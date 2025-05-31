import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);
  
  constructor(
    private reflector: Reflector
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }
    
    const canActivate = super.canActivate(context);

    if (typeof canActivate === 'boolean' && !canActivate) {
      this.logger.warn('JWT Guard blocked a request (synchronous check)');
    }

    return canActivate;
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    if (err || !user) {
      const request = context.switchToHttp().getRequest();
      const logData = {
        message: `JWT Authentication Failed: ${info?.message || (err?.message || 'No user or error info')}`,
        error: err?.message,
        info: info?.message,
        requestDetails: {
          ip: request.ip,
          path: request.url,
          method: request.method,
          // Optionally log headers, be careful with sensitive info
          // headers: request.headers, 
        }
      };
      
      this.logger.warn(JSON.stringify(logData));
      throw err || new UnauthorizedException(info?.message || 'Unauthorized');
    }
    return user;
  }
}
