"use client";

import React from "react";

import CVManager from "@/components/dashboard/CVManager";
import JobRecommendations from "@/components/dashboard/JobRecommendations";
import InterviewSchedule from "@/components/dashboard/InterviewSchedule";
import CVUploadPrompt from "@/components/dashboard/CVUploadPrompt";
import { useCVStatus } from "@/hooks/useCVStatus";
import { useAuth } from "@/hooks/useAuth";

// CandidateProfile type now comes from useAuth hook

export default function UserDashboardPage() {
  const { user, isLoading: userLoading } = useAuth();
  const {
    showUploadPrompt,
    handleCVUpload,
    handleSkipUpload,
    handleDismissPrompt,
  } = useCVStatus();

  // User data is now provided by AuthProvider context - no need to fetch separately

  // Get CV data from user's candidate profile
  const getCVData = (): {
    fileName: string;
    lastUpdated: string;
    status: "current" | "draft" | "outdated";
  } | null => {
    const cvs = user?.candidateProfile?.cvs;
    if (!cvs || cvs.length === 0) return null;

    // Get the most recent active CV with valid updatedAt
    const activeCVs = cvs.filter((cv) => cv.isActive && cv.updatedAt);
    const latestCV =
      activeCVs.length > 0
        ? activeCVs.sort((a, b) => {
            const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            return dateB - dateA;
          })[0]
        : null;

    if (!latestCV || !latestCV.updatedAt) return null;

    return {
      fileName: latestCV.originalFileName || latestCV.fileName,
      lastUpdated: latestCV.updatedAt.substring(0, 10), // Extract YYYY-MM-DD
      status: (latestCV.status === "UPLOADED" ? "current" : "draft") as
        | "current"
        | "draft"
        | "outdated",
    };
  };

  const cvData = getCVData();
  const hasCV = !!cvData;

  // Determine if we should show upload prompt
  const shouldShowUploadPrompt = !hasCV && showUploadPrompt;

  // Show loading state while checking user data
  if (userLoading) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0fc4b5]"></div>
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Get user's first name for personalized greeting
  const getUserFirstName = (): string => {
    if (user?.candidateProfile?.firstName) {
      return user.candidateProfile.firstName;
    }
    if (user?.name) {
      // Extract first name from full name
      const firstName = user.name.split(" ")[0];
      return firstName || "there";
    }
    return "there";
  };

  return (
    <div className="flex-1 min-h-screen bg-gray-50 py-12 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-2">
              Welcome back,{" "}
              <span className="text-[#0891b2]">
                {getUserFirstName()}!
              </span>
            </h1>
            <p className="text-lg text-gray-500 font-medium">
              Here’s your personalized job search and activity overview.
            </p>
          </div>
          <div className="hidden md:block h-2 w-32 rounded-full bg-[#0891b2]/30 blur-sm" />
        </div>

        {/* CV Upload Prompt */}
        {shouldShowUploadPrompt && (
          <div className="mb-8">
            <CVUploadPrompt
              onUpload={handleCVUpload}
              onSkip={handleSkipUpload}
              onDismiss={handleDismissPrompt}
            />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            <div className="rounded-sm bg-white/80 shadow-xl border border-gray-200 p-8 mb-10">
              <h2 className="text-2xl font-medium text-gray-900 mb-6 tracking-tight">
                Recommended Jobs
              </h2>
              <div className="border-t border-gray-100 mb-6" />
              <JobRecommendations />
            </div>
          </div>

          {/* Right Column - Sidebar Content */}
          <div className="space-y-10">
            <div className="rounded-sm bg-white/60 backdrop-blur-md shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">
                Your CV
              </h2>
              <CVManager cvData={cvData} />
            </div>
            <div className="rounded-sm bg-white/60 backdrop-blur-md shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">
                Upcoming Interviews
              </h2>
              <InterviewSchedule />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

