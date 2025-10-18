import { Body, Controller, Post, Get, Param, Query } from '@nestjs/common';
import { LiveKitService } from './livekit.service';
import { Public } from '../auth/public.decorator';

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

  @Public()
  @Get('join-room/:roomName')
  async joinRoom(
    @Param('roomName') roomName: string,
    @Query('participantName') participantName: string,
    @Query('userId') userId?: string,
  ) {
    if (!participantName) {
      return {
        success: false,
        error: 'Participant name is required',
      };
    }

    try {
      const token = await this.liveKitService.generateToken(
        roomName,
        participantName,
        userId || 'anonymous',
      );

      return {
        success: true,
        token,
        roomName,
        url: process.env.LIVEKIT_URL,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to generate room token',
      };
    }
  }
}
