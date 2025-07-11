import { Injectable } from '@nestjs/common';
import { PrismaClient, LiveKitRoom } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { AccessToken } from 'livekit-server-sdk';

@Injectable()
export class LiveKitService {
  private prisma = new PrismaClient();

  constructor(private readonly configService: ConfigService) {}

  async createRoomWithToken(
    name: string,
    metadata: Record<string, any>,
    userId: string,
    participantName: string
  ): Promise<{ room: LiveKitRoom; token: string }> {
    // 1. Create room in DB
    const room = await this.prisma.liveKitRoom.create({
      data: {
        name,
        metadata,
        createdBy: userId,
      },
    });

    // 2. Generate LiveKit token
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');
    const roomName = name;
    const identity = participantName;
    const at = new AccessToken(apiKey, apiSecret, {
      identity,
      ttl: 60 * 60, // 1 hour
    });
    at.addGrant({ room: roomName, roomJoin: true });
    const token = await at.toJwt();
    return { room, token };
  }
}
