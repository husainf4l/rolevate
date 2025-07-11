"use client";

import React, { useState, useEffect } from "react";
import JobCard, { JobData } from "@/components/common/JobCard";
import { Button } from "@/components/common/Button";
import { JobService, JobPost } from "@/services/job";
import { useSavedJobs } from "@/hooks/useSavedJobs";

// Fallback data in case API fails
const fallbackJobsData: JobData[] = [
  {
    id: "fallback-1",
    title: "Senior Software Engineer",
    company: "Aramco Digital",
    location: "Riyadh, Saudi Arabia",
    type: "Full-time",
    salary: "25,000 - 35,000 SAR",
    skills: ["React", "Node.js", "TypeScript", "AWS", "GraphQL"],
    posted: "2 days ago",
    applicants: 23,
    logo: "🏢",
    description:
      "Join Saudi Arabia's leading tech transformation initiative building next-generation digital solutions.",
    urgent: true,
  },
  {
    id: "fallback-2",
    title: "Product Manager",
    company: "Qatar Airways Group",
    location: "Doha, Qatar",
    type: "Full-time",
    salary: "18,000 - 25,000 QAR",
    skills: [
      "Product Strategy",
      "Analytics",
      "Leadership",
      "Agile",
      "Aviation Tech",
    ],
    posted: "1 day ago",
    applicants: 41,
    logo: "✈️",
    description:
      "Drive digital product innovation for Qatar's world-class airline and travel ecosystem.",
  },
  {
    id: "fallback-3",
    title: "UX Designer",
    company: "Zain Jordan",
    location: "Amman, Jordan",
    type: "Full-time",
    salary: "1,200 - 1,800 JOD",
    skills: ["Figma", "User Research", "Arabic UX", "Mobile Design"],
    posted: "3 days ago",
    applicants: 18,
    logo: "📱",
    description:
      "Design innovative digital experiences for Jordan's leading telecommunications company.",
  },
];

const jobTypes = [
  "All",
  "Full-time",
  "Part-time",
  "Contract",
  "Remote",
  "Internship",
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
  "Director",
];
const salaryRanges = [
  "All",
  "Below 10K",
  "10K - 20K",
  "20K - 35K",
  "35K - 50K",
  "50K+",
];
const companies = [
  "All",
  "Aramco Digital",
  "Qatar Airways",
  "Zain",
  "NEOM Tech",
  "Careem",
  "Ooredoo",
  "Dubai Police",
  "KAUST",
];
const industries = [
  "All",
  "Technology",
  "Aviation",
  "Telecommunications",
  "Energy",
  "Transportation",
  "Government",
  "Research",
  "Finance",
];

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedExperience, setSelectedExperience] = useState("All");
  const [selectedSalary, setSelectedSalary] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  // Use the useSavedJobs hook for canonical saved jobs state
  const { isJobSaved, toggleSaveJob } = useSavedJobs();

  // API state
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const jobsPerPage = 10;

  // Helper function to convert JobPost to JobData format
  const convertJobPostToJobData = (jobPost: JobPost): JobData => {
    return {
      id: jobPost.id, // Use string ID directly (UUID from backend)
      title: jobPost.title,
      company: jobPost.company?.name || "Company", // Use actual company name from API
      location: jobPost.location,
      type:
        jobPost.type === "FULL_TIME"
          ? "Full-time"
          : jobPost.type === "PART_TIME"
          ? "Part-time"
          : jobPost.type === "CONTRACT"
          ? "Contract"
          : "Remote",
      salary: jobPost.salary,
      skills: jobPost.skills || [],
      posted: new Date(jobPost.postedAt).toLocaleDateString(),
      applicants: jobPost.applicants,
      logo: getCompanyLogo(jobPost.company?.name), // Dynamic logo based on company
      description: jobPost.shortDescription || jobPost.description,
      urgent: false, // You might want to add this field to JobPost interface
    };
  };

  // Helper function to get company logo/emoji based on company name
  const getCompanyLogo = (companyName?: string): string => {
    if (!companyName) return "🏢";

    const name = companyName.toLowerCase();

    // Map company names to appropriate emojis
    if (name.includes("tech") || name.includes("software")) return "💻";
    if (
      name.includes("health") ||
      name.includes("medical") ||
      name.includes("pharma")
    )
      return "🏥";
    if (name.includes("finance") || name.includes("bank")) return "🏦";
    if (
      name.includes("education") ||
      name.includes("school") ||
      name.includes("university")
    )
      return "🎓";
    if (name.includes("food") || name.includes("restaurant")) return "🍽️";
    if (
      name.includes("travel") ||
      name.includes("airline") ||
      name.includes("tourism")
    )
      return "✈️";
    if (
      name.includes("retail") ||
      name.includes("shop") ||
      name.includes("store")
    )
      return "🛍️";
    if (name.includes("energy") || name.includes("oil") || name.includes("gas"))
      return "⚡";
    if (name.includes("construction") || name.includes("building")) return "🏗️";
    if (name.includes("telecom") || name.includes("communication")) return "📱";
    if (name.includes("automotive") || name.includes("car")) return "🚗";
    if (name.includes("media") || name.includes("entertainment")) return "🎬";

    return "🏢"; // Default logo
  };

  // Fetch jobs from API
  const fetchJobs = async (page: number = 1, search?: string) => {
    try {
      setLoading(true);
      setApiError(null);

      const response = await JobService.getAllPublicJobs(
        page,
        jobsPerPage,
        search || searchTerm || undefined
      );

      const convertedJobs = response.jobs.map(convertJobPostToJobData);
      setJobs(convertedJobs);
      setTotalJobs(response.total);
      setPagination(response.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setApiError("Failed to load jobs");
      // Fallback to hardcoded data
      setJobs(fallbackJobsData);
      setTotalJobs(fallbackJobsData.length);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and search effect
  useEffect(() => {
    fetchJobs(1, searchTerm);
  }, [searchTerm]);

  // Filter jobs locally (since API doesn't support all filter types yet)
  const filteredJobs = jobs.filter((job) => {
    const matchesType = selectedType === "All" || job.type === selectedType;
    const matchesLocation =
      selectedLocation === "All" || job.location.includes(selectedLocation);
    const matchesCompany =
      selectedCompany === "All" || job.company === selectedCompany;

    // Add other filter logic here
    return matchesType && matchesLocation && matchesCompany;
  });

  const handleApply = (jobId: string) => {
    console.log(`Applying for job ID: ${jobId}`);
  };

  const handleSaveJob = async (jobId: string) => {
    try {
      await toggleSaveJob(jobId);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          <div className="text-center mb-8 lg:mb-10">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
              Find Your Next{" "}
              <span
                className="bg-gradient-to-r from-[#13ead9] to-[#0891b2] bg-clip-text text-transparent"
                style={{
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Opportunity
              </span>
            </h1>
            <p className="font-text text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto px-4">
              Discover premium career opportunities from leading companies
              across the Middle East
            </p>
          </div>

          {/* Mobile Search Bar - Shows at top on mobile */}
          <div className="lg:hidden mb-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
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
                    placeholder="Job title, company, or skills..."
                    className="w-full pl-12 pr-6 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 text-base shadow-sm transition-all duration-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors text-base py-2"
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
              {showMobileFilters && (
                <div className="mt-4 space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Job Type
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base"
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base"
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
                      Salary Range
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base"
                      value={selectedSalary}
                      onChange={(e) => setSelectedSalary(e.target.value)}
                    >
                      {salaryRanges.map((range) => (
                        <option key={range} value={range}>
                          {range}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Experience Level
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base"
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
                      Company
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base"
                      value={selectedCompany}
                      onChange={(e) => setSelectedCompany(e.target.value)}
                    >
                      {companies.map((company) => (
                        <option key={company} value={company}>
                          {company}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Industry
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base"
                      value={selectedIndustry}
                      onChange={(e) => setSelectedIndustry(e.target.value)}
                    >
                      {industries.map((industry) => (
                        <option key={industry} value={industry}>
                          {industry}
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
                      setSelectedSalary("All");
                      setSelectedCompany("All");
                      setSelectedIndustry("All");
                    }}
                    className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-base"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search and Filters as Side Section */}
          <div className="w-full flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Desktop Sidebar Filters - Hidden on mobile, appears on left on desktop */}
            <aside className="hidden lg:block w-80 xl:w-96 bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:p-8 sticky top-8 self-start animate-fade-in">
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
                    className="w-full pl-12 pr-6 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 text-base shadow-sm transition-all duration-200"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base transition-all duration-200"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base transition-all duration-200"
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
                    Salary Range
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base transition-all duration-200"
                    value={selectedSalary}
                    onChange={(e) => setSelectedSalary(e.target.value)}
                  >
                    {salaryRanges.map((range) => (
                      <option key={range} value={range}>
                        {range}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors text-base"
                >
                  <svg
                    className={`w-5 h-5 transform transition-transform ${
                      showAdvancedFilters ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  {showAdvancedFilters
                    ? "Hide Advanced Filters"
                    : "Show Advanced Filters"}
                </button>
                {showAdvancedFilters && (
                  <div className="animate-fade-in space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Experience Level
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base transition-all duration-200"
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
                        Company
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base transition-all duration-200"
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                      >
                        {companies.map((company) => (
                          <option key={company} value={company}>
                            {company}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Industry
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm text-base transition-all duration-200"
                        value={selectedIndustry}
                        onChange={(e) => setSelectedIndustry(e.target.value)}
                      >
                        {industries.map((industry) => (
                          <option key={industry} value={industry}>
                            {industry}
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
                        setSelectedSalary("All");
                        setSelectedCompany("All");
                        setSelectedIndustry("All");
                      }}
                      className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-base"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="mb-6 lg:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="text-lg sm:text-xl font-semibold text-gray-900">
                      {filteredJobs.length}{" "}
                      {filteredJobs.length === 1 ? "Job" : "Jobs"} Found
                      {totalJobs > 0 && totalJobs !== filteredJobs.length && (
                        <span className="text-sm text-gray-500 ml-2">
                          (filtered from {totalJobs} total)
                        </span>
                      )}
                    </div>
                    {(searchTerm ||
                      selectedType !== "All" ||
                      selectedLocation !== "All" ||
                      selectedExperience !== "All" ||
                      selectedSalary !== "All" ||
                      selectedCompany !== "All" ||
                      selectedIndustry !== "All") && (
                      <div className="flex flex-wrap gap-2">
                        {searchTerm && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 hidden sm:block">
                      Sort by:
                    </span>
                    <select
                      className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white shadow-sm min-w-0 flex-shrink-0"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="latest">Latest Posted</option>
                      <option value="salary">Highest Salary</option>
                      <option value="applicants">Most Popular</option>
                    </select>
                  </div>
                </div>
                {/* Jobs Grid */}
                <div className="mt-8">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 sm:py-20 lg:py-24">
                      <svg
                        className="animate-spin h-12 w-12 sm:h-14 sm:w-14 text-blue-500 mb-4"
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
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        ></path>
                      </svg>
                      <div className="text-lg text-gray-500">
                        Loading jobs...
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 xl:gap-10">
                        {filteredJobs.map((job) => (
                          <div
                            key={job.id}
                            className="animate-fade-in group relative flex flex-col h-full"
                            tabIndex={0}
                            aria-label={`Job: ${job.title} at ${job.company}`}
                          >
                            <div className="flex-1">
                              <JobCard
                                job={job}
                                onApply={handleApply}
                                onSave={handleSaveJob}
                                isSaved={isJobSaved(job.id)}
                                showDescription={true}
                                compact={false}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* No Results */}
                      {filteredJobs.length === 0 && !loading && (
                        <div className="text-center py-12 sm:py-16 lg:py-20">
                          <div
                            className="text-gray-400 text-5xl sm:text-6xl lg:text-7xl mb-4 sm:mb-6"
                            aria-hidden="true"
                          >
                            🔍
                          </div>
                          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                            No jobs found
                          </h3>
                          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 px-4 max-w-md mx-auto">
                            Try adjusting your search criteria to find more
                            opportunities
                          </p>
                          <Button
                            variant="primary"
                            onClick={() => {
                              setSearchTerm("");
                              setSelectedType("All");
                              setSelectedLocation("All");
                              setSelectedExperience("All");
                              setSelectedSalary("All");
                              setSelectedCompany("All");
                              setSelectedIndustry("All");
                            }}
                            className="px-6 py-3 text-base"
                          >
                            Clear All Filters
                          </Button>
                        </div>
                      )}

                      {/* Pagination */}
                      {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center mt-12 space-x-2">
                          <Button
                            variant="secondary"
                            disabled={!pagination.hasPrevPage || loading}
                            onClick={() =>
                              handlePageChange(pagination.prevPage)
                            }
                            className="px-4 py-2"
                          >
                            Previous
                          </Button>

                          <div className="flex items-center space-x-2">
                            {Array.from(
                              { length: Math.min(5, pagination.totalPages) },
                              (_, i) => {
                                const page = i + 1;
                                return (
                                  <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    disabled={loading}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                      currentPage === page
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                                    }`}
                                  >
                                    {page}
                                  </button>
                                );
                              }
                            )}
                          </div>

                          <Button
                            variant="secondary"
                            disabled={!pagination.hasNextPage || loading}
                            onClick={() =>
                              handlePageChange(pagination.nextPage)
                            }
                            className="px-4 py-2"
                          >
                            Next
                          </Button>
                        </div>
                      )}

                      {/* API Error */}
                      {apiError && (
                        <div className="text-center py-8">
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
                            <div className="text-red-600 font-medium mb-2">
                              {apiError}
                            </div>
                            <Button
                              variant="secondary"
                              onClick={() => fetchJobs(currentPage)}
                              className="text-sm"
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

      {/* ...existing code... */}
    </div>
  );
}
