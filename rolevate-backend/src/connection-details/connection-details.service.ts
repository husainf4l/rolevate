import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken, AccessTokenOptions, VideoGrant } from 'livekit-server-sdk';
import { ConnectionDetails } from './interfaces/connection-details.interface';

@Injectable()
export class ConnectionDetailsService {
  constructor(private readonly configService: ConfigService) {}

  async getConnectionDetails(): Promise<ConnectionDetails> {
    const livekitUrl = this.configService.get<string>('LIVEKIT_URL');
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');

    if (!livekitUrl) {
      throw new Error('LIVEKIT_URL is not defined');
    }
    if (!apiKey) {
      throw new Error('LIVEKIT_API_KEY is not defined');
    }
    if (!apiSecret) {
      throw new Error('LIVEKIT_API_SECRET is not defined');
    }

    // Generate participant token
    const participantIdentity = `voice_assistant_user_${Math.floor(Math.random() * 10_000)}`;
    const roomName = `voice_assistant_room_${Math.floor(Math.random() * 10_000)}`;
    const participantToken = await this.createParticipantToken(
      { identity: participantIdentity },
      roomName,
      apiKey,
      apiSecret,
    );

    // Return connection details
    return {
      serverUrl: livekitUrl,
      roomName,
      participantToken,
      participantName: participantIdentity,
    };
  }

  private async createParticipantToken(
    userInfo: AccessTokenOptions, 
    roomName: string,
    apiKey: string,
    apiSecret: string,
  ): Promise<string> {
    const at = new AccessToken(apiKey, apiSecret, {
      ...userInfo,
      ttl: 60 * 15, // 15 minutes
    });
    
    const grant: VideoGrant = {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    };
    
    at.addGrant(grant);
    return await at.toJwt();
  }
}
