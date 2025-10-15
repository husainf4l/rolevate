"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
  ArrowLeftIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import {
  Application,
  getApplicationsByJob,
  updateApplicationStatus,
  bulkUpdateApplicationStatus,
} from "@/services/application";
import { JobService, JobPost } from "@/services/job";

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
    skills: application.cvAnalysisResults?.skillsMatch?.matched || [],
    location: "Not specified", // No location in current API response
    source: "direct" as const, // Default source, could be enhanced
    priority: "medium" as const, // Default priority, could be calculated
    cvRating: application.cvAnalysisScore || 0,
    interview1Rating: 0, // These would come from interview data
    interview2Rating: 0,
    hrRating: 0,
    overallRating: application.cvAnalysisScore || 0,
    appliedDate: new Date(application.appliedAt).toLocaleDateString(),
    lastActivity: new Date(application.updatedAt).toLocaleDateString(),
    experience: application.cvAnalysisResults?.experienceMatch?.years
      ? `${application.cvAnalysisResults.experienceMatch.years} years`
      : "Not specified",
    name: `${application.candidate.firstName} ${application.candidate.lastName}`,
    email: application.candidate.email,
  };
};

export default function JobApplicationsPage() {
  const params = useParams();
  const jobId = params?.id as string;
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [candidates, setCandidates] = useState<CandidateDisplay[]>([]);
  const [job, setJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch job details and applications on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch job details and applications in parallel
        const [jobData, applications] = await Promise.all([
          JobService.getJobById(jobId),
          getApplicationsByJob(jobId),
        ]);

        setJob(jobData);
        const transformedCandidates = applications.map(
          transformApplicationToCandidate
        );
        setCandidates(transformedCandidates);
      } catch (err) {
        console.error("Error fetching data:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch data";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchData();
    }
  }, [jobId]);

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
    const matchesPriority =
      filterPriority === "all" || candidate.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
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
      const applications = await getApplicationsByJob(jobId);
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
      const applications = await getApplicationsByJob(jobId);
      const transformedCandidates = applications.map(
        transformApplicationToCandidate
      );
      setCandidates(transformedCandidates);
    } catch (err) {
      console.error("Error updating application status:", err);
      // You might want to show a toast notification here
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
    hired: 0, // No equivalent in new enum - could be tracked separately
    rejected: candidates.filter((c) => c.status === "REJECTED").length,
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Job Applications" subtitle="Loading applications..." />
        <div className="pt-20 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading job applications...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Error" subtitle="Failed to load job applications" />
        <div className="pt-20 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error Loading Applications
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <div className="-mx-2 -my-1.5 flex">
                      <button
                        onClick={() => window.location.reload()}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Retry
                      </button>
                      <Link
                        href="/dashboard/jobs"
                        className="ml-3 px-3 py-2 bg-white text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                      >
                        Back to Jobs
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title={job ? `${job.title} - Applications` : "Job Applications"}
        subtitle={
          job
            ? `${candidates.length} applications • ${
                job.company?.name || "Your Company"
              }`
            : "Manage job applications"
        }
      />

      <div className="pt-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link
              href="/dashboard/jobs"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-4"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Jobs
            </Link>
          </div>

          {/* Job Info Card */}
          {job && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  <BriefcaseIcon className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {job.title}
                      </h1>
                      <p className="text-lg text-gray-600">
                        {job.company?.name}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>{job.department}</span>
                        <span>{job.location}</span>
                        <span className="capitalize">
                          {job.type?.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600">
                        {candidates.length}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Applications
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {statusCounts.ai_analysis}
                </div>
                <div className="text-sm text-gray-600 mb-2">Submitted</div>
                <div className="w-8 h-8 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {statusCounts.ai_interview_1}
                </div>
                <div className="text-sm text-gray-600 mb-2">Reviewing</div>
                <div className="w-8 h-8 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {statusCounts.ai_interview_2}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Interview Scheduled
                </div>
                <div className="w-8 h-8 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-primary-600 mb-1">
                  {statusCounts.hr_interview}
                </div>
                <div className="text-sm text-gray-600 mb-2">Interviewed</div>
                <div className="w-8 h-8 mx-auto bg-blue-100 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-primary-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {statusCounts.offer}
                </div>
                <div className="text-sm text-gray-600 mb-2">Offer Sent</div>
                <div className="w-8 h-8 mx-auto bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {statusCounts.hired}
                </div>
                <div className="text-sm text-gray-600 mb-2">Hired</div>
                <div className="w-8 h-8 mx-auto bg-green-100 rounded-lg flex items-center justify-center">
                  <UsersIcon className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {statusCounts.rejected}
                </div>
                <div className="text-sm text-gray-600 mb-2">Rejected</div>
                <div className="w-8 h-8 mx-auto bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircleIcon className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Filter & Search Applications
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-6">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search candidates by name, email, or skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="REVIEWING">Reviewing</option>
                    <option value="INTERVIEW_SCHEDULED">
                      Interview Scheduled
                    </option>
                    <option value="INTERVIEWED">Interviewed</option>
                    <option value="OFFERED">Offered</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="WITHDRAWN">Withdrawn</option>
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm"
                  >
                    <option value="all">All Priority</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <button className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm">
                    <FunnelIcon className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedCandidates.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {selectedCandidates.length}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-blue-900">
                        {selectedCandidates.length} candidate
                        {selectedCandidates.length !== 1 ? "s" : ""} selected
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleBulkStatusUpdate("REVIEWING")}
                        className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                      >
                        Move to Review
                      </button>
                      <button
                        onClick={() =>
                          handleBulkStatusUpdate("INTERVIEW_SCHEDULED")
                        }
                        className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                      >
                        Schedule Interview
                      </button>
                      <button
                        onClick={() => handleBulkStatusUpdate("OFFERED")}
                        className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Send Offer
                      </button>
                      <button
                        onClick={() => handleBulkStatusUpdate("REJECTED")}
                        className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Applications ({filteredCandidates.length})
                  </h2>
                  <div className="flex items-center gap-2">
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
                    <span className="text-sm text-gray-600">Select All</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Export
                  </button>
                  <Link
                    href={`/dashboard/jobs/${jobId}`}
                    className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    View Job Details
                  </Link>
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      AI Score
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interview 1
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interview 2
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      HR Interview
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Overall
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
                          checked={selectedCandidates.includes(candidate.id)}
                          onChange={() => handleSelectCandidate(candidate.id)}
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
                              .join("")}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {candidate.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {candidate.email}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {candidate.experience}
                              </span>
                              <span className="text-lg">
                                {getSourceIcon(candidate.source)}
                              </span>
                            </div>
                          </div>
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
                            : candidate.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* AI Score */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-gray-900">
                          {candidate.cvRating}%
                        </span>
                      </td>

                      {/* Interview 1 */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {candidate.interview1Rating > 0 ? (
                          <span className="text-sm font-semibold text-gray-900">
                            {candidate.interview1Rating}%
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>

                      {/* Interview 2 */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {candidate.interview2Rating > 0 ? (
                          <span className="text-sm font-semibold text-gray-900">
                            {candidate.interview2Rating}%
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>

                      {/* HR Interview */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {candidate.hrRating > 0 ? (
                          <span className="text-sm font-semibold text-gray-900">
                            {candidate.hrRating}%
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>

                      {/* Overall */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-gray-900">
                          {candidate.overallRating}%
                        </span>
                      </td>

                      {/* Applied Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">
                          {candidate.appliedDate}
                        </div>
                        <div className="text-sm text-gray-500">
                          {candidate.lastActivity}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/dashboard/jobs/${jobId}/applications/${candidate.id}`}
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
                            Schedule
                          </button>
                          <button
                            onClick={() =>
                              handleSingleStatusUpdate(candidate.id, "REJECTED")
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

              {/* Empty State */}
              {filteredCandidates.length === 0 && (
                <div className="text-center py-12">
                  <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No applications found
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm ||
                    filterStatus !== "all" ||
                    filterPriority !== "all"
                      ? "Try adjusting your search filters."
                      : "This job doesn't have any applications yet."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
