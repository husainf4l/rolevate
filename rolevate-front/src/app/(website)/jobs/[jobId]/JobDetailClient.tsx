"use client";

import React from "react";
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
import ShareButton from "@/components/common/ShareButton";
import { useSavedJobs } from "@/hooks/useSavedJobs";

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
  };
}

interface JobDetailClientProps {
  job: JobDetail;
  jobId: string;
}

export default function JobDetailClient({ job, jobId }: JobDetailClientProps) {
  const { isJobSaved, canSaveJobs, toggleSaveJob } = useSavedJobs();
  
  const isSaved = isJobSaved(jobId);
  const showSaveButton = canSaveJobs();

  // Generate the share URL
  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/jobs/${jobId}`;
    }
    // Fallback for SSR
    return `https://rolevate.com/jobs/${jobId}`;
  };

  // Debug logging with more detail
  console.log("Job Detail Page - Debug Info:", {
    jobId,
    jobIdType: typeof jobId,
    isSaved,
    showSaveButton,
    canSaveJobs: canSaveJobs(),
  });

  const handleSaveJob = async () => {
    try {
      await toggleSaveJob(jobId);
    } catch (error) {
      console.error("Error saving/removing job:", error);
    }
  };

  const formatJobType = (type: string) => {
    return type
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatWorkType = (workType: string) => {
    if (!workType || workType === "Work Type Not Specified") return "Not Specified";
    return workType.charAt(0).toUpperCase() + workType.slice(1).toLowerCase();
  };

  const formatPostedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.ceil(diffDays / 30)} month${Math.ceil(diffDays / 30) > 1 ? 's' : ''} ago`;
  };

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
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1 mb-8 lg:mb-0">
              {/* Title */}
              <h1 className="text-4xl font-bold text-gray-900 mb-4 font-display leading-tight">
                {job.title}
              </h1>

              <div className="flex items-center flex-wrap gap-3 mb-6">
                {job.featured && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border border-orange-200/50">
                    <StarIcon className="w-3 h-3 mr-1" />
                    Featured
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3 mb-6">
                {job.company?.logo ? (
                  <img
                    src={job.company.logo}
                    alt={job.company.name || "Company logo"}
                    className="w-12 h-12 rounded-2xl object-cover shadow-lg border border-gray-200/50"
                    onError={(e) => {
                      // Fallback to icon if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                ) : null}
                <div
                  className={`w-12 h-12 bg-gradient-to-r from-[#13ead9] to-[#0891b2] rounded-2xl flex items-center justify-center shadow-lg ${
                    job.company?.logo ? "hidden" : ""
                  }`}
                >
                  <BuildingOfficeIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-semibold text-[#0891b2] font-display">
                    {job.company?.name || "Company Name Not Available"}
                  </span>
                  <p className="text-gray-600 text-sm">
                    {job.company?.industry ||
                      job.industry ||
                      "Industry Not Specified"}
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
                    {formatWorkType(job.workType || "Work Type Not Specified")}
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
                    disabled={false}
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.location.href = `/jobs/${job.id}/apply`;
                      }
                    }}
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
                      <span>{isSaved ? "Saved" : "Save Job"}</span>
                    </button>
                  )}

                  {/* Share Button */}
                  <div className="flex items-center justify-center">
                    <ShareButton
                      url={getShareUrl()}
                      title={`${job.title} at ${job.company?.name || "Company"}`}
                      description={`${job.shortDescription || job.description || ''} - ${job.location} - ${job.salary}`.slice(0, 150)}
                      variant="button"
                      className="w-full px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-2xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-white hover:border-[#0891b2] hover:text-[#0891b2] hover:shadow-md transform hover:scale-[1.02] transition-all duration-300 font-semibold text-base"
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 font-medium">Posted:</span>
                      <span className="text-gray-900 font-semibold">
                        {formatPostedDate(job.postedAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 font-medium">Applicants:</span>
                      <span className="text-gray-900 font-semibold">
                        {job.applicants}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 font-medium">Views:</span>
                      <span className="text-gray-900 font-semibold">
                        {job.views}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Job Details Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Description */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 font-display">
                Job Description
              </h2>
              <div className="prose prose-gray max-w-none">
                <div
                  className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              </div>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 font-display">
                  Key Responsibilities
                </h2>
                <div className="prose prose-gray max-w-none">
                  <div
                    className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: job.responsibilities }}
                  />
                </div>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 font-display">
                  Requirements
                </h2>
                <div className="prose prose-gray max-w-none">
                  <div
                    className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: job.requirements }}
                  />
                </div>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 font-display">
                  Benefits & Perks
                </h2>
                <div className="prose prose-gray max-w-none">
                  <div
                    className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: job.benefits }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Details */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 font-display">
                Job Details
              </h3>
              <div className="space-y-4">
                {job.experience && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#0891b2]/10 rounded-lg flex items-center justify-center">
                      <UserGroupIcon className="w-4 h-4 text-[#0891b2]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Experience</p>
                      <p className="text-sm text-gray-900">{job.experience}</p>
                    </div>
                  </div>
                )}

                {job.education && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#0891b2]/10 rounded-lg flex items-center justify-center">
                      <BookmarkIcon className="w-4 h-4 text-[#0891b2]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Education</p>
                      <p className="text-sm text-gray-900">{job.education}</p>
                    </div>
                  </div>
                )}

                {job.jobLevel && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#0891b2]/10 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="w-4 h-4 text-[#0891b2]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Job Level</p>
                      <p className="text-sm text-gray-900">{job.jobLevel}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#0891b2]/10 rounded-lg flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4 text-[#0891b2]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Application Deadline</p>
                    <p className="text-sm text-gray-900">
                      {new Date(job.deadline).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 font-display">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-[#13ead9]/10 to-[#0891b2]/10 text-[#0891b2] text-sm font-medium rounded-full border border-[#0891b2]/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
