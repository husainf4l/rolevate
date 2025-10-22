"use client";

import React from "react";
import {
  ClockIcon,
  CheckCircleIcon,
  CalendarIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  XCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

export interface ActivityItem {
  id: string;
  type: "APPLICATION" | "INTERVIEW" | "PROFILE_UPDATE" | "STATUS_CHANGE" | "JOB_VIEW";
  title: string;
  description: string;
  timestamp: string;
  icon?: "clock" | "check" | "calendar" | "document" | "briefcase" | "x";
  link?: string;
}

interface UserActivityFeedProps {
  activities: ActivityItem[];
  loading?: boolean;
}

const getActivityIcon = (icon?: ActivityItem["icon"]) => {
  switch (icon) {
    case "check":
      return CheckCircleIcon;
    case "calendar":
      return CalendarIcon;
    case "document":
      return DocumentTextIcon;
    case "briefcase":
      return BriefcaseIcon;
    case "x":
      return XCircleIcon;
    default:
      return ClockIcon;
  }
};

const getActivityColor = (type: ActivityItem["type"]) => {
  switch (type) {
    case "APPLICATION":
      return "blue";
    case "INTERVIEW":
      return "purple";
    case "PROFILE_UPDATE":
      return "green";
    case "STATUS_CHANGE":
      return "amber";
    case "JOB_VIEW":
      return "gray";
    default:
      return "gray";
  }
};

export default function UserActivityFeed({
  activities,
  loading = false,
}: UserActivityFeedProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-4 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.25 }}
      className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Recent Activity
      </h2>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <ClockIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No recent activity</p>
          <p className="text-sm text-gray-400">
            Your recent actions will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.icon);
            const color = getActivityColor(activity.type);
            const timeAgo = new Date(activity.timestamp).toLocaleDateString();

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className={`flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                  activity.link ? "cursor-pointer group" : ""
                }`}
                onClick={() => {
                  if (activity.link) {
                    window.location.href = activity.link;
                  }
                }}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full bg-${color}-50 flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <Icon className={`w-5 h-5 text-${color}-600`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400">{timeAgo}</p>
                </div>
                {activity.link && (
                  <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
