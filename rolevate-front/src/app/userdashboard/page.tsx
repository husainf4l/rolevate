"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
        // No redirect needed; profile creation is now automatic
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="flex-1 min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e0e7ef] py-12 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-2">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-[#0fc4b5] to-[#3b82f6] bg-clip-text text-transparent">
                {getUserFirstName()}!
              </span>
            </h1>
            <p className="text-lg text-gray-500 font-medium">
              Here’s your personalized job search and activity overview.
            </p>
          </div>
          <div className="hidden md:block h-2 w-32 rounded-full bg-gradient-to-r from-[#0fc4b5]/60 to-[#3b82f6]/60 blur-sm" />
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
            <div className="rounded-3xl bg-white/80 shadow-xl border border-gray-200 p-8 mb-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight">
                Recommended Jobs
              </h2>
              <div className="border-t border-gray-100 mb-6" />
              <JobRecommendations />
            </div>
          </div>

          {/* Right Column - Sidebar Content */}
          <div className="space-y-10">
            <div className="rounded-3xl bg-white/60 backdrop-blur-md shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 tracking-tight">
                Your CV
              </h2>
              <CVManager cvData={cvData} />
            </div>
            <div className="rounded-3xl bg-white/60 backdrop-blur-md shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 tracking-tight">
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
