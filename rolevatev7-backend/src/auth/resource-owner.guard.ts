import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    const args = ctx.getArgs();
    
    const user = req.user;
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if the user is accessing their own resource
    const resourceUserId = args.id || args.userId || args.input?.userId;
    
    if (resourceUserId && resourceUserId !== user.id) {
      throw new ForbiddenException('You can only access your own resources');
    }

    return true;
  }
}
