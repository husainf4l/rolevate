"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, User } from "../../services/auth.service";
import CompanySetup from "./CompanySetup";

interface CompanySetupGuardProps {
  children: React.ReactNode;
  fallbackComponent?: React.ReactNode;
}

/**
 * CompanySetupGuard ensures user has a company before accessing content
 * If no company, shows CompanySetup component
 */
export default function CompanySetupGuard({
  children,
  fallbackComponent,
}: CompanySetupGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsCompanySetup, setNeedsCompanySetup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkUserCompanyStatus();
  }, []);

  const checkUserCompanyStatus = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);

      if (userData) {
        // Check if user has a company
        const hasCompany = userData.companyId || userData.company;
        setNeedsCompanySetup(!hasCompany);
      }
    } catch (error) {
      console.error("Failed to check user company status:", error);
      // If error getting user, redirect to login
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyCreated = () => {
    // Refresh user data and continue to dashboard
    setNeedsCompanySetup(false);
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-solid rounded-full border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (needsCompanySetup) {
    return (
      fallbackComponent || (
        <CompanySetup onCompanyCreated={handleCompanyCreated} />
      )
    );
  }

  return <>{children}</>;
}

/**
 * Hook to check if user needs company setup
 */
export function useCompanySetupStatus() {
  const [needsSetup, setNeedsSetup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const userData = await getCurrentUser();
        if (userData) {
          const hasCompany = userData.companyId || userData.company;
          setNeedsSetup(!hasCompany);
        }
      } catch (error) {
        console.error("Error checking company setup status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  return { needsSetup, loading };
}
