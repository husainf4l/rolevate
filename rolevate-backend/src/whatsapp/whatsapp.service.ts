
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
            const _error = await res.text();
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
            const templateLanguageMap = {
                'hello_world': 'en_US',
                'cv_received_notification': 'en'
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
            components = [
                {
                    type: 'body',
                    parameters: [
                        { type: 'text', text: params[0] }
                    ]
                }
            ];
            // If a second param is provided, add a button parameter
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
}
