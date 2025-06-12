import { SetMetadata } from '@nestjs/common';
import { SubscriptionFeature } from '../guards/subscription.guard';

export const SUBSCRIPTION_FEATURE_KEY = 'subscriptionFeature';
export const RequireSubscriptionFeature = (feature: SubscriptionFeature) =>
  SetMetadata(SUBSCRIPTION_FEATURE_KEY, feature);
