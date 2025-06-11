import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

@Injectable()
export class LiveKitService {
  private roomService: RoomServiceClient;
  private apiKey: string;
  private apiSecret: string;
  private liveKitUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('LIVEKIT_API_KEY')!;
    this.apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET')!;
    this.liveKitUrl = this.configService.get<string>('LIVEKIT_URL')!;
    
    this.roomService = new RoomServiceClient(
      this.liveKitUrl,
      this.apiKey,
      this.apiSecret,
    );
  }

  async generateToken(
    identity: string,
    roomName: string,
    participantName?: string,
  ): Promise<{ 
    token: string; 
    serverUrl: string; 
    participantToken: string;
    roomName: string; 
    identity: string;
  }> {
    const token = new AccessToken(this.apiKey, this.apiSecret, {
      identity,
      name: participantName || identity,
    });

    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    const jwt = await token.toJwt();

    return {
      token: jwt,
      serverUrl: this.liveKitUrl,
      participantToken: jwt,
      roomName,
      identity,
    };
  }

  async createRoom(name: string, emptyTimeout?: number, maxParticipants?: number) {
    const options: any = {};
    if (emptyTimeout) options.emptyTimeout = emptyTimeout;
    if (maxParticipants) options.maxParticipants = maxParticipants;

    return await this.roomService.createRoom({
      name,
      ...options,
    });
  }

  async getRoomInfo(roomName: string) {
    return await this.roomService.listRooms([roomName]);
  }

  async deleteRoom(roomName: string) {
    return await this.roomService.deleteRoom(roomName);
  }

  async listRooms() {
    return await this.roomService.listRooms();
  }

  async listParticipants(roomName: string) {
    return await this.roomService.listParticipants(roomName);
  }
}
