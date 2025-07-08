import React from "react";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: "pending" | "reviewing" | "rejected" | "accepted";
  location: string;
  salary: string;
  type: string;
}

const mockApplications: Application[] = [
  {
    id: "1",
    jobTitle: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    appliedDate: "2025-01-05",
    status: "reviewing",
    location: "Remote",
    salary: "$120k - $150k",
    type: "Full-time",
  },
  {
    id: "2",
    jobTitle: "UI/UX Designer",
    company: "DesignHub",
    appliedDate: "2025-01-03",
    status: "pending",
    location: "New York, NY",
    salary: "$80k - $100k",
    type: "Full-time",
  },
  {
    id: "3",
    jobTitle: "Full Stack Developer",
    company: "StartupXYZ",
    appliedDate: "2025-01-01",
    status: "accepted",
    location: "San Francisco, CA",
    salary: "$130k - $160k",
    type: "Full-time",
  },
  {
    id: "4",
    jobTitle: "React Developer",
    company: "WebSolutions",
    appliedDate: "2024-12-28",
    status: "rejected",
    location: "Austin, TX",
    salary: "$90k - $110k",
    type: "Contract",
  },
  {
    id: "5",
    jobTitle: "Frontend Engineer",
    company: "Innovation Labs",
    appliedDate: "2024-12-25",
    status: "reviewing",
    location: "Remote",
    salary: "$100k - $130k",
    type: "Full-time",
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

export default function ApplicationsPage() {
  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Applications
          </h1>
          <p className="text-gray-600">
            Track and manage all your job applications in one place.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <FunnelIcon className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <option>All Status</option>
              <option>Pending</option>
              <option>Reviewing</option>
              <option>Accepted</option>
              <option>Rejected</option>
            </select>
          </div>
          <div className="text-sm text-gray-500">
            {mockApplications.length} applications total
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Applications
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {mockApplications.map((application) => (
              <div
                key={application.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(application.status)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {application.jobTitle}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {application.company}
                      </p>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span>{application.location}</span>
                        <span>{application.salary}</span>
                        <span>{application.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        application.status
                      )}`}
                    >
                      {application.status.charAt(0).toUpperCase() +
                        application.status.slice(1)}
                    </span>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Applied{" "}
                        {new Date(application.appliedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                        View
                      </button>
                      <button className="px-3 py-1 text-sm bg-[#0fc4b5] text-white rounded-md hover:bg-[#0ba399] transition-colors">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
