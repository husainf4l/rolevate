import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiveKitRoom } from './livekit-room.entity';
import { Application } from '../application/application.entity';
import { ConfigService } from '@nestjs/config';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { CreateRoomResponse, RoomTokenResponse } from './livekit.dto';

@Injectable()
export class LiveKitService {
  constructor(
    @InjectRepository(LiveKitRoom)
    private readonly liveKitRoomRepository: Repository<LiveKitRoom>,
    private readonly configService: ConfigService,
  ) {}

  async createRoomWithToken(
    name: string,
    metadata: Record<string, any>,
    userId: string,
    participantName: string,
    ttlSeconds: number = 60 * 60 // Default 1 hour
  ): Promise<{ room: LiveKitRoom; token: string }> {
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');
    const liveKitUrl = this.configService.get<string>('LIVEKIT_URL');

    if (!apiKey || !apiSecret || !liveKitUrl) {
      throw new Error('LiveKit configuration missing');
    }

            // 1. Check if room exists and DELETE it completely
    const httpUrl = liveKitUrl.replace('wss://', 'https://').replace('ws://', 'http://');
    const roomService = new RoomServiceClient(httpUrl, apiKey, apiSecret);
    
    try {
      // Check if room exists
      const existingRooms = await roomService.listRooms([name]);
      
      if (existingRooms.length > 0) {
        console.log(`🔍 Found existing room: ${name}, deleting it completely...`);
        
        // Delete the room completely (removes all participants and room)
        await roomService.deleteRoom(name);
        console.log(`🗑️ Deleted existing room: ${name}`);
        
        // Wait a bit to ensure room is fully deleted
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        console.log(`✅ No existing room found, will create new one: ${name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`⚠️ Room check/delete failed: ${errorMessage}`);
      // Continue anyway - we'll try to create the room
    }
    
    // 2. Create brand new room with fresh metadata
    try {
      // Convert metadata to JSON string for LiveKit
      const metadataJson = JSON.stringify(metadata);
      
      console.log(`🏗️ Creating NEW LiveKit room: ${name}`);
      console.log(`📋 Metadata size: ${metadataJson.length} characters`);
      console.log(`📦 Full Metadata being sent to LiveKit:`);
      console.log(JSON.stringify(metadata, null, 2));
      
      // Create brand new room on LiveKit server with fresh metadata
      const liveKitRoom = await roomService.createRoom({
        name: name,
        metadata: metadataJson,
        emptyTimeout: 10 * 60, // 10 minutes
        maxParticipants: 10,
      });
      
      console.log(`✅ NEW LiveKit room created: ${liveKitRoom.name} with fresh metadata`);
      console.log(`🔍 Room metadata stored on LiveKit server (${liveKitRoom.metadata?.length || 0} chars):`, liveKitRoom.metadata?.substring(0, 200));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error(`❌ CRITICAL: LiveKit room creation FAILED: ${errorMessage}`);
      console.error(`❌ Stack:`, errorStack);
      console.error(`❌ This means the agent will NOT receive metadata - continuing anyway`);
      // Don't throw - let it continue, but log the error prominently
    }

    // 3. Create or update room in our DB

    // 3. Create or update room in our DB
    try {
      // Convert metadata to JSON string for LiveKit
      const metadataJson = JSON.stringify(metadata);
      
      console.log(`🏗️ Creating NEW LiveKit room: ${name}`);
      console.log(`📋 Metadata size: ${metadataJson.length} characters`);
      console.log(`📦 Full Metadata being sent to LiveKit:`);
      console.log(JSON.stringify(metadata, null, 2));
      
      // Create brand new room on LiveKit server with fresh metadata
      const liveKitRoom = await roomService.createRoom({
        name: name,
        metadata: metadataJson,
        emptyTimeout: 10 * 60, // 10 minutes
        maxParticipants: 10,
      });
      
      console.log(`✅ NEW LiveKit room created: ${liveKitRoom.name} with fresh metadata`);
      console.log(`🔍 Room metadata stored on LiveKit server (${liveKitRoom.metadata?.length || 0} chars):`, liveKitRoom.metadata?.substring(0, 200));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error(`❌ CRITICAL: LiveKit room creation FAILED: ${errorMessage}`);
      console.error(`❌ Stack:`, errorStack);
      console.error(`❌ This means the agent will NOT receive metadata - continuing anyway`);
      // Don't throw - let it continue, but log the error prominently
    }

    // 3. Create or update room in our DB
    let room: LiveKitRoom = {} as LiveKitRoom;
    const existingDbRoom = await this.liveKitRoomRepository.findOne({
      where: { roomName: name },
    });

    if (existingDbRoom) {
      // Room exists, use it
      room = existingDbRoom;
      console.log(`📝 Using existing room from database: ${name}`);
    } else {
      // Create new room - Note: This old method is deprecated, use LiveKitInterviewService instead
      room = await this.liveKitRoomRepository.save({
        roomName: name,
        roomSid: name, // Use name as sid for backward compatibility
        roomPassword: 'legacy', // Legacy rooms don't have password
        passwordExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        passwordUsed: true,
        applicationId: userId, // Temporary - this is not ideal
      });
      console.log(`💾 Created new room in database: ${name}`);
    }

    // 3. Generate LiveKit token
    const roomName = name;
    const identity = participantName;
    const at = new AccessToken(apiKey, apiSecret, {
      identity,
      ttl: ttlSeconds, // Use custom duration
    });
    at.addGrant({ room: roomName, roomJoin: true });
    const token = await at.toJwt();
    
    console.log(`🎫 Generated token for ${participantName} (${ttlSeconds}s duration)`);
    
    return { room, token };
  }

  async generateToken(
    roomName: string,
    participantName: string,
    _userId: string
  ): Promise<string> {
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');
    
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      ttl: 60 * 60, // 1 hour
    });
    
    at.addGrant({ room: roomName, roomJoin: true });
    const token = await at.toJwt();
    
    console.log(`Generated token for ${participantName} to join room: ${roomName}`);
    return token;
  }

  async generateTokenWithDuration(
    roomName: string,
    participantName: string,
    userId: string,
    durationSeconds: number = 60 * 60 // Default 1 hour
  ): Promise<string> {
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');
    
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      ttl: durationSeconds, // Custom duration
    });
    
    at.addGrant({ room: roomName, roomJoin: true });
    const token = await at.toJwt();
    
    console.log(`Generated token for ${participantName} to join room: ${roomName} (${durationSeconds}s duration)`);
    return token;
  }

  async getLiveKitRoomStatus(roomName: string) {
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');
    const liveKitUrl = this.configService.get<string>('LIVEKIT_URL');

    if (!apiKey || !apiSecret || !liveKitUrl) {
      return {
        exists: false,
        error: 'LiveKit configuration missing'
      };
    }

    // Create room service client
    const roomService = new RoomServiceClient(liveKitUrl, apiKey, apiSecret);

    try {
      // Get room info from LiveKit server
      const rooms = await roomService.listRooms([roomName]);
      
      if (rooms.length === 0) {
        return {
          exists: false,
          error: 'Room not found on LiveKit server'
        };
      }

      const room = rooms[0];
      
      // Get participants in the room
      const participants = await roomService.listParticipants(roomName);

      return {
        exists: true,
        room: {
          name: room.name,
          sid: room.sid,
          emptyTimeout: Number(room.emptyTimeout || 0),
          maxParticipants: Number(room.maxParticipants || 0),
          creationTime: room.creationTime ? Number(room.creationTime) : null,
          turnPassword: room.turnPassword,
          enabledCodecs: room.enabledCodecs,
          metadata: room.metadata,
          numParticipants: Number(room.numParticipants || 0),
          numPublishers: Number(room.numPublishers || 0),
          activeRecording: Boolean(room.activeRecording)
        },
        participants: participants.map(p => ({
          sid: p.sid,
          identity: p.identity,
          state: p.state,
          tracks: p.tracks.map(t => ({
            sid: t.sid,
            type: t.type,
            name: t.name,
            muted: Boolean(t.muted),
            width: Number(t.width || 0),
            height: Number(t.height || 0)
          })),
          metadata: p.metadata,
          joinedAt: p.joinedAt ? Number(p.joinedAt) : null,
          name: p.name,
          version: Number(p.version || 0),
          permission: p.permission
        })),
        liveKitUrl
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error getting LiveKit room status:', error);
      return {
        exists: false,
        error: errorMessage || 'Failed to connect to LiveKit server'
      };
    }
  }

  async closeAllSessions() {
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');
    const liveKitUrl = this.configService.get<string>('LIVEKIT_URL');

    if (!apiKey || !apiSecret || !liveKitUrl) {
      return {
        success: false,
        error: 'LiveKit configuration missing'
      };
    }

    // Convert WebSocket URL to HTTP URL for API calls
    const httpUrl = liveKitUrl.replace('wss://', 'https://').replace('ws://', 'http://');
    const roomService = new RoomServiceClient(httpUrl, apiKey, apiSecret);

    try {
      console.log('🧹 Getting all active rooms to close...');
      
      // Get all rooms
      const rooms = await roomService.listRooms();
      
      if (rooms.length === 0) {
        return {
          success: true,
          message: 'No active rooms found',
          roomsClosed: 0,
          rooms: []
        };
      }

      console.log(`📋 Found ${rooms.length} active rooms to close`);

      const closedRooms: Array<{
        name: string;
        sid: string;
        participants?: number;
        status: 'closed' | 'error';
        error?: string;
      }> = [];
      let successCount = 0;
      let errorCount = 0;

      // Close each room
      for (const room of rooms) {
        try {
          console.log(`🔒 Closing room: ${room.name} (SID: ${room.sid})`);
          
          // Get all participants in the room first
          const participants = await roomService.listParticipants(room.name);
          
          // Remove all participants
          for (const participant of participants) {
            try {
              await roomService.removeParticipant(room.name, participant.identity);
              console.log(`👋 Removed participant: ${participant.identity} from ${room.name}`);
            } catch (participantError) {
              const participantErrorMessage = participantError instanceof Error ? participantError.message : String(participantError);
              console.error(`❌ Failed to remove participant ${participant.identity}:`, participantErrorMessage);
            }
          }

          // Delete the room
          await roomService.deleteRoom(room.name);
          
          closedRooms.push({
            name: room.name,
            sid: room.sid,
            participants: participants.length,
            status: 'closed'
          });
          
          successCount++;
          console.log(`✅ Successfully closed room: ${room.name}`);
          
        } catch (roomError) {
          const roomErrorMessage = roomError instanceof Error ? roomError.message : String(roomError);
          console.error(`❌ Failed to close room ${room.name}:`, roomErrorMessage);
          
          closedRooms.push({
            name: room.name,
            sid: room.sid,
            status: 'error',
            error: roomErrorMessage
          });
          
          errorCount++;
        }
      }

      console.log(`🎉 Session cleanup complete: ${successCount} closed, ${errorCount} errors`);

      return {
        success: true,
        message: `Closed ${successCount} rooms, ${errorCount} errors`,
        roomsClosed: successCount,
        errors: errorCount,
        totalRooms: rooms.length,
        rooms: closedRooms,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Error closing all sessions:', error);
      return {
        success: false,
        error: errorMessage || 'Failed to close all sessions',
        timestamp: new Date().toISOString()
      };
    }
  }
}
