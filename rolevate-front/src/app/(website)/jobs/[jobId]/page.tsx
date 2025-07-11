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
  const { isJobSaved, toggleSaveJob, canSaveJobs, savedJobIds } = useSavedJobs();

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0fc4b5] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Job Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The job you're looking for doesn't exist."}
          </p>
          <Button href="/jobs" variant="primary">
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  const isSaved = isJobSaved(jobId);
  const showSaveButton = canSaveJobs();
  
  // Debug logging with more detail
  console.log('Job Detail Page - Debug Info:', {
    jobId,
    jobIdType: typeof jobId,
    isSaved,
    showSaveButton,
    canSaveJobs: canSaveJobs()
  });
  
  // Check the hook state directly
  console.log('Direct hook state check:', {
    savedJobIds: Array.from(savedJobIds),
    savedJobIdsSize: savedJobIds.size,
    hasJobId: savedJobIds.has(jobId),
    jobIdStringified: JSON.stringify(jobId)
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {job.title}
                </h1>
                {job.featured && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <StarIcon className="w-3 h-3 mr-1" />
                    Featured
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <BuildingOfficeIcon className="w-5 h-5 text-[#0fc4b5]" />
                <span className="text-xl font-semibold text-[#0fc4b5]">
                  {job.company?.name || "Company"}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">
                  {job.company?.industry || job.industry || "Industry"}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPinIcon className="w-4 h-4" />
                  <span className="text-sm">{job.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <CurrencyDollarIcon className="w-4 h-4" />
                  <span className="text-sm">{job.salary}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <BriefcaseIcon className="w-4 h-4" />
                  <span className="text-sm">{formatJobType(job.type)}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <ClockIcon className="w-4 h-4" />
                  <span className="text-sm">
                    {formatWorkType(job.workType || "On-site")}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">
                {job.shortDescription}
              </p>
            </div>

            <div className="lg:ml-8 mt-6 lg:mt-0">
              <div className="flex flex-col space-y-3">
                <Button size="lg" className="w-full lg:w-auto">
                  Apply Now
                </Button>

                {showSaveButton && (
                  <button
                    onClick={handleSaveJob}
                    className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 w-full lg:w-auto font-medium ${
                      isSaved
                        ? "bg-[#0fc4b5] text-white border-[#0fc4b5] hover:bg-[#0ba399] shadow-md"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                    }`}
                    title={isSaved ? "Remove from saved jobs" : "Save this job"}
                  >
                    {isSaved ? (
                      <BookmarkIconSolid className="w-5 h-5 text-white" />
                    ) : (
                      <BookmarkIcon className="w-5 h-5 text-gray-500" />
                    )}
                    <span className={isSaved ? "text-white" : "text-gray-700"}>
                      {isSaved ? "Saved ✓" : "Save Job"}
                    </span>
                  </button>
                )}
              </div>

              <div className="mt-6 text-sm text-gray-500 space-y-2">
                <div className="flex items-center space-x-2">
                  <UserGroupIcon className="w-4 h-4" />
                  <span>{job.applicants} applicants</span>
                </div>
                {job.deadline && (
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>
                      Apply by {new Date(job.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-4 h-4" />
                  <span>
                    Posted {new Date(job.postedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Job Description
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="whitespace-pre-line text-gray-600 leading-relaxed">
                  {job.description}
                </p>
              </div>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Key Responsibilities
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="whitespace-pre-line text-gray-600 leading-relaxed">
                    {job.responsibilities}
                  </p>
                </div>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Requirements
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="whitespace-pre-line text-gray-600 leading-relaxed">
                    {job.requirements}
                  </p>
                </div>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Benefits
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="whitespace-pre-line text-gray-600 leading-relaxed">
                    {job.benefits}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Job Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Experience Level
                  </label>
                  <p className="text-gray-900">{job.experience}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Education
                  </label>
                  <p className="text-gray-900">{job.education}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Job Level
                  </label>
                  <p className="text-gray-900">{job.jobLevel}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Industry
                  </label>
                  <p className="text-gray-900">{job.industry}</p>
                </div>
              </div>
            </div>

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#0fc4b5]/10 text-[#0fc4b5]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Company Info */}
            {job.company && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  About {job.company.name}
                </h3>
                <div className="space-y-3">
                  {job.company.industry && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <BuildingOfficeIcon className="w-4 h-4" />
                      <span className="text-sm">{job.company.industry}</span>
                    </div>
                  )}
                  {job.company.numberOfEmployees && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <UserGroupIcon className="w-4 h-4" />
                      <span className="text-sm">
                        {job.company.numberOfEmployees} employees
                      </span>
                    </div>
                  )}
                  {job.company.address && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPinIcon className="w-4 h-4" />
                      <span className="text-sm">
                        {job.company.address.city},{" "}
                        {job.company.address.country}
                      </span>
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
