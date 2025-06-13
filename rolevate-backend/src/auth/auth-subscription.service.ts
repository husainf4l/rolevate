import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SubscriptionService } from '../subscription/subscription.service';
import { AuthService } from './auth.service';

/**
 * This service is used to adapt the new SubscriptionService to the existing AuthService
 * to ensure minimal changes to existing code while transitioning to the new system.
 */
@Injectable()
export class AuthSubscriptionAdapter {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  /**
   * Checks if a company can create a job post based on their subscription
   */
  async canCreateJobPost(companyId: string): Promise<boolean> {
    return this.subscriptionService.canUseFeature(companyId, 'createJobPost');
  }

  /**
   * Checks if a company can process an interview based on their subscription
   */
  async canProcessInterview(companyId: string): Promise<boolean> {
    return this.subscriptionService.canUseFeature(companyId, 'createInterview');
  }

  /**
   * Gets the subscription status and details for a company
   */
  async checkSubscriptionStatus(companyId: string): Promise<{ isActive: boolean; subscription?: any }> {
    try {
      const stats = await this.subscriptionService.getSubscriptionStats(companyId);
      return {
        isActive: stats.isActive,
        subscription: stats.subscription
      };
    } catch (error) {
      return { isActive: false };
    }
  }
}
