"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getMyCompanyApplications,
  Application,
  ApplicationStatus,
} from "@/services/applications.service";
import { getJobs, getMyCompanyJobs, Job } from "@/services/jobs.service";

// Define our interface for the page data
interface CVManagerData {
  applications: Application[];
  loading: boolean;
  error: string | null;
  filters: {
    status: ApplicationStatus | "ALL";
    jobId: string | "ALL";
    search: string;
  };
}

const CVManager = () => {
  const [data, setData] = useState<CVManagerData>({
    applications: [],
    loading: true,
    error: null,
    filters: {
      status: "ALL",
      jobId: "ALL",
      search: "",
    },
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [sortBy, setSortBy] = useState<string>("appliedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch applications and jobs data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setData((prev) => ({ ...prev, loading: true, error: null }));

        // Fetch jobs and applications in parallel
        const [jobsResponse, applicationsResponse] = await Promise.all([
          getMyCompanyJobs({ limit: 100 }),
          getMyCompanyApplications({
            sortBy,
            sortOrder,
            // Only apply status filter if it's not 'ALL'
            ...(data.filters.status !== "ALL" && {
              status: data.filters.status,
            }),
            // Only apply job filter if it's not 'ALL'
            ...(data.filters.jobId !== "ALL" && {
              jobPostId: data.filters.jobId,
            }),
          }),
        ]);

        setJobs(jobsResponse.jobs);
        setData({
          applications: applicationsResponse.applications,
          loading: false,
          error: null,
          filters: data.filters,
        });
      } catch (error) {
        console.error("Error fetching CV data:", error);
        setData((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load applications data",
        }));
      }
    };

    fetchData();
  }, [data.filters.status, data.filters.jobId, sortBy, sortOrder]);

  // Handle filter changes
  const handleStatusFilterChange = (status: ApplicationStatus | "ALL") => {
    setData((prev) => ({
      ...prev,
      filters: { ...prev.filters, status },
    }));
  };

  const handleJobFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setData((prev) => ({
      ...prev,
      filters: { ...prev.filters, jobId: event.target.value },
    }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setData((prev) => ({
      ...prev,
      filters: { ...prev.filters, search: event.target.value },
    }));
  };

  // Handle sorting
  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      // If already sorting by this field, toggle order
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // If sorting by a new field, default to descending
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Filter applications by search term
  const filteredApplications = (data.applications || []).filter((app) => {
    if (!data.filters.search) return true;

    const searchTerm = data.filters.search.toLowerCase();
    return (
      (app.candidate.firstName?.toLowerCase() || "").includes(searchTerm) ||
      (app.candidate.lastName?.toLowerCase() || "").includes(searchTerm) ||
      (app.candidate.fullName?.toLowerCase() || "").includes(searchTerm) ||
      app.candidate.phoneNumber.toLowerCase().includes(searchTerm) ||
      (app.candidate.email?.toLowerCase() || "").includes(searchTerm) ||
      app.jobPost.title.toLowerCase().includes(searchTerm)
    );
  });

  // Helper function to get status color
  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case ApplicationStatus.SCREENING:
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
      case ApplicationStatus.INTERVIEWED:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case ApplicationStatus.SHORTLISTED:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case ApplicationStatus.REJECTED:
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case ApplicationStatus.HIRED:
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (data.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-8 max-w-md">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Error Loading Applications
          </h3>
          <p className="text-red-600 dark:text-red-300">{data.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          CV & Application Manager
        </h1>
        <Link href="/dashboard">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </button>
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Total Applications
          </h3>
          <p className="text-3xl font-semibold text-gray-900 dark:text-white">
            {(data.applications || []).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Pending Review
          </h3>
          <p className="text-3xl font-semibold text-gray-900 dark:text-white">
            {
              (data.applications || []).filter(
                (app) => app.status === ApplicationStatus.PENDING
              ).length
            }
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Shortlisted
          </h3>
          <p className="text-3xl font-semibold text-gray-900 dark:text-white">
            {
              (data.applications || []).filter(
                (app) => app.status === ApplicationStatus.SHORTLISTED
              ).length
            }
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Filter Applications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusFilterChange("ALL")}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  data.filters.status === "ALL"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                All
              </button>
              {Object.values(ApplicationStatus).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusFilterChange(status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    data.filters.status === status
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {status.charAt(0) +
                    status.slice(1).toLowerCase().replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Job Filter */}
          <div>
            <label
              htmlFor="job-filter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Job Posting
            </label>
            <select
              id="job-filter"
              value={data.filters.jobId}
              onChange={handleJobFilterChange}
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Job Postings</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label
              htmlFor="search-filter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Search
            </label>
            <input
              id="search-filter"
              type="text"
              placeholder="Search candidate name, email, phone..."
              value={data.filters.search}
              onChange={handleSearchChange}
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {(filteredApplications || []).length === 0 ? (
            <div className="text-center p-8">
              <p className="text-gray-500 dark:text-gray-400">
                No applications found matching your filters
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange("candidate.fullName")}
                  >
                    Candidate
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange("jobPost.title")}
                  >
                    Position
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange("appliedAt")}
                  >
                    Applied Date
                    {sortBy === "appliedAt" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange("status")}
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    CV
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {(filteredApplications || []).map((application) => (
                  <tr
                    key={application.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                              {application.candidate.firstName?.[0]?.toUpperCase() ||
                                application.candidate.fullName?.[0]?.toUpperCase() ||
                                application.candidate.phoneNumber?.[0]?.toUpperCase() ||
                                "?"}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {application.candidate.fullName ||
                              application.candidate.firstName ||
                              "Unnamed Candidate"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {application.candidate.email ||
                              application.candidate.phoneNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {application.jobPost.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {application.jobPost.company.displayName ||
                          application.jobPost.company.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(application.appliedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {application.status.charAt(0) +
                          application.status
                            .slice(1)
                            .toLowerCase()
                            .replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {application.cvUrl ? (
                        <a
                          href={application.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          {application.cvFileName || "View CV"}
                        </a>
                      ) : (
                        <span>No CV uploaded</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/cv/${application.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline mr-3"
                      >
                        View
                      </Link>
                      <button className="text-emerald-600 dark:text-emerald-400 hover:underline">
                        Interview
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CVManager;
