'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
  fallbackPath?: string;
  loadingComponent?: React.ReactNode;
}

/**
 * ProtectedRoute component that wraps pages requiring authentication
 * Optionally supports role-based access control
 */
export default function ProtectedRoute({
  children,
  requiredRole,
  fallbackPath = '/login',
  loadingComponent
}: ProtectedRouteProps) {
  const { user, loading, authenticated } = useAuth();
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (loading) return; // Still checking auth status

    if (!authenticated) {
      // Not authenticated, redirect to login
      const currentPath = window.location.pathname;
      const redirectUrl = `${fallbackPath}?from=${encodeURIComponent(currentPath)}`;
      router.replace(redirectUrl);
      return;
    }

    if (requiredRole && user) {
      // Check if user has required role
      const hasRequiredRole = requiredRole.includes(user.role);
      if (!hasRequiredRole) {
        // User doesn't have required role, redirect to dashboard or unauthorized page
        router.replace('/dashboard');
        return;
      }
    }

    // All checks passed, render the component
    setShouldRender(true);
  }, [user, loading, authenticated, requiredRole, router, fallbackPath]);

  // Show loading while checking authentication
  if (loading) {
    return loadingComponent || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-solid rounded-full border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render anything while redirecting
  if (!shouldRender) {
    return null;
  }

  // Render the protected content
  return <>{children}</>;
}

/**
 * Higher-order component version of ProtectedRoute
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * Role-based protection for specific user roles
 */
export function RequireRole({
  children,
  roles,
  fallback
}: {
  children: React.ReactNode;
  roles: string[];
  fallback?: React.ReactNode;
}) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return fallback || (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg font-medium">Access Denied</div>
        <p className="text-gray-600 mt-2">
          You don't have permission to access this section.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Subscription-based protection
 */
export function RequireSubscription({
  children,
  plans,
  fallback
}: {
  children: React.ReactNode;
  plans: string[];
  fallback?: React.ReactNode;
}) {
  const { user } = useAuth();

  if (!user?.company?.subscription || !plans.includes(user.company.subscription.plan)) {
    return fallback || (
      <div className="text-center py-12">
        <div className="text-orange-600 text-lg font-medium">Upgrade Required</div>
        <p className="text-gray-600 mt-2">
          This feature requires a {plans.join(' or ')} subscription.
        </p>
        <button className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700">
          Upgrade Subscription
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
