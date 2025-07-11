import { Body, Controller, Post } from '@nestjs/common';
import { LiveKitService } from './livekit.service';

@Controller('livekit')
export class LiveKitController {
  constructor(private readonly liveKitService: LiveKitService) {}

  @Post('create-room')
  async createRoom(@Body() body: { name: string; metadata: any; userId: string; participantName: string }) {
    const { name, metadata, userId, participantName } = body;
    const { room, token } = await this.liveKitService.createRoomWithToken(name, metadata, userId, participantName);
    return {
      room,
      token,
      url: process.env.LIVEKIT_URL,
    };
  }
}
