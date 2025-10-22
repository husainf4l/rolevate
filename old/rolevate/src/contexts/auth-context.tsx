'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import type { User, LoginRequest, RegisterRequest, GoogleLoginRequest } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  googleLogin: (data: GoogleLoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in (e.g., from cookies)
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if there are any auth-related cookies before making the API call
      const hasAuthCookies = document.cookie.includes('auth') ||
                            document.cookie.includes('token') ||
                            document.cookie.includes('session');

      // Only make API call if there are potential auth cookies
      if (!hasAuthCookies) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const result = await authService.getProfile();
      // Handle both AuthResponse format and direct user object format
      if (result.data.success && result.data.user) {
        setUser(result.data.user);
      } else if ((result.data as any).id && (result.data as any).email) {
        // Direct user object response from profile endpoint
        setUser(result.data as unknown as User);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginRequest): Promise<boolean> => {
    try {
      const response = await authService.login(data);
      if (response.success && response.user) {
        setUser(response.user);

        // Navigate based on user type
        if (response.user.userType === 'CANDIDATE') {
          router.push('/dashboard');
        } else if (response.user.userType === 'EMPLOYER') {
          router.push('/employer/dashboard');
        } else {
          router.push('/dashboard');
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (data: RegisterRequest): Promise<boolean> => {
    try {
      const response = await authService.register(data);
      if (response.success && response.user) {
        setUser(response.user);

        // Navigate based on user type
        if (response.user.userType === 'CANDIDATE') {
          router.push('/dashboard');
        } else if (response.user.userType === 'EMPLOYER') {
          router.push('/employer/dashboard');
        } else {
          router.push('/dashboard');
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const googleLogin = async (data: GoogleLoginRequest): Promise<boolean> => {
    try {
      const response = await authService.googleLogin(data);
      if (response.success && response.user) {
        setUser(response.user);

        // Navigate based on user type
        if (response.user.userType === 'CANDIDATE') {
          router.push('/dashboard');
        } else if (response.user.userType === 'EMPLOYER') {
          router.push('/employer/dashboard');
        } else {
          router.push('/dashboard');
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error('Google login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
      // Navigate to home page after logout
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails on server, clear local state and navigate
      setUser(null);
      router.push('/');
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    googleLogin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}