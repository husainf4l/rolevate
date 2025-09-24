'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, CandidateAuthenticatedUser, BusinessUser } from '@/services/auth';

export interface UseAuthReturn {
  user: CandidateAuthenticatedUser | BusinessUser | null;
  userType: 'candidate' | 'business' | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<CandidateAuthenticatedUser | BusinessUser | null>(null);
  const [userType, setUserType] = useState<'candidate' | 'business' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user is authenticated via HTTP-only cookie
        const isAuth = await authService.verifyAuth();
        
        if (isAuth) {
          // Get stored user data and type
          const storedUser = authService.getStoredUser();
          const storedUserType = authService.getUserType();
          
          if (storedUser && storedUserType) {
            setUser(storedUser);
            setUserType(storedUserType);
          }
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setUserType(null);
    router.push('/login');
  };

  return {
    user,
    userType,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}

// Hook for protecting business routes
export function useBusinessAuth() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading) {
      if (!auth.isAuthenticated) {
        router.push('/login');
      } else if (auth.userType !== 'business') {
        router.push('/dashboard'); // Redirect candidates to their dashboard
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.userType, router]);

  return auth;
}

// Hook for protecting candidate routes
export function useCandidateAuth() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading) {
      if (!auth.isAuthenticated) {
        router.push('/login');
      } else if (auth.userType !== 'candidate') {
        router.push('/business'); // Redirect business users to their dashboard
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.userType, router]);

  return auth;
}