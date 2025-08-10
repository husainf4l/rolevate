import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { RoomService } from './room.service';
import { LiveKitService } from '../livekit/livekit.service';

interface LeaveRoomDto {
  candidateId: string;
  roomName: string;
}

interface RoomStatusDto {
  roomName: string;
}

interface RefreshTokenDto {
  roomName: string;
  candidateId: string;
}

interface LiveKitServerStatusDto {
  roomName: string;
}

interface CreateRoomDto {
  jobId: string;
  phone: string;
}

@Controller('room')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly liveKitService: LiveKitService
  ) {}

  @Post('create-new-room')
  async createRoom(@Body() createRoomDto: CreateRoomDto) {
    console.log('🎯 ROOM CONTROLLER: create-new-room endpoint called');
    console.log('📦 Request data:', JSON.stringify(createRoomDto, null, 2));
    
    const result = await this.roomService.createNewRoomWithMetadata(createRoomDto);
    
    console.log('🎯 ROOM CONTROLLER: Response from service:');
    console.log('📤 Metadata in response:', JSON.stringify(result.room?.metadata, null, 2));
    
    return result;
  }

  @Post('close-all-sessions')
  async closeAllSessions() {
    return this.roomService.closeAllLiveKitSessions();
  }

  @Get('livekit-status')
  async getLiveKitRoomStatus(@Query('roomName') roomName: string) {
    if (!roomName) {
      return {
        error: 'roomName parameter is required'
      };
    }
    
    return this.liveKitService.getLiveKitRoomStatus(roomName);
  }
}
