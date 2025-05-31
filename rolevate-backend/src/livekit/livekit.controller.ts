import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  Delete,
  Logger,
  HttpException, 
  HttpStatus,
  Query
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LivekitService } from './livekit.service';
import { TokenDto } from './dto/token.dto';
import { RoomDto } from './dto/room.dto';

@Controller('livekit')
export class LivekitController {
  private readonly logger = new Logger(LivekitController.name);
  private readonly livekitUrl: string;

  constructor(
    private readonly livekitService: LivekitService,
    private readonly configService: ConfigService
  ) {
    this.livekitUrl = this.configService.get<string>('LIVEKIT_URL') || '';
  }

  @Get('token')
  async getToken(
    @Query('identity') identity: string,
    @Query('room') roomName: string,
    @Query('name') displayName?: string
  ) {
    try {
      this.logger.log(`Generating token for identity: ${identity} and room: ${roomName}`);
      
      if (!identity || !roomName) {
        throw new HttpException(
          'Identity and room parameters are required',
          HttpStatus.BAD_REQUEST
        );
      }
      
      const tokenOptions: TokenDto = {
        identity,
        name: roomName,  // 'name' in TokenOptions refers to the room name
        canPublish: true,
        canSubscribe: true,
        canPublishData: true
      };
      
      const token = await this.livekitService.generateToken(tokenOptions);
      return { token };
    } catch (error) {
      this.logger.error(`Error generating token: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Failed to generate token',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('token')
  generateToken(@Body() tokenDto: TokenDto) {
    try {
      this.logger.log(`Generating token for identity: ${tokenDto.identity} and room: ${tokenDto.name}`);
      
      // Make sure all required properties are present
      if (!tokenDto.name) {
        throw new HttpException(
          'Room name is required',
          HttpStatus.BAD_REQUEST
        );
      }
      
      const token = this.livekitService.generateToken(tokenDto);
      return { token };
    } catch (error) {
      this.logger.error(`Error generating token: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Failed to generate token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('room')
  async createRoom(@Body() roomOptions: RoomDto) {
    try {
      this.logger.log(`Creating room: ${roomOptions.name}`);
      const room = await this.livekitService.createRoom(roomOptions);
      return room;
    } catch (error) {
      this.logger.error(`Error creating room: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to create room',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('room/:name')
  async getRoomInfo(@Param('name') roomName: string) {
    try {
      this.logger.log(`Getting info for room: ${roomName}`);
      const roomInfo = await this.livekitService.getRoomInfo(roomName);
      return roomInfo;
    } catch (error) {
      this.logger.error(`Error getting room info: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to get room info',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

//   @Delete('room/:name')
//   async deleteRoom(@Param('name') roomName: string) {
//     try {
//       this.logger.log(`Deleting room: ${roomName}`);
//       await this.livekitService.deleteRoom(roomName);
//       return { success: true, message: `Room ${roomName} deleted successfully` };
//     } catch (error) {
//       this.logger.error(`Error deleting room: ${error.message}`, error.stack);
//       throw new HttpException(
//         'Failed to delete room',
//         HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }

  @Get('rooms')
  async listRooms() {
    try {
      this.logger.log('Listing all rooms');
      const rooms = await this.livekitService.listRooms();
      return rooms;
    } catch (error) {
      this.logger.error(`Error listing rooms: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to list rooms',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('test-connection/:roomName')
  async testConnection(@Param('roomName') roomName: string) {
    this.logger.log(`Testing LiveKit connection to room: ${roomName}`);
    
    try {
      // Check if room exists
      const room = await this.livekitService.getRoom(roomName);
      let roomStatus = 'NOT_FOUND';
      
      if (room) {
        roomStatus = 'EXISTS';
      } else {
        // Create room if it doesn't exist
        await this.livekitService.createRoom({ name: roomName });
        roomStatus = 'CREATED';
      }
      
      // Generate a test token
      const testIdentity = `test-connection-${Date.now()}`;
      const token = await this.livekitService.generateToken({
        identity: testIdentity,
        name: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
      });
      
      return {
        status: 'SUCCESS',
        message: 'LiveKit connection test',
        roomName,
        roomStatus,
        token: token.substring(0, 20) + '...',
        livekitUrl: process.env.LIVEKIT_URL,
        clientInfo: {
          connectUrl: `${process.env.LIVEKIT_URL}?access_token=${token}`,
          identity: testIdentity,
        }
      };
    } catch (error) {
      this.logger.error(`Error testing LiveKit connection: ${error.message}`, error.stack);
      return {
        status: 'ERROR',
        message: `Failed to test connection: ${error.message}`,
        roomName,
      };
    }
  }
}
