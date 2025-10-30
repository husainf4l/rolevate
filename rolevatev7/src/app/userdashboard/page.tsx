"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import UserStatsCards from "@/components/dashboard/UserStatsCards";
import RecentApplicationsWidget from "@/components/dashboard/RecentApplicationsWidget";
import UserUpcomingInterviews, { Interview } from "@/components/dashboard/UserUpcomingInterviews";
import UserQuickActions from "@/components/dashboard/UserQuickActions";
import UserProfileCompletionWidget from "@/components/dashboard/UserProfileCompletionWidget";
import { getCandidateApplications, Application } from "@/services/application";
import { getProfile, CandidateProfile } from "@/services/profile";
import { motion } from "framer-motion";

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);

  // Calculate stats from applications
  const stats = {
    totalApplications: applications.length,
    activeApplications: applications.filter((app) =>
      ["PENDING", "REVIEWED", "SHORTLISTED"].includes(app.status)
    ).length,
    interviews: applications.filter((app) =>
      ["SHORTLISTED", "INTERVIEWED"].includes(app.status)
    ).length,
    offers: applications.filter((app) => app.status === "OFFERED").length,
    pending: applications.filter((app) =>
      ["PENDING", "REVIEWED"].includes(app.status)
    ).length,
    rejected: applications.filter((app) => app.status === "REJECTED").length,
  };

  // Profile completion sections
  const currentProfile = profile || user?.candidateProfile;
  const profileSections = [
    {
      label: "Add Resume/CV",
      completed: !!(currentProfile as any)?.resumeUrl,
      href: "/userdashboard/profile?tab=resume",
    },
    {
      label: "Complete Work Experience",
      completed: ((currentProfile as any)?.workExperiences?.length || 0) > 0,
      href: "/userdashboard/profile?tab=experience",
    },
    {
      label: "Add Skills",
      completed: ((currentProfile as any)?.skills?.length || 0) > 0,
      href: "/userdashboard/profile?tab=skills",
    },
    {
      label: "Add Education",
      completed: ((currentProfile as any)?.educationHistory?.length || 0) > 0,
      href: "/userdashboard/profile?tab=education",
    },
    {
      label: "Upload Profile Picture",
      completed: !!user?.avatar,
      href: "/userdashboard/profile",
    },
  ];

  const completedCount = profileSections.filter((s) => s.completed).length;
  const completionPercentage = Math.round(
    (completedCount / profileSections.length) * 100
  );

  // Fetch dashboard data when the authenticated user becomes available.
  // This ensures the dashboard retries after login/token is stored and AuthProvider finishes loading.
  useEffect(() => {
    if (!user) {
      console.log('[UserDashboard] No user yet, skipping dashboard fetch');
      return;
    }
    console.log('[UserDashboard] User detected, fetching dashboard data for', user?.id || user?.email);
    fetchDashboardData();
    // Re-run when user changes (e.g., after login or token refresh)
  }, [user?.id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch profile
      const profileData = await getProfile();
      setProfile(profileData);

      // Fetch applications
      const applicationsData = await getCandidateApplications();
      setApplications(applicationsData);

      // Mock upcoming interviews (replace with actual API call when available)
      const mockInterviews: Interview[] = applicationsData
        .filter((app) => app.status === "SHORTLISTED")
        .map((app) => ({
          id: app.id,
          jobTitle: app.job.title,
          company: app.job.company?.name || 'Unknown',
          date: new Date(
            Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          time: "10:00 AM",
          type: "VIDEO" as const,
          meetingLink: "https://meet.google.com/example",
          applicationId: app.id,
          jobId: app.jobId,
        }));
      setUpcomingInterviews(mockInterviews);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="space-y-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-sm p-6 border border-gray-200 shadow-sm"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.candidateProfile?.name || user?.name || "Candidate"}! 
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your job search today.
          </p>
        </motion.div>

        {/* Modern Apple-Style Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="relative rounded-xl p-6 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10"
        >
          {/* Subtle animated background elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/20 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20 opacity-30"></div>
          
          {/* Content */}
          <div className="relative z-10 text-center">
            {/* Coming Soon Badge */}
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 backdrop-blur-xl rounded-full px-3 py-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary-500"></span>
                </span>
                <span className="text-xs font-medium text-white tracking-wide">Coming Jan 1, 2026</span>
              </div>
            </div>

            {/* Main Headline */}
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mb-2 leading-tight">
              Create Professional CVs
            </h2>
            
            {/* Subheading */}
            <p className="text-sm md:text-base text-gray-300 font-light mb-4 leading-relaxed max-w-xl mx-auto">
              Rolekit brings everything you need to build a standout resume. Crafted by Rolevate.
            </p>

            {/* CTA Button */}
            <div className="flex justify-center">
              <a
                href="https://rolekits.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-2 px-6 py-2 bg-white text-slate-900 font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-white/20 transform hover:scale-105 text-sm"
              >
                Learn More
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <UserStatsCards stats={stats} loading={loading} />

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <RecentApplicationsWidget
              applications={applications}
              loading={loading}
            />
            <UserQuickActions />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            <UserProfileCompletionWidget
              sections={profileSections}
              completionPercentage={completionPercentage}
            />
            <UserUpcomingInterviews
              interviews={upcomingInterviews}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
