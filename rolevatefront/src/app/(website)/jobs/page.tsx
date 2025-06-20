"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useJobs } from "@/hooks/useJobs";
import { JobCard } from "@/components/jobs/JobCard";
import { Pagination } from "@/components/jobs/Pagination";
import { JobFilters as JobFiltersType } from "@/services/jobs.service";
import {
  BriefcaseIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const JobsPage: React.FC = () => {
  const router = useRouter();
  const [filters, setFilters] = useState<JobFiltersType>({
    page: 1,
    limit: 12,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { jobs, pagination, loading, error, refetch } = useJobs(filters);

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    refetch(newFilters);
  };

  const handleViewDetails = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Title - Left-aligned, Apple Style */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Demo Jobs
          </h1>
          <div className="w-16 h-1 bg-[#00C6AD] mt-3"></div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C6AD] mx-auto mb-4"></div>
              <p className="text-gray-400">Loading jobs...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-400 text-lg mb-2">Error loading jobs</p>
              <p className="text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => refetch(filters)}
                className="bg-[#00C6AD] hover:bg-[#14B8A6] text-white px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            {pagination && (
              <div className="mb-6">
                <p className="text-gray-400">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  of {pagination.total} jobs
                </p>
              </div>
            )}

            {/* Jobs Grid */}
            {(jobs?.length ?? 0) > 0 ? (
              <div className="jobs-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <BriefcaseIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No jobs found
                </h3>
                <p className="text-gray-400 mb-4">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={() => {
                    setFilters({
                      page: 1,
                      limit: 12,
                      sortBy: "createdAt",
                      sortOrder: "desc",
                    });
                    refetch({
                      page: 1,
                      limit: 12,
                      sortBy: "createdAt",
                      sortOrder: "desc",
                    });
                  }}
                  className="bg-[#00C6AD] hover:bg-[#14B8A6] text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <Pagination
                current={pagination.page}
                total={pagination.totalPages}
                onPageChange={handlePageChange}
                hasNext={pagination.hasNext}
                hasPrev={pagination.hasPrev}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
