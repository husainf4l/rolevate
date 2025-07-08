"use client";

import React from "react";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: "pending" | "reviewing" | "rejected" | "accepted";
  location: string;
}

const mockApplications: Application[] = [
  {
    id: "1",
    jobTitle: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    appliedDate: "2025-01-05",
    status: "reviewing",
    location: "Remote",
  },
  {
    id: "2",
    jobTitle: "UI/UX Designer",
    company: "DesignHub",
    appliedDate: "2025-01-03",
    status: "pending",
    location: "New York, NY",
  },
  {
    id: "3",
    jobTitle: "Full Stack Developer",
    company: "StartupXYZ",
    appliedDate: "2025-01-01",
    status: "accepted",
    location: "San Francisco, CA",
  },
  {
    id: "4",
    jobTitle: "React Developer",
    company: "WebSolutions",
    appliedDate: "2024-12-28",
    status: "rejected",
    location: "Austin, TX",
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <ClockIcon className="w-5 h-5 text-yellow-500" />;
    case "reviewing":
      return <EyeIcon className="w-5 h-5 text-blue-500" />;
    case "accepted":
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    case "rejected":
      return <XCircleIcon className="w-5 h-5 text-red-500" />;
    default:
      return <ClockIcon className="w-5 h-5 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "reviewing":
      return "bg-blue-100 text-blue-800";
    case "accepted":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function RecentApplications() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Recent Applications
        </h2>
        <a
          href="/userdashboard/applications"
          className="text-[#0fc4b5] hover:text-[#0ba399] font-medium text-sm transition-colors"
        >
          View all
        </a>
      </div>

      <div className="space-y-4">
        {mockApplications.map((application) => (
          <div
            key={application.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(application.status)}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {application.jobTitle}
                </h3>
                <p className="text-sm text-gray-600">{application.company}</p>
                <p className="text-xs text-gray-500">{application.location}</p>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                  application.status
                )}`}
              >
                {application.status.charAt(0).toUpperCase() +
                  application.status.slice(1)}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(application.appliedDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
