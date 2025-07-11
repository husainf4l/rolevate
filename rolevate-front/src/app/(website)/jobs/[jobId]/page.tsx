"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BriefcaseIcon,
  BookmarkIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CalendarIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkIconSolid } from "@heroicons/react/24/solid";
import { Button } from "@/components/common/Button";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { JobService } from "@/services/job";

interface JobDetail {
  id: string;
  title: string;
  department: string;
  location: string;
  salary: string;
  type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "REMOTE";
  deadline: string;
  description: string;
  shortDescription?: string;
  responsibilities?: string;
  requirements?: string;
  benefits?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  jobLevel?: string;
  workType?: string;
  industry?: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "CLOSED" | "EXPIRED" | "DELETED";
  featured?: boolean;
  applicants: number;
  views: number;
  postedAt: string;
  company?: {
    id: string;
    name: string;
    industry?: string;
    numberOfEmployees?: number;
    address?: {
      city: string;
      country: string;
    };
  };
  screeningQuestions?: Array<{
    id: string;
    question: string;
    type: "YES_NO" | "MULTIPLE_CHOICE" | "TEXT";
    required: boolean;
  }>;
}

const formatJobType = (type: string) => {
  switch (type) {
    case "FULL_TIME":
      return "Full-time";
    case "PART_TIME":
      return "Part-time";
    case "CONTRACT":
      return "Contract";
    case "INTERNSHIP":
      return "Internship";
    default:
      return type;
  }
};

const formatWorkType = (type: string) => {
  switch (type) {
    case "ON_SITE":
      return "On-site";
    case "REMOTE":
      return "Remote";
    case "HYBRID":
      return "Hybrid";
    default:
      return type;
  }
};

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the saved jobs hook - get all needed values in one call
  const { isJobSaved, toggleSaveJob, canSaveJobs, savedJobIds } =
    useSavedJobs();

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Use the public endpoint to get job details (no auth required)
        const response = await JobService.getPublicJobById(jobId);
        setJob(response as JobDetail);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load job details"
        );
        console.error("Failed to fetch job details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetail();
    }
  }, [jobId]);

  const handleSaveJob = async () => {
    if (!canSaveJobs()) {
      // User is not authenticated or not a candidate, redirect to login
      return;
    }

    try {
      await toggleSaveJob(jobId);
    } catch (error) {
      console.error("Failed to toggle save job:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin mx-auto"></div>
            <div className="w-16 h-16 border-4 border-[#0891b2] border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-2 font-display">
              Loading Job Details...
            </h3>
            <p className="text-gray-600">
              Please wait while we fetch the job information
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">😞</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-display">
              Job Not Found
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {error ||
                "The job you're looking for doesn't exist or has been removed."}
            </p>
            <Button
              href="/jobs"
              variant="primary"
              size="lg"
              className="shadow-lg"
            >
              ← Back to Jobs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isSaved = isJobSaved(jobId);
  const showSaveButton = canSaveJobs();

  // Debug logging with more detail
  console.log("Job Detail Page - Debug Info:", {
    jobId,
    jobIdType: typeof jobId,
    isSaved,
    showSaveButton,
    canSaveJobs: canSaveJobs(),
  });

  // Check the hook state directly
  console.log("Direct hook state check:", {
    savedJobIds: Array.from(savedJobIds),
    savedJobIdsSize: savedJobIds.size,
    hasJobId: savedJobIds.has(jobId),
    jobIdStringified: JSON.stringify(jobId),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <span>Jobs</span>
          <span className="mx-2">•</span>
          <span>{job.department}</span>
          <span className="mx-2">•</span>
          <span className="text-[#0891b2] font-medium">{job.title}</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200/50 p-8 mb-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#13ead9]/5 to-[#0891b2]/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#0891b2]/5 to-[#13ead9]/5 rounded-full translate-y-24 -translate-x-24"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1 mb-8 lg:mb-0">
              <div className="flex items-center space-x-3 mb-4">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 font-display">
                  {job.title}
                </h1>
                {job.featured && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border border-orange-200/50">
                    <StarIcon className="w-3 h-3 mr-1" />
                    Featured
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-[#13ead9] to-[#0891b2] rounded-2xl flex items-center justify-center shadow-lg">
                  <BuildingOfficeIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-semibold text-[#0891b2] font-display">
                    {job.company?.name || "Company"}
                  </span>
                  <p className="text-gray-600 text-sm">
                    {job.company?.industry || job.industry || "Industry"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 rounded-xl p-3">
                  <MapPinIcon className="w-4 h-4 text-[#0891b2]" />
                  <span className="text-sm font-medium">{job.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 rounded-xl p-3">
                  <CurrencyDollarIcon className="w-4 h-4 text-[#0891b2]" />
                  <span className="text-sm font-medium">{job.salary}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 rounded-xl p-3">
                  <BriefcaseIcon className="w-4 h-4 text-[#0891b2]" />
                  <span className="text-sm font-medium">
                    {formatJobType(job.type)}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 rounded-xl p-3">
                  <ClockIcon className="w-4 h-4 text-[#0891b2]" />
                  <span className="text-sm font-medium">
                    {formatWorkType(job.workType || "On-site")}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                {job.shortDescription}
              </p>
            </div>

            <div className="lg:ml-12 flex-shrink-0">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-lg border border-gray-200/50 min-w-[280px]">
                <div className="flex flex-col space-y-4">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full shadow-lg"
                    ripple={true}
                  >
                    Apply Now
                  </Button>

                  {showSaveButton && (
                    <button
                      onClick={handleSaveJob}
                      className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-2xl border-2 transition-all duration-300 w-full font-semibold text-base ${
                        isSaved
                          ? "bg-gradient-to-r from-[#13ead9] to-[#0891b2] text-white border-transparent shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white hover:border-[#0891b2] hover:text-[#0891b2] hover:shadow-md transform hover:scale-[1.02]"
                      }`}
                      title={
                        isSaved ? "Remove from saved jobs" : "Save this job"
                      }
                    >
                      {isSaved ? (
                        <BookmarkIconSolid className="w-5 h-5" />
                      ) : (
                        <BookmarkIcon className="w-5 h-5" />
                      )}
                      <span>{isSaved ? "Saved ✓" : "Save Job"}</span>
                    </button>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <div className="w-8 h-8 bg-[#0891b2]/10 rounded-lg flex items-center justify-center">
                      <UserGroupIcon className="w-4 h-4 text-[#0891b2]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {job.applicants} applicants
                      </p>
                      <p className="text-xs text-gray-500">applied so far</p>
                    </div>
                  </div>

                  {job.deadline && (
                    <div className="flex items-center space-x-3 text-gray-600">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <CalendarIcon className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(job.deadline).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          application deadline
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 text-gray-600">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <ClockIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(job.postedAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">posted date</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Description */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-[#13ead9] to-[#0891b2] rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">📋</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 font-display">
                  Job Description
                </h2>
              </div>
              <div className="prose prose-gray max-w-none">
                <p className="whitespace-pre-line text-gray-600 leading-relaxed text-lg">
                  {job.description}
                </p>
              </div>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">🎯</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 font-display">
                    Key Responsibilities
                  </h2>
                </div>
                <div className="prose prose-gray max-w-none">
                  <p className="whitespace-pre-line text-gray-600 leading-relaxed text-lg">
                    {job.responsibilities}
                  </p>
                </div>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">✅</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 font-display">
                    Requirements
                  </h2>
                </div>
                <div className="prose prose-gray max-w-none">
                  <p className="whitespace-pre-line text-gray-600 leading-relaxed text-lg">
                    {job.requirements}
                  </p>
                </div>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">🎁</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 font-display">
                    Benefits & Perks
                  </h2>
                </div>
                <div className="prose prose-gray max-w-none">
                  <p className="whitespace-pre-line text-gray-600 leading-relaxed text-lg">
                    {job.benefits}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Job Details */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-[#13ead9] to-[#0891b2] rounded-xl flex items-center justify-center">
                  <BriefcaseIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-display">
                  Job Details
                </h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-sm font-medium">
                      💼
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="text-sm font-medium text-gray-500 block">
                      Experience Level
                    </label>
                    <p className="text-gray-900 font-medium truncate">
                      {job.experience || "Not specified"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 text-sm font-medium">
                      🎓
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="text-sm font-medium text-gray-500 block">
                      Education
                    </label>
                    <p className="text-gray-900 font-medium truncate">
                      {job.education || "Not specified"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 text-sm font-medium">
                      📊
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="text-sm font-medium text-gray-500 block">
                      Job Level
                    </label>
                    <p className="text-gray-900 font-medium truncate">
                      {job.jobLevel || "Not specified"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 text-sm font-medium">
                      🏭
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="text-sm font-medium text-gray-500 block">
                      Industry
                    </label>
                    <p className="text-gray-900 font-medium truncate">
                      {job.industry || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">🛠️</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 font-display">
                    Required Skills
                  </h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-[#13ead9]/10 to-[#0891b2]/10 text-[#0891b2] border border-[#0891b2]/20 hover:from-[#13ead9]/20 hover:to-[#0891b2]/20 transition-colors duration-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Company Info */}
            {job.company && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl flex items-center justify-center">
                    <BuildingOfficeIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 font-display">
                    About {job.company.name}
                  </h3>
                </div>
                <div className="space-y-4">
                  {job.company.industry && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BuildingOfficeIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Industry
                        </p>
                        <p className="text-gray-900 font-medium">
                          {job.company.industry}
                        </p>
                      </div>
                    </div>
                  )}
                  {job.company.numberOfEmployees && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <UserGroupIcon className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Company Size
                        </p>
                        <p className="text-gray-900 font-medium">
                          {job.company.numberOfEmployees.toLocaleString()}{" "}
                          employees
                        </p>
                      </div>
                    </div>
                  )}
                  {job.company.address && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPinIcon className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Location
                        </p>
                        <p className="text-gray-900 font-medium">
                          {job.company.address.city},{" "}
                          {job.company.address.country}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
