import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import util from 'util';
import { ConfigService } from '@nestjs/config';
import { TokenManagerService } from './token-manager.service';

@Injectable()
export class WhatsAppService {
    private readonly logger = new Logger(WhatsAppService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly tokenManager: TokenManagerService,
    ) { }

    async listTemplates() {
        const businessAccountId = this.configService.get<string>('WHATSAPP_BUSINESS_ACCOUNT_ID');
        const apiVersion = this.configService.get<string>('WHATSAPP_API_VERSION') || 'v18.0';
        const accessToken = await this.tokenManager.getAccessToken();
        // DEBUG: Log the access token being used
        console.log('DEBUG: Using access token:', accessToken);
        const url = `https://graph.facebook.com/${apiVersion}/${businessAccountId}/message_templates`;
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) {
            // DEBUG: Log the full error response
            const errorResponse = await res.json();
            console.error('DEBUG: Error response data:', util.inspect(errorResponse, { depth: 5 }));
            throw new BadRequestException(`Failed to list templates: ${JSON.stringify(errorResponse)}`);
        }
        return await res.json();
    }

    async sendTemplateMessage(to: string, templateName: string, lang?: string, params?: string[]) {
        // Set default language based on template name
        if (!lang) {
            // Map template names to their correct language codes
            const templateLanguageMap: Record<string, string> = {
                'hello_world': 'en_US',
                'cv_received_notification': 'en',
                'temppassword': 'en_US'
            };
            lang = templateLanguageMap[templateName] || 'en_US';
        }
        const phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID');
        const apiVersion = this.configService.get<string>('WHATSAPP_API_VERSION') || 'v18.0';
        const accessToken = await this.tokenManager.getAccessToken();
        const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

        // Build components for BODY and BUTTON if params are provided
        let components: any[] | undefined = undefined;
        if (params && params.length > 0) {
            // For AUTHENTICATION templates (like temppassword), needs body + URL button parameter
            if (templateName === 'temppassword') {
                components = [
                    {
                        type: 'body',
                        parameters: [
                            { type: 'text', text: params[0] }
                        ]
                    },
                    {
                        type: 'button',
                        sub_type: 'url',
                        index: 0,
                        parameters: [
                            { type: 'text', text: params[0] }
                        ]
                    }
                ];
            }
            // For other templates with parameters
            else {
                components = [
                    {
                        type: 'body',
                        parameters: [
                            { type: 'text', text: params[0] }
                        ]
                    }
                ];
                // If a second param is provided, add a URL button parameter
                if (params.length > 1) {
                    components.push({
                        type: 'button',
                        sub_type: 'url',
                        index: 0,
                        parameters: [
                            { type: 'text', text: params[1] }
                        ]
                    });
                }
            }
        }

        const payload = {
            messaging_product: 'whatsapp',
            to,
            type: 'template',
            template: {
                name: templateName,
                language: { code: lang },
                ...(components ? { components } : {}),
            },
        };
        
        // DEBUG: Log the payload being sent
        this.logger.log('Sending WhatsApp template message:', JSON.stringify(payload, null, 2));
        
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok) {
            this.logger.error('Error sending template message:', result);
            throw new BadRequestException(`WhatsApp API error: ${result.error?.message || 'Unknown error'}`);
        }
        this.logger.log('Template message sent:', result);
        return result;
    }

    async sendTextMessage(to: string, text: string) {
        const phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID');
        const apiVersion = this.configService.get<string>('WHATSAPP_API_VERSION') || 'v18.0';
        const accessToken = await this.tokenManager.getAccessToken();
        const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

        const payload = {
            messaging_product: 'whatsapp',
            to,
            type: 'text',
            text: {
                body: text
            }
        };

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const result = await res.json();
        if (!res.ok) {
            this.logger.error('Error sending text message:', result);
            throw new BadRequestException(`WhatsApp API error: ${result.error?.message || 'Unknown error'}`);
        }

        this.logger.log('Text message sent:', result);
        return result;
    }

    /**
     * Handle incoming WhatsApp webhook payloads
     * Processes messages, status updates, and other webhook events
     */
    async handleWebhook(payload: any) {
        this.logger.log('Processing WhatsApp webhook payload');

        try {
            // Check if this is a valid webhook payload
            if (!payload.object || payload.object !== 'whatsapp_business_account') {
                this.logger.warn('Invalid webhook payload object:', payload.object);
                return;
            }

            if (!payload.entry || !Array.isArray(payload.entry)) {
                this.logger.warn('Invalid webhook payload entry');
                return;
            }

            // Process each entry
            for (const entry of payload.entry) {
                if (entry.messaging && Array.isArray(entry.messaging)) {
                    await this.processMessages(entry.messaging);
                }

                if (entry.changes && Array.isArray(entry.changes)) {
                    await this.processChanges(entry.changes);
                }
            }

            this.logger.log('Webhook processing completed successfully');
        } catch (error) {
            this.logger.error('Error processing webhook:', error);
            throw error;
        }
    }

    /**
     * Process messaging events from webhook
     */
    private async processMessages(messaging: any[]) {
        for (const message of messaging) {
            try {
                // Handle message status updates
                if (message.message && message.message.id) {
                    await this.handleMessageStatus(message);
                }

                // Handle incoming messages
                if (message.message && message.message.type && message.contacts) {
                    await this.handleIncomingMessage(message);
                }
            } catch (error) {
                this.logger.error('Error processing message:', error);
            }
        }
    }

    /**
     * Process changes from webhook
     */
    private async processChanges(changes: any[]) {
        for (const change of changes) {
            if (change.field === 'messages') {
                // Handle message-related changes
                this.logger.log('Processing message changes:', change);
            } else if (change.field === 'message_template_status_update') {
                // Handle template status updates
                this.logger.log('Processing template status update:', change);
            }
        }
    }

    /**
     * Handle message status updates (delivered, read, etc.)
     */
    private async handleMessageStatus(message: any) {
        const messageId = message.message.id;
        const status = message.message.status;
        const timestamp = message.timestamp;

        this.logger.log(`Message status update - ID: ${messageId}, Status: ${status}, Timestamp: ${timestamp}`);

        // Here you could update message status in database
        // For now, just log the status
        switch (status) {
            case 'sent':
                this.logger.log(`Message ${messageId} was sent`);
                break;
            case 'delivered':
                this.logger.log(`Message ${messageId} was delivered`);
                break;
            case 'read':
                this.logger.log(`Message ${messageId} was read`);
                break;
            case 'failed':
                this.logger.error(`Message ${messageId} failed to send`);
                break;
            default:
                this.logger.log(`Unknown message status: ${status}`);
        }
    }

    /**
     * Handle incoming messages from users
     */
    private async handleIncomingMessage(message: any) {
        const from = message.contacts[0]?.wa_id;
        const messageData = message.message;
        const timestamp = message.timestamp;

        this.logger.log(`Incoming message from ${from}:`, messageData);

        // Handle different message types
        switch (messageData.type) {
            case 'text':
                await this.handleTextMessage(from, messageData.text.body, timestamp);
                break;
            case 'image':
                this.logger.log(`Received image from ${from}`);
                // Handle image messages
                break;
            case 'document':
                this.logger.log(`Received document from ${from}`);
                // Handle document messages
                break;
            default:
                this.logger.log(`Received ${messageData.type} message from ${from}`);
        }
    }

    /**
     * Handle incoming text messages
     */
    private async handleTextMessage(from: string, text: string, _timestamp: string) {
        this.logger.log(`Processing text message from ${from}: ${text}`);

        // Here you could implement auto-responses, forward to customer service, etc.
        // For now, just log the message

        // Example: Send an auto-reply
        // await this.sendTextMessage(from, 'Thank you for your message. We will get back to you soon.');
    }
}
