import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserType } from '../user/user.entity';

/**
 * Guard to ensure a candidate can only access their own resources
 * Checks if the requested resource belongs to the authenticated user
 */
@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const { user } = ctx.getContext().req;
    const args = ctx.getArgs();

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Admins can access all resources
    if (user.userType === UserType.ADMIN || user.userType === UserType.SYSTEM) {
      return true;
    }

    // For candidates, check if they're accessing their own resource
    if (user.userType === UserType.CANDIDATE) {
      // Check various possible parameter names for user/candidate ID
      const resourceUserId = args.userId || args.candidateId || args.id;
      
      if (resourceUserId && resourceUserId !== user.id) {
        throw new ForbiddenException('You can only access your own resources');
      }
    }

    // For business users, check if they're accessing resources from their company
    if (user.userType === UserType.BUSINESS) {
      const resourceCompanyId = args.companyId;
      
      if (resourceCompanyId && resourceCompanyId !== user.companyId) {
        throw new ForbiddenException('You can only access resources from your company');
      }
    }

    return true;
  }
}
