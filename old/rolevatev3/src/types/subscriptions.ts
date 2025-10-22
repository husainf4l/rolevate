export interface Subscription {
  id: string;
  name: string;
  plan: string;
  status: 'active' | 'inactive' | 'expired';
  startDate: string;
  endDate: string;
  price: number;
  currency: string;
  features: string[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
}

export interface CreateSubscriptionRequest {
  planId: string;
  paymentMethodId?: string;
}

export interface UpdateSubscriptionRequest {
  status?: 'active' | 'inactive' | 'cancelled';
}

export interface SubscriptionResponse {
  success: boolean;
  message?: string;
  subscription?: Subscription;
  subscriptions?: Subscription[];
  plans?: SubscriptionPlan[];
}