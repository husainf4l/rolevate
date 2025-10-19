"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
      PENDING: "submitted",
      ANALYZED: "reviewing",
      REVIEWED: "reviewing",
      SHORTLISTED: "interview",
      INTERVIEWED: "interview",
      OFFERED: "offered",
      HIRED: "accepted",
      REJECTED: "rejected",
      WITHDRAWN: "withdrawn",
    };

  return {
    id: application.id,
    jobId: application.jobId || '',
    jobTitle: application.job.title,
    company: application.job.company?.name || 'Unknown Company',
    appliedDate: application.appliedAt,
    status: statusMap[application.status] || "submitted",
    cvAnalysisScore: application.cvAnalysisScore || 0,
    overallFit: application.cvAnalysisResults?.recommendation || "Not analyzed",
    expectedSalary: application.expectedSalary || "Not specified",
    coverLetter: application.coverLetter || "No cover letter",
  };
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
      <div className="min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-red-50 border border-red-200 rounded-sm p-4">
            <div className="text-red-600 font-medium mb-2">
              Error loading applications
            </div>
            <div className="text-red-500 text-sm">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-sm hover:bg-red-700 transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-4">
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
              My{" "}
              <span className="text-primary-600">
                Applications
              </span>
            </h1>
            <p className="font-text text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Track and manage all your job applications in one place.
            </p>
          </div>
        </div>
      </div>

      {/* Applications Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-8">

        {/* Filters */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex gap-1.5 sm:gap-2 flex-wrap justify-center">
            <button
              onClick={() => setFilterStatus("All Status")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-sm transition-all duration-200 ${
                filterStatus === "All Status"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("submitted")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-sm transition-all duration-200 ${
                filterStatus === "submitted"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Submitted
            </button>
            <button
              onClick={() => setFilterStatus("interview")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-sm transition-all duration-200 ${
                filterStatus === "interview"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Interview
            </button>
            <button
              onClick={() => setFilterStatus("offered")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-sm transition-all duration-200 ${
                filterStatus === "offered"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Offered
            </button>
            <button
              onClick={() => setFilterStatus("accepted")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-sm transition-all duration-200 ${
                filterStatus === "accepted"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Accepted
            </button>
            <button
              onClick={() => setFilterStatus("rejected")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-sm transition-all duration-200 ${
                filterStatus === "rejected"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Rejected
            </button>
            <button
              onClick={() => setFilterStatus("withdrawn")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-sm transition-all duration-200 ${
                filterStatus === "withdrawn"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Withdrawn
            </button>
          </div>
        </div>

        {/* Applications List */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-lg font-semibold text-gray-900">
            {filteredApplications.length} {filteredApplications.length === 1 ? "Application" : "Applications"} Found
          </div>
        </div>
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
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
                className="px-4 py-2 bg-primary-600 text-white rounded-sm hover:bg-primary-700 transition-colors"
              >
                Clear Filter
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div
                key={application.id}
                className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 bg-white hover:bg-slate-50/50 rounded-sm p-4 sm:p-4 shadow-sm"
              >
                {/* Mobile Layout */}
                <div className="block sm:hidden">
                  {/* Top row - Job title and company */}
                  <div className="mb-3">
                    <h3 className="font-semibold text-slate-900 leading-tight text-base group-hover:text-teal-700 transition-colors mb-1">
                      {application.jobTitle}
                    </h3>
                    <p className="text-xs font-medium text-slate-700 mb-2">{application.company}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-600 mb-2">
                      <span>Applied {new Date(application.appliedDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Bottom row - Status, Details button */}
                  <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-sm ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {application.status.charAt(0).toUpperCase() +
                          application.status.slice(1)}
                      </span>
                      <Button
                        onClick={() => handleShowDetails(application.jobId)}
                        className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-3 py-1.5 text-xs shadow-sm"
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex sm:items-center sm:justify-between gap-4">
                  {/* Left side - Application info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 leading-tight text-base group-hover:text-teal-700 transition-colors">
                      {application.jobTitle}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <p className="text-sm font-medium text-slate-700">{application.company}</p>
                      <span className="text-sm text-slate-600">
                        Applied {new Date(application.appliedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Right side - Status and Details button */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-sm ${getStatusColor(
                        application.status
                      )}`}
                    >
                      {application.status.charAt(0).toUpperCase() +
                        application.status.slice(1)}
                    </span>
                    <Button
                      onClick={() => handleShowDetails(application.jobId)}
                      className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 text-sm"
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

