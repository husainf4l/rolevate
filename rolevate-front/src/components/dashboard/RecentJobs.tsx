import React, { useState, useEffect } from "react";
import {
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  EyeIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { JobService, JobPost } from "@/services/job";
import { getApplicationsByJob } from "@/services/application";
import { Skeleton } from "@/components/ui/skeleton";

interface JobWithStats extends JobPost {
  applicants: number;
  views: number;
}

export default function RecentJobs() {
  const [recentJobs, setRecentJobs] = useState<JobWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentJobs();
  }, []);

  const fetchRecentJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await JobService.getCompanyJobs(1, 4); // Get first 4 jobs

      if (response.jobs) {
        // Fetch application counts for each job
        const jobsWithStats = await Promise.all(
          response.jobs.map(async (job) => {
            try {
              const applications = await getApplicationsByJob(job.id);
              return {
                ...job,
                applicants: applications.length,
                views: 0, // Views not implemented in backend yet
              };
            } catch (error) {
              console.error(
                `Error fetching applications for job ${job.id}:`,
                error
              );
              return {
                ...job,
                applicants: 0,
                views: 0,
              };
            }
          })
        );

        setRecentJobs(jobsWithStats);
      }
    } catch (error) {
      console.error("Error fetching recent jobs:", error);
      setError(error instanceof Error ? error.message : 'Failed to load recent jobs');
    } finally {
      setLoading(false);
    }
  };

  const formatPostedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "1 day ago";
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "FULL_TIME":
        return "bg-green-100 text-green-800";
      case "PART_TIME":
        return "bg-blue-100 text-blue-800";
      case "CONTRACT":
        return "bg-purple-100 text-purple-800";
      case "REMOTE":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "PAUSED":
        return "bg-yellow-100 text-yellow-900";
      case "CLOSED":
        return "bg-red-100 text-red-800";
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "EXPIRED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeDisplayText = (type: string) => {
    switch (type) {
      case "FULL_TIME":
        return "Full-time";
      case "PART_TIME":
        return "Part-time";
      case "CONTRACT":
        return "Contract";
      case "REMOTE":
        return "Remote";
      default:
        return type;
    }
  };

  const getStatusDisplayText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Active";
      case "PAUSED":
        return "Paused";
      case "CLOSED":
        return "Closed";
      case "DRAFT":
        return "Draft";
      case "EXPIRED":
        return "Expired";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-300/70">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <BriefcaseIcon className="w-5 h-5 text-[#0fc4b5]" />
            Your Job Postings
          </h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 bg-white rounded-lg shadow-none border border-gray-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div>
                    <Skeleton className="w-48 h-5 mb-2" />
                    <Skeleton className="w-32 h-4" />
                  </div>
                </div>
                <Skeleton className="w-20 h-6 rounded-full" />
              </div>
              <div className="space-y-3 mb-4">
                <Skeleton className="w-full h-12" />
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-24 h-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-300/70">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <BriefcaseIcon className="w-5 h-5 text-[#0fc4b5]" />
            Your Job Postings
          </h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-2 text-red-800">
            <span className="text-sm font-medium">Error loading job postings:</span>
            <span className="text-sm">{error}</span>
          </div>
          <button 
            onClick={fetchRecentJobs}
            className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-300/70">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <BriefcaseIcon className="w-5 h-5 text-[#0fc4b5]" />
          Your Job Postings
        </h2>
        <button className="text-sm text-[#0fc4b5] hover:text-[#0891b2] font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {recentJobs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BriefcaseIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No job postings yet</p>
            <p className="text-sm">
              Create your first job posting to get started
            </p>
          </div>
        ) : (
          recentJobs.map((job) => (
            <div
              key={job.id}
              className="p-4 border border-gray-300 rounded-lg hover:border-[#0fc4b5]/50 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {job.title}
                  </h3>
                  <p className="text-gray-600 font-medium">
                    {job.department || "General"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                      job.type
                    )}`}
                  >
                    {getTypeDisplayText(job.type)}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      job.status
                    )}`}
                  >
                    {getStatusDisplayText(job.status)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CurrencyDollarIcon className="w-4 h-4" />
                    <span>{job.salary || "Not specified"}</span>
                  </div>
                </div>
                <span>{formatPostedDate(job.postedAt)}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <UsersIcon className="w-4 h-4" />
                    <span>{job.applicants} applicants</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <EyeIcon className="w-4 h-4" />
                    <span>{job.views} views</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

