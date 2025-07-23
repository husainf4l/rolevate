"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/common/Button";
import { useSavedJobsStandalone } from "@/hooks/useSavedJobsStandalone";

// Get the base URL without the /api suffix for static files
const getBaseStaticUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://rolevate.com/api";
  return apiUrl.replace("/api", "");
};

export interface JobData {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  skills: string[];
  posted: string;
  applicants: number;
  logo?: string; // Make logo optional - can be undefined if no logo available
  description?: string;
  urgent?: boolean;
  experience?: string; // Add experience field
}

interface JobCardProps {
  job: JobData;
  onApply?: (jobId: string) => void;
  onSave?: (jobId: string) => void;
  isSaved?: boolean; // Optional override for saved state
  showDescription?: boolean;
  compact?: boolean;
}

export default function JobCard({
  job,
  onSave,
  isSaved, // This prop is now optional and mainly for override
  showDescription = false,
  compact = false,
}: JobCardProps) {
  const { isJobSaved, canSaveJobs, toggleSaveJob } = useSavedJobsStandalone();
  const [isSaving, setIsSaving] = useState(false);

  // Use hook's saved state or external prop as fallback
  const jobIsSaved = isSaved !== undefined ? isSaved : isJobSaved(job.id);
  const showSaveButton = canSaveJobs();

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      // If external onSave handler is provided, use it (for pages that manage their own state)
      if (onSave) {
        onSave(job.id);
      } else {
        // Otherwise, use the hook's toggle functionality
        await toggleSaveJob(job.id);
      }
    } catch (error) {
      console.error("Failed to save/unsave job:", error);
      // You could add a toast notification here
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200 group relative hover:-translate-y-1 ${
        compact ? "p-4" : "p-6"
      }`}
    >
      {/* Urgent Badge */}
      {job.urgent && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
          Urgent
        </div>
      )}

      {/* Save Button */}
      {showSaveButton && (
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`absolute top-4 ${
            job.urgent ? "right-20" : "right-4"
          } z-10 w-8 h-8 rounded-full bg-white shadow-md border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 flex items-center justify-center group/save disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label={jobIsSaved ? "Unsave job" : "Save job"}
        >
          {isSaving ? (
            <svg
              className="w-4 h-4 text-gray-400 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <svg
              className={`w-4 h-4 transition-all duration-200 ${
                jobIsSaved
                  ? "text-red-500 fill-current"
                  : "text-gray-400 group-hover/save:text-red-500 group-hover/save:fill-current"
              }`}
              fill={jobIsSaved ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          )}
        </button>
      )}

      {/* Content */}
      <div className="relative">
        {/* Company Info */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-xl border border-gray-200 flex-shrink-0 overflow-hidden relative">
            {job.logo &&
            (job.logo.includes(".jpg") ||
              job.logo.includes(".png") ||
              job.logo.includes(".jpeg") ||
              job.logo.includes(".svg") ||
              job.logo.includes(".webp")) ? (
              <Image
                src={
                  job.logo.startsWith("http")
                    ? job.logo
                    : `/api/proxy-image?url=${encodeURIComponent(
                        `${getBaseStaticUrl()}/${job.logo}`
                      )}`
                }
                alt={`${job.company} logo`}
                width={48}
                height={48}
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  console.error(
                    "Image failed to load for company:",
                    job.company
                  );
                  console.error("Logo URL:", job.logo);
                  // Hide the broken image and show fallback
                  e.currentTarget.style.display = "none";
                  const fallback =
                    e.currentTarget.parentElement?.querySelector(
                      ".logo-fallback"
                    );
                  if (fallback) {
                    fallback.classList.remove("hidden");
                  }
                }}
              />
            ) : null}
            <span
              className={`logo-fallback text-xl font-semibold text-gray-600 ${
                job.logo &&
                (job.logo.includes(".jpg") ||
                  job.logo.includes(".png") ||
                  job.logo.includes(".jpeg") ||
                  job.logo.includes(".svg") ||
                  job.logo.includes(".webp"))
                  ? "hidden"
                  : ""
              }`}
            >
              {job.logo &&
              !job.logo.startsWith("http") &&
              !job.logo.includes(".")
                ? job.logo
                : job.company.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base leading-tight group-hover:text-gray-700 transition-colors duration-300 truncate">
              {job.company}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
              <svg
                className="w-3.5 h-3.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="truncate">{job.location}</span>
            </div>
          </div>
        </div>

        {/* Job Title */}
        <h4
          className={`font-bold text-gray-900 mb-3 leading-tight ${
            compact ? "text-base" : "text-lg"
          }`}
        >
          {job.title}
        </h4>

        {/* Job Description */}
        {showDescription && job.description && (
          <p className="text-gray-500 text-sm mb-3 line-clamp-1 leading-relaxed">
            {job.description.length > 80
              ? `${job.description.substring(0, 80)}...`
              : job.description}
          </p>
        )}

        {/* Job Details */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
          <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-medium">
            {job.type}
          </span>
          <span className="font-semibold text-gray-900 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
            {job.salary}
          </span>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-5">
          {job.skills.slice(0, compact ? 2 : 3).map((skill, index) => (
            <span
              key={index}
              className="bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-200"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > (compact ? 2 : 3) && (
            <span className="text-gray-600 text-xs px-2.5 py-1 font-medium">
              +{job.skills.length - (compact ? 2 : 3)} more
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <svg
              className="w-3.5 h-3.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{job.posted}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="primary"
              size="sm"
              href={`/jobs/${job.id}`}
              className="text-xs px-3 py-1.5 sm:px-4 sm:py-2"
            >
              Apply Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
