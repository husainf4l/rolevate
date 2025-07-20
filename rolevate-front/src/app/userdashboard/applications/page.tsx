"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { getCandidateApplications, Application } from "@/services/application";

interface ApplicationDisplay {
  id: string;
  jobId: string; // Add jobId for details lookup
  jobTitle: string;
  company: string;
  appliedDate: string;
  status:
    | "submitted"
    | "reviewing"
    | "rejected"
    | "accepted"
    | "interview"
    | "offered"
    | "withdrawn";
  cvAnalysisScore: number;
  overallFit: string;
  expectedSalary: string;
  coverLetter: string;
}

// Helper function to convert API Application to display format
const convertToDisplayFormat = (
  application: Application
): ApplicationDisplay => {
  // Map API status to display status
  const statusMap: Record<Application["status"], ApplicationDisplay["status"]> =
    {
      SUBMITTED: "submitted",
      REVIEWING: "reviewing",
      INTERVIEW_SCHEDULED: "interview",
      INTERVIEWED: "interview",
      OFFERED: "offered",
      REJECTED: "rejected",
      WITHDRAWN: "withdrawn",
    };

  return {
    id: application.id,
    jobId: application.jobId,
    jobTitle: application.job.title,
    company: application.job.company.name,
    appliedDate: application.appliedAt,
    status: statusMap[application.status] || "submitted",
    cvAnalysisScore: application.cvAnalysisScore,
    overallFit: application.cvAnalysisResults?.overallFit || "Not analyzed",
    expectedSalary: application.expectedSalary || "Not specified",
    coverLetter: application.coverLetter || "No cover letter",
  };
};

const getStatusIcon = (status: ApplicationDisplay["status"]) => {
  switch (status) {
    case "submitted":
      return <ClockIcon className="w-5 h-5 text-yellow-500" />;
    case "reviewing":
      return <EyeIcon className="w-5 h-5 text-blue-500" />;
    case "interview":
      return <EyeIcon className="w-5 h-5 text-purple-500" />;
    case "offered":
      return <CheckCircleIcon className="w-5 h-5 text-emerald-500" />;
    case "accepted":
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    case "rejected":
      return <XCircleIcon className="w-5 h-5 text-red-500" />;
    case "withdrawn":
      return <XCircleIcon className="w-5 h-5 text-gray-500" />;
    default:
      return <ClockIcon className="w-5 h-5 text-gray-500" />;
  }
};

const getStatusColor = (status: ApplicationDisplay["status"]) => {
  switch (status) {
    case "submitted":
      return "bg-yellow-100 text-yellow-800";
    case "reviewing":
      return "bg-blue-100 text-blue-800";
    case "interview":
      return "bg-purple-100 text-purple-800";
    case "offered":
      return "bg-emerald-100 text-emerald-800";
    case "accepted":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "withdrawn":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("All Status");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiApplications = await getCandidateApplications();
        const displayApplications = apiApplications.map(convertToDisplayFormat);
        setApplications(displayApplications);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch applications"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Filter applications based on selected status
  const filteredApplications = applications.filter((app) => {
    if (filterStatus === "All Status") return true;
    return app.status.toLowerCase() === filterStatus.toLowerCase();
  });

  // Handle showing application details
  const handleShowDetails = (jobId: string) => {
    router.push(`/userdashboard/applications/${jobId}`);
  };

  if (loading) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0fc4b5]"></div>
            <span className="ml-3 text-gray-600">Loading applications...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-600 font-medium mb-2">
              Error loading applications
            </div>
            <div className="text-red-500 text-sm">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
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
            <select
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option>All Status</option>
              <option>Submitted</option>
              <option>Reviewing</option>
              <option>Interview</option>
              <option>Offered</option>
              <option>Accepted</option>
              <option>Rejected</option>
              <option>Withdrawn</option>
            </select>
          </div>
          <div className="text-sm text-gray-500">
            {filteredApplications.length} applications total
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📄</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No applications found
            </h3>
            <p className="text-gray-600 mb-4">
              {filterStatus === "All Status"
                ? "You haven't applied to any jobs yet. Start exploring opportunities!"
                : `No applications with status: ${filterStatus}`}
            </p>
            {filterStatus !== "All Status" && (
              <button
                onClick={() => setFilterStatus("All Status")}
                className="px-4 py-2 bg-[#0fc4b5] text-white rounded-md hover:bg-[#0ba399] transition-colors"
              >
                Clear Filter
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                All Applications
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredApplications.map((application) => (
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
                          <span>
                            Application ID: {application.id.slice(-8)}
                          </span>
                          <span>
                            {application.coverLetter !== "No cover letter"
                              ? "Cover letter included"
                              : "No cover letter"}
                          </span>
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
                          {new Date(
                            application.appliedDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleShowDetails(application.jobId)}
                          className="px-3 py-1 text-sm bg-[#0fc4b5] text-white rounded-md hover:bg-[#0ba399] transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
