import { Controller, Get, Post, Body, Logger } from '@nestjs/common';
import { LivekitService } from './livekit.service';

@Controller('debug')
export class DebugController {
  private readonly logger = new Logger(DebugController.name);
  private readonly livekitUrl: string;

  constructor(private readonly livekitService: LivekitService) {
    this.livekitUrl = process.env.LIVEKIT_URL || '';
  }

  @Get('livekit')
  async getLivekitInfo() {
    return {
      status: 'OK',
      livekitUrl: this.livekitUrl,
      apiKey: process.env.LIVEKIT_API_KEY ? '[REDACTED]' : 'Not set',
      apiSecret: process.env.LIVEKIT_API_SECRET ? '[REDACTED]' : 'Not set',
      debug: process.env.LIVEKIT_DEBUG === 'true',
    };
  }

  @Post('test-token')
  async testToken(@Body() data: any) {
    try {
      const { identity, roomName } = data;
      if (!identity || !roomName) {
        return {
          status: 'ERROR',
          message: 'Identity and roomName are required',
        };
      }
      const token = await this.livekitService.generateToken({
        identity,
        name: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
      });
      return {
        status: 'OK',
        token,
        wsUrl: `${this.livekitUrl}/rtc?token=${token}`,
      };
    } catch (error) {
      this.logger.error(`Error testing token: ${error.message}`);
      return {
        status: 'ERROR',
        message: error.message,
      };
    }
  }
}
