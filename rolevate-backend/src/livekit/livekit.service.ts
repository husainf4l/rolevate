import { Injectable } from '@nestjs/common';
import { PrismaClient, LiveKitRoom } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

@Injectable()
export class LiveKitService {
  private prisma = new PrismaClient();

  constructor(private readonly configService: ConfigService) {}

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

    // 1. Create room on LiveKit server with metadata
    const httpUrl = liveKitUrl.replace('wss://', 'https://').replace('ws://', 'http://');
    const roomService = new RoomServiceClient(httpUrl, apiKey, apiSecret);
    
    try {
      // Convert metadata to JSON string for LiveKit
      const metadataJson = JSON.stringify(metadata);
      
      console.log(`🏗️ Creating LiveKit room: ${name}`);
      console.log(`📋 Metadata size: ${metadataJson.length} characters`);
      
      // Create room on LiveKit server with metadata
      const liveKitRoom = await roomService.createRoom({
        name: name,
        metadata: metadataJson,
        emptyTimeout: 10 * 60, // 10 minutes
        maxParticipants: 10,
      });
      
      console.log(`✅ LiveKit room created: ${liveKitRoom.name} with metadata`);
      
    } catch (error) {
      console.log(`⚠️ LiveKit room creation failed (might already exist): ${error.message}`);
      // Continue anyway - room might already exist
    }

    // 2. Create room in our DB
    const room = await this.prisma.liveKitRoom.create({
      data: {
        name,
        metadata,
        createdBy: userId,
      },
    });

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
    userId: string
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
      console.error('Error getting LiveKit room status:', error);
      return {
        exists: false,
        error: error.message || 'Failed to connect to LiveKit server'
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
              console.error(`❌ Failed to remove participant ${participant.identity}:`, participantError.message);
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
          console.error(`❌ Failed to close room ${room.name}:`, roomError.message);
          
          closedRooms.push({
            name: room.name,
            sid: room.sid,
            status: 'error',
            error: roomError.message
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
      console.error('❌ Error closing all sessions:', error);
      return {
        success: false,
        error: error.message || 'Failed to close all sessions',
        timestamp: new Date().toISOString()
      };
    }
  }
}
