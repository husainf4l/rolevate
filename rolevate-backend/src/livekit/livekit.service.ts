import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  AccessToken, 
  RoomServiceClient, 
  Room,
  CreateOptions
} from 'livekit-server-sdk';
import { 
  TokenOptions, 
  RoomOptions, 
  RoomStatus 
} from './interfaces/livekit.interfaces';

@Injectable()
export class LivekitService {
  private readonly logger = new Logger(LivekitService.name);
  private readonly roomService: RoomServiceClient;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly livekitUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('LIVEKIT_API_KEY') || '';
    this.apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET') || '';
    this.livekitUrl = this.configService.get<string>('LIVEKIT_URL') || '';

    if (!this.apiKey || !this.apiSecret || !this.livekitUrl) {
      this.logger.error('LiveKit configuration is missing. Please check your .env file.');
    }

    this.roomService = new RoomServiceClient(
      this.livekitUrl,
      this.apiKey,
      this.apiSecret,
    );

    this.logger.log('LiveKit service initialized');
  }

  /**
   * Generate a LiveKit access token
   * @param options Token generation options
   * @returns Promise resolving to JWT token string
   */
  async generateToken(options: TokenOptions): Promise<string> {
    try {
      const { 
        identity, 
        name, 
        ttl = 3600, 
        metadata, 
        roomJoin = true, 
        canPublish = true, 
        canSubscribe = true,
        canPublishData = true,
      } = options;
      
      this.logger.debug(`Generating token for identity: ${identity}, room: ${name}`);
      
      const at = new AccessToken(this.apiKey, this.apiSecret, {
        identity,
        name: identity, // Set the participant name to the identity
        ttl,
        metadata,
      });

      if (roomJoin) {
        at.addGrant({
          roomJoin: true,
          room: name, // Use the provided name as the room name
          canPublish,
          canSubscribe,
          canPublishData,
        });
      }

      // Return the JWT token
      const token = at.toJwt();
      return token;
    } catch (error) {
      this.logger.error(`Error generating token: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create a new LiveKit room
   * @param options Room creation options
   * @returns Promise resolving to the created room
   */
  async createRoom(options: RoomOptions): Promise<Room> {
    try {
      const { 
        name, 
        emptyTimeout = 300, 
        maxParticipants = 2,
        metadata 
      } = options;

      const createOptions: CreateOptions = {
        name,
        emptyTimeout,
        maxParticipants,
        metadata,
      };

      return await this.roomService.createRoom(createOptions);
    } catch (error) {
      this.logger.error(`Error creating room: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get information about a LiveKit room
   * @param roomName Name of the room
   * @returns Promise resolving to room status information
   */
  async getRoomInfo(roomName: string): Promise<RoomStatus> {
    try {
      // Get room by listing all rooms and finding the one with the matching name
      const rooms = await this.roomService.listRooms();
      const room = rooms.find(r => r.name === roomName);
      
      if (!room) {
        throw new Error(`Room not found: ${roomName}`);
      }
      
      return room as unknown as RoomStatus;
    } catch (error) {
      this.logger.error(`Error getting room info: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get a LiveKit room by name
   * @param roomName The name of the room to retrieve
   * @returns Promise resolving to the room or null if not found
   */
  async getRoom(roomName: string): Promise<Room | null> {
    try {
      const rooms = await this.roomService.listRooms();
      const room = rooms.find(r => r.name === roomName);
      return room || null;
    } catch (error) {
      this.logger.error(`Error getting room: ${error.message}`, error.stack);
      return null;
    }
  }
  /**
   * List all active LiveKit rooms
   * @returns Promise resolving to array of room status objects
   */
  async listRooms(): Promise<RoomStatus[]> {
    try {
      const rooms = await this.roomService.listRooms();
      
      // Convert Room objects to RoomStatus objects
      const roomStatusList: RoomStatus[] = rooms.map(room => ({
        name: room.name,
        sid: room.sid,
        emptyTimeout: room.emptyTimeout,
        maxParticipants: room.maxParticipants,
        creationTime: typeof room.creationTime === 'bigint' ? Number(room.creationTime) : room.creationTime,
        turnPassword: room.turnPassword,
        enabledCodecs: room.enabledCodecs,
        metadata: room.metadata || '',
        numParticipants: room.numParticipants,
        activeRecording: room.activeRecording,
      }));
      
      return roomStatusList;
    } catch (error) {
      this.logger.error(`Error listing rooms: ${error.message}`, error.stack);
      throw error;
    }
  }
}
