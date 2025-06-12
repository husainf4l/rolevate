"use client";

import React, { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisHorizontalIcon,
  BriefcaseIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { getJobs, getMyCompanyJobs, Job, JobFilters } from "@/services/jobs.service";

type JobPostStatus = "active" | "paused" | "draft" | "completed";

// Map API Job to display format
interface JobPostDisplay {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: JobPostStatus;
  applicants: number;
  createdBy: string;
  createdAt: string;
  description: string;
  company: string;
  isActive: boolean;
  isFeatured: boolean;
}

type Props = {};

const JobPostDashboard = (props: Props) => {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobPostDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredJobs, setFilteredJobs] = useState<JobPostDisplay[]>([]);

  // Map API Job to JobPostDisplay
  const mapJobToDisplay = (job: Job): JobPostDisplay => {
    // Determine status based on job properties
    let status: JobPostStatus = "draft";
    if (job.isActive && job.publishedAt) {
      status = "active";
    } else if (job.publishedAt && !job.isActive) {
      status = "paused";
    } else if (!job.publishedAt) {
      status = "draft";
    }

    // Map work type to display format
    const typeMap: { [key: string]: string } = {
      ONSITE: "full-time",
      REMOTE: "remote",
      HYBRID: "hybrid",
      FULL_TIME: "full-time",
      PART_TIME: "part-time",
      CONTRACT: "contract",
    };

    return {
      id: job.id,
      title: job.title,
      department: job.company?.industry || "General",
      location: job.location,
      type: typeMap[job.workType] || job.workType.toLowerCase(),
      status,
      applicants: job.applicationCount || 0,
      createdBy: job.createdBy?.name || "System",
      createdAt: new Date(job.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      description: job.description,
      company: job.company?.name || "",
      isActive: job.isActive,
      isFeatured: job.isFeatured,
    };
  };

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const filters: JobFilters = {
          page: 1,
          limit: 20,
          sortBy: "createdAt",
          sortOrder: "desc",
        };

        const response = await getMyCompanyJobs(filters);
        const mappedJobs = response.jobs.map(mapJobToDisplay);
        setJobs(mappedJobs);
        setFilteredJobs(mappedJobs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load jobs");
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredJobs(filtered);
    }
  }, [searchTerm, jobs]);

  const getStatusBadge = (status: JobPostStatus) => {
    const statusConfig = {
      active: {
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        text: "Active",
      },
      paused: {
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        text: "Paused",
      },
      draft: {
        color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        text: "Draft",
      },
      completed: {
        color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        text: "Completed",
      },
    };

    const config = statusConfig[status];
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const handleRowClick = (jobId: string) => {
    router.push(`/dashboard/jobpost/${jobId}`);
  };

  const handleActionClick = (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    console.log("Action clicked for job:", jobId);
  };

  const handleNewJob = () => {
    router.push("/dashboard/jobpost/new");
  };

  return (
    <div className="flex-1 items-center justify-center min-h-screen bg-gray-900">
      <div className="px-20 py-20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BriefcaseIcon className="h-8 w-8 text-[#00C6AD]" />
              Job Posts
            </h1>
            <p className="text-gray-400 mt-1">
              Create and manage banking positions with AI-powered recruitment
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleNewJob}
              className="bg-[#00C6AD] hover:bg-[#14B8A6] text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
            >
              <PlusIcon className="h-5 w-5" />
              New Job Post
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Jobs</p>
                <p className="text-2xl font-bold text-white">
                  {loading ? "..." : jobs.length}
                </p>
              </div>
              <BriefcaseIcon className="h-8 w-8 text-[#00C6AD]" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Jobs</p>
                <p className="text-2xl font-bold text-white">
                  {loading
                    ? "..."
                    : jobs.filter((job) => job.status === "active").length}
                </p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Applicants</p>
                <p className="text-2xl font-bold text-white">
                  {loading
                    ? "..."
                    : jobs.reduce((sum, job) => sum + job.applicants, 0)}
                </p>
              </div>
              <UserGroupIcon className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Featured Jobs</p>
                <p className="text-2xl font-bold text-white">
                  {loading
                    ? "..."
                    : jobs.filter((job) => job.isFeatured).length}
                </p>
              </div>
              <ClockIcon className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#00C6AD] focus:border-[#00C6AD] transition-all bg-gray-800 text-white placeholder-gray-400"
            placeholder="Search job posts..."
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading jobs...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
            <div className="text-red-400 text-sm">
              Error loading jobs: {error}
            </div>
          </div>
        )}

        {/* Jobs Table */}
        {!loading && !error && (
          <div className="w-full border border-gray-800 rounded-xl overflow-hidden shadow-lg bg-gray-800">
            <table className="w-full">
              <thead className="bg-gray-850 border-b border-gray-700">
                <tr className="text-left text-sm">
                  <th className="px-6 py-4 text-gray-300 font-semibold">
                    Position
                  </th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">
                    Company
                  </th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">
                    Location
                  </th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">
                    Applicants
                  </th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">
                    Type
                  </th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">
                    Created
                  </th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-gray-400"
                    >
                      {searchTerm
                        ? "No jobs found matching your search."
                        : "No jobs available."}
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job, index) => (
                    <tr
                      key={job.id}
                      onClick={() => handleRowClick(job.id)}
                      className="border-b border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-[#00C6AD] group-hover:underline">
                            {job.title}
                          </span>
                          <span className="text-xs text-gray-400">
                            {job.department}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{job.company}</td>
                      <td className="px-6 py-4 text-gray-300">
                        {job.location}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(job.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <UserGroupIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-300">
                            {job.applicants}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-300 capitalize">
                          {job.type}
                        </span>
                        {job.isFeatured && (
                          <span className="ml-2 px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                            Featured
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {job.createdAt}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          className="p-1.5 rounded-full hover:bg-gray-700"
                          onClick={(e) => handleActionClick(e, job.id)}
                        >
                          <EllipsisHorizontalIcon className="h-5 w-5 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Quick Info Panel */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-[#00C6AD] rounded-full"></div>
            Quick Info
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-medium mb-2">
                Job Status Indicators
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">
                    Active - Published and accepting applications
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-300">
                    Paused - Temporarily closed for applications
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-gray-300">
                    Draft - Not yet published
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">
                Rolevate Jobs Platform
              </h4>
              <p className="text-gray-400 text-sm">
                Manage all your job postings from this dashboard. Create new
                positions, track applications, and monitor performance metrics
                with real-time data integration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPostDashboard;
