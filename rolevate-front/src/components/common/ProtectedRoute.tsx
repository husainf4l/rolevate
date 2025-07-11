'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/services/auth';
import { AuthContext, User } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: ('CANDIDATE' | 'COMPANY')[];
}

export default function ProtectedRoute({ children, allowedUserTypes }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication...');
        const userData = await getCurrentUser();
        console.log('User from getCurrentUser:', userData);
        
        if (!userData) {
          console.log('No user found, redirecting to login');
          router.replace('/login');
          return;
        }

        // Store user data
        setUser(userData);

        // Get current pathname
        const currentPath = window.location.pathname;

        // Check if user type is allowed for this route
        if (allowedUserTypes && !allowedUserTypes.includes(userData.userType)) {
          console.log('User type not allowed:', userData.userType, 'Allowed:', allowedUserTypes);
          // User type not allowed, redirect based on their type
          if (userData.userType === 'CANDIDATE') {
            router.replace('/userdashboard');
          } else if (userData.userType === 'COMPANY') {
            // Check if company user has a company or companyId
            if (!userData.company && !userData.companyId) {
              router.replace('/dashboard/setup-company');
            } else {
              router.replace('/dashboard');
            }
          } else {
            router.replace('/');
          }
          return;
        }

        // Special handling for COMPANY users
        if (userData.userType === 'COMPANY' && allowedUserTypes?.includes('COMPANY')) {
          // If company user has no company and is NOT on setup-company page, redirect
          if (!userData.company && !userData.companyId && !currentPath.includes('/dashboard/setup-company')) {
            console.log('Company user has no company, redirecting to setup-company');
            router.replace('/dashboard/setup-company');
            return;
          }
          // If company user has a company and IS on setup-company page, redirect to dashboard
          if ((userData.company || userData.companyId) && currentPath.includes('/dashboard/setup-company')) {
            console.log('Company user already has company, redirecting to dashboard');
            router.replace('/dashboard');
            return;
          }
        }

        console.log('User authorized:', userData);
        setIsAuthorized(true);
      } catch (error) {
        console.error('Authentication check failed:', error);
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, allowedUserTypes]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#13ead9] mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-gradient-to-r from-[#13ead9] to-[#0891b2] rounded-lg mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm">Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
