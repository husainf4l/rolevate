"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import UserStatsCards from "@/components/dashboard/UserStatsCards";
import RecentApplicationsWidget from "@/components/dashboard/RecentApplicationsWidget";
import UserUpcomingInterviews, { Interview } from "@/components/dashboard/UserUpcomingInterviews";
import UserQuickActions from "@/components/dashboard/UserQuickActions";
import UserProfileCompletionWidget from "@/components/dashboard/UserProfileCompletionWidget";
import { getCandidateApplications, Application } from "@/services/application";
import { ProfileService, CandidateProfile } from "@/services/profile";
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
      ["SUBMITTED", "REVIEWING", "INTERVIEW_SCHEDULED"].includes(app.status)
    ).length,
    interviews: applications.filter((app) =>
      ["INTERVIEW_SCHEDULED", "INTERVIEWED"].includes(app.status)
    ).length,
    offers: applications.filter((app) => app.status === "OFFERED").length,
    pending: applications.filter((app) =>
      ["SUBMITTED", "REVIEWING"].includes(app.status)
    ).length,
    rejected: applications.filter((app) => app.status === "REJECTED").length,
  };

  // Profile completion sections
  const currentProfile = profile || user?.candidateProfile;
  const profileSections = [
    {
      label: "Add Resume/CV",
      completed: !!currentProfile?.resumeUrl,
      href: "/userdashboard/profile?tab=resume",
    },
    {
      label: "Complete Work Experience",
      completed: (currentProfile?.workExperiences?.length || 0) > 0,
      href: "/userdashboard/profile?tab=experience",
    },
    {
      label: "Add Skills",
      completed: (currentProfile?.skills?.length || 0) > 0,
      href: "/userdashboard/profile?tab=skills",
    },
    {
      label: "Add Education",
      completed: (currentProfile?.educationHistory?.length || 0) > 0,
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch profile
      const profileData = await ProfileService.getUserProfile();
      setProfile(profileData);

      // Fetch applications
      const applicationsData = await getCandidateApplications();
      setApplications(applicationsData);

      // Mock upcoming interviews (replace with actual API call when available)
      const mockInterviews: Interview[] = applicationsData
        .filter((app) => app.status === "INTERVIEW_SCHEDULED")
        .map((app) => ({
          id: app.id,
          jobTitle: app.job.title,
          company: app.job.company.name,
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
            Welcome back, {user?.candidateProfile?.firstName || user?.name || "Candidate"}! 
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your job search today.
          </p>
        </motion.div>

        {/* Modern Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-[url('/images/cv.jpg')] bg-cover bg-center rounded-xl p-6 text-white shadow-lg relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-xl"></div>
          <div className="text-center relative z-10">
            <h2 className="text-2xl font-bold mb-3 drop-shadow-lg">Need a new CV?</h2>
            <p className="text-lg text-gray-100 mb-6 drop-shadow-md">Try our partners at rolekits.com</p>
            <a
              href="https://rolekits.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-sm font-semibold hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Visit rolekits.com
            </a>
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
