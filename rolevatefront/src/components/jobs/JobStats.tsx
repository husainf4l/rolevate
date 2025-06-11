"use client";

import React, { useEffect, useState } from "react";
import { getJobStats, JobStats as JobStatsType } from "@/services/jobs.service";
import {
  BriefcaseIcon,
  UserGroupIcon,
  EyeIcon,
  StarIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

interface JobStatsProps {
  showHeader?: boolean;
  className?: string;
}

export const JobStats: React.FC<JobStatsProps> = ({
  showHeader = true,
  className = "",
}) => {
  const [stats, setStats] = useState<JobStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const jobStats = await getJobStats();
        setStats(jobStats);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load job statistics"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJobStats();
  }, []);

  if (loading) {
    return (
      <div className={`py-12 ${className}`}>
        <div className="container mx-auto px-4">
          {showHeader && (
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Platform Statistics
              </h2>
              <p className="text-gray-400 text-lg">
                Real-time insights into our job marketplace
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 animate-pulse"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 bg-gray-700 rounded"></div>
                  <div className="w-16 h-6 bg-gray-700 rounded"></div>
                </div>
                <div className="w-24 h-8 bg-gray-700 rounded mb-2"></div>
                <div className="w-32 h-4 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={`py-12 ${className}`}>
        <div className="container mx-auto px-4">
          {showHeader && (
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Platform Statistics
              </h2>
            </div>
          )}
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">
              {error || "Unable to load statistics"}
            </p>
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

  return (
    <div className={`py-12 ${className}`}>
      <div className="container mx-auto px-4">
        {showHeader && (
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Platform Statistics
            </h2>
            <p className="text-gray-400 text-lg">
              Real-time insights into our job marketplace
            </p>
          </div>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <BriefcaseIcon className="h-8 w-8 text-[#00C6AD]" />
              <ChartBarIcon className="h-5 w-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {stats.totalJobs.toLocaleString()}
            </div>
            <div className="text-gray-400 text-sm">Total Jobs</div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <EyeIcon className="h-8 w-8 text-blue-400" />
              <ChartBarIcon className="h-5 w-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {stats.activeJobs.toLocaleString()}
            </div>
            <div className="text-gray-400 text-sm">Active Jobs</div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <StarIcon className="h-8 w-8 text-yellow-400" />
              <ChartBarIcon className="h-5 w-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {stats.featuredJobs.toLocaleString()}
            </div>
            <div className="text-gray-400 text-sm">Featured Jobs</div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <UserGroupIcon className="h-8 w-8 text-green-400" />
              <ChartBarIcon className="h-5 w-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {stats.totalApplications.toLocaleString()}
            </div>
            <div className="text-gray-400 text-sm">Total Applications</div>
          </div>
        </div>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Experience Level Distribution */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Jobs by Experience Level
            </h3>
            <div className="space-y-3">
              {stats.distribution.byExperience.map((item) => {
                const percentage =
                  stats.totalJobs > 0
                    ? (item.count / stats.totalJobs) * 100
                    : 0;
                return (
                  <div
                    key={item.level}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-gray-300 text-sm w-20">
                        {item.level.replace("_", " ")}
                      </span>
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-[#00C6AD] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-white font-medium text-sm ml-3">
                      {item.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Work Type Distribution */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Jobs by Work Type
            </h3>
            <div className="space-y-3">
              {stats.distribution.byWorkType.map((item) => {
                const percentage =
                  stats.totalJobs > 0
                    ? (item.count / stats.totalJobs) * 100
                    : 0;
                return (
                  <div
                    key={item.type}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-gray-300 text-sm w-20">
                        {item.type}
                      </span>
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-white font-medium text-sm ml-3">
                      {item.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Recent Activity
            </h3>
            <span className="text-sm text-gray-400">Last 30 days</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-xl font-bold text-[#00C6AD] mb-1">
                {stats.recentJobs.toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm">New Jobs Posted</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400 mb-1">
                {Math.round((stats.totalApplications / stats.totalJobs) * 100) /
                  100}
              </div>
              <div className="text-gray-400 text-sm">
                Avg Applications per Job
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-400 mb-1">
                {Math.round((stats.activeJobs / stats.totalJobs) * 100)}%
              </div>
              <div className="text-gray-400 text-sm">Jobs Currently Active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
