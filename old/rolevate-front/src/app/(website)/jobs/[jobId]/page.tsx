"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CalendarIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
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
    logo?: string;
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

function JobDetailPage() {
  // Application modal state
  // Removed unused applying state
  const params = useParams();
  const jobId = params?.jobId as string;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Use the saved jobs hook - get all needed values in one call
  const { isJobSaved, toggleSaveJob, canSaveJobs } =
    useSavedJobs();

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const handleSaveJob = useCallback(async () => {
    if (!canSaveJobs()) {
      // User is not authenticated or not a candidate, redirect to login
      return;
    }

    try {
      await toggleSaveJob(jobId);
    } catch (error) {
      console.error("Failed to toggle save job:", error);
    }
  }, [canSaveJobs, toggleSaveJob, jobId]);

  // Prevent hydration mismatch by showing consistent loading state
  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Breadcrumb Skeleton */}
          <div className="mb-8 flex items-center space-x-2">
            <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1"></div>
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>

          {/* Header Skeleton */}
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              <div className="flex-1">
                <div className="h-12 bg-gray-200 rounded mb-4 animate-pulse w-3/4"></div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-40 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-5 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                </div>
              </div>

              <div className="lg:w-80 flex-shrink-0">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="space-y-4">
                    <div className="h-11 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-11 bg-gray-200 rounded animate-pulse"></div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-16 mb-1 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-16 mb-1 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content Skeleton */}
            <div className="lg:col-span-2 space-y-12">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
                  <div className="space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-5 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-12">
              <div>
                <div className="h-7 bg-gray-200 rounded w-32 mb-6 animate-pulse"></div>
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-20 mb-1 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-white p-8">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Job Not Found
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {error ||
                "The job you're looking for doesn't exist or has been removed."}
            </p>
            <Link href="/jobs">
              <Button
                variant="default"
                size="lg"
              >
                Back to Jobs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-500">
          <Link href="/jobs" className="hover:text-gray-700">Jobs</Link>
          <span className="mx-2 text-gray-300">/</span>
          <span className="text-gray-900">{job.title}</span>
        </nav>

        {/* Header */}
        <div className="mb-12">

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">
                  {job.title}
                </h1>
                {job.featured && (
                  <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-md">
                    <StarIcon className="w-3.5 h-3.5 mr-1.5" />
                    Featured
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mb-6">
                {job.company?.logo ? (
                  <img
                    src={job.company.logo}
                    alt={job.company.name || "Company logo"}
                    className="w-10 h-10 rounded-lg object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                ) : null}
                <div
                  className={`w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center ${
                    job.company?.logo ? "hidden" : ""
                  }`}
                >
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="text-lg font-medium text-gray-900">
                    {job.company?.name || "Company Name Not Available"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {job.company?.industry || job.industry || "Industry Not Specified"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <CurrencyDollarIcon className="w-4 h-4 flex-shrink-0" />
                  <span>{job.salary}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <BriefcaseIcon className="w-4 h-4 flex-shrink-0" />
                  <span>{job ? formatJobType(job.type) : ""}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <ClockIcon className="w-4 h-4 flex-shrink-0" />
                  <span>{job ? formatWorkType(job.workType || "Work Type Not Specified") : ""}</span>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed">
                {job.shortDescription}
              </p>
            </div>

            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                <div className="flex flex-col space-y-3">
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    disabled={isLoading || !job}
                    onClick={() => {
                      // Only navigate if job is loaded and valid
                      if (!isLoading && job && typeof window !== "undefined") {
                        window.location.href = `/jobs/${job.id}/apply`;
                      }
                    }}
                  >
                    Apply Now
                  </Button>

                  {canSaveJobs() && (
                    <button
                      onClick={handleSaveJob}
                      className={`w-full h-11 border font-medium rounded transition-all duration-300 ${
                        isJobSaved(jobId)
                          ? "bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100"
                          : "bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      {isJobSaved(jobId) ? "Saved" : "Save Job"}
                    </button>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                  {job.deadline && (
                    <div className="flex items-center gap-3 text-sm">
                      <CalendarIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="text-gray-500 text-xs">Deadline</div>
                        <div className="text-gray-900 font-medium">
                          {new Date(job.deadline).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-sm">
                    <ClockIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <div className="text-gray-500 text-xs">Posted</div>
                      <div className="text-gray-900 font-medium">
                        {new Date(job.postedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Job Description */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight">Job Description</h2>
              <div className="prose prose-gray max-w-none">
                <p className="whitespace-pre-line text-gray-600 leading-relaxed">
                  {job.description}
                </p>
              </div>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight">Key Responsibilities</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="whitespace-pre-line text-gray-600 leading-relaxed">
                    {job.responsibilities}
                  </p>
                </div>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight">Requirements</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="whitespace-pre-line text-gray-600 leading-relaxed">
                    {job.requirements}
                  </p>
                </div>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight">Benefits & Perks</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="whitespace-pre-line text-gray-600 leading-relaxed">
                    {job.benefits}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-12">
            {/* Job Details */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Job Details</h3>
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <BriefcaseIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-gray-500">Experience Level</div>
                    <div className="text-gray-900 font-medium">{job.experience || "Not Specified"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-gray-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 14l9-5-9-5-9 5 9 5z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 14v7a2 2 0 01-2 2H8a2 2 0 01-2-2v-7m8 0V9a2 2 0 00-2-2H8a2 2 0 00-2 2v5m8 0l2-1"
                    />
                  </svg>
                  <div>
                    <div className="text-sm text-gray-500">Education</div>
                    <div className="text-gray-900 font-medium">{job.education || "Not Specified"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-gray-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <div>
                    <div className="text-sm text-gray-500">Job Level</div>
                    <div className="text-gray-900 font-medium">{job.jobLevel || "Not Specified"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-gray-500">Industry</div>
                    <div className="text-gray-900 font-medium">{job.industry || "Not Specified"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md border border-gray-200 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Company Info */}
            {job.company && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">About {job.company.name}</h3>
                <div className="space-y-5">
                  {job.company.industry && (
                    <div className="flex items-center gap-3">
                      <BuildingOfficeIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-gray-500">Industry</div>
                        <div className="text-gray-900 font-medium">{job.company.industry}</div>
                      </div>
                    </div>
                  )}
                  {job.company.numberOfEmployees && (
                    <div className="flex items-center gap-3">
                      <UserGroupIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-gray-500">Company Size</div>
                        <div className="text-gray-900 font-medium">
                          {job.company.numberOfEmployees.toLocaleString()} employees
                        </div>
                      </div>
                    </div>
                  )}
                  {job.company.address && (
                    <div className="flex items-center gap-3">
                      <MapPinIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-gray-500">Location</div>
                        <div className="text-gray-900 font-medium">
                          {job.company.address.city}, {job.company.address.country}
                        </div>
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

export default React.memo(JobDetailPage);
