"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/dashboard/Header";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import {
  Application,
  getCompanyApplications,
  updateApplicationStatus,
  bulkUpdateApplicationStatus,
} from "@/services/application";

// Extended interface for display with additional fields
interface CandidateDisplay extends Application {
  position: string;
  skills: string[];
  location: string;
  source: "linkedin" | "website" | "referral" | "recruiter" | "direct";
  priority: "high" | "medium" | "low";
  cvRating: number;
  interview1Rating: number;
  interview2Rating: number;
  hrRating: number;
  overallRating: number;
  appliedDate: string;
  lastActivity: string;
  experience: string;
  name: string;
  email: string;
}

const getStatusColor = (status: Application["status"]) => {
  switch (status) {
    case "SUBMITTED":
      return "bg-gray-100 text-gray-800";
    case "REVIEWING":
      return "bg-blue-100 text-blue-800";
    case "INTERVIEW_SCHEDULED":
      return "bg-purple-100 text-purple-800";
    case "INTERVIEWED":
      return "bg-indigo-100 text-indigo-800";
    case "OFFERED":
      return "bg-green-100 text-green-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    case "WITHDRAWN":
      return "bg-gray-100 text-gray-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "ANALYZED":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPriorityColor = (priority: "high" | "medium" | "low") => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getSourceIcon = (source: CandidateDisplay["source"]) => {
  switch (source) {
    case "linkedin":
      return "LinkedIn";
    case "website":
      return "Website";
    case "referral":
      return "Referral";
    case "recruiter":
      return "Recruiter";
    default:
      return "Email";
  }
};

// Transform API application data to display format
const transformApplicationToCandidate = (
  application: Application
): CandidateDisplay => {
  return {
    ...application,
    position: application.job.title,
    skills: application.cvAnalysisResults?.skills_matched || [],
    location: "Not specified", // No location in current API response
    source: "direct" as const, // Default source, could be enhanced
    priority: "medium" as const, // Default priority, could be calculated
    cvRating: application.cvAnalysisScore || 0,
    interview1Rating: 0, // These would come from interview data
    interview2Rating: 0,
    hrRating: 0,
    overallRating: application.cvAnalysisScore || 0,
    appliedDate: new Date(application.appliedAt).toLocaleDateString(),
    lastActivity: new Date(application.appliedAt).toLocaleDateString(),
    experience: application.cvAnalysisResults?.experience_summary
      ? application.cvAnalysisResults.experience_summary.split('.')[0] + '.'
      : "Not analyzed",
    name: application.candidate.name || "Unknown Candidate",
    email: application.candidate.email,
  };
};

export default function CandidatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPosition, setFilterPosition] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [candidates, setCandidates] = useState<CandidateDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch applications on component mount
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching company applications...");
        const applications = await getCompanyApplications();
        console.log("Applications fetched successfully:", applications);
        const transformedCandidates = applications.map(
          transformApplicationToCandidate
        );
        setCandidates(transformedCandidates);
      } catch (err) {
        console.error("Error fetching applications:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch applications";
        setError(errorMessage);

        // Check if it's a 401 authentication error
        if (
          errorMessage.includes("Unauthorized") ||
          errorMessage.includes("401")
        ) {
          console.error(
            "Authentication error - user may not be logged in as company"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      filterStatus === "all" || candidate.status === filterStatus;
    const matchesPosition =
      filterPosition === "all" || candidate.position === filterPosition;
    const matchesPriority =
      filterPriority === "all" || candidate.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPosition && matchesPriority;
  });

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleSelectAll = () => {
    setSelectedCandidates(
      selectedCandidates.length === filteredCandidates.length
        ? []
        : filteredCandidates.map((c) => c.id)
    );
  };

  const handleBulkStatusUpdate = async (status: Application["status"]) => {
    try {
      await bulkUpdateApplicationStatus(selectedCandidates, status);
      // Refresh data after update
      const applications = await getCompanyApplications();
      const transformedCandidates = applications.map(
        transformApplicationToCandidate
      );
      setCandidates(transformedCandidates);
      setSelectedCandidates([]);
    } catch (err) {
      console.error("Error updating application statuses:", err);
      // You might want to show a toast notification here
    }
  };

  const handleSingleStatusUpdate = async (
    candidateId: string,
    status: Application["status"]
  ) => {
    try {
      await updateApplicationStatus(candidateId, status);
      // Refresh data after update
      const applications = await getCompanyApplications();
      const transformedCandidates = applications.map(
        transformApplicationToCandidate
      );
      setCandidates(transformedCandidates);
    } catch (err) {
      console.error("Error updating application status:", err);
      // You might want to show a toast notification here
    }
  };

  const handleExport = () => {
    if (filteredCandidates.length === 0) {
      alert('No candidates to export');
      return;
    }

    const headers = ['Name', 'Email', 'Position', 'Status', 'CV Score', 'Interview 1', 'Interview 2', 'HR Interview', 'Overall Score', 'Applied Date', 'Experience', 'Location', 'Priority', 'Source'];
    
    const csvData = filteredCandidates.map(candidate => [
      candidate.name,
      candidate.email,
      candidate.position,
      candidate.status,
      `${candidate.cvRating}%`,
      candidate.interview1Rating > 0 ? `${candidate.interview1Rating}%` : '-',
      candidate.interview2Rating > 0 ? `${candidate.interview2Rating}%` : '-',
      candidate.hrRating > 0 ? `${candidate.hrRating}%` : '-',
      `${candidate.overallRating}%`,
      candidate.appliedDate,
      candidate.experience,
      candidate.location,
      candidate.priority,
      getSourceIcon(candidate.source)
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `candidates-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (filteredCandidates.length === 0) {
      alert('No candidates to print');
      return;
    }

    const printContent = `
      <html>
        <head>
          <title>Candidates Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            h1 { color: #333; }
            .header { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Candidates Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <p>Total Candidates: ${filteredCandidates.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Position</th>
                <th>Status</th>
                <th>CV Score</th>
                <th>Overall Score</th>
                <th>Applied Date</th>
                <th>Experience</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              ${filteredCandidates.map(candidate => `
                <tr>
                  <td>${candidate.name}</td>
                  <td>${candidate.email}</td>
                  <td>${candidate.position}</td>
                  <td>${candidate.status}</td>
                  <td>${candidate.cvRating}%</td>
                  <td>${candidate.overallRating}%</td>
                  <td>${candidate.appliedDate}</td>
                  <td>${candidate.experience}</td>
                  <td>${candidate.priority}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  // Map API statuses to display statuses
  const statusCounts = {
    ai_analysis: candidates.filter((c) => c.status === "SUBMITTED").length,
    ai_interview_1: candidates.filter((c) => c.status === "REVIEWING").length,
    ai_interview_2: candidates.filter((c) => c.status === "INTERVIEW_SCHEDULED")
      .length,
    hr_interview: candidates.filter((c) => c.status === "INTERVIEWED").length,
    offer: candidates.filter((c) => c.status === "OFFERED").length,
    hired: 0, // No HIRED status in new interface
    rejected: candidates.filter((c) => c.status === "REJECTED").length,
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Recruitment Pipeline"
        subtitle="Track and manage candidates through your AI-powered hiring process"
      />

      <div className="pt-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Action Buttons */}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading candidates...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error.includes("Unauthorized") || error.includes("401")
                      ? "Authentication Error"
                      : "Error Loading Candidates"}
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                    {(error.includes("Unauthorized") ||
                      error.includes("401")) && (
                      <p className="mt-1">
                        Please make sure you are logged in as a company. You may
                        need to log out and log back in.
                      </p>
                    )}
                  </div>
                  <div className="mt-4">
                    <div className="-mx-2 -my-1.5 flex">
                      <button
                        onClick={() => window.location.reload()}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Retry
                      </button>
                      {(error.includes("Unauthorized") ||
                        error.includes("401")) && (
                        <button
                          onClick={() => (window.location.href = "/login")}
                          className="ml-3 px-3 py-2 bg-white text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                        >
                          Go to Login
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Stats Dashboard */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-12">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="text-3xl font-semibold text-gray-900 mb-2">
                      {statusCounts.ai_analysis}
                    </div>
                    <div className="text-sm text-gray-500 font-medium">Submitted</div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="text-3xl font-semibold text-gray-900 mb-2">
                      {statusCounts.ai_interview_1}
                    </div>
                    <div className="text-sm text-gray-500 font-medium">Reviewing</div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="text-3xl font-semibold text-gray-900 mb-2">
                      {statusCounts.ai_interview_2}
                    </div>
                    <div className="text-sm text-gray-500 font-medium">Interview Scheduled</div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="text-3xl font-semibold text-primary-600 mb-2">
                      {statusCounts.hr_interview}
                    </div>
                    <div className="text-sm text-gray-500 font-medium">Interviewed</div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="text-3xl font-semibold text-green-600 mb-2">
                      {statusCounts.offer}
                    </div>
                    <div className="text-sm text-gray-500 font-medium">Offer Sent</div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="text-3xl font-semibold text-green-600 mb-2">
                      {statusCounts.hired}
                    </div>
                    <div className="text-sm text-gray-500 font-medium">Hired</div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="text-3xl font-semibold text-red-600 mb-2">
                      {statusCounts.rejected}
                    </div>
                    <div className="text-sm text-gray-500 font-medium">Rejected</div>
                  </div>
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-10">
                <div className="px-8 py-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Filter & Search
                  </h3>
                </div>
                <div className="px-8 py-8">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <div className="lg:col-span-5">
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search candidates by name, email, position..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm transition-all"
                        />
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm transition-all"
                      >
                        <option value="all">All Status</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="REVIEWING">Reviewing</option>
                        <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                        <option value="INTERVIEWED">Interviewed</option>
                        <option value="OFFERED">Offered</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="WITHDRAWN">Withdrawn</option>
                      </select>
                    </div>

                    <div className="lg:col-span-2">
                      <select
                        value={filterPosition}
                        onChange={(e) => setFilterPosition(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm transition-all"
                      >
                        <option value="all">All Positions</option>
                        <option value="Senior Frontend Developer">
                          Senior Frontend Developer
                        </option>
                        <option value="React Developer">React Developer</option>
                        <option value="UI/UX Designer">UI/UX Designer</option>
                        <option value="Full Stack Developer">
                          Full Stack Developer
                        </option>
                        <option value="DevOps Engineer">DevOps Engineer</option>
                        <option value="Mobile App Developer">
                          Mobile App Developer
                        </option>
                        <option value="Data Scientist">Data Scientist</option>
                        <option value="Product Manager">Product Manager</option>
                      </select>
                    </div>

                    <div className="lg:col-span-2">
                      <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm transition-all"
                      >
                        <option value="all">All Priority</option>
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                      </select>
                    </div>

                    <div className="lg:col-span-1">
                      <button className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium text-sm">
                        <FunnelIcon className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>

                  {/* Bulk Actions */}
                  {selectedCandidates.length > 0 && (
                    <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">
                              {selectedCandidates.length}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-blue-900">
                            {selectedCandidates.length} candidate
                            {selectedCandidates.length !== 1 ? "s" : ""}{" "}
                            selected
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleBulkStatusUpdate("REVIEWING")}
                            className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                          >
                            Review
                          </button>
                          <button
                            onClick={() =>
                              handleBulkStatusUpdate("INTERVIEW_SCHEDULED")
                            }
                            className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                          >
                            Shortlist
                          </button>
                          <button
                            onClick={() => handleBulkStatusUpdate("OFFERED")}
                            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                          >
                            Offer
                          </button>
                          <button
                            onClick={() => handleBulkStatusUpdate("REJECTED")}
                            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Data Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Candidates ({filteredCandidates.length})
                      </h2>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={
                            selectedCandidates.length ===
                              filteredCandidates.length &&
                            filteredCandidates.length > 0
                          }
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                        />
                        <span className="text-sm text-gray-600 font-medium">
                          Select All
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleExport}
                        className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Export
                      </button>
                      <button 
                        onClick={handlePrint}
                        className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Print
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1200px]">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="w-12 px-8 py-4 text-left">
                          <input
                            type="checkbox"
                            checked={
                              selectedCandidates.length ===
                                filteredCandidates.length &&
                              filteredCandidates.length > 0
                            }
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                          />
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Candidate
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-8 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          CV Score
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Skills
                        </th>
                        <th className="px-8 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Applied
                        </th>
                        <th className="px-8 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredCandidates.map((candidate) => (
                        <tr
                          key={candidate.id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          {/* Checkbox */}
                          <td className="px-8 py-5 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedCandidates.includes(
                                candidate.id
                              )}
                              onChange={() =>
                                handleSelectCandidate(candidate.id)
                              }
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                            />
                          </td>

                          {/* Candidate Info */}
                          <td className="px-8 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {candidate.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {candidate.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {candidate.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Position */}
                          <td className="px-8 py-5 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {candidate.position}
                            </div>
                          </td>

                          {/* Company */}
                          <td className="px-8 py-5 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {candidate.job?.company?.name || "N/A"}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-8 py-5 whitespace-nowrap">
                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(
                                candidate.status
                              )}`}
                            >
                              {candidate.status === "SUBMITTED"
                                ? "Submitted"
                                : candidate.status === "INTERVIEW_SCHEDULED"
                                ? "Scheduled"
                                : candidate.status === "INTERVIEWED"
                                ? "Interviewed"
                                : candidate.status === "PENDING"
                                ? "Pending"
                                : candidate.status === "ANALYZED"
                                ? "Analyzed"
                                : candidate.status.replace("_", " ")}
                            </span>
                          </td>

                          {/* CV Score */}
                          <td className="px-8 py-5 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-3">
                              <span className="text-sm font-semibold text-gray-900">
                                {candidate.cvRating || 0}%
                              </span>
                              {candidate.cvRating > 0 && (
                                <div className="w-14 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      candidate.cvRating >= 80
                                        ? "bg-green-500"
                                        : candidate.cvRating >= 60
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                    }`}
                                    style={{
                                      width: `${Math.min(candidate.cvRating, 100)}%`,
                                    }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Skills */}
                          <td className="px-8 py-5">
                            <div className="flex flex-wrap gap-1.5">
                              {candidate.skills.length > 0 ? (
                                candidate.skills.slice(0, 2).map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full border border-green-200"
                                  >
                                    {skill.length > 18
                                      ? skill.substring(0, 18) + "..."
                                      : skill}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-500">
                                  No skills
                                </span>
                              )}
                              {candidate.skills.length > 2 && (
                                <span className="text-xs font-semibold text-gray-600 px-2.5 py-1">
                                  +{candidate.skills.length - 2}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Applied Date */}
                          <td className="px-8 py-5 whitespace-nowrap text-center">
                            <div className="text-sm text-gray-600">
                              {candidate.appliedDate}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-8 py-5 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-3">
                              <Link
                                href={`/dashboard/candidates/${candidate.id}`}
                                className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
                              >
                                View
                              </Link>
                              <button
                                onClick={() =>
                                  handleSingleStatusUpdate(
                                    candidate.id,
                                    "INTERVIEW_SCHEDULED"
                                  )
                                }
                                className="text-green-600 hover:text-green-700 font-semibold text-sm"
                              >
                                Shortlist
                              </button>
                              <button
                                onClick={() =>
                                  handleSingleStatusUpdate(
                                    candidate.id,
                                    "REJECTED"
                                  )
                                }
                                className="text-red-600 hover:text-red-700 font-semibold text-sm"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

                            selectedCandidates.length ===
                              filteredCandidates.length &&
                            filteredCandidates.length > 0
                          }
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                        />
                        <span className="text-sm text-gray-600">
                          Select All
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleExport}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Export
                      </button>
                      <button 
                        onClick={handlePrint}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Print
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1200px]">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="w-12 px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={
                              selectedCandidates.length ===
                                filteredCandidates.length &&
                              filteredCandidates.length > 0
                            }
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Candidate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          CV Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Skills Matched
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applied
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCandidates.map((candidate) => (
                        <tr
                          key={candidate.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {/* Checkbox */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedCandidates.includes(
                                candidate.id
                              )}
                              onChange={() =>
                                handleSelectCandidate(candidate.id)
                              }
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                            />
                          </td>

                          {/* Candidate Info */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                {candidate.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .substring(0, 2)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {candidate.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {candidate.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Position */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {candidate.position}
                            </div>
                          </td>

                          {/* Company */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {candidate.job?.company?.name || "N/A"}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                candidate.status
                              )}`}
                            >
                              {candidate.status === "SUBMITTED"
                                ? "Submitted"
                                : candidate.status === "INTERVIEW_SCHEDULED"
                                ? "Interview Scheduled"
                                : candidate.status === "INTERVIEWED"
                                ? "Interviewed"
                                : candidate.status === "PENDING"
                                ? "Pending"
                                : candidate.status === "ANALYZED"
                                ? "Analyzed"
                                : candidate.status.replace("_", " ")}
                            </span>
                          </td>

                          {/* CV Score */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">
                                {candidate.cvRating || 0}%
                              </span>
                              {candidate.cvRating > 0 && (
                                <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      candidate.cvRating >= 80
                                        ? "bg-green-500"
                                        : candidate.cvRating >= 60
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                    }`}
                                    style={{
                                      width: `${Math.min(candidate.cvRating, 100)}%`,
                                    }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Skills Matched */}
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {candidate.skills.length > 0 ? (
                                candidate.skills.slice(0, 2).map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full"
                                  >
                                    {skill.length > 20
                                      ? skill.substring(0, 20) + "..."
                                      : skill}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-500">
                                  No skills analyzed
                                </span>
                              )}
                              {candidate.skills.length > 2 && (
                                <span className="text-xs text-gray-600 font-medium">
                                  +{candidate.skills.length - 2}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Applied Date */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="text-sm text-gray-900">
                              {candidate.appliedDate}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Link
                                href={`/dashboard/candidates/${candidate.id}`}
                                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                              >
                                View
                              </Link>
                              <button
                                onClick={() =>
                                  handleSingleStatusUpdate(
                                    candidate.id,
                                    "INTERVIEW_SCHEDULED"
                                  )
                                }
                                className="text-green-600 hover:text-green-700 font-medium text-sm"
                              >
                                Shortlist
                              </button>
                              <button
                                onClick={() =>
                                  handleSingleStatusUpdate(
                                    candidate.id,
                                    "REJECTED"
                                  )
                                }
                                className="text-red-600 hover:text-red-700 font-medium text-sm"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

