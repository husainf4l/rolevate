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

        // Clear any stale localStorage data first
        const storedUser = authService.getStoredUser();
        const storedUserType = authService.getUserType();

        // Verify authentication with server (this is the source of truth)
        const user = await authService.verifyAuth();

        if (user) {
          // User is authenticated via server verification
          const userType = user.role === 'CANDIDATE' ? 'candidate' : 'business';
          setUser(user);
          setUserType(userType);
          // Store/update the user data
          authService.storeUserData(user, userType);
        } else {
          // Server says user is not authenticated, clear any local data
          if (storedUser || storedUserType) {
            console.log('Server auth failed, clearing stale local data');
            localStorage.removeItem('user_data');
            localStorage.removeItem('organization_data');
            localStorage.removeItem('user_type');
          }
          setUser(null);
          setUserType(null);
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
    console.log('Starting logout process...');
    setIsLoading(true);
    
    try {
      // Call the logout service
      await authService.logout();
      console.log('Logout service completed');
    } catch (error) {
      console.error('Logout service error:', error);
      // Continue with cleanup even if server logout fails
    }

    // Clear all state immediately
    setUser(null);
    setUserType(null);
    setIsLoading(false);
    
    console.log('Local auth state cleared');
    
    // WORKAROUND: Since backend session-based auth doesn't properly logout,
    // we need to force a complete browser refresh to clear any cached state
    // This ensures the user can't navigate back to authenticated pages
    
    // Clear any cached API responses
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      } catch (e) {
        console.warn('Failed to clear caches:', e);
      }
    }
    
    // Force a complete page refresh with cache busting
    const loginUrl = `/login?t=${Date.now()}`;
    window.location.replace(loginUrl);
  };

  const refreshAuth = async () => {
    try {
      const verifiedUser = await authService.verifyAuth();
      if (verifiedUser) {
        // Use the verified user data from server, not local storage
        const userType = verifiedUser.role === 'CANDIDATE' ? 'candidate' : 'business';
        setUser(verifiedUser);
        setUserType(userType);
        // Update stored data with fresh server data
        authService.storeUserData(verifiedUser, userType);
      } else {
        // Clear everything if server verification fails
        setUser(null);
        setUserType(null);
        localStorage.removeItem('user_data');
        localStorage.removeItem('organization_data');
        localStorage.removeItem('user_type');
      }
    } catch (error) {
      console.error('Auth refresh failed:', error);
      // Clear state on error
      setUser(null);
      setUserType(null);
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