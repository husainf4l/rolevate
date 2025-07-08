"use client";

import React from "react";
import {
  ClipboardDocumentListIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease" | "neutral";
  icon: React.ElementType;
  color: string;
}

const stats: StatCard[] = [
  {
    title: "Total Applications",
    value: "24",
    change: "+4 this week",
    changeType: "increase",
    icon: ClipboardDocumentListIcon,
    color: "bg-blue-500",
  },
  {
    title: "Profile Views",
    value: "156",
    change: "+12 this week",
    changeType: "increase",
    icon: EyeIcon,
    color: "bg-green-500",
  },
  {
    title: "Interviews",
    value: "3",
    change: "+1 this week",
    changeType: "increase",
    icon: CheckCircleIcon,
    color: "bg-purple-500",
  },
  {
    title: "Pending Responses",
    value: "8",
    change: "No change",
    changeType: "neutral",
    icon: ClockIcon,
    color: "bg-yellow-500",
  },
];

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon
                  className={`w-6 h-6 ${stat.color.replace("bg-", "text-")}`}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <span
              className={`text-sm ${
                stat.changeType === "increase"
                  ? "text-green-600"
                  : stat.changeType === "decrease"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {stat.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
