"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import JobListCard, { JobData } from "@/components/common/JobListCard";
import { Button } from "@/components/ui/button";
import { JobService, JobPost } from "@/services/job";
import { useSavedJobs } from "@/hooks/useSavedJobs";

export default function UserDashboardJobsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [loading, setLoading] = useState(false);

  // Initialize search term from URL params
  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [searchParams]);

  // Update URL when search term changes
  const updateSearchTerm = useCallback((value: string) => {
    setSearchTerm(value);
    
    // Update URL with search query
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.replace(`/userdashboard/jobs${newUrl}`, { scroll: false });
  }, [searchParams, router]);

  // Clear search function
  const clearSearch = useCallback(() => {
    updateSearchTerm("");
  }, [updateSearchTerm]);

  // Use the useSavedJobs hook for canonical saved jobs state
  const { isJobSaved, saveJob, unsaveJob } = useSavedJobs();

  // API state
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pagination, setPagination] = useState<any>(null);

  const jobsPerPage = 10;

  // Helper function to convert JobPost to JobData format
  const convertJobPostToJobData = (jobPost: JobPost): JobData => {
    try {
      const logoResult = getJobLogo(jobPost);

      const jobData: JobData = {
        id: jobPost.id || '', // Use string ID directly (UUID from backend)
        title: jobPost.title || 'Untitled Position',
        company: jobPost.company?.name || "Company", // Use actual company name from API
        location: jobPost.location || 'Location TBD',
        type:
          jobPost.type === "FULL_TIME"
            ? "Full-time"
            : jobPost.type === "PART_TIME"
            ? "Part-time"
            : jobPost.type === "CONTRACT"
            ? "Contract"
            : jobPost.type === "REMOTE"
            ? "Remote"
            : "Other",
        salary: jobPost.salary || 'Competitive',
        skills: jobPost.skills || [],
        posted: jobPost.postedAt ? new Date(jobPost.postedAt).toLocaleDateString() : 'Recently',
        applicants: jobPost.applicants || 0,
        description: jobPost.shortDescription || jobPost.description || '',
        urgent: false, // Default to false for now
      };

      // Only add logo field if it exists (handles exactOptionalPropertyTypes)
      if (logoResult !== undefined) {
        jobData.logo = logoResult;
      }

      // Only add experience field if it exists
      if (jobPost.experience) {
        jobData.experience = jobPost.experience;
      }

      return jobData;
    } catch (error) {
      console.error("Error converting job post:", jobPost, error);
      // Return a minimal valid job data object
      return {
        id: jobPost.id || 'unknown',
        title: 'Error Loading Job',
        company: 'Unknown',
        location: 'Unknown',
        type: 'Full-time',
        salary: 'N/A',
        skills: [],
        posted: 'Unknown',
        applicants: 0,
        description: 'Error loading job details',
        urgent: false,
      };
    }
  };

  // Helper function to get job logo from API response (no emoji fallback)
  const getJobLogo = (jobPost: JobPost): string | undefined => {
    // Priority order: companyLogo -> company.logo -> undefined (no fallback)
    if (jobPost.companyLogo) {
      return jobPost.companyLogo;
    }

    if (jobPost.company?.logo) {
      return jobPost.company.logo;
    }

    // No fallback - return undefined if no logo is available
    return undefined;
  };

  // Fetch jobs from API
  const fetchJobs = useCallback(async (page: number = 1, search?: string) => {
    try {
      setLoading(true);

      const response = await JobService.getAllPublicJobs(
        page,
        jobsPerPage,
        search || searchTerm || undefined
      );

      console.log("API Response:", response); // Debug log

      // Check if response has the expected structure
      if (!response || !Array.isArray(response.jobs)) {
        throw new Error("Invalid response structure from API");
      }

      const convertedJobs = response.jobs.map(convertJobPostToJobData);

      setJobs(convertedJobs);
      setPagination(response.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      console.error("Error details:", error instanceof Error ? error.message : "Unknown error");
      // Set empty state instead of fallback data
      setJobs([]);
      setPagination(undefined);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]); // Only depend on searchTerm

  // Initial fetch and search effect
  useEffect(() => {
    fetchJobs(1, searchTerm);
  }, [searchTerm, fetchJobs]);

  // Sort the jobs
  const sortedJobs = [...jobs].sort((a, b) => {
    switch (sortBy) {
      case "latest":
        return new Date(b.posted).getTime() - new Date(a.posted).getTime();
      case "salary":
        // Extract numeric values from salary strings for comparison
        const getSalaryValue = (salary: string) => {
          const numbers = salary.match(/\d+/g);
          return numbers ? parseInt(numbers[0]) : 0;
        };
        return getSalaryValue(b.salary) - getSalaryValue(a.salary);
      case "applicants":
        return b.applicants - a.applicants;
      default:
        return 0;
    }
  });

  const handleApply = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
  };

  const handleSaveJob = async (jobId: string) => {
    try {
      if (isJobSaved(jobId)) {
        await unsaveJob(jobId);
      } else {
        await saveJob(jobId);
      }
    } catch (error) {
      console.error("Failed to toggle save job:", error);
      // Error handling is already done in the hook
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchJobs(page);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-4">
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
              Explore{" "}
              <span className="text-primary-600">
                Opportunities
              </span>
            </h1>
            <p className="font-text text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Find your next career opportunity
            </p>
          </div>

          {/* Search and Sort Bar */}
          <div className="max-w-4xl mx-auto mb-2">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
              <div className="flex-1 relative w-full">
                <svg
                  className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Job title, company, or skills..."
                  className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 text-sm sm:text-base shadow-sm transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => updateSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Clear search"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="flex gap-1.5 sm:gap-2 flex-wrap justify-center sm:justify-start">
                <button
                  onClick={() => setSortBy("latest")}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-sm transition-all duration-200 ${
                    sortBy === "latest"
                      ? "bg-primary-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Latest
                </button>
                <button
                  onClick={() => setSortBy("salary")}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-sm transition-all duration-200 ${
                    sortBy === "salary"
                      ? "bg-primary-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Salary
                </button>
                <button
                  onClick={() => setSortBy("applicants")}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-sm transition-all duration-200 ${
                    sortBy === "applicants"
                      ? "bg-primary-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Popular
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="text-lg font-semibold text-gray-900">
            {sortedJobs.length} {sortedJobs.length === 1 ? "Job" : "Jobs"} Found
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {sortedJobs.map((job) => (
                <JobListCard
                  key={job.id}
                  job={job}
                  onApply={handleApply}
                  onSave={handleSaveJob}
                  isSaved={isJobSaved(job.id)}
                />
              ))}
            </div>

            {sortedJobs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No jobs found matching your criteria.</p>
                <Button
                  variant="outline"
                  onClick={clearSearch}
                  className="mt-4"
                >
                  Clear Search
                </Button>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                <Button
                  variant="secondary"
                  disabled={!pagination.hasPrevPage || loading}
                  onClick={() => handlePageChange(pagination.prevPage)}
                >
                  Previous
                </Button>
                <span className="px-4 py-2">
                  Page {currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="secondary"
                  disabled={!pagination.hasNextPage || loading}
                  onClick={() => handlePageChange(pagination.nextPage)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

