import {
  // Subscription,
  // SubscriptionPlan,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  SubscriptionResponse
} from '@/types/subscriptions';

class SubscriptionsService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005';

  async getSubscriptions(): Promise<SubscriptionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/subscriptions`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          subscriptions: Array.isArray(result) ? result : result.subscriptions || [],
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to fetch subscriptions',
        };
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return {
        success: false,
        message: 'Network error while fetching subscriptions',
      };
    }
  }

  async getSubscription(subscriptionId: string): Promise<SubscriptionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          subscription: result,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to fetch subscription',
        };
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return {
        success: false,
        message: 'Network error while fetching subscription',
      };
    }
  }

  async createSubscription(data: CreateSubscriptionRequest): Promise<SubscriptionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          subscription: result,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to create subscription',
        };
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      return {
        success: false,
        message: 'Network error while creating subscription',
      };
    }
  }

  async updateSubscription(subscriptionId: string, data: UpdateSubscriptionRequest): Promise<SubscriptionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          subscription: result,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to update subscription',
        };
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      return {
        success: false,
        message: 'Network error while updating subscription',
      };
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<SubscriptionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        return {
          success: true,
        };
      } else {
        const result = await response.json();
        return {
          success: false,
          message: result.message || result.error || 'Failed to cancel subscription',
        };
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return {
        success: false,
        message: 'Network error while canceling subscription',
      };
    }
  }

  async renewSubscription(subscriptionId: string): Promise<SubscriptionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}/renew`, {
        method: 'POST',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          subscription: result,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to renew subscription',
        };
      }
    } catch (error) {
      console.error('Error renewing subscription:', error);
      return {
        success: false,
        message: 'Network error while renewing subscription',
      };
    }
  }

  async getSubscriptionPlans(): Promise<SubscriptionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/subscriptions/plans`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          plans: Array.isArray(result) ? result : result.plans || [],
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to fetch subscription plans',
        };
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return {
        success: false,
        message: 'Network error while fetching subscription plans',
      };
    }
  }

  async getSubscriptionPlan(planId: string): Promise<SubscriptionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/subscriptions/plans/${planId}`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          plans: [result], // Return as array for consistency
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to fetch subscription plan',
        };
      }
    } catch (error) {
      console.error('Error fetching subscription plan:', error);
      return {
        success: false,
        message: 'Network error while fetching subscription plan',
      };
    }
  }

  async getSubscriptionHistory(): Promise<SubscriptionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/subscriptions/history`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          subscriptions: Array.isArray(result) ? result : result.subscriptions || [],
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to fetch subscription history',
        };
      }
    } catch (error) {
      console.error('Error fetching subscription history:', error);
      return {
        success: false,
        message: 'Network error while fetching subscription history',
      };
    }
  }

  async getSubscriptionAnalytics(): Promise<{ success: boolean; analytics?: unknown; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/subscriptions/analytics`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          analytics: result,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to fetch subscription analytics',
        };
      }
    } catch (error) {
      console.error('Error fetching subscription analytics:', error);
      return {
        success: false,
        message: 'Network error while fetching subscription analytics',
      };
    }
  }
}

export const subscriptionsService = new SubscriptionsService();