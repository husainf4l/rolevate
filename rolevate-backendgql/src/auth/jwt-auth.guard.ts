import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    
    let token: string | undefined;

    // First try to get from Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // If not found in header, try cookie
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
      if (user) {
        request.user = user;
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  }
}