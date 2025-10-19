import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ApiKeyService } from '../user/api-key.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';

/**
 * Guard that allows either JWT token or API key authentication
 * Used for mutations that need to be accessible by both authenticated users and system services
 */
@Injectable()
export class JwtOrApiKeyGuard implements CanActivate {
  constructor(
    private apiKeyService: ApiKeyService,
    private jwtService: JwtService,
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    // First try API key authentication (including system API key)
    const apiKey = request.headers['x-api-key'];
    if (apiKey) {
      // Check if it's the system API key (special case)
      const systemApiKey = this.configService.get<string>('SYSTEM_API_KEY');
      if (systemApiKey && apiKey === systemApiKey) {
        // System API key - create a system user context
        request.user = {
          userId: 'system',
          userType: 'SYSTEM',
          isSystemKey: true,
          sub: 'system',
        };
        return true;
      }

      // Regular API key - validate and get the associated user
      const isValidApiKey = await this.apiKeyService.validateApiKey(apiKey);
      if (isValidApiKey) {
        const apiKeyEntity = await this.apiKeyService.findByKey(apiKey);
        if (apiKeyEntity && apiKeyEntity.user) {
          request.user = {
            ...apiKeyEntity.user,
            userId: apiKeyEntity.user.id,
            isApiKey: true,
          };
          return true;
        }
      }
    }

    // If API key fails, try JWT authentication
    let token: string | undefined;

    // Get token from Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Or from cookie
    if (!token) {
      const cookieHeader = request.headers.cookie;
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);
        token = cookies['access_token'];
      }
    }

    if (!token) {
      return false;
    }

    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userService.findOne(payload.sub);
      if (user && user.isActive) {
        request.user = {
          ...user,
          userId: user.id,
          isJwt: true,
        };
        return true;
      }
    } catch (error) {
      // JWT verification failed
    }

    return false;
  }
}
