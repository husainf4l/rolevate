"use client";

import StatsCards from "@/components/dashboard/StatsCards";
import Calendar from "@/components/dashboard/Calendar";
import RecentJobs from "@/components/dashboard/RecentJobs";
import RecentApplications from "@/components/dashboard/RecentCVs";
import Header from "@/components/dashboard/Header";
import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  console.log('[Dashboard] Current state:', {
    isLoading,
    hasUser: !!user,
    userEmail: user?.email,
    hasCompany: !!user?.company,
    companyName: user?.company?.name,
  });

  useEffect(() => {
    console.log('[Dashboard] useEffect - Auth state:', {
      isLoading,
      hasUser: !!user,
      userEmail: user?.email,
      hasCompany: !!user?.company,
      companyName: user?.company?.name,
    });
    
    if (!isLoading) {
      if (!user) {
        console.log('[Dashboard] No user found, redirecting to home');
        router.push("/");
      } else if (!user.company) {
        console.log('[Dashboard] User exists but no company, redirecting to setup');
        router.push("/dashboard/setup-company");
      } else {
        console.log('[Dashboard] User and company present, rendering dashboard');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user || !user.company) {
    return null; // Will redirect
  }

  return (
    <div className="p-8 pt-20">
      <div className="max-w-7xl mx-auto">
        <Header />
        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Calendar />
          <RecentApplications />
        </div>

        <RecentJobs />
      </div>
    </div>
  );
}

