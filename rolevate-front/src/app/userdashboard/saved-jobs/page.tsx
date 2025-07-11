"use client";

import React, { useState, useEffect } from "react";
import {
  BookmarkIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BriefcaseIcon,
  TrashIcon,
  EyeIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { getSavedJobsDetails } from "@/services/savedJobs";

interface SavedJob {
  id: string;
  title: string;
  department: string;
  location: string;
  salary: string;
  type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
  deadline: string;
  description: string;
  shortDescription: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  skills: string[];
  experience: string;
  education: string;
  jobLevel: "ENTRY" | "MID" | "SENIOR" | "EXECUTIVE";
  workType: "ON_SITE" | "REMOTE" | "HYBRID";
  industry: string;
  status: "ACTIVE" | "INACTIVE" | "CLOSED";
  featured: boolean;
  applicants: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
    name: string;
    industry: string;
    numberOfEmployees: number;
    address: {
      city: string;
      country: string;
    };
  };
  screeningQuestions: Array<{
    id: string;
    question: string;
    type: "YES_NO" | "MULTIPLE_CHOICE" | "TEXT";
    required: boolean;
  }>;
  _count: {
    applications: number;
  };
}

const isDeadlineApproaching = (deadline: string) => {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 3;
};

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

export default function SavedJobsPage() {
  const { toggleSaveJob } = useSavedJobs();
  const [savedJobsDetails, setSavedJobsDetails] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch saved jobs details from API
  useEffect(() => {
    const fetchSavedJobsDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getSavedJobsDetails();
        setSavedJobsDetails(response.savedJobs);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load saved jobs"
        );
        console.error("Failed to fetch saved jobs details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedJobsDetails();
  }, []);

  const handleUnsaveJob = async (jobId: string) => {
    try {
      await toggleSaveJob(jobId);
      // Remove from local state
      setSavedJobsDetails((prev) => prev.filter((job) => job.id !== jobId));
    } catch (error) {
      console.error("Failed to unsave job:", error);
      // You could show a toast notification here
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0fc4b5] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your saved jobs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Error Loading Saved Jobs
            </h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Jobs</h1>
          <p className="text-gray-600">
            Keep track of interesting opportunities you want to apply to later.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Saved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {savedJobsDetails.length}
                </p>
              </div>
              <div className="p-3 bg-[#0fc4b5] bg-opacity-10 rounded-lg">
                <BookmarkIcon className="w-6 h-6 text-[#0fc4b5]" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Applied From Saved
                </p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <BriefcaseIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Deadlines Soon
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    savedJobsDetails.filter(
                      (job) =>
                        job.deadline && isDeadlineApproaching(job.deadline)
                    ).length
                  }
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <option>All Jobs</option>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Remote</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <option>Sort by: Most Recent</option>
                <option>Sort by: Best Match</option>
                <option>Sort by: Salary</option>
                <option>Sort by: Deadline</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              {savedJobsDetails.length} saved jobs
            </div>
          </div>
        </div>

        {/* Saved Jobs List */}
        {savedJobsDetails.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <HeartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No saved jobs yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start saving jobs you're interested in to keep track of them here.
            </p>
            <a
              href="/userdashboard/jobs"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#0fc4b5] text-white rounded-lg hover:bg-[#0ba399] transition-colors"
            >
              <span>Browse Jobs</span>
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {savedJobsDetails.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {job.title}
                      </h3>
                      {job.workType === "REMOTE" && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          Remote
                        </span>
                      )}
                      {job.workType === "HYBRID" && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                          Hybrid
                        </span>
                      )}
                      {job.deadline && isDeadlineApproaching(job.deadline) && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Deadline Soon
                        </span>
                      )}
                    </div>
                    <p className="text-lg text-[#0fc4b5] font-medium mb-2">
                      {job.company.name}
                    </p>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {job.description}
                    </p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CurrencyDollarIcon className="w-4 h-4" />
                        <span>{job.salary}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BriefcaseIcon className="w-4 h-4" />
                        <span>{formatJobType(job.type)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{job.experience}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleUnsaveJob(job.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from saved jobs"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>
                      Saved on {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                    {job.deadline && (
                      <span>
                        Apply by {new Date(job.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={`/jobs/${job.id}`}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View Details
                    </a>
                    <button className="px-4 py-2 bg-[#0fc4b5] text-white rounded-lg hover:bg-[#0ba399] transition-colors">
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 Tips for Managing Saved Jobs
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <p className="font-medium mb-1">Set Application Reminders</p>
              <p>
                Don't let great opportunities slip away due to missed deadlines.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Research Companies</p>
              <p>
                Use your saved list to research companies and prepare better
                applications.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Track Application Status</p>
              <p>
                Move applied jobs to your applications tracker for better
                organization.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Regular Review</p>
              <p>
                Clean up your saved jobs list regularly to keep it relevant.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
