"use client";

import React, { useState, useEffect } from "react";
import CVManager from "@/components/dashboard/CVManager";
import JobRecommendations from "@/components/dashboard/JobRecommendations";
import InterviewSchedule from "@/components/dashboard/InterviewSchedule";
import CVUploadPrompt from "@/components/dashboard/CVUploadPrompt";
import { useCVStatus } from "@/hooks/useCVStatus";
import { getCurrentUser } from "@/services/auth";

interface CV {
  id: string;
  fileName: string;
  originalFileName: string;
  fileUrl: string;
  fileSize: number;
  status: string;
  isActive: boolean;
  uploadedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Application {
  id: string;
  status?: string;
  appliedDate?: string;
  // Add other application fields as needed
}

interface WorkExperience {
  id: string;
  // Add work experience fields as needed
}

interface EducationHistory {
  id: string;
  // Add education fields as needed
}

interface CandidateProfile {
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  cvs: CV[];
  applications: Application[];
  workExperiences: WorkExperience[];
  educationHistory: EducationHistory[];
  resumeUrl?: string;
  // Add other profile fields as needed
}

interface User {
  id: string;
  name: string;
  email: string;
  userType: string;
  candidateProfile?: CandidateProfile;
}

export default function UserDashboardPage() {
  const {
    showUploadPrompt,
    handleCVUpload,
    handleSkipUpload,
    handleDismissPrompt,
  } = useCVStatus();

  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  // Fetch current user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUser();
  }, []);

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
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {getUserFirstName()}!
          </h1>
          <p className="text-gray-600">
            Here&apos;s your job search overview and recent activity.
          </p>
        </div>

        {/* CV Upload Prompt */}
        {shouldShowUploadPrompt && (
          <CVUploadPrompt
            onUpload={handleCVUpload}
            onSkip={handleSkipUpload}
            onDismiss={handleDismissPrompt}
          />
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <JobRecommendations />
          </div>

          {/* Right Column - Sidebar Content */}
          <div className="space-y-8">
            <CVManager cvData={cvData} />
            <InterviewSchedule />
          </div>
        </div>
      </div>
    </div>
  );
}
