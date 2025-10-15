import { User, LoginInput, SignupInput, AuthResponse, AuthError } from '@/types/auth';
import { graphQLService } from './graphql.service';

class AuthService {
  private currentUser: User | null = null;

  // GraphQL Mutations
  private LOGIN_MUTATION = `
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        access_token
        user {
          id
          email
          role
          name
        }
      }
    }
  `;

  private SIGNUP_MUTATION = `
    mutation CreateUser($input: CreateUserInput!) {
      createUser(input: $input) {
        id
        email
        role
        name
      }
    }
  `;

  /**
   * Login user with email and password
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    try {
      const response = await graphQLService.request<{ login: AuthResponse }>(
        this.LOGIN_MUTATION,
        { input }
      );

      const { access_token, user } = response.login;
      
      // Store token and user data
      graphQLService.setToken(access_token);
      this.setUser(user);

      return response.login;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  }

  /**
   * Register new user
   */
  async signup(input: SignupInput): Promise<User> {
    try {
      const response = await graphQLService.request<{ createUser: User }>(
        this.SIGNUP_MUTATION,
        { input }
      );

      return response.createUser;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Signup failed');
    }
  }

  /**
   * Logout user and clear stored data
   */
  logout(): void {
    graphQLService.removeToken();
    this.clearUser();
    
    // Redirect to home page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
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
    return this.getCurrentUser() !== null && this.hasValidToken();
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