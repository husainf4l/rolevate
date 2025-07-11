import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface TokenCache {
    token: string;
    expiresAt: Date;
}

@Injectable()
export class TokenManagerService {
    private readonly logger = new Logger(TokenManagerService.name);
    private tokenCache: Map<string, TokenCache> = new Map();

    constructor(private readonly configService: ConfigService) { }

    async getAccessToken(): Promise<string> {
        const cacheKey = 'whatsapp_access_token';
        const cached = this.tokenCache.get(cacheKey);
        if (cached && cached.expiresAt > new Date(Date.now() + 5 * 60 * 1000)) {
            return cached.token;
        }
        const newToken = await this.fetchAccessToken();
        return newToken;
    }

    private async fetchAccessToken(): Promise<string> {
        try {
            const staticToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN');
            if (staticToken) {
                this.logger.log('Using static WhatsApp access token');
                this.cacheToken('whatsapp_access_token', staticToken, 24 * 60 * 60 * 1000);
                return staticToken;
            }
            // Use FACEBOOK_SYSTEM_USER_TOKEN directly if present
            const envSystemUserToken = this.configService.get<string>('FACEBOOK_SYSTEM_USER_TOKEN');
            if (envSystemUserToken) {
                this.logger.log('Using FACEBOOK_SYSTEM_USER_TOKEN from environment');
                this.cacheToken('whatsapp_access_token', envSystemUserToken, 24 * 60 * 60 * 1000);
                return envSystemUserToken;
            }
            const appId = this.configService.get<string>('FACEBOOK_APP_ID');
            const appSecret = this.configService.get<string>('FACEBOOK_APP_SECRET');
            const systemUserId = this.configService.get<string>('FACEBOOK_SYSTEM_USER_ID');
            if (!appId || !appSecret || !systemUserId) {
                throw new Error('Missing Facebook app credentials. Please set FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, and FACEBOOK_SYSTEM_USER_ID in your environment variables.');
            }
            const appAccessToken = await this.getAppAccessToken(appId, appSecret);
            const systemUserToken = await this.getSystemUserToken(systemUserId, appAccessToken);
            this.cacheToken('whatsapp_access_token', systemUserToken, 24 * 60 * 60 * 1000);
            this.logger.log('Successfully fetched new WhatsApp access token');
            return systemUserToken;
        } catch (error) {
            this.logger.error('Failed to fetch access token:', error);
            throw new Error('Unable to obtain WhatsApp access token');
        }
    }

    private async getAppAccessToken(appId: string, appSecret: string): Promise<string> {
        const response = await fetch(
            `https://graph.facebook.com/v23.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&grant_type=client_credentials`
        );
        if (!response.ok) {
            throw new Error(`Failed to get app access token: ${response.statusText}`);
        }
        const data = await response.json();
        return data.access_token;
    }

    private async getSystemUserToken(systemUserId: string, appAccessToken: string): Promise<string> {
        const response = await fetch(
            `https://graph.facebook.com/v23.0/${systemUserId}/access_tokens`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${appAccessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    scope: 'whatsapp_business_messaging,whatsapp_business_management'
                })
            }
        );
        if (!response.ok) {
            throw new Error(`Failed to get system user token: ${response.statusText}`);
        }
        const data = await response.json();
        return data.access_token;
    }

    async getWhatsAppBusinessAccountToken(): Promise<string> {
        try {
            const accessToken = await this.getAccessToken();
            const wabaId = this.configService.get<string>('WHATSAPP_BUSINESS_ACCOUNT_ID');
            const response = await fetch(
                `https://graph.facebook.com/v23.0/${wabaId}?fields=access_token`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                }
            );
            if (!response.ok) {
                this.logger.warn('Could not get WABA-specific token, using system user token');
                return accessToken;
            }
            const data = await response.json();
            return data.access_token || accessToken;
        } catch (error) {
            this.logger.error('Error getting WABA token:', error);
            return this.getAccessToken();
        }
    }

    private cacheToken(key: string, token: string, ttlMs: number): void {
        const expiresAt = new Date(Date.now() + ttlMs);
        this.tokenCache.set(key, { token, expiresAt });
    }

    clearTokenCache(): void {
        this.tokenCache.clear();
        this.logger.log('Token cache cleared');
    }

    async getTokenInfo(): Promise<any> {
        try {
            const token = await this.getAccessToken();
            const response = await fetch(
                `https://graph.facebook.com/v23.0/debug_token?input_token=${token}&access_token=${token}`
            );
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            this.logger.error('Error getting token info:', error);
        }
        return null;
    }
}
