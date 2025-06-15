import {
    Controller,
    Get,
    Post,
    Query,
    Body,
    Req,
    Res,
    HttpStatus,
    Logger,
    Headers,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WhatsAppService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsAppController {
    private readonly logger = new Logger(WhatsAppController.name);

    constructor(private readonly whatsAppService: WhatsAppService) { }

    // Webhook verification endpoint (GET request)
    @Get('webhook')
    verifyWebhook(
        @Query('hub.mode') mode: string,
        @Query('hub.verify_token') token: string,
        @Query('hub.challenge') challenge: string,
        @Res() res: Response,
    ) {
        this.logger.log('Webhook verification request received');

        try {
            const isValid = this.whatsAppService.verifyWebhook(mode, token);

            if (isValid) {
                this.logger.log('Webhook verified successfully');
                return res.status(HttpStatus.OK).send(challenge);
            }

            this.logger.warn('Webhook verification failed');
            return res.status(HttpStatus.FORBIDDEN).send('Forbidden');
        } catch (error) {
            this.logger.error('Webhook verification error:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal Server Error');
        }
    }

    // Webhook callback endpoint (POST request)
    @Post('webhook')
    async handleWebhook(
        @Body() body: any,
        @Headers('x-hub-signature-256') signature: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        console.log('🚨🚨🚨 WEBHOOK CALLBACK RECEIVED 🚨🚨🚨');
        console.log('📞 Webhook URL Hit:', req.url);
        console.log('📋 Webhook Body:', JSON.stringify(body, null, 2));
        console.log('🔐 Signature:', signature);
        console.log('📅 Timestamp:', new Date().toISOString());

        this.logger.log('🎯 WEBHOOK CALLBACK RECEIVED');
        this.logger.log('📋 Webhook body:', JSON.stringify(body, null, 2));
        this.logger.log('🔐 Signature:', signature);

        try {
            // Verify webhook signature
            console.log('🔍 VERIFYING WEBHOOK SIGNATURE...');
            this.logger.log('🔍 Verifying webhook signature...');
            const isValidSignature = this.whatsAppService.verifySignature(
                JSON.stringify(body),
                signature,
            );

            if (!isValidSignature) {
                console.log('❌ INVALID WEBHOOK SIGNATURE');
                this.logger.warn('❌ Invalid webhook signature');
                return res.status(HttpStatus.UNAUTHORIZED).send('Unauthorized');
            }

            console.log('✅ WEBHOOK SIGNATURE VERIFIED');
            this.logger.log('✅ Webhook signature verified successfully');

            // Process the webhook data
            console.log('⚙️ PROCESSING WEBHOOK DATA...');
            this.logger.log('⚙️ Processing webhook data...');
            await this.whatsAppService.processWebhook(body);

            console.log('✅ WEBHOOK PROCESSED SUCCESSFULLY');
            this.logger.log('✅ Webhook processed successfully');

            // Always return 200 OK to prevent WhatsApp from retrying
            return res.status(HttpStatus.OK).send('OK');
        } catch (error) {
            console.log('❌ WEBHOOK PROCESSING ERROR:', error);
            this.logger.error('❌ Webhook processing error:', error);
            // Still return 200 to prevent retries
            return res.status(HttpStatus.OK).send('OK');
        }
    }

    // Token management and testing endpoints

    /**
     * Refresh the WhatsApp access token
     */
    @Post('token/refresh')
    async refreshToken(@Res() res: Response) {
        try {
            await this.whatsAppService.refreshAccessToken();
            return res.status(HttpStatus.OK).json({
                success: true,
                message: 'Token refreshed successfully'
            });
        } catch (error) {
            this.logger.error('Token refresh error:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get token information for debugging
     */
    @Get('token/info')
    async getTokenInfo(@Res() res: Response) {
        try {
            const tokenInfo = await this.whatsAppService.getTokenInfo();
            return res.status(HttpStatus.OK).json({
                success: true,
                data: tokenInfo
            });
        } catch (error) {
            this.logger.error('Get token info error:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Test WhatsApp API connection
     */
    @Get('test-connection')
    async testConnection(@Res() res: Response) {
        try {
            const result = await this.whatsAppService.testConnection();
            return res.status(HttpStatus.OK).json(result);
        } catch (error) {
            this.logger.error('Test connection error:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Send a test message (for debugging)
     */
    @Post('send-test-message')
    async sendTestMessage(
        @Body() body: { to: string; message: string },
        @Res() res: Response
    ) {
        try {
            const result = await this.whatsAppService.sendTextMessage(body.to, body.message);
            return res.status(HttpStatus.OK).json({
                success: true,
                data: result
            });
        } catch (error) {
            this.logger.error('Send test message error:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Send a template message (for new contacts)
     */
    @Post('send-template-message')
    async sendTemplateMessage(
        @Body() body: {
            to: string;
            templateName: string;
            languageCode?: string;
            parameters?: string[]
        },
        @Res() res: Response
    ) {
        try {
            const result = await this.whatsAppService.sendTemplateMessage(
                body.to,
                body.templateName,
                body.languageCode || 'en',
                body.parameters
            );
            return res.status(HttpStatus.OK).json({
                success: true,
                data: result
            });
        } catch (error) {
            this.logger.error('Send template message error:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Send message (auto-detects if template is needed)
     */
    @Post('send-message')
    async sendMessage(
        @Body() body: {
            to: string;
            message: string;
            templateName?: string
        },
        @Res() res: Response
    ) {
        try {
            const result = await this.whatsAppService.sendMessage(
                body.to,
                body.message,
                body.templateName
            );
            return res.status(HttpStatus.OK).json({
                success: true,
                data: result
            });
        } catch (error) {
            this.logger.error('Send message error:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Send invitation message using cv_received_notification template
     */
    @Post('invitation')
    async sendInvitation(
        @Body() body: { to: string; name: string; link: string },
        @Res() res: Response
    ) {
        try {
            const result = await this.whatsAppService.sendInvitation(
                body.to,
                body.name,
                body.link
            );
            return res.status(HttpStatus.OK).json({
                success: true,
                data: result
            });
        } catch (error) {
            this.logger.error('Send invitation error:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            });
        }
    }
}
