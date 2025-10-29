import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { WhatsAppService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsAppController {
  private readonly logger = new Logger(WhatsAppController.name);

  constructor(private readonly whatsAppService: WhatsAppService) {}

  /**
   * WhatsApp webhook verification endpoint
   * Facebook sends a GET request to verify the webhook
   */
  @Public()
  @Get('webhook')
  async verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') verifyToken: string,
  ) {
    this.logger.log(`Webhook verification request: mode=${mode}, challenge=${challenge}`);

    // Verify the webhook token matches our configured token
    const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;
    if (!expectedToken) {
      this.logger.error('WHATSAPP_VERIFY_TOKEN not configured');
      throw new BadRequestException('Webhook verification token not configured');
    }

    if (mode !== 'subscribe') {
      this.logger.warn(`Invalid webhook mode: ${mode}`);
      throw new BadRequestException('Invalid webhook mode');
    }

    if (verifyToken !== expectedToken) {
      this.logger.warn('Invalid webhook verify token');
      throw new UnauthorizedException('Invalid verify token');
    }

    this.logger.log('Webhook verification successful');
    return challenge;
  }

  /**
   * WhatsApp webhook for receiving messages and status updates
   */
  @Public()
  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    this.logger.log('Received WhatsApp webhook:', JSON.stringify(body, null, 2));

    try {
      // Handle the webhook payload
      await this.whatsAppService.handleWebhook(body);
      return { status: 'success' };
    } catch (error) {
      this.logger.error('Error handling WhatsApp webhook:', error);
      throw new BadRequestException('Failed to process webhook');
    }
  }
}
