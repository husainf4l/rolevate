import { apiClient } from '@/lib/api-client';
import type {
  RegisterRequest,
  LoginRequest,
  GoogleLoginRequest,
  AuthResponse,
  LogoutResponse
} from '@/types/auth';

export class AuthService {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const result = await apiClient.post<AuthResponse>('/auth/register', data);
      return result.data;
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.',
      };
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const result = await apiClient.post<AuthResponse>('/auth/login', data);
      return result.data;
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        message: 'Login failed. Please check your credentials.',
      };
    }
  }

  async googleLogin(data: GoogleLoginRequest): Promise<AuthResponse> {
    try {
      const result = await apiClient.post<AuthResponse>('/auth/google/login', data);
      return result.data;
    } catch (error) {
      console.error('Google login failed:', error);
      return {
        success: false,
        message: 'Google login failed. Please try again.',
      };
    }
  }

  async logout(): Promise<{ data: LogoutResponse; response: Response }> {
    try {
      return await apiClient.post<LogoutResponse>('/auth/logout', {});
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  async getProfile(): Promise<{ data: AuthResponse; response: Response }> {
    try {
      return await apiClient.get<AuthResponse>('/auth/profile');
    } catch (error) {
      console.error('Profile fetch failed:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();