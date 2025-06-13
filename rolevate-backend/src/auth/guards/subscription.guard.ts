import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { SUBSCRIPTION_FEATURE_KEY } from '../decorators/subscription-feature.decorator';

export enum SubscriptionFeature {
  CREATE_JOB_POST = 'CREATE_JOB_POST',
  PROCESS_INTERVIEW = 'PROCESS_INTERVIEW',
  ACCESS_ANALYTICS = 'ACCESS_ANALYTICS',
  BULK_ACTIONS = 'BULK_ACTIONS',
  ADVANCED_FILTERS = 'ADVANCED_FILTERS',
  API_ACCESS = 'API_ACCESS',
}

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.getAllAndOverride<SubscriptionFeature>(
      SUBSCRIPTION_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredFeature) {
      return true; // No subscription requirement
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.companyId) {
      throw new ForbiddenException('Company membership required');
    }

    // Super admin can bypass subscription checks
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }
    
    const { isActive, subscription } = await this.authService.checkSubscriptionStatus(user.companyId);

    if (!isActive || !subscription) {
      throw new ForbiddenException('Active subscription required');
    }

    // Check specific feature access based on subscription plan
    const hasAccess = this.checkFeatureAccess(requiredFeature, subscription.plan);

    if (!hasAccess) {
      throw new ForbiddenException(`Feature '${requiredFeature}' requires a higher subscription plan`);
    }

    // For CREATE_JOB_POST, check the actual limits
    if (requiredFeature === SubscriptionFeature.CREATE_JOB_POST) {
      const canCreate = await this.authService.canCreateJobPost(user.companyId);
      if (!canCreate) {
        throw new ForbiddenException('Job post limit reached for current subscription plan');
      }
    }

    return true;
  }

  private checkFeatureAccess(feature: SubscriptionFeature, plan: string): boolean {
    const featureMatrix = {
      [SubscriptionFeature.CREATE_JOB_POST]: ['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'],
      [SubscriptionFeature.PROCESS_INTERVIEW]: ['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'],
      [SubscriptionFeature.ACCESS_ANALYTICS]: ['BASIC', 'PREMIUM', 'ENTERPRISE'],
      [SubscriptionFeature.BULK_ACTIONS]: ['PREMIUM', 'ENTERPRISE'],
      [SubscriptionFeature.ADVANCED_FILTERS]: ['PREMIUM', 'ENTERPRISE'],
      [SubscriptionFeature.API_ACCESS]: ['ENTERPRISE'],
    };

    return featureMatrix[feature]?.includes(plan) || false;
  }
}
