class GraphQLService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4005/graphql';
  }

  async request<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
    const token = this.getToken();
    
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        query,
        ...(variables && { variables }),
      }),
    });

    const data = await response.json();

    if (data.errors) {
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