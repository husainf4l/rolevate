"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";

interface SimpleAuthGuardProps {
  children: React.ReactNode;
}

/**
 * Simple authentication guard that automatically handles:
 * 1. Redirects to login if not authenticated
 * 2. Redirects to company setup if authenticated but no company
 * 3. Shows content if authenticated and has company
 */
export default function SimpleAuthGuard({ children }: SimpleAuthGuardProps) {
  const { loading, authenticated, needsCompanySetup } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Still checking auth status

    if (!authenticated) {
      // Not authenticated - redirect to login
      router.push("/login");
      return;
    }

    if (needsCompanySetup) {
      // Authenticated but needs company setup
      router.push("/company-setup");
      return;
    }

    // All good - user is authenticated and has company
  }, [authenticated, needsCompanySetup, loading, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1E293B] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C6AD] mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  if (!authenticated || needsCompanySetup) {
    return (
      <div className="min-h-screen bg-[#1E293B] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C6AD] mx-auto mb-4"></div>
          <p className="text-gray-300">Redirecting...</p>
        </div>
      </div>
    );
  }

  // All checks passed - render children
  return <>{children}</>;
}
