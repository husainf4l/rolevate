class GraphQLService {
  private baseURL: string;

  constructor() {
    // Direct endpoint - pointing to local development server
    this.baseURL = 'http://localhost:4005/graphql';
  }

  async request<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
    const token = this.getToken();
    
    console.log('=== GraphQL Request ===');
    console.log('Endpoint:', this.baseURL);
    console.log('Token:', token ? `${token.substring(0, 20)}...` : 'Missing');
    console.log('Query:', query);
    console.log('Variables:', JSON.stringify(variables, null, 2));
    
    const requestBody = JSON.stringify({
      query,
      ...(variables && { variables }),
    });
    
    console.log('Request body:', requestBody);
    
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: requestBody,
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
    }
    
    console.log('Parsed response:', JSON.stringify(data, null, 2));

    if (data.errors) {
      console.error('GraphQL errors:', JSON.stringify(data.errors, null, 2));
      throw new Error(data.errors[0].message);
    }
    
    console.log('=== Request Complete ===\n');

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