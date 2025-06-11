"use client";

import React, { useEffect, useState } from "react";
import { getFeaturedJobs, Job } from "@/services/jobs.service";
import { JobCard } from "@/components/jobs/JobCard";
import { useRouter } from "next/navigation";
import { BriefcaseIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

interface FeaturedJobsProps {
  limit?: number;
  showHeader?: boolean;
  showViewAll?: boolean;
}

export const FeaturedJobs: React.FC<FeaturedJobsProps> = ({
  limit = 6,
  showHeader = true,
  showViewAll = true,
}) => {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const featuredJobs = await getFeaturedJobs(limit);
        setJobs(featuredJobs);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load featured jobs"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedJobs();
  }, [limit]);

  const handleViewDetails = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
  };

  const handleViewAllJobs = () => {
    router.push("/jobs?isFeatured=true");
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4">
          {showHeader && (
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <BriefcaseIcon className="h-8 w-8 text-[#00C6AD]" />
                <h2 className="text-3xl font-bold text-white">Featured Jobs</h2>
              </div>
              <p className="text-gray-400 text-lg">
                Hand-picked opportunities from top companies
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: limit }).map((_, index) => (
              <div
                key={index}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 animate-pulse"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-700 rounded w-4/5"></div>
                  <div className="h-3 bg-gray-700 rounded w-3/5"></div>
                </div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-gray-700 rounded w-20"></div>
                  <div className="h-6 bg-gray-700 rounded w-16"></div>
                </div>
                <div className="h-10 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4">
          {showHeader && (
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <BriefcaseIcon className="h-8 w-8 text-[#00C6AD]" />
                <h2 className="text-3xl font-bold text-white">Featured Jobs</h2>
              </div>
            </div>
          )}
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#00C6AD] hover:bg-[#14B8A6] text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4">
          {showHeader && (
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <BriefcaseIcon className="h-8 w-8 text-[#00C6AD]" />
                <h2 className="text-3xl font-bold text-white">Featured Jobs</h2>
              </div>
            </div>
          )}
          <div className="text-center py-12">
            <BriefcaseIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No featured jobs available
            </h3>
            <p className="text-gray-400">
              Check back later for new opportunities
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {showHeader && (
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BriefcaseIcon className="h-8 w-8 text-[#00C6AD]" />
              <h2 className="text-3xl font-bold text-white">Featured Jobs</h2>
            </div>
            <p className="text-gray-400 text-lg">
              Hand-picked opportunities from top companies
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onViewDetails={handleViewDetails} />
          ))}
        </div>

        {showViewAll && (
          <div className="text-center mt-8">
            <button
              onClick={handleViewAllJobs}
              className="inline-flex items-center gap-2 bg-[#00C6AD] hover:bg-[#14B8A6] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              View All Featured Jobs
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
