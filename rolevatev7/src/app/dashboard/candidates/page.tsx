"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/dashboard/Header";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UsersIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  Application,
  getCompanyApplications,
  updateApplicationStatus,
  bulkUpdateApplicationStatus,
} from "@/services/application";
import toast from "react-hot-toast";

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

const getStatusLabel = (status: Application["status"]) => {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "ANALYZED":
      return "Analyzed";
    case "REVIEWED":
      return "Reviewed";
    case "SHORTLISTED":
      return "Shortlisted";
    case "INTERVIEWED":
      return "Interviewed";
    case "OFFERED":
      return "Offered";
    case "HIRED":
      return "Hired";
    case "REJECTED":
      return "Rejected";
    case "WITHDRAWN":
      return "Withdrawn";
    default:
      return String(status).replace(/_/g, " ");
  }
};

const getStatusColor = (status: Application["status"]) => {
  switch (status) {
    case "PENDING":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "ANALYZED":
      return "bg-blue-50 text-blue-700 border border-blue-200";
    case "REVIEWED":
      return "bg-sky-50 text-sky-700 border border-sky-200";
    case "SHORTLISTED":
      return "bg-violet-50 text-violet-700 border border-violet-200";
    case "INTERVIEWED":
      return "bg-primary-50 text-primary-700 border border-primary-200";
    case "OFFERED":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "HIRED":
      return "bg-green-50 text-green-700 border border-green-200";
    case "REJECTED":
      return "bg-rose-50 text-rose-700 border border-rose-200";
    case "WITHDRAWN":
      return "bg-slate-50 text-slate-700 border border-slate-200";
    default:
      return "bg-slate-50 text-slate-700 border border-slate-200";
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

const transformApplicationToCandidate = (
  application: Application
): CandidateDisplay => {
  return {
    ...application,
    position: application.job.title,
    skills: application.cvAnalysisResults?.skills_matched || [],
    location: "Not specified",
    source: "direct" as const,
    priority: "medium" as const,
    cvRating: application.cvAnalysisScore || 0,
    interview1Rating: 0,
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

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        const applications = await getCompanyApplications();
        const transformedCandidates = applications.map(
          transformApplicationToCandidate
        );
        setCandidates(transformedCandidates);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch applications";
        setError(errorMessage);
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
      const applications = await getCompanyApplications();
      const transformedCandidates = applications.map(
        transformApplicationToCandidate
      );
      setCandidates(transformedCandidates);
      setSelectedCandidates([]);
      toast.success(`Successfully updated ${selectedCandidates.length} candidate(s) to ${getStatusLabel(status)}`);
    } catch (err) {
      console.error("Error updating application statuses:", err);
      toast.error("Failed to update candidates. Please try again.");
    }
  };

  const handleSingleStatusUpdate = async (
    candidateId: string,
    status: Application["status"]
  ) => {
    try {
      await updateApplicationStatus(candidateId, status);
      const applications = await getCompanyApplications();
      const transformedCandidates = applications.map(
        transformApplicationToCandidate
      );
      setCandidates(transformedCandidates);
      toast.success(`Candidate status updated to ${getStatusLabel(status)}`);
    } catch (err) {
      console.error("Error updating application status:", err);
      toast.error("Failed to update candidate status. Please try again.");
    }
  };

  const handleExport = () => {
    if (filteredCandidates.length === 0) {
      alert('No candidates to export');
      return;
    }

    const headers = ['Name', 'Email', 'Position', 'Status', 'CV Score', 'Applied Date'];
    const csvData = filteredCandidates.map(candidate => [
      candidate.name,
      candidate.email,
      candidate.position,
      candidate.status,
      `${candidate.cvRating}%`,
      candidate.appliedDate,
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
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
            th { background-color: #f9fafb; font-weight: 600; }
            h1 { color: #111827; }
          </style>
        </head>
        <body>
          <h1>Candidates Report</h1>
          <p>Generated: ${new Date().toLocaleDateString()}</p>
          <p>Total: ${filteredCandidates.length} candidates</p>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Position</th>
                <th>Status</th>
                <th>CV Score</th>
                <th>Applied</th>
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
                  <td>${candidate.appliedDate}</td>
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

  const statusCounts = {
    pending: candidates.filter((c) => c.status === "PENDING").length,
    analyzed: candidates.filter((c) => c.status === "ANALYZED").length,
    reviewed: candidates.filter((c) => c.status === "REVIEWED").length,
    shortlisted: candidates.filter((c) => c.status === "SHORTLISTED").length,
    interviewed: candidates.filter((c) => c.status === "INTERVIEWED").length,
    offered: candidates.filter((c) => c.status === "OFFERED").length,
    hired: candidates.filter((c) => c.status === "HIRED").length,
    rejected: candidates.filter((c) => c.status === "REJECTED").length,
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Candidates"
        subtitle="Manage and track all your job applicants"
      />

      <div className="pt-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">Loading candidates...</div>
                    <div className="text-sm text-gray-600">Please wait while we fetch your applications</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-8 text-center max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 bg-rose-50 rounded-full flex items-center justify-center">
                <XCircleIcon className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load candidates</h3>
              <p className="text-gray-600 text-sm mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-primary-600 text-white rounded-sm hover:bg-primary-700 transition-all duration-200 shadow-sm hover:shadow font-semibold inline-flex items-center gap-2"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Try Again
              </button>
            </div>
          )}

          {/* Main Content */}
          {!loading && !error && (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4 mb-8">
                <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-200 hover:shadow transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-600">Total</p>
                    <UsersIcon className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-xl font-bold text-gray-900">{candidates.length}</p>
                </div>

                <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-200 hover:shadow transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-600">Pending</p>
                    <DocumentTextIcon className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-xl font-bold text-amber-700">{statusCounts.pending}</p>
                </div>

                <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-200 hover:shadow transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-600">Analyzed</p>
                    <CheckCircleIcon className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-xl font-bold text-blue-700">{statusCounts.analyzed}</p>
                </div>

                <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-200 hover:shadow transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-600">Reviewed</p>
                    <ClockIcon className="w-4 h-4 text-sky-500" />
                  </div>
                  <p className="text-xl font-bold text-sky-700">{statusCounts.reviewed}</p>
                </div>

                <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-200 hover:shadow transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-600">Shortlisted</p>
                    <ClockIcon className="w-4 h-4 text-violet-500" />
                  </div>
                  <p className="text-xl font-bold text-violet-700">{statusCounts.shortlisted}</p>
                </div>

                <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-200 hover:shadow transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-600">Interviewed</p>
                    <CheckCircleIcon className="w-4 h-4 text-primary-500" />
                  </div>
                  <p className="text-xl font-bold text-primary-700">{statusCounts.interviewed}</p>
                </div>

                <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-200 hover:shadow transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-600">Offered</p>
                    <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-xl font-bold text-emerald-700">{statusCounts.offered}</p>
                </div>

                <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-200 hover:shadow transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-600">Hired</p>
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-xl font-bold text-green-700">{statusCounts.hired}</p>
                </div>

                <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-200 hover:shadow transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-600">Rejected</p>
                    <XCircleIcon className="w-4 h-4 text-rose-500" />
                  </div>
                  <p className="text-xl font-bold text-rose-700">{statusCounts.rejected}</p>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                  <div className="flex-1 min-w-0">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name, email, position, or skills..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-all duration-200 bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 rounded-sm focus:ring-2 focus:ring-primary-600 focus:border-primary-600 bg-white text-sm font-medium"
                    >
                      <option value="all">All Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="ANALYZED">Analyzed</option>
                      <option value="REVIEWED">Reviewed</option>
                      <option value="SHORTLISTED">Shortlisted</option>
                      <option value="INTERVIEWED">Interviewed</option>
                      <option value="OFFERED">Offered</option>
                      <option value="HIRED">Hired</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="WITHDRAWN">Withdrawn</option>
                    </select>

                    <select
                      value={filterPosition}
                      onChange={(e) => setFilterPosition(e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 rounded-sm focus:ring-2 focus:ring-primary-600 focus:border-primary-600 bg-white text-sm font-medium"
                    >
                      <option value="all">All Positions</option>
                      {Array.from(new Set(candidates.map(c => c.position))).map(position => (
                        <option key={position} value={position}>{position}</option>
                      ))}
                    </select>

                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 rounded-sm focus:ring-2 focus:ring-primary-600 focus:border-primary-600 bg-white text-sm font-medium"
                    >
                      <option value="all">All Priority</option>
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>
                </div>

                {/* Bulk Actions Bar */}
                {selectedCandidates.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-sm border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-900">
                        {selectedCandidates.length} candidate{selectedCandidates.length !== 1 ? "s" : ""} selected
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleBulkStatusUpdate("ANALYZED")}
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors font-medium"
                        >
                          Analyze
                        </button>
                        <button
                          onClick={() => handleBulkStatusUpdate("REVIEWED")}
                          className="px-4 py-2 text-sm bg-sky-600 text-white rounded-sm hover:bg-sky-700 transition-colors font-medium"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => handleBulkStatusUpdate("SHORTLISTED")}
                          className="px-4 py-2 text-sm bg-violet-600 text-white rounded-sm hover:bg-violet-700 transition-colors font-medium"
                        >
                          Shortlist
                        </button>
                        <button
                          onClick={() => handleBulkStatusUpdate("OFFERED")}
                          className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-sm hover:bg-emerald-700 transition-colors font-medium"
                        >
                          Offer
                        </button>
                        <button
                          onClick={() => handleBulkStatusUpdate("REJECTED")}
                          className="px-4 py-2 text-sm bg-rose-600 text-white rounded-sm hover:bg-rose-700 transition-colors font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Candidates Table */}
              <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Candidates ({filteredCandidates.length})
                      </h2>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedCandidates.length === filteredCandidates.length && filteredCandidates.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                        />
                        <span className="text-sm text-gray-600">Select All</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleExport}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors"
                      >
                        Export
                      </button>
                      <button 
                        onClick={handlePrint}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors"
                      >
                        Print
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="w-12 px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedCandidates.length === filteredCandidates.length && filteredCandidates.length > 0}
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
                          Status
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          CV Score
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
                      {filteredCandidates.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center">
                            <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-2">No candidates found</p>
                            <p className="text-sm text-gray-400">
                              {searchTerm ? "Try adjusting your search terms" : "Start receiving applications to see candidates here"}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredCandidates.map((candidate) => (
                          <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedCandidates.includes(candidate.id)}
                                onChange={() => handleSelectCandidate(candidate.id)}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                              />
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                  {candidate.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                                  <div className="text-sm text-gray-500">{candidate.email}</div>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{candidate.position}</div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                                {getStatusLabel(candidate.status)}
                              </span>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-sm font-semibold text-gray-900">{candidate.cvRating || 0}%</span>
                                {candidate.cvRating > 0 && (
                                <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      candidate.cvRating >= 80 ? "bg-emerald-500" :
                                      candidate.cvRating >= 60 ? "bg-amber-500" : "bg-rose-500"
                                    }`}
                                    style={{ width: `${Math.min(candidate.cvRating, 100)}%` }}
                                  ></div>
                                </div>
                                )}
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="text-sm text-gray-500">{candidate.appliedDate}</div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Link
                                  href={`/dashboard/candidates/${candidate.id}`}
                                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                                >
                                  View
                                </Link>
                                {candidate.status === "PENDING" && (
                                  <button
                                    onClick={() => handleSingleStatusUpdate(candidate.id, "ANALYZED")}
                                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                  >
                                    Analyze
                                  </button>
                                )}
                                {(candidate.status === "ANALYZED" || candidate.status === "REVIEWED") && (
                                  <button
                                    onClick={() => handleSingleStatusUpdate(candidate.id, "SHORTLISTED")}
                                    className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                                  >
                                    Shortlist
                                  </button>
                                )}
                                <button
                                  onClick={() => handleSingleStatusUpdate(candidate.id, "REJECTED")}
                                  className="text-rose-600 hover:text-rose-700 font-medium text-sm"
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
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
