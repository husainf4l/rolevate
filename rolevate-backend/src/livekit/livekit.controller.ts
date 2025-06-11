import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LiveKitService } from './livekit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { GenerateTokenDto, CreateRoomDto } from './dto/livekit.dto';

@Controller('livekit')
@UseGuards(JwtAuthGuard)
export class LiveKitController {
  constructor(private readonly liveKitService: LiveKitService) {}

  /**
   * Generate access token for LiveKit room
   * Can be called via GET with query params or POST with body
   */
  @Get('token')
  async generateTokenGet(
    @Query('identity') identity: string,
    @Query('roomName') roomName: string,
    @Query('room') room: string, // Alternative parameter name
    @Query('name') name?: string,
    @Query('participantName') participantName?: string, // Alternative parameter name
    @CurrentUser() user?: { id: string; username: string },
  ) {
    // Use room if roomName is not provided (backward compatibility)
    const finalRoomName = roomName || room;
    // Use participantName if name is not provided
    const finalName = name || participantName;
    
    // If no identity provided, use the authenticated user's info
    const finalIdentity = identity || user?.id || `user_${Date.now()}`;

    if (!finalRoomName) {
      throw new Error('roomName or room parameter is required');
    }

    return await this.liveKitService.generateToken(
      finalIdentity,
      finalRoomName,
      finalName || user?.username,
    );
  }

  @Post('token')
  @HttpCode(HttpStatus.OK)
  async generateTokenPost(
    @Body() generateTokenDto: GenerateTokenDto,
    @CurrentUser() user?: { id: string; username: string },
  ) {
    const { identity, roomName, name } = generateTokenDto;
    
    // If no identity provided, use the authenticated user's info
    const finalIdentity = identity || user?.id || `user_${Date.now()}`;

    return await this.liveKitService.generateToken(
      finalIdentity,
      roomName,
      name || user?.username,
    );
  }

  @Post('room')
  async createRoom(@Body() createRoomDto: CreateRoomDto) {
    const { name, emptyTimeout, maxParticipants } = createRoomDto;
    return await this.liveKitService.createRoom(name, emptyTimeout, maxParticipants);
  }

  @Get('room/:roomName')
  async getRoomInfo(@Param('roomName') roomName: string) {
    return await this.liveKitService.getRoomInfo(roomName);
  }

  @Delete('room/:roomName')
  async deleteRoom(@Param('roomName') roomName: string) {
    return await this.liveKitService.deleteRoom(roomName);
  }

  @Get('rooms')
  async listRooms() {
    return await this.liveKitService.listRooms();
  }

  @Get('room/:roomName/participants')
  async listParticipants(@Param('roomName') roomName: string) {
    return await this.liveKitService.listParticipants(roomName);
  }
}
