import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { CHECK_OWNERSHIP_KEY, OwnershipCheckOptions } from '../decorators/check-ownership.decorator';
import { ResourceOwnershipService } from '../services/resource-ownership.service';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private ownershipService: ResourceOwnershipService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ownershipOptions = this.reflector.getAllAndOverride<OwnershipCheckOptions>(
      CHECK_OWNERSHIP_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!ownershipOptions) {
      return true; // No ownership check required
    }

    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    const user = req.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Get the resource ID from the request arguments
    const args = ctx.getArgs();
    const resourceIdParam = ownershipOptions.resourceIdParam || 'id';
    const resourceId = args[resourceIdParam] || args.input?.[resourceIdParam];

    if (!resourceId) {
      throw new ForbiddenException(`Resource ID parameter '${resourceIdParam}' not found`);
    }

    // Check ownership based on resource type
    let result;
    switch (ownershipOptions.resourceType) {
      case 'application':
        result = await this.ownershipService.checkApplicationOwnership(
          resourceId,
          user.id,
          user.userType,
          user.companyId,
        );
        break;

      case 'application-note':
        result = await this.ownershipService.checkApplicationNoteOwnership(
          resourceId,
          user.id,
          user.userType,
          user.companyId,
        );
        break;

      case 'job':
        result = await this.ownershipService.checkJobOwnership(
          resourceId,
          user.id,
          user.userType,
          user.companyId,
        );
        break;

      case 'candidate-profile':
        if (ownershipOptions.isModification) {
          result = await this.ownershipService.checkCandidateProfileModifyPermission(
            resourceId,
            user.id,
            user.userType,
          );
        } else {
          result = await this.ownershipService.checkCandidateProfileOwnership(
            resourceId,
            user.id,
            user.userType,
          );
        }
        break;

      default:
        throw new ForbiddenException('Unknown resource type');
    }

    if (!result.isOwner) {
      throw new ForbiddenException(result.reason || 'You do not have permission to access this resource');
    }

    // Attach the resource to the request for use in the resolver
    req.ownershipVerifiedResource = result.resource;

    return true;
  }
}
