"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { JobPostAgent } from "@/components/job-creation/JobPostAgent";
import JobPreview from "@/components/job-creation/JobPreview";
import FormHeader from "@/components/job-creation/FormHeader";
import { createJob, ExperienceLevel, WorkType } from "@/services/jobs.service";
import { JobFormData } from "@/components/job-creation/types";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeftIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function AIJobCreationPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [jobData, setJobData] = useState<Partial<JobFormData> | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // No need for authentication check here since AuthChecker already handles it

  const handleJobDataUpdate = (data: any) => {
    console.log("Received job data from AI:", data);
    // Map AI-generated job data to JobFormData interface
    const mappedData: Partial<JobFormData> = {
      title: data.title || "",
      department: data.department || "",
      location: data.location || "",
      workType:
        data.work_type === "remote"
          ? "REMOTE"
          : data.work_type === "hybrid"
          ? "HYBRID"
          : "ONSITE",
      experienceLevel:
        data.experience_level === "entry"
          ? "ENTRY_LEVEL"
          : data.experience_level === "junior"
          ? "JUNIOR"
          : data.experience_level === "mid"
          ? "MID_LEVEL"
          : data.experience_level === "senior"
          ? "SENIOR"
          : data.experience_level === "lead"
          ? "LEAD"
          : data.experience_level === "principal"
          ? "PRINCIPAL"
          : data.experience_level === "executive"
          ? "EXECUTIVE"
          : "MID_LEVEL",
      description: data.description || "",
      requirements: Array.isArray(data.requirements)
        ? data.requirements.join("\n")
        : data.requirements || "",
      responsibilities: Array.isArray(data.responsibilities)
        ? data.responsibilities.join("\n")
        : data.responsibilities || "",
      benefits: Array.isArray(data.benefits)
        ? data.benefits.join("\n")
        : data.benefits || "",
      skills: data.skills || [],
      currency: data.salary_range?.currency || "USD",
      salaryMin: data.salary_range?.min || 0,
      salaryMax: data.salary_range?.max || 0,
      enableAiInterview: data.enable_ai_interview || false,
    };
    setJobData(mappedData);
  };

  // Helper function to convert frontend experience level to backend enum
  const mapExperienceLevelToBackend = (
    frontendLevel: string
  ): ExperienceLevel => {
    const mapping: Record<string, ExperienceLevel> = {
      ENTRY_LEVEL: ExperienceLevel.ENTRY,
      JUNIOR: ExperienceLevel.JUNIOR,
      MID_LEVEL: ExperienceLevel.MID,
      SENIOR: ExperienceLevel.SENIOR,
      LEAD: ExperienceLevel.LEAD,
      PRINCIPAL: ExperienceLevel.LEAD, // Map PRINCIPAL to LEAD since backend doesn't have PRINCIPAL
      EXECUTIVE: ExperienceLevel.EXECUTIVE,
    };
    return mapping[frontendLevel] || ExperienceLevel.MID;
  };

  // Helper function to convert frontend work type to backend enum
  const mapWorkTypeToBackend = (frontendWorkType: string): WorkType => {
    const mapping: Record<string, WorkType> = {
      REMOTE: WorkType.REMOTE,
      HYBRID: WorkType.HYBRID,
      ONSITE: WorkType.ONSITE,
    };
    return mapping[frontendWorkType] || WorkType.ONSITE;
  };

  const handleCreateJob = async () => {
    if (!jobData || !user) {
      setError("Missing job data or user information");
      return;
    }

    setIsCreatingJob(true);
    setError(null);

    try {
      // Convert partial job data to complete JobFormData
      const completeJobData: JobFormData = {
        title: jobData.title || "",
        department: jobData.department || "",
        location: jobData.location || "",
        workType: jobData.workType || "ONSITE",
        experienceLevel: jobData.experienceLevel || "MID_LEVEL",
        description: jobData.description || "",
        requirements: jobData.requirements || "",
        responsibilities: jobData.responsibilities || "",
        benefits: jobData.benefits || "",
        skills: jobData.skills || [],
        currency: jobData.currency || "USD",
        salaryMin: jobData.salaryMin || 0,
        salaryMax: jobData.salaryMax || 0,
        enableAiInterview: jobData.enableAiInterview || false,
        // Set default values for any missing required fields
        interviewDuration: 30,
        aiPrompt: "",
        aiInstructions: "",
      };

      // Convert to backend-compatible format
      const backendJobData = {
        ...completeJobData,
        experienceLevel: mapExperienceLevelToBackend(
          completeJobData.experienceLevel
        ),
        workType: mapWorkTypeToBackend(completeJobData.workType),
      };

      await createJob(backendJobData);
      setSuccess(true);

      // Redirect to job posts dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard/jobpost");
      }, 2000);
    } catch (err: any) {
      console.error("Error creating job:", err);
      setError(err.message || "Failed to create job post");
    } finally {
      setIsCreatingJob(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/jobpost");
  };

  // Show loading state while user data is being loaded
  if (loading || !user) {
    return (
      <div className="flex-1 min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-600 border-t-[#00C6AD] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex-1 min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-gray-800 rounded-xl">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Job Created Successfully!
          </h1>
          <p className="text-gray-400 mb-6">
            Your AI-generated job post has been created and is now live.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/dashboard/jobpost")}
              className="w-full px-6 py-3 bg-[#00C6AD] text-gray-900 rounded-lg hover:bg-[#14B8A6] transition-colors font-medium"
            >
              View All Job Posts
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Create Another Job
            </button>
          </div>
          <p className="text-sm text-gray-500 text-center mt-6">
            Redirecting to dashboard in a few seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-900">
      <div className="px-6 md:px-20 py-6 md:py-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6 text-gray-400" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <SparklesIcon className="h-8 w-8 text-[#00C6AD]" />
              AI Job Creation
            </h1>
            <p className="text-gray-400 mt-1">
              Create job posts using conversational AI
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-600/30 rounded-lg p-4 flex items-start gap-3">
            <svg
              className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <h3 className="text-red-300 font-medium">Error</h3>
              <p className="text-red-200 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {showPreview && jobData ? (
          <div className="max-w-4xl">
            <JobPreview formData={jobData as JobFormData} />

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowPreview(false)}
                className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back to Chat
              </button>
              <button
                onClick={handleCreateJob}
                disabled={isCreatingJob}
                className="px-6 py-3 bg-[#00C6AD] text-gray-900 rounded-lg hover:bg-[#14B8A6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isCreatingJob ? "Creating Job..." : "Create Job Post"}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AI Chat Interface */}
            <div className="lg:col-span-2">
              <JobPostAgent onJobDataUpdate={handleJobDataUpdate} />
            </div>

            {/* Job Data Preview Sidebar */}
            <div className="space-y-6">
              {jobData && (
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Job Preview
                  </h3>
                  <div className="space-y-3 text-sm">
                    {jobData.title && (
                      <div>
                        <span className="text-gray-400">Title:</span>
                        <p className="text-white">{jobData.title}</p>
                      </div>
                    )}
                    {jobData.department && (
                      <div>
                        <span className="text-gray-400">Department:</span>
                        <p className="text-white">{jobData.department}</p>
                      </div>
                    )}
                    {jobData.location && (
                      <div>
                        <span className="text-gray-400">Location:</span>
                        <p className="text-white">{jobData.location}</p>
                      </div>
                    )}
                    {jobData.workType && (
                      <div>
                        <span className="text-gray-400">Work Type:</span>
                        <p className="text-white capitalize">
                          {jobData.workType.toLowerCase()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowPreview(true)}
                      className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                    >
                      Full Preview
                    </button>
                    <button
                      onClick={handleCreateJob}
                      disabled={isCreatingJob}
                      className="flex-1 px-4 py-2 bg-[#00C6AD] text-gray-900 rounded-lg hover:bg-[#14B8A6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      {isCreatingJob ? "Creating..." : "Create Job"}
                    </button>
                  </div>
                </div>
              )}

              {/* Help Text */}
              <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                <h4 className="text-blue-300 font-medium mb-2">How it works</h4>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• Chat with AI to describe your job requirements</li>
                  <li>• AI will generate a complete job posting</li>
                  <li>• Review and refine the details</li>
                  <li>• Publish your job post</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
