"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  allowedUserTypes?: string[];
}

export default function ProtectedRoute({
  children,
  redirectTo = "/login",
  allowedUserTypes
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  console.log('[ProtectedRoute] State:', {
    isLoading,
    hasUser: !!user,
    userType: user?.userType,
    allowedUserTypes,
    pathname: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
  });

  useEffect(() => {
    if (!isLoading) {
      console.log('[ProtectedRoute] Check auth:', {
        hasUser: !!user,
        userType: user?.userType,
        allowedUserTypes
      });

      if (!user) {
        console.log('[ProtectedRoute] No user, redirecting to:', redirectTo);
        router.push(redirectTo);
        return;
      }

      // Check user type if restrictions are specified
      if (allowedUserTypes && allowedUserTypes.length > 0) {
        const hasCorrectType = allowedUserTypes.includes(user.userType);
        
        console.log('[ProtectedRoute] User type check:', {
          userType: user.userType,
          allowedUserTypes,
          hasCorrectType
        });

        if (!hasCorrectType) {
          console.log('[ProtectedRoute] Wrong user type, redirecting based on type');
          // Redirect to appropriate dashboard based on user type
          if (user.userType === 'BUSINESS') {
            if (!user.company) {
              console.log('[ProtectedRoute] Business user without company, going to setup');
              router.push('/dashboard/setup-company');
            } else {
              console.log('[ProtectedRoute] Business user with company, going to dashboard');
              router.push('/dashboard');
            }
          } else if (user.userType === 'CANDIDATE') {
            console.log('[ProtectedRoute] Candidate user, going to user dashboard');
            router.push('/userdashboard');
          } else {
            console.log('[ProtectedRoute] Unknown user type, going home');
            router.push('/');
          }
          return;
        }
      }

      console.log('[ProtectedRoute] Access granted');
    }
  }, [user, isLoading, router, redirectTo, allowedUserTypes]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Check user type access
  if (allowedUserTypes && allowedUserTypes.length > 0) {
    const hasCorrectType = allowedUserTypes.includes(user.userType);
    if (!hasCorrectType) {
      return null;
    }
  }

  return <>{children}</>;
}
