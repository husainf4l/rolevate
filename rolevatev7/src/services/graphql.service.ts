import { API_CONFIG } from '../lib/config';

class GraphQLService {
  private baseURL: string;

  constructor() {
    // Use the configured API base URL
    this.baseURL = `${API_CONFIG.API_BASE_URL}/graphql`;
  }

  async request<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
    const token = this.getToken();
    
    const requestBody = JSON.stringify({
      query,
      ...(variables && { variables }),
    });
    
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: requestBody,
    });
    
    const responseText = await response.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse GraphQL response:', e);
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
    }

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      throw new Error(data.errors[0].message);
    }

    return data.data;
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }
}

export const graphQLService = new GraphQLService();