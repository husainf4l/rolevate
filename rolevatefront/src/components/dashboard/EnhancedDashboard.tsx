"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PlusIcon,
  BriefcaseIcon,
  UserGroupIcon,
  DocumentTextIcon,
  BellIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { getDashboardData, DashboardData } from "@/services/dashboard.service";
import { JobCard } from "@/components/jobs/JobCard";

// Statistics Card Component
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  changePercentage?: number;
  changeText?: string;
  color?: "blue" | "green" | "yellow" | "red" | "purple" | "gray";
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  changePercentage,
  changeText,
  color = "blue",
  onClick,
}) => {
  const colorMap = {
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    green:
      "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    yellow:
      "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    red: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    purple:
      "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
    gray: "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800",
  };

  const iconColorMap = {
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
    yellow: "text-yellow-600 dark:text-yellow-400",
    red: "text-red-600 dark:text-red-400",
    purple: "text-purple-600 dark:text-purple-400",
    gray: "text-gray-600 dark:text-gray-400",
  };

  return (
    <div
      className={`p-6 rounded-xl border ${colorMap[color]} ${
        onClick ? "cursor-pointer hover:shadow-lg transition-shadow" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
          {(trend || changeText) && (
            <div className="flex items-center mt-2">
              {trend && changePercentage !== undefined && (
                <>
                  {trend === "up" ? (
                    <ArrowUpIcon className="h-4 w-4 text-green-500" />
                  ) : trend === "down" ? (
                    <ArrowDownIcon className="h-4 w-4 text-red-500" />
                  ) : null}
                  <span
                    className={`text-sm ml-1 ${
                      trend === "up"
                        ? "text-green-600"
                        : trend === "down"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {changePercentage}%
                  </span>
                </>
              )}
              {changeText && (
                <span className="text-xs text-gray-500 ml-2">{changeText}</span>
              )}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconColorMap[color]}`}>{icon}</div>
      </div>
    </div>
  );
};

// Activity Item Component
interface ActivityItemProps {
  activity: {
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    metadata?: any;
  };
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "job_created":
        return <BriefcaseIcon className="h-5 w-5 text-blue-500" />;
      case "application_received":
        return <DocumentTextIcon className="h-5 w-5 text-green-500" />;
      case "interview_scheduled":
        return <UserGroupIcon className="h-5 w-5 text-purple-500" />;
      case "candidate_hired":
        return <StarIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {activity.title}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {activity.description}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {formatTimeAgo(activity.timestamp)}
        </p>
      </div>
    </div>
  );
};

// Main Enhanced Dashboard Component
const EnhancedDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Move fetchDashboardData outside useEffect
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = async () => {
    await fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || "Something went wrong while loading the dashboard."}
          </p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { stats, company, recentActivities, recentJobs, notifications } =
    dashboardData;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back to {company.displayName || company.name}
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={handleRefresh}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors"
          >
            Refresh
          </button>
          <Link
            href="/dashboard/jobpost/ai-create"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span>AI Create</span>
          </Link>
          <Link
            href="/dashboard/jobpost/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>New Job Post</span>
          </Link>
        </div>
      </div>

      {/* Subscription Alert */}
      {!company.subscription.isActive && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Subscription Required
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Upgrade your subscription to create job posts and access
                advanced features.
              </p>
            </div>
            <Link
              href="/dashboard/profile?tab=subscription"
              className="ml-auto bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Jobs"
          value={stats.jobs.totalJobs}
          icon={<BriefcaseIcon className="h-6 w-6" />}
          trend="up"
          changePercentage={12}
          changeText="vs last month"
          color="blue"
          onClick={() => (window.location.href = "/dashboard/jobpost")}
        />
        <StatCard
          title="Active Applications"
          value={stats.applications.total}
          icon={<DocumentTextIcon className="h-6 w-6" />}
          trend="up"
          changePercentage={8}
          changeText="vs last month"
          color="green"
          onClick={() => (window.location.href = "/dashboard/applications")}
        />
        <StatCard
          title="Total Candidates"
          value={stats.candidates.total}
          icon={<UserGroupIcon className="h-6 w-6" />}
          trend="up"
          changePercentage={15}
          changeText="vs last month"
          color="purple"
          onClick={() => (window.location.href = "/dashboard/candidates")}
        />
        <StatCard
          title="Unread Notifications"
          value={stats.notifications.unreadCount}
          icon={<BellIcon className="h-6 w-6" />}
          color={stats.notifications.unreadCount > 0 ? "red" : "gray"}
          onClick={() => (window.location.href = "/dashboard/notifications")}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Job Distribution
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                By Experience Level
              </h4>
              <div className="space-y-2">
                {stats.jobs.distribution.byExperience.map((item) => (
                  <div
                    key={item.level}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.level}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${
                              (item.count / stats.jobs.totalJobs) * 100
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
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                By Work Type
              </h4>
              <div className="space-y-2">
                {stats.jobs.distribution.byWorkType.map((item) => (
                  <div
                    key={item.type}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.type}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${
                              (item.count / stats.jobs.totalJobs) * 100
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

        {/* Application Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Application Status
          </h3>
          <div className="space-y-4">
            {Object.entries(stats.applications.byStatus).map(
              ([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {status.toLowerCase().replace("_", " ")}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{
                          width: `${(count / stats.applications.total) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                      {count}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Jobs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Jobs
            </h3>
            <Link
              href="/dashboard/jobpost"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentJobs.slice(0, 3).map((job) => (
              <div
                key={job.id}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  {job.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {job.applicationCount} applications • {job.viewCount} views
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      job.isActive
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                        : "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {job.isActive ? "Active" : "Inactive"}
                  </span>
                  {job.isFeatured && (
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                      Featured
                    </span>
                  )}
                </div>
              </div>
            ))}
            {recentJobs.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No jobs posted yet
              </p>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-2">
            {recentActivities.slice(0, 5).map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
            {recentActivities.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </div>

        {/* Company Info & Notifications */}
        <div className="space-y-6">
          {/* Company Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Company Overview
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Plan:
                </span>
                <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                  {company.subscription.plan}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Team:
                </span>
                <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                  {company.team.totalUsers} members
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Industry:
                </span>
                <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                  {company.industry || "Not specified"}
                </span>
              </div>
              <div className="pt-2">
                <Link
                  href="/dashboard/profile"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Manage Company →
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              <Link
                href="/dashboard/notifications"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {notifications.slice(0, 3).map((notification) => (
                <div
                  key={notification.id}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {notification.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {notification.message}
                  </p>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  )}
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No notifications
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
