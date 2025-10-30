import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ApiKeyService } from '../user/api-key.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UserType } from '../user/user.entity';

@Injectable()
export class BusinessOrApiKeyGuard implements CanActivate {
  constructor(
    private apiKeyService: ApiKeyService,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    // First try API key authentication
    const apiKey = request.headers['x-api-key'];
    if (apiKey) {
      // For API key, we need to validate and get the associated user
      const isValidApiKey = await this.apiKeyService.validateApiKey(apiKey);
      if (isValidApiKey) {
        // Get the user associated with this API key
        const apiKeyEntity = await this.apiKeyService.findByKey(apiKey);
        if (apiKeyEntity && apiKeyEntity.user) {
          request.user = apiKeyEntity.user;
          return true;
        }
      }
    }

    // If API key fails, try JWT authentication for BUSINESS users
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
        const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie: string) => {
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
      if (user && user.userType === UserType.BUSINESS && user.isActive) {
        request.user = user;
        return true;
      }
    } catch (error) {
      // JWT verification failed
    }

    return false;
  }
}