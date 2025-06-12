"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getJobStats,
  getJobs,
  getFeaturedJobs,
  JobStats,
  Job,
} from "@/services/jobs.service";

// Interface for dashboard data
interface DashboardData {
  stats: JobStats | null;
  recentJobs: Job[];
  featuredJobs: Job[];
  loading: boolean;
  error: string | null;
}

// Function to generate initials avatar from name
const getInitials = (name: string) => {
  const nameParts = name.split(" ");
  return nameParts.length > 1
    ? `${nameParts[0][0]}${nameParts[1][0]}`
    : nameParts[0].substring(0, 2);
};

// Function to get a consistent color based on name
const getAvatarColor = (name: string) => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-indigo-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-teal-500",
  ];

  // Simple hash function to get a consistent color for a name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

// Component for stat card
const StatCard = ({
  title,
  value,
  icon,
  trend,
  changePercentage,
}: {
  title: string;
  value: number | string;
  icon: string;
  trend?: "up" | "down";
  changePercentage?: number;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
        <span className="text-2xl">{icon}</span>
      </div>
      {trend && (
        <div
          className={`flex items-center ${
            trend === "up" ? "text-green-500" : "text-red-500"
          }`}
        >
          <span className="text-sm font-medium">{changePercentage}%</span>
          <svg className="w-5 h-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d={
                trend === "up"
                  ? "M12 7a1 1 0 01-1-1V5.414l-4.293 4.293a1 1 0 01-1.414-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L13 5.414V6a1 1 0 01-1 1z"
                  : "M12 13a1 1 0 011 1v1.586l4.293-4.293a1 1 0 011.414 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 011.414-1.414L11 15.586V14a1 1 0 011-1z"
              }
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
    <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
      {value}
    </h3>
    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{title}</p>
  </div>
);

// Component for job card
const JobCard = ({ job }: { job: Job }) => {
  const [imageError, setImageError] = useState(false);

  const formatSalary = (min?: number, max?: number, currency = "USD") => {
    if (!min || !max) return null;
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="flex items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
        <div className="flex-shrink-0 mr-4">
          {job.company.logo && !imageError ? (
            <Image
              src={job.company.logo}
              alt={job.company.name}
              width={40}
              height={40}
              className="rounded-lg"
              onError={() => setImageError(true)}
              onLoadingComplete={() => setImageError(false)}
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                {job.company.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {job.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {job.company.displayName || job.company.name}
              </p>
              <div className="flex items-center mt-1 space-x-2">
                <span className="inline-block px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                  {job.experienceLevel}
                </span>
                <span className="inline-block px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
                  {job.workType}
                </span>
                {job.isFeatured && (
                  <span className="inline-block px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full">
                    Featured
                  </span>
                )}
              </div>
              {formatSalary(job.salaryMin, job.salaryMax, job.currency) && (
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                </p>
              )}
            </div>
            <div className="flex-shrink-0 ml-2 text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(job.createdAt)}
              </p>
              <div className="flex items-center mt-1 space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{job.applicationCount} apps</span>
                <span>{job.viewCount} views</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: null,
    recentJobs: [],
    featuredJobs: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardData((prev) => ({ ...prev, loading: true, error: null }));

        // Fetch all data in parallel
        const [statsData, recentJobsData, featuredJobsData] = await Promise.all(
          [
            getJobStats(),
            getJobs({ limit: 10, sortBy: "createdAt", sortOrder: "desc" }),
            getFeaturedJobs(6),
          ]
        );

        setDashboardData({
          stats: statsData,
          recentJobs: recentJobsData.jobs,
          featuredJobs: featuredJobsData,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setDashboardData((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load dashboard data",
        }));
      }
    };

    fetchDashboardData();
  }, []);

  if (dashboardData.loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <div className="space-y-8">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error loading dashboard
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{dashboardData.error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const { stats } = dashboardData;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <div className="flex items-center space-x-3">
          <Link href="/dashboard/jobpost">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              New Job Posting
            </button>
          </Link>
          <Link href="/jobs">
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
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              View All Jobs
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Jobs"
          value={stats?.totalJobs || 0}
          icon="💼"
          trend="up"
          changePercentage={12}
        />
        <StatCard
          title="Active Jobs"
          value={stats?.activeJobs || 0}
          icon="🟢"
        />
        <StatCard
          title="Featured Jobs"
          value={stats?.featuredJobs || 0}
          icon="⭐"
          trend="up"
          changePercentage={5}
        />
        <StatCard
          title="Applications"
          value={stats?.totalApplications || 0}
          icon="📋"
        />
        <StatCard
          title="Recent Jobs"
          value={stats?.recentJobs || 0}
          icon="🆕"
          trend="up"
          changePercentage={8}
        />
        <StatCard
          title="Companies"
          value={
            dashboardData.recentJobs.length > 0
              ? new Set(dashboardData.recentJobs.map((job) => job.company.id))
                  .size
              : 0
          }
          icon="🏢"
        />
      </div>

      {/* Job Analytics Visualization */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Job Analytics
          </h2>
          <div className="flex items-center space-x-2 text-sm">
            <span className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
              <span className="text-gray-500 dark:text-gray-400">
                Experience Level
              </span>
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-500 mr-1"></span>
              <span className="text-gray-500 dark:text-gray-400">
                Work Type
              </span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Experience Level Distribution */}
          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              By Experience Level
            </h3>
            <div className="space-y-3">
              {stats?.distribution.byExperience.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.level}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            (item.count / (stats?.totalJobs || 1)) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Work Type Distribution */}
          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              By Work Type
            </h3>
            <div className="space-y-3">
              {stats?.distribution.byWorkType.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.type}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            (item.count / (stats?.totalJobs || 1)) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Jobs and Featured Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Jobs
            </h3>
            <Link
              href="/jobs"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {dashboardData.recentJobs.slice(0, 5).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
            {dashboardData.recentJobs.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No recent jobs found
              </p>
            )}
          </div>
        </div>

        {/* Featured Jobs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Featured Jobs
            </h3>
            <Link
              href="/jobs?featured=true"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {dashboardData.featuredJobs.slice(0, 5).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
            {dashboardData.featuredJobs.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No featured jobs found
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h2>
          <Link
            href="/dashboard/activities"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="space-y-4">
          {dashboardData.recentJobs.slice(0, 4).map((job, index) => (
            <div key={job.id} className="flex">
              <div className="mr-4 flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-lg">
                    {index === 0
                      ? "📝"
                      : index === 1
                      ? "✅"
                      : index === 2
                      ? "🔍"
                      : "🏆"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-900 dark:text-white">
                  <span className="font-medium">New job posted:</span>{" "}
                  {job.title} at{" "}
                  <span className="font-medium">
                    {job.company.displayName || job.company.name}
                  </span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatDate(job.createdAt)} • {job.applicationCount}{" "}
                  applications • {job.viewCount} views
                </p>
              </div>
            </div>
          ))}

          {stats && stats.totalApplications > 0 && (
            <div className="flex">
              <div className="mr-4 flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 text-lg">
                    📋
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-900 dark:text-white">
                  <span className="font-medium">
                    {stats.totalApplications} total applications
                  </span>{" "}
                  received across all jobs
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Job marketplace activity
                </p>
              </div>
            </div>
          )}

          {dashboardData.featuredJobs.length > 0 && (
            <div className="flex">
              <div className="mr-4 flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <span className="text-yellow-600 dark:text-yellow-400 text-lg">
                    ⭐
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-900 dark:text-white">
                  <span className="font-medium">
                    {dashboardData.featuredJobs.length} featured jobs
                  </span>{" "}
                  are currently active
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enhanced visibility jobs
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
