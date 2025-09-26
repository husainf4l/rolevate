import { ApiKey } from '@/types/common';

class ApiKeysService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005';

  async getApiKeys(): Promise<{ success: boolean; apiKeys?: ApiKey[]; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api-keys`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          apiKeys: Array.isArray(result) ? result : [],
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to fetch API keys',
        };
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
      return {
        success: false,
        message: 'Network error while fetching API keys',
      };
    }
  }

  async createApiKey(name: string): Promise<{ success: boolean; apiKey?: ApiKey; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          apiKey: result,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to create API key',
        };
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      return {
        success: false,
        message: 'Network error while creating API key',
      };
    }
  }

  async deleteApiKey(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api-keys/${id}`, {
        method: 'DELETE',
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
          message: result.message || result.error || 'Failed to delete API key',
        };
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      return {
        success: false,
        message: 'Network error while deleting API key',
      };
    }
  }

  async getApiKey(id: string): Promise<{ success: boolean; apiKey?: ApiKey; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api-keys/${id}`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          apiKey: result,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to fetch API key',
        };
      }
    } catch (error) {
      console.error('Error fetching API key:', error);
      return {
        success: false,
        message: 'Network error while fetching API key',
      };
    }
  }
}

export const apiKeysService = new ApiKeysService();