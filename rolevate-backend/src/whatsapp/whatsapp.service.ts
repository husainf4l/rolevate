import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TokenManagerService } from './token-manager.service';
import * as crypto from 'crypto';

@Injectable()
export class WhatsAppService {
    private readonly logger = new Logger(WhatsAppService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        private readonly tokenManager: TokenManagerService,
    ) { }

    // Verify webhook during setup
    verifyWebhook(mode: string, token: string): boolean {
        const verifyToken = this.configService.get<string>('WHATSAPP_VERIFY_TOKEN');
        return mode === 'subscribe' && token === verifyToken;
    }

    // Verify webhook signature
    verifySignature(payload: string, signature: string): boolean {
        if (!signature) return false;

        // Use Facebook App Secret (not WhatsApp App Secret) for webhook signature verification
        const appSecret = this.configService.get<string>('FACEBOOK_APP_SECRET');
        if (!appSecret) {
            this.logger.error('Missing FACEBOOK_APP_SECRET for webhook signature verification');
            return false;
        }

        this.logger.log('🔍 Verifying signature with Facebook App Secret...');

        const expectedSignature = crypto
            .createHmac('sha256', appSecret)
            .update(payload, 'utf8')
            .digest('hex');

        const expectedSignatureWithPrefix = `sha256=${expectedSignature}`;

        this.logger.log('📋 Signature verification details:', {
            receivedSignature: signature,
            expectedSignature: expectedSignatureWithPrefix,
            match: signature === expectedSignatureWithPrefix
        });

        return signature === expectedSignatureWithPrefix;
    }

    // Process incoming webhook data
    async processWebhook(body: any): Promise<void> {
        try {
            this.logger.log('📞 WEBHOOK RECEIVED:', JSON.stringify(body, null, 2));

            if (body.object !== 'whatsapp_business_account') {
                this.logger.warn('Received webhook for unknown object:', body.object);
                return;
            }

            if (!body.entry || !Array.isArray(body.entry)) {
                this.logger.warn('No entry data in webhook');
                return;
            }

            for (const entry of body.entry) {
                this.logger.log('📋 Processing entry:', JSON.stringify(entry, null, 2));

                if (!entry.changes || !Array.isArray(entry.changes)) {
                    continue;
                }

                for (const change of entry.changes) {
                    this.logger.log('🔄 Processing change:', JSON.stringify(change, null, 2));
                    await this.processChange(change);
                }
            }
        } catch (error) {
            this.logger.error('❌ Error processing webhook:', error);
        }
    }

    // Process individual change
    private async processChange(change: any): Promise<void> {
        try {
            switch (change.field) {
                case 'messages':
                    await this.processMessages(change.value);
                    break;
                case 'message_template_status_update':
                    await this.processTemplateUpdate(change.value);
                    break;
                default:
                    this.logger.log(`Unhandled field type: ${change.field}`);
            }
        } catch (error) {
            this.logger.error('Error processing change:', error);
        }
    }

    // Process incoming messages
    private async processMessages(value: any): Promise<void> {
        try {
            this.logger.log('📨 PROCESSING MESSAGES:', JSON.stringify(value, null, 2));

            const { messages, contacts, metadata } = value;

            if (!messages || !Array.isArray(messages)) {
                this.logger.log('❌ No messages array found in webhook data');
                return;
            }

            this.logger.log(`📨 Found ${messages.length} messages to process`);

            for (const message of messages) {
                const contact = contacts?.find((c: any) => c.wa_id === message.from);

                this.logger.log('📱 Processing message:', {
                    messageId: message.id,
                    from: message.from,
                    type: message.type,
                    timestamp: message.timestamp,
                });

                // Save message to database
                this.logger.log('💾 Attempting to save message to database...');
                await this.saveMessage(message, contact);

                // Process based on message type
                await this.handleMessageType(message, contact);

                // Mark message as read
                await this.markAsRead(message.id);
            }
        } catch (error) {
            this.logger.error('❌ Error processing messages:', error);
        }
    }

    // Handle different message types
    private async handleMessageType(message: any, contact: any): Promise<void> {
        try {
            switch (message.type) {
                case 'text':
                    await this.handleTextMessage(message, contact);
                    break;
                case 'image':
                case 'document':
                case 'audio':
                case 'video':
                    await this.handleMediaMessage(message, contact);
                    break;
                case 'interactive':
                    await this.handleInteractiveMessage(message, contact);
                    break;
                case 'button':
                    await this.handleButtonMessage(message, contact);
                    break;
                default:
                    this.logger.log(`Unhandled message type: ${message.type}`);
            }
        } catch (error) {
            this.logger.error('Error handling message type:', error);
        }
    }

    // Handle text messages
    private async handleTextMessage(message: any, contact: any): Promise<void> {
        const text = message.text?.body?.toLowerCase().trim();
        const from = message.from;

        // Simple auto-responses
        if (text?.includes('hello') || text?.includes('hi')) {
            await this.sendTextMessage(from, 'Hello! How can I help you today?');
        } else if (text?.includes('menu')) {
            await this.sendTextMessage(from, 'Here is our menu: \n1. Services\n2. Contact\n3. Support');
        } else if (text?.includes('support')) {
            await this.sendTextMessage(from, 'I will connect you with our support team.');
        }
    }

    // Handle media messages
    private async handleMediaMessage(message: any, contact: any): Promise<void> {
        this.logger.log(`Received ${message.type} message from ${message.from}`);
        // Add your media processing logic here
    }

    // Handle interactive messages
    private async handleInteractiveMessage(message: any, contact: any): Promise<void> {
        const interactive = message.interactive;
        let selectedOption = null;

        if (interactive?.type === 'button_reply') {
            selectedOption = interactive.button_reply.id;
        } else if (interactive?.type === 'list_reply') {
            selectedOption = interactive.list_reply.id;
        }

        this.logger.log(`User selected option: ${selectedOption}`);
        // Add your interactive message processing logic here
    }

    // Handle button messages
    private async handleButtonMessage(message: any, contact: any): Promise<void> {
        this.logger.log('Button message received');
        // Add your button message processing logic here
    }

    // Process template updates
    private async processTemplateUpdate(value: any): Promise<void> {
        try {
            const { message_template_id, message_template_name, event } = value;

            this.logger.log('Template status update:', {
                templateId: message_template_id,
                templateName: message_template_name,
                event,
            });

            // Update template status in database if needed
        } catch (error) {
            this.logger.error('Error processing template update:', error);
        }
    }

    // Save message to database
    private async saveMessage(message: any, contact: any): Promise<void> {
        try {
            this.logger.log('💾 SAVE MESSAGE - Starting save process...');

            const phoneNumber = message.from;
            const messageContent = this.getMessageContent(message);
            const timestamp = new Date(parseInt(message.timestamp) * 1000);

            this.logger.log('💾 SAVE MESSAGE - Data prepared:', {
                phoneNumber,
                messageContent,
                timestamp,
                contactName: contact?.profile?.name
            });

            // Create or update conversation
            this.logger.log('💾 SAVE MESSAGE - Creating/updating conversation...');
            const conversation = await this.prisma.whatsAppConversation.upsert({
                where: { phoneNumber },
                update: {
                    lastMessageAt: timestamp,
                    contactName: contact?.profile?.name || null,
                    isActive: true, // Reset to active on new message
                    templateRequired: false // They can receive regular messages for 24h
                },
                create: {
                    phoneNumber,
                    contactName: contact?.profile?.name || null,
                    lastMessageAt: timestamp,
                    isActive: true,
                    templateRequired: false
                }
            });

            this.logger.log('💾 SAVE MESSAGE - Conversation created/updated:', { conversationId: conversation.id });

            // Save the message
            this.logger.log('💾 SAVE MESSAGE - Saving message...');
            const savedMessage = await this.prisma.whatsAppMessage.create({
                data: {
                    messageId: message.id,
                    from: message.from,
                    direction: 'INBOUND',
                    type: message.type.toUpperCase() as any,
                    content: messageContent,
                    timestamp: timestamp,
                    contactName: contact?.profile?.name || null,
                    metadata: message,
                    conversationId: conversation.id,
                    status: 'DELIVERED'
                }
            });

            this.logger.log(`✅ Message ${message.id} saved successfully to database with ID: ${savedMessage.id}`);
        } catch (error) {
            this.logger.error('❌ SAVE MESSAGE ERROR:', error);
            this.logger.error('❌ SAVE MESSAGE ERROR - Full error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
        }
    }

    // Save outbound message to database
    private async saveOutboundMessage(
        to: string,
        messageId: string,
        type: string,
        content: string,
        templateName?: string
    ): Promise<void> {
        try {
            // Create or update conversation
            const conversation = await this.prisma.whatsAppConversation.upsert({
                where: { phoneNumber: to },
                update: {
                    lastMessageAt: new Date(),
                    isActive: true,
                    templateRequired: false
                },
                create: {
                    phoneNumber: to,
                    lastMessageAt: new Date(),
                    isActive: true,
                    templateRequired: false
                }
            });

            // Save the outbound message
            await this.prisma.whatsAppMessage.create({
                data: {
                    messageId: messageId,
                    from: this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID') || '684085261451106',
                    to: to,
                    direction: 'OUTBOUND',
                    type: type.toUpperCase() as any,
                    content: content,
                    templateName: templateName,
                    timestamp: new Date(),
                    conversationId: conversation.id,
                    status: 'SENT'
                }
            });

            this.logger.log(`Outbound message ${messageId} saved to database`);
        } catch (error) {
            this.logger.error('Error saving outbound message to database:', error);
        }
    }

    // Extract message content based on type
    private getMessageContent(message: any): string {
        switch (message.type) {
            case 'text':
                return message.text?.body || '';
            case 'image':
                return message.image?.caption || '';
            case 'document':
                return message.document?.caption || message.document?.filename || '';
            case 'audio':
                return 'Audio message';
            case 'video':
                return message.video?.caption || 'Video message';
            case 'interactive':
                if (message.interactive?.type === 'button_reply') {
                    return message.interactive.button_reply.title;
                } else if (message.interactive?.type === 'list_reply') {
                    return message.interactive.list_reply.title;
                }
                return 'Interactive message';
            default:
                return `${message.type} message`;
        }
    }

    // Send text message
    async sendTextMessage(to: string, text: string): Promise<any> {
        try {
            const phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID') || '684085261451106';
            const accessToken = await this.tokenManager.getAccessToken();

            const response = await fetch(
                `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messaging_product: 'whatsapp',
                        to,
                        type: 'text',
                        text: { body: text },
                    }),
                },
            );

            const result = await response.json();

            if (!response.ok) {
                this.logger.error('Error sending message:', result);
                throw new Error(`WhatsApp API error: ${result.error?.message || 'Unknown error'}`);
            }

            // Save outbound text message to database
            if (result.messages && result.messages[0]) {
                await this.saveOutboundMessage(to, result.messages[0].id, 'TEXT', text);
            }

            this.logger.log('Message sent:', result);
            return result;
        } catch (error) {
            this.logger.error('Error sending message:', error);
            throw error;
        }
    }

    // Send template message (required for new contacts)
    async sendTemplateMessage(to: string, templateName: string, languageCode: string = 'en', parameters?: any[]): Promise<any> {
        try {
            const phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID') || '684085261451106';
            const accessToken = await this.tokenManager.getAccessToken();

            const templatePayload: any = {
                messaging_product: 'whatsapp',
                to,
                type: 'template',
                template: {
                    name: templateName,
                    language: {
                        code: languageCode
                    }
                }
            };

            // Add parameters if provided
            if (parameters && parameters.length > 0) {
                templatePayload.template.components = [
                    {
                        type: 'body',
                        parameters: parameters.map(param => ({
                            type: 'text',
                            text: param
                        }))
                    }
                ];
            }

            const response = await fetch(
                `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(templatePayload),
                },
            );

            const result = await response.json();

            if (!response.ok) {
                this.logger.error('Error sending template message:', result);
                throw new Error(`WhatsApp API error: ${result.error?.message || 'Unknown error'}`);
            }

            // Save outbound template message to database
            if (result.messages && result.messages[0]) {
                const content = `Template: ${templateName}`;
                await this.saveOutboundMessage(to, result.messages[0].id, 'TEMPLATE', content, templateName);
            }

            this.logger.log('Template message sent:', result);
            return result;
        } catch (error) {
            this.logger.error('Error sending template message:', error);
            throw error;
        }
    }

    // Send invitation using cv_received_notification template
    async sendInvitation(to: string, name: string, link: string): Promise<any> {
        try {
            // Create the components for cv_received_notification template
            const components = [
                {
                    type: "body",
                    parameters: [
                        {
                            type: "text",
                            text: name
                        }
                    ]
                },
                {
                    type: "button",
                    sub_type: "url",
                    index: "0",
                    parameters: [
                        {
                            type: "text",
                            text: link
                        }
                    ]
                }
            ];

            const phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID') || '684085261451106';
            const accessToken = await this.tokenManager.getAccessToken();

            const templatePayload = {
                messaging_product: 'whatsapp',
                to,
                type: 'template',
                template: {
                    name: 'cv_received_notification',
                    language: {
                        code: 'en'
                    },
                    components: components
                }
            };

            const response = await fetch(
                `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(templatePayload),
                },
            );

            const result = await response.json();

            if (!response.ok) {
                this.logger.error('Error sending invitation:', result);
                throw new Error(`WhatsApp API error: ${result.error?.message || 'Unknown error'}`);
            }

            // Save outbound invitation message to database
            if (result.messages && result.messages[0]) {
                const content = `CV Received Notification for ${name}`;
                await this.saveOutboundMessage(to, result.messages[0].id, 'TEMPLATE', content, 'cv_received_notification');
            }

            this.logger.log('Invitation sent successfully:', {
                to,
                name,
                link,
                messageId: result.messages?.[0]?.id
            });

            return result;
        } catch (error) {
            this.logger.error('Error sending invitation:', error);
            throw error;
        }
    }

    // Check if contact is new (no previous conversation in last 24 hours)
    async isNewContact(phoneNumber: string): Promise<boolean> {
        try {
            const conversation = await this.prisma.whatsAppConversation.findUnique({
                where: { phoneNumber },
                include: {
                    messages: {
                        orderBy: { timestamp: 'desc' },
                        take: 1
                    }
                }
            });

            if (!conversation || conversation.messages.length === 0) {
                return true; // No previous conversation
            }

            // Check if last message was more than 24 hours ago
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const lastMessage = conversation.messages[0];

            return lastMessage.timestamp < twentyFourHoursAgo;
        } catch (error) {
            this.logger.error('Error checking if contact is new:', error);
            return true; // Default to template message if unsure
        }
    }

    // Send message (automatically chooses template vs text based on contact status)
    async sendMessage(to: string, message: string, templateName?: string): Promise<any> {
        try {
            const isNew = await this.isNewContact(to);

            if (isNew && templateName) {
                this.logger.log(`Sending template message to new contact: ${to}`);
                return await this.sendTemplateMessage(to, templateName, 'en');
            } else {
                this.logger.log(`Sending text message to existing contact: ${to}`);
                return await this.sendTextMessage(to, message);
            }
        } catch (error) {
            this.logger.error('Error sending message:', error);
            throw error;
        }
    }

    // Mark message as read
    private async markAsRead(messageId: string): Promise<void> {
        try {
            const phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID') || '684085261451106';
            const accessToken = await this.tokenManager.getAccessToken();

            const response = await fetch(
                `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messaging_product: 'whatsapp',
                        status: 'read',
                        message_id: messageId,
                    }),
                },
            );

            if (!response.ok) {
                const error = await response.json();
                this.logger.error('Error marking message as read:', error);
            }
        } catch (error) {
            this.logger.error('Error marking message as read:', error);
        }
    }

    // Utility methods for token management

    /**
     * Refresh the cached access token
     */
    async refreshAccessToken(): Promise<void> {
        this.tokenManager.clearTokenCache();
        await this.tokenManager.getAccessToken();
        this.logger.log('Access token refreshed');
    }

    /**
     * Get current token information for debugging
     */
    async getTokenInfo(): Promise<any> {
        return this.tokenManager.getTokenInfo();
    }

    /**
     * Test the WhatsApp API connection
     */
    async testConnection(): Promise<any> {
        try {
            const phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID') || '684085261451106';
            const accessToken = await this.tokenManager.getAccessToken();

            const response = await fetch(
                `https://graph.facebook.com/v23.0/${phoneNumberId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                }
            );

            const result = await response.json();

            if (response.ok) {
                this.logger.log('WhatsApp API connection successful');
                return { success: true, data: result };
            } else {
                this.logger.error('WhatsApp API connection failed:', result);
                return { success: false, error: result };
            }
        } catch (error) {
            this.logger.error('Error testing connection:', error);
            return { success: false, error: error.message };
        }
    }
}
