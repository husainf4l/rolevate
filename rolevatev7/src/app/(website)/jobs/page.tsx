"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import JobCard from "@/components/common/JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { jobsService, Job } from "@/services";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

const jobTypes = [
  "All",
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
];
const locations = [
  "All",
  "Saudi Arabia",
  "Qatar",
  "Jordan",
  "UAE",
  "Kuwait",
  "Bahrain",
  "Oman",
];
const experienceLevels = [
  "All",
  "Entry Level",
  "Mid Level",
  "Senior Level",
  "Executive",
];
const departments = [
  "All",
  "Engineering",
  "Sales",
  "Marketing",
  "Finance",
  "Human Resources",
  "Operations",
  "Customer Service",
  "Product",
  "Design",
  "Legal",
  "Other",
];

function JobsPageContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { isJobSaved, toggleSaveJob } = useSavedJobs();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedExperience, setSelectedExperience] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  // API state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Initialize filters from URL parameters
  useEffect(() => {
    const department = searchParams.get('department');
    if (department && departments.includes(department)) {
      setSelectedDepartment(department);
    }
  }, [searchParams]);

  // Fetch jobs from API
  const fetchJobs = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      // Pass department filter to API
      const filters: any = {};
      if (selectedDepartment && selectedDepartment !== "All") {
        filters.department = selectedDepartment;
      }
      // You can add other filters here as needed

      // Use getPublicJobs to ensure only ACTIVE jobs are shown
      const response = await jobsService.getPublicJobs(page, 12, filters); // Fetch 12 jobs per page for better UX

      if (append) {
        setJobs(prev => [...prev, ...response.jobs]);
      } else {
        setJobs(response.jobs);
      }

      setTotalJobs(response.total);
      setCurrentPage(page);
      setHasMore(response.jobs.length === 12 && page * 12 < response.total);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs from server. Please check your connection and try again.");
      if (!append) setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDepartment]);

  // Initial fetch
  useEffect(() => {
    fetchJobs(1);
  }, [fetchJobs]);

  // Filter jobs locally (only for search, type, location, experience - department is handled by backend)
  const filteredJobs = jobs.filter((job) => {
    // Only show active jobs
    const isActive = job.isActive !== false;
    
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === "All" || 
      job.type.toLowerCase().replace("_", "-") === selectedType.toLowerCase().replace("-", "_");
    
    const matchesLocation = selectedLocation === "All" ||
      job.location.toLowerCase().includes(selectedLocation.toLowerCase());

    const matchesExperience = selectedExperience === "All" ||
      job.level.toLowerCase().includes(selectedExperience.toLowerCase().split(" ")[0]);

    // Department filtering is now handled by the backend API
    return isActive && matchesSearch && matchesType && matchesLocation && matchesExperience;
  });

  // Sort the filtered jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case "latest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "salary":
        // Extract numeric salary values for better sorting
        const getSalaryValue = (salary: string | undefined) => {
          if (!salary) return 0;
          const match = salary.match(/(\d+(?:,\d+)?(?:\.\d+)?)/);
          return match ? parseFloat(match[1].replace(',', '')) : 0;
        };
        return getSalaryValue(b.salary) - getSalaryValue(a.salary);
      default:
        return 0;
    }
  });

  const handleSaveJob = async (jobId: string) => {
    if (!user) {
      toast.error('Please login to save jobs');
      return;
    }

    try {
      await toggleSaveJob(jobId);
      if (isJobSaved(jobId)) {
        toast.success('Job removed from saved jobs');
      } else {
        toast.success('Job saved successfully');
      }
    } catch (error: any) {
      console.error('Error toggling save job:', error);
      toast.error(error?.message || 'Failed to save job');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          <div className="text-center mb-8 lg:mb-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-gray-900 mb-4 sm:mb-6 ">
              Find Your Next{" "}
              <span className="text-primary-600">
                Opportunity
              </span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto px-4">
              Discover premium career opportunities from leading companies
              across the Middle East
            </p>
          </div>

          {/* Mobile Search Bar */}
          <div className="lg:hidden mb-6">
            <div className="bg-white rounded-sm shadow-lg border border-gray-100 p-4">
              <div className="mb-4">
                <div className="relative">
                  <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
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
                    placeholder="Job title, company, or keywords..."
                    className="w-full pl-12 pr-6 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 text-base shadow-sm transition-all duration-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full flex items-center justify-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors text-base py-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
                  />
                </svg>
                {showMobileFilters ? "Hide Filters" : "Show Filters"}
              </button>

              {/* Mobile Filters */}
              {showMobileFilters && (
                <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Job Type
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                    >
                      {jobTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                    >
                      {locations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Experience Level
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base"
                      value={selectedExperience}
                      onChange={(e) => setSelectedExperience(e.target.value)}
                    >
                      {experienceLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base"
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                    >
                      {departments.map((department) => (
                        <option key={department} value={department}>
                          {department}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedType("All");
                      setSelectedLocation("All");
                      setSelectedExperience("All");
                      setSelectedDepartment("All");
                    }}
                    className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-sm transition-colors text-base"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="w-full flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden lg:block w-80 xl:w-96 bg-white rounded-sm shadow-lg border border-gray-100 p-6 lg:p-8 sticky top-8 self-start">
              <div className="mb-8">
                <label className="block text-lg font-bold text-gray-800 mb-4 tracking-wide">
                  Search Jobs
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
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
                    className="w-full pl-12 pr-6 py-3.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 text-base shadow-sm transition-all duration-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Job Type
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base transition-all duration-200"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    {jobTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Location
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base transition-all duration-200"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Experience Level
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base transition-all duration-200"
                    value={selectedExperience}
                    onChange={(e) => setSelectedExperience(e.target.value)}
                  >
                    {experienceLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Department
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base transition-all duration-200"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                  >
                    {departments.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedType("All");
                    setSelectedLocation("All");
                    setSelectedExperience("All");
                    setSelectedDepartment("All");
                  }}
                  className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-sm transition-colors text-base"
                >
                  Clear All Filters
                </button>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="mb-6 lg:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="text-lg sm:text-xl font-semibold text-gray-900">
                      {totalJobs > 0 ? `${totalJobs} Jobs Found` : `${sortedJobs.length} Jobs Found`}
                    </div>
                    
                    {/* Active filters */}
                    {(searchTerm ||
                      selectedType !== "All" ||
                      selectedLocation !== "All" ||
                      selectedExperience !== "All" ||
                      selectedDepartment !== "All") && (
                      <div className="flex flex-wrap gap-2">
                        {searchTerm && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            Search: "{searchTerm}"
                          </span>
                        )}
                        {selectedType !== "All" && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {selectedType}
                          </span>
                        )}
                        {selectedLocation !== "All" && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {selectedLocation}
                          </span>
                        )}
                        {selectedDepartment !== "All" && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {selectedDepartment}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 hidden sm:block">
                      Sort by:
                    </span>
                    <select
                      className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm text-gray-900 bg-white shadow-sm min-w-0 flex-shrink-0"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="latest">Latest Posted</option>
                      <option value="salary">Highest Salary</option>
                    </select>
                  </div>
                </div>

                {/* Jobs Grid */}
                <div className="mt-8">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 sm:py-20 lg:py-24">
                      <svg
                        className="animate-spin h-12 w-12 sm:h-14 sm:w-14 text-primary-500 mb-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-label="Loading Spinner"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      <div className="text-lg text-gray-500">Loading jobs...</div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                        {sortedJobs.map((job) => (
                          <div
                            key={job.id}
                            className="animate-in fade-in-50 duration-300"
                          >
                            <JobCard
                              job={job}
                              onSave={handleSaveJob}
                              isSaved={false}
                              showSaveButton={true}
                            />
                          </div>
                        ))}
                      </div>

                      {/* No Results */}
                      {sortedJobs.length === 0 && !loading && (
                        <div className="text-center py-12 sm:py-16 lg:py-20">
                          <div className="text-gray-400 text-5xl sm:text-6xl lg:text-7xl mb-4 sm:mb-6">
                            🔍
                          </div>
                          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                            No jobs found
                          </h3>
                          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 px-4 max-w-md mx-auto">
                            Try adjusting your search criteria to find more opportunities
                          </p>
                          <Button
                            onClick={() => {
                              setSearchTerm("");
                              setSelectedType("All");
                              setSelectedLocation("All");
                              setSelectedExperience("All");
                              setSelectedDepartment("All");
                            }}
                            className="px-6 py-3 text-base bg-primary-600 hover:bg-primary-700"
                          >
                            Clear All Filters
                          </Button>
                        </div>
                      )}

                      {/* Load More Button */}
                      {sortedJobs.length > 0 && hasMore && !loading && (
                        <div className="text-center mt-8">
                          <Button
                            onClick={() => fetchJobs(currentPage + 1, true)}
                            className="px-8 py-3 text-base bg-primary-600 hover:bg-primary-700"
                          >
                            Load More Jobs
                          </Button>
                        </div>
                      )}

                      {/* API Error */}
                      {error && (
                        <div className="text-center py-8">
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
                            <div className="text-red-600 font-medium mb-2">{error}</div>
                            <Button
                              onClick={() => fetchJobs()}
                              className="text-sm bg-red-600 hover:bg-red-700"
                            >
                              Try Again
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading jobs...</p>
          </div>
        </div>
      }
    >
      <JobsPageContent />
    </Suspense>
  );
}