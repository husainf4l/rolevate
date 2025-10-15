import { User, LoginInput, SignupInput, AuthResponse, AuthError } from '@/types/auth';
import { apolloClient } from '@/lib/apollo';
import { gql } from '@apollo/client';

class AuthService {
  private currentUser: User | null = null;

  // GraphQL Mutations
  private LOGIN_MUTATION = gql`
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        access_token
        user {
          id
          email
          userType
          name
          company {
            id
            name
          }
        }
      }
    }
  `;

  private SIGNUP_MUTATION = gql`
    mutation CreateUser($input: CreateUserInput!) {
      createUser(input: $input) {
        id
        email
        userType
        name
      }
    }
  `;

  private GET_CURRENT_USER_QUERY = gql`
    query GetCurrentUser {
      me {
        id
        email
        name
        userType
        phone
        avatar
        company {
          id
          name
          description
          industry
          website
          email
          phone
        }
        companyId
        createdAt
        updatedAt
      }
    }
  `;

  /**
   * Login user with email and password
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    try {
      const { data } = await apolloClient.mutate<{ login: AuthResponse }>({
        mutation: this.LOGIN_MUTATION,
        variables: { input }
      });

      const { access_token, user } = data!.login;
      
      // Store token in localStorage (Apollo will pick it up automatically)
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', access_token);
      }
      this.setUser(user);

      return data!.login;
    } catch (error: any) {
      throw new Error(error?.message || 'Login failed');
    }
  }

  /**
   * Register new user
   */
  async signup(input: SignupInput): Promise<User> {
    try {
      const { data } = await apolloClient.mutate<{ createUser: User }>({
        mutation: this.SIGNUP_MUTATION,
        variables: { input }
      });

      return data!.createUser;
    } catch (error: any) {
      throw new Error(error?.message || 'Signup failed');
    }
  }

  /**
   * Logout user and clear stored data
   */
  logout(): void {
    // Clear token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
    this.clearUser();
    
    // Clear Apollo cache
    apolloClient.clearStore();
    
    // Redirect to home page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

  /**
   * Redirect user based on their type and company status
   */
  redirectAfterLogin(user: User): void {
    if (user.userType === 'BUSINESS') {
      if (!user.company) {
        window.location.href = '/dashboard/setup-company';
      } else {
        window.location.href = '/dashboard';
      }
    } else if (user.userType === 'CANDIDATE') {
      window.location.href = '/userdashboard';
    } else {
      window.location.href = '/';
    }
  }

  /**
   * Get current authenticated user from backend
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.hasValidToken();
      if (!token) {
        return null;
      }

      const { data } = await apolloClient.query<{ me: User }>({
        query: this.GET_CURRENT_USER_QUERY,
        fetchPolicy: 'network-only' // Always fetch fresh data
      });
      
      if (data?.me) {
        this.setUser(data.me);
        return data.me;
      }
      
      return null;
    } catch (error: any) {
      console.error('Error fetching current user:', error);
      // If error is authentication related, clear stored data
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('Unauthenticated')) {
        this.logout();
      }
      return null;
    }
  }

  /**
   * Get user from localStorage (synchronous)
   */
  getUserFromStorage(): User | null {
    if (!this.currentUser && typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          this.currentUser = JSON.parse(storedUser);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          this.logout();
        }
      }
    }
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getUserFromStorage() !== null && this.hasValidToken();
  }

  /**
   * Check if user has valid token
   */
  private hasValidToken(): boolean {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token') !== null;
    }
    return false;
  }

  /**
   * Set current user and store in localStorage
   */
  private setUser(user: User): void {
    this.currentUser = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  /**
   * Clear current user from memory and localStorage
   */
  private clearUser(): void {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }

  /**
   * Initialize auth service (call on app startup)
   */
  init(): void {
    this.getCurrentUser();
  }
}

export const authService = new AuthService();

// Export convenience functions
export const logout = () => authService.logout();
export const getCurrentUser = () => authService.getCurrentUser();
export const getUserFromStorage = () => authService.getUserFromStorage();