'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from '@/i18n/navigation';
import { authService, RegisterBusinessRequest } from '@/services/auth';
import { UserData } from '@/types/auth';

interface AuthContextType {
  user: UserData | null;
  userType: 'candidate' | 'business' | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  registerBusiness: (data: RegisterBusinessRequest) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const [userType, setUserType] = useState<'candidate' | 'business' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Skip auth verification if API calls are disabled or no backend is available
        if (process.env.NEXT_PUBLIC_DISABLE_API_CALLS === 'true' || !process.env.NEXT_PUBLIC_API_URL) {
          console.log('API calls disabled or no backend URL configured, skipping auth verification');
          setIsLoading(false);
          return;
        }

        // Check if user is authenticated via HTTP-only cookie
        const user = await authService.verifyAuth();

        if (user) {
          const userType = user.role === 'CANDIDATE' ? 'candidate' : 'business';
          setUser(user);
          setUserType(userType);
          // Store the user data
          authService.storeUserData(user, userType);
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        // Don't keep retrying on failure
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await authService.login({ email, password });

      if (result.success && result.user) {
        const userType = result.user.role === 'CANDIDATE' ? 'candidate' : 'business';
        
        // Store user data with type
        authService.storeUserData(result.user, userType);

        // Update state
        setUser(result.user);
        setUserType(userType);

        // Navigate based on user type
        const redirectPath = authService.getRedirectPath(userType);
        router.push(redirectPath);

        return { success: true };
      } else {
        return { success: false, message: result.message || 'Login failed' };
      }
    } catch {
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setUserType(null);
    router.push('/login');
  };

  const refreshAuth = async () => {
    try {
      const isAuth = await authService.verifyAuth();
      if (isAuth) {
        const storedUser = authService.getStoredUser();
        const storedUserType = authService.getUserType();
        if (storedUser && storedUserType) {
          setUser(storedUser);
          setUserType(storedUserType);
        }
      } else {
        setUser(null);
        setUserType(null);
      }
    } catch (error) {
      console.error('Auth refresh failed:', error);
    }
  };

  const registerBusiness = async (data: RegisterBusinessRequest) => {
    try {
      const result = await authService.registerBusiness(data);

      if (result.success && result.user && result.organization) {
        // Store user data with type
        authService.storeUserData(result.user, 'business');

        // Update state
        setUser(result.user);
        setUserType('business');

        // Navigate to business dashboard
        router.push('/business');

        return { success: true };
      } else {
        return { success: false, message: result.message || 'Registration failed' };
      }
    } catch {
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  };

  const value: AuthContextType = {
    user,
    userType,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshAuth,
    registerBusiness,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}