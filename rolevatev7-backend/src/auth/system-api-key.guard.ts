import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ConfigService } from '@nestjs/config';

/**
 * System API Key Guard
 * 
 * This guard validates system-to-system API calls using the SYSTEM_API_KEY
 * environment variable. It's used for FastAPI CV analysis callbacks and other
 * internal service communications.
 * 
 * Unlike ApiKeyGuard which checks database-stored API keys, this guard checks
 * against the environment variable for simplified system integration.
 */
@Injectable()
export class SystemApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().request;
    
    const apiKey = request.headers['x-api-key'];
    const systemApiKey = this.configService.get<string>('SYSTEM_API_KEY');
    
    if (!apiKey || !systemApiKey) {
      console.warn('⚠️ System API key validation failed: Missing API key');
      return false;
    }
    
    const isValid = apiKey === systemApiKey;
    
    if (!isValid) {
      console.warn('⚠️ System API key validation failed: Invalid key');
    }
    
    return isValid;
  }
}
