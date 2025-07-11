import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    console.log('=== JWT Auth Guard canActivate called ===');
    
    const request = context.switchToHttp().getRequest();
    console.log('Request headers:', request.headers);
    console.log('Request cookies:', request.cookies);
    console.log('Authorization header:', request.headers.authorization);
    
    const skipAuth = this.reflector.getAllAndOverride<boolean>('skipAuth', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipAuth) {
      console.log('Skipping auth due to skipAuth decorator');
      return true;
    }

    console.log('Proceeding with JWT validation');
    return super.canActivate(context);
  }
}
