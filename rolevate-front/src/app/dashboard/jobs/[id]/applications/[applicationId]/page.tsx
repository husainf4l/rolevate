"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/dashboard/Header";
import {
  UserIcon,
  MapPinIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import {
  Application,
  getApplicationById,
  updateApplicationStatus,
  ApplicationNote,
  getApplicationNotes,
  createApplicationNote,
  CreateNoteData,
} from "@/services/application";
import { JobService, JobPost } from "@/services/job";
import { API_CONFIG } from "@/lib/config";

// Interview type (same as candidate detail page)
interface Interview {
  id: string;
  candidateId: string;
  jobId: string;
  companyId: string;
  title: string;
  description?: string;
  status: string;
  type: string;
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  roomId?: string;
  videoLink?: string;
  recordingUrl?: string;
  aiAnalysis?: string;
  aiScore?: number;
  aiRecommendation?: string;
  analyzedAt?: string;
  interviewerNotes?: string;
  candidateFeedback?: string;
  overallRating?: number;
  technicalQuestions?: any;
  technicalAnswers?: any;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  job: {
    id: string;
    title: string;
    department?: string;
    location?: string;
    salary?: string;
    type?: string;
    deadline?: string;
    description?: string;
    shortDescription?: string;
    responsibilities?: string;
    requirements?: string;
    benefits?: string;
    skills?: string[];
    experience?: string;
    education?: string;
    jobLevel?: string;
    workType?: string;
    industry?: string;
    companyDescription?: string;
    status?: string;
    companyId?: string;
    cvAnalysisPrompt?: string;
    interviewPrompt?: string;
    aiSecondInterviewPrompt?: string;
    interviewLanguage?: string;
    featured?: boolean;
    applicants?: number;
    views?: number;
    createdAt?: string;
    updatedAt?: string;
    company?: {
      id: string;
      name: string;
      description?: string;
      email?: string;
      phone?: string;
      website?: string;
      logo?: string;
      industry?: string;
      numberOfEmployees?: number;
      subscription?: string;
      createdAt?: string;
      updatedAt?: string;
    };
  };
  company: {
    id: string;
    name: string;
  };
  transcripts: Array<{
    id: string;
    interviewId: string;
    speakerType: string;
    speakerName: string;
    speakerId?: string;
    content: string;
    confidence?: number;
    language: string;
    startTime: number;
    endTime: number;
    duration: number;
    sentiment?: string;
    keywords: string[];
    aiSummary?: string;
    importance: number;
    sequenceNumber: number;
    metadata?: any;
    createdAt: string;
    updatedAt: string;
  }>;
}

// Transform API application data to display format for detail view
interface CandidateDetail {
  id: string;
  name: string;
  email: string;
  position: string;
  location: string;
  experience: string;
  education: string;
  skills: string[];
  status: Application["status"];
  appliedDate: string;
  lastActivity: string;
  aiScore: number;
  notes: string;
  resume: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  source: "website" | "linkedin" | "referral" | "recruiter" | "direct";
  priority: "high" | "medium" | "low";
  coverLetter: string;
  expectedSalary: string;
  noticePeriod: string;
  cvAnalysisResults?: Application["cvAnalysisResults"];
}

// Transform API application to candidate detail format
const transformApplicationToDetail = (
  application: Application
): CandidateDetail => {
  console.log("Transforming application:", application);

  // Guard against undefined application
  if (!application) {
    console.error("Application is null or undefined");
    throw new Error("Application data is missing");
  }

  // Guard against missing required fields
  if (!application.id) {
    console.error("Application missing ID:", application);
    throw new Error("Application ID is missing");
  }

  // Guard against missing nested objects with more specific errors
  if (!application.candidate) {
    console.error("Missing candidate data in application:", application);
    throw new Error("Candidate data is missing from application");
  }

  if (!application.job) {
    console.error("Missing job data in application:", application);
    throw new Error("Job data is missing from application");
  }

  // Handle potential missing or placeholder data
  const firstName = application.candidate.firstName?.trim() || "Unknown";
  const lastName = application.candidate.lastName?.trim() || "";
  const fullName = `${firstName} ${lastName}`.trim() || "Unknown Candidate";
  const email = application.candidate.email?.trim() || "No email provided";

  // Check if CV analysis failed or has no meaningful data
  const hasValidAnalysis =
    application.cvAnalysisResults &&
    application.cvAnalysisResults.overallFit &&
    !application.cvAnalysisResults.summary?.includes("analysis failed") &&
    !application.cvAnalysisResults.summary?.includes("CV analysis failed");

  console.log("Has valid CV analysis:", hasValidAnalysis);

  const result = {
    id: application.id,
    name: fullName,
    email: email,
    position: application.job.title || "Unknown Position",
    location: "",
    experience:
      hasValidAnalysis &&
      application.cvAnalysisResults?.experienceMatch?.years &&
      application.cvAnalysisResults.experienceMatch.years > 0
        ? `${application.cvAnalysisResults.experienceMatch.years} years`
        : "",
    education:
      hasValidAnalysis &&
      application.cvAnalysisResults?.educationMatch?.details &&
      !application.cvAnalysisResults.educationMatch.details.includes(
        "Analysis failed"
      )
        ? application.cvAnalysisResults.educationMatch.details
        : "",
    skills: hasValidAnalysis
      ? application.cvAnalysisResults?.skillsMatch?.matched || []
      : [],
    status: application.status,
    appliedDate: new Date(application.appliedAt).toLocaleDateString(),
    lastActivity: new Date(application.updatedAt).toLocaleDateString(),
    aiScore: application.cvAnalysisScore || 0,
    notes:
      application.cvAnalysisResults?.summary || "",
    resume: application.resumeUrl || "",
    jobId: application.jobId,
    jobTitle: application.job.title || "Unknown Position",
    companyName: application.job?.company?.name || "Unknown Company",
    source: (application as any).source || "direct",
    priority: (application as any).priority || "medium",
    coverLetter: application.coverLetter?.trim() || "",
    expectedSalary: application.expectedSalary?.trim() || "",
    noticePeriod: application.noticePeriod?.trim() || "",
    cvAnalysisResults: application.cvAnalysisResults,
  };

  console.log("Transformation result:", result);
  return result;
};

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

const getSourceIcon = (source: CandidateDetail["source"]) => {
  switch (source) {
    case "linkedin":
      return "💼";
    case "website":
      return "🌐";
    case "referral":
      return "👥";
    case "recruiter":
      return "🎯";
    default:
      return "📧";
  }
};

const getStatusIcon = (status: Application["status"]) => {
  switch (status) {
    case "SUBMITTED":
      return ChartBarIcon;
    case "REVIEWING":
      return ChatBubbleLeftRightIcon;
    case "INTERVIEW_SCHEDULED":
      return CalendarDaysIcon;
    case "INTERVIEWED":
      return UserIcon;
    case "OFFERED":
      return CheckCircleIcon;
    case "REJECTED":
      return XCircleIcon;
    case "WITHDRAWN":
      return ClockIcon;
    default:
      return ClockIcon;
  }
};

export default function JobCandidateProfile() {
  const params = useParams();
  const jobId = params?.id as string;
  const applicationId = params?.applicationId as string;
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [job, setJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState<ApplicationNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [interviews, setInterviews] = useState<Interview[]>([]);

  // Fetch application and job data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch application, job, and notes in parallel
        const [application, jobData] = await Promise.all([
          getApplicationById(applicationId),
          JobService.getJobById(jobId)
        ]);
        
        if (!application)
          throw new Error("No application data received from server");
          
        const candidateDetail = transformApplicationToDetail(application);
        setCandidate(candidateDetail);
        setJob(jobData);
        
        // Fetch notes
        try {
          const applicationNotes = await getApplicationNotes(applicationId);
          setNotes(applicationNotes);
        } catch {}
        
        // Fetch interviews
        try {
          const res = await fetch(
            `${API_CONFIG.API_BASE_URL}/interviews/candidate/${application.candidate.id}/job/${application.job.id}`
          );
          if (res.ok) {
            const data = await res.json();
            setInterviews(Array.isArray(data) ? data : []);
          }
        } catch (err) {
          // Interview fetch errors are non-blocking
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch application"
        );
      } finally {
        setLoading(false);
      }
    };
    
    if (applicationId && jobId) {
      fetchData();
    } else {
      setError("No application or job ID provided");
      setLoading(false);
    }
  }, [applicationId, jobId]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      setAddingNote(true);
      const noteData: CreateNoteData = {
        text: newNote.trim(),
        source: "USER",
      };
      const createdNote = await createApplicationNote(applicationId, noteData);
      setNotes((prev) => [createdNote, ...prev]);
      setNewNote("");
    } catch (err) {
      console.error("Error adding note:", err);
      // You might want to show a toast notification here
    } finally {
      setAddingNote(false);
    }
  };

  const handleStatusUpdate = async (newStatus: Application["status"]) => {
    if (!candidate) return;

    try {
      setUpdating(true);
      await updateApplicationStatus(candidate.id, newStatus);
      // Refresh the data after update
      const application = await getApplicationById(applicationId);
      const candidateDetail = transformApplicationToDetail(application);
      setCandidate(candidateDetail);
    } catch (err) {
      console.error("Error updating application status:", err);
      // You might want to show a toast notification here
    } finally {
      setUpdating(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          title="Candidate Profile"
          subtitle="Loading candidate information..."
        />
        <div className="pt-20 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0891b2] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading candidate profile...</p>
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
        <Header title="Error" subtitle="Failed to load candidate information" />
        <div className="pt-20 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
              <XCircleIcon className="mx-auto h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-lg font-medium text-red-900 mb-2">
                Error Loading Candidate
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
                <Link
                  href={`/dashboard/jobs/${jobId}/applications`}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back to Applications
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          title="Candidate Not Found"
          subtitle="The requested candidate could not be found"
        />
        <div className="pt-20 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Candidate Not Found
              </h3>
              <p className="text-gray-600 mb-4">
                The candidate you're looking for doesn't exist or you don't have
                permission to view it.
              </p>
              <Link
                href={`/dashboard/jobs/${jobId}/applications`}
                className="inline-flex items-center px-4 py-2 bg-[#0891b2] text-white rounded-lg hover:bg-[#0fc4b5] transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Applications
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(candidate.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title={candidate.name}
        subtitle={`${candidate.position} • Applied ${candidate.appliedDate} • ${job?.title || 'Job'}`}
      />

      <div className="pt-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link
              href={`/dashboard/jobs/${jobId}/applications`}
              className="inline-flex items-center gap-2 text-[#0891b2] hover:text-[#0fc4b5] font-medium mb-4"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to {job?.title} Applications
            </Link>
          </div>

          {/* Job Context Card */}
          {job && (
            <div className="bg-gradient-to-r from-[#0891b2] to-[#0fc4b5] rounded-xl p-6 mb-8 text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <BriefcaseIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{job.title}</h2>
                  <p className="text-white/80">{job.company?.name} • {job.department}</p>
                  <p className="text-white/60 text-sm">{job.location} • {job.type?.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#0891b2] to-[#0fc4b5] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {candidate.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {candidate.name}
                      </h1>
                      <span className="text-xl">
                        {getSourceIcon(candidate.source)}
                      </span>
                    </div>
                    <p className="text-lg text-gray-600 mb-3">
                      {candidate.position}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{candidate.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BriefcaseIcon className="w-4 h-4" />
                        <span>{candidate.experience}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <EnvelopeIcon className="w-4 h-4" />
                        <span>{candidate.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-[#0891b2] bg-[#0fc4b5]/10 px-2 py-1 rounded">
                          AI Score: {candidate.aiScore}%
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          candidate.status
                        )}`}
                      >
                        {candidate.status === "SUBMITTED"
                          ? "Submitted"
                          : candidate.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CV Analysis Results */}
              {candidate.cvAnalysisResults ? (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    CV Analysis Results
                  </h3>

                  {!candidate.cvAnalysisResults.overallFit ||
                  candidate.cvAnalysisResults.summary?.includes(
                    "analysis failed"
                  ) ||
                  candidate.cvAnalysisResults.summary?.includes(
                    "CV analysis failed"
                  ) ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <XCircleIcon className="w-5 h-5 text-yellow-600 mr-2" />
                        <p className="text-yellow-800 font-medium">
                          CV Analysis Unavailable
                        </p>
                      </div>
                      <p className="text-yellow-700 text-sm mt-1">
                        The CV analysis could not be completed. This might be
                        due to CV format issues or processing errors.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Overall Fit
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            candidate.cvAnalysisResults.overallFit === "Good"
                              ? "bg-green-100 text-green-800"
                              : candidate.cvAnalysisResults.overallFit ===
                                "Poor"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {candidate.cvAnalysisResults.overallFit}
                        </span>
                      </div>

                      {candidate.cvAnalysisResults.skillsMatch && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Skills Match
                          </span>
                          <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-[#0891b2] h-2 rounded-full"
                              style={{
                                width: `${
                                  candidate.cvAnalysisResults.skillsMatch
                                    .percentage || 0
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {candidate.cvAnalysisResults.skillsMatch
                              .percentage || 0}
                            % match
                          </span>
                        </div>
                      )}

                      {candidate.cvAnalysisResults.strengths &&
                        candidate.cvAnalysisResults.strengths.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">
                              Strengths
                            </span>
                            <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                              {candidate.cvAnalysisResults.strengths.map(
                                (strength, index) => (
                                  <li key={index}>{strength}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                      {candidate.cvAnalysisResults.weaknesses &&
                        candidate.cvAnalysisResults.weaknesses.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">
                              Areas for Improvement
                            </span>
                            <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                              {candidate.cvAnalysisResults.weaknesses.map(
                                (weakness, index) => (
                                  <li key={index}>{weakness}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    CV Analysis Results
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <ClockIcon className="w-5 h-5 text-gray-500 mr-2" />
                      <p className="text-gray-700 font-medium">
                        Analysis Not Available
                      </p>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      CV analysis has not been performed for this application.
                    </p>
                  </div>
                </div>
              )}

              {/* Skills & Education */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Skills & Experience
                </h3>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <BriefcaseIcon className="w-5 h-5 text-gray-600" />
                    <h4 className="font-medium text-gray-900">Experience</h4>
                  </div>
                  <p className="text-gray-700">{candidate.experience}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <AcademicCapIcon className="w-5 h-5 text-gray-600" />
                    <h4 className="font-medium text-gray-900">Education</h4>
                  </div>
                  <p className="text-gray-700">{candidate.education}</p>
                </div>

                {candidate.skills.length > 0 ? (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Matched Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-[#0891b2]/15 text-[#0891b2] rounded-full text-sm font-semibold border border-[#0fc4b5]/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Skills</h4>
                    <p className="text-gray-500 text-sm">
                      No skills could be extracted from CV analysis
                    </p>
                  </div>
                )}
              </div>

              {/* Application Details */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Application Details
                </h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Cover Letter
                    </h4>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                      {candidate.coverLetter &&
                      candidate.coverLetter !== "No cover letter provided"
                        ? candidate.coverLetter
                        : "No cover letter provided"}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Expected Salary
                    </h4>
                    <p className="text-gray-700">
                      {candidate.expectedSalary &&
                      candidate.expectedSalary !== "Not specified"
                        ? candidate.expectedSalary
                        : "Not specified"}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Notice Period
                    </h4>
                    <p className="text-gray-700">
                      {candidate.noticePeriod &&
                      candidate.noticePeriod !== "Not specified"
                        ? candidate.noticePeriod
                        : "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Analysis Notes */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  AI Analysis Summary
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {candidate.notes}
                </p>
              </div>

              {/* Interview Details Section - Enhanced design */}
              {interviews.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#0891b2] to-[#0fc4b5] px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            Interview History
                          </h3>
                          <p className="text-sm text-white/80">
                            {interviews.length} interview{interviews.length !== 1 ? 's' : ''} completed
                          </p>
                        </div>
                      </div>
                      <div className="text-white/80 text-sm">
                        Total: {interviews.length}
                      </div>
                    </div>
                  </div>

                  {/* Interview Cards */}
                  <div className="p-6 space-y-6">
                    {interviews.map((interview) => (
                      <div
                        key={interview.id}
                        className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-200"
                      >
                        {/* Interview Header */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              interview.status === "COMPLETED"
                                ? "bg-green-100 text-green-600"
                                : interview.status === "IN_PROGRESS"
                                ? "bg-blue-100 text-blue-600"
                                : interview.status === "SCHEDULED"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-gray-100 text-gray-600"
                            }`}>
                              <CalendarDaysIcon className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-gray-900 mb-1">
                                {interview.title}
                              </h4>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="font-medium">
                                  {interview.type.replace("_", " ")}
                                </span>
                                <span>•</span>
                                <span>{interview.job?.company?.name || "N/A"}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                              interview.status === "COMPLETED"
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : interview.status === "IN_PROGRESS"
                                ? "bg-blue-100 text-blue-700 border border-blue-200"
                                : interview.status === "SCHEDULED"
                                ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                : "bg-gray-100 text-gray-700 border border-gray-200"
                            }`}>
                              {interview.status.replace("_", " ")}
                            </span>
                          </div>
                        </div>

                        {/* Interview Timeline */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                              Scheduled
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(interview.scheduledAt).toLocaleString()}
                            </div>
                          </div>
                          {interview.startedAt && (
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                                Started
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {new Date(interview.startedAt).toLocaleString()}
                              </div>
                            </div>
                          )}
                          {interview.endedAt && (
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                                Completed
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {new Date(interview.endedAt).toLocaleString()}
                              </div>
                            </div>
                          )}
                          {interview.duration && (
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                                Duration
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {interview.duration} minutes
                              </div>
                            </div>
                          )}
                        </div>

                        {/* AI Analysis Section */}
                        {(interview.aiScore || interview.aiAnalysis || interview.interviewerNotes) && (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 mb-6 border border-blue-100">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <ChartBarIcon className="w-5 h-5 text-blue-600" />
                              </div>
                              <h5 className="text-lg font-semibold text-gray-900">
                                AI Performance Analysis
                              </h5>
                            </div>

                            {interview.aiScore && (
                              <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-4">
                                    <div className="text-3xl font-bold text-gray-900">
                                      {interview.aiScore}%
                                    </div>
                                    {interview.aiRecommendation && (
                                      <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                                        interview.aiRecommendation === "SECOND_INTERVIEW"
                                          ? "bg-green-100 text-green-700 border border-green-200"
                                          : interview.aiRecommendation === "REJECT"
                                          ? "bg-red-100 text-red-700 border border-red-200"
                                          : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                      }`}>
                                        {interview.aiRecommendation.replace("_", " ")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                                  <div 
                                    className={`h-2.5 rounded-full ${
                                      interview.aiScore >= 70 
                                        ? "bg-green-500" 
                                        : interview.aiScore >= 40
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                    }`}
                                    style={{ width: `${Math.min(interview.aiScore, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}

                            {interview.interviewerNotes && (
                              <div>
                                <h6 className="text-sm font-semibold text-gray-900 mb-3">
                                  Detailed Assessment
                                </h6>
                                <div className="bg-white rounded-lg p-4 border border-gray-200 max-h-64 overflow-y-auto">
                                  <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {interview.interviewerNotes}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Interview Transcript */}
                        {interview.transcripts && interview.transcripts.length > 0 && (
                          <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <DocumentTextIcon className="w-5 h-5 text-gray-600" />
                                </div>
                                <h5 className="text-lg font-semibold text-gray-900">
                                  Interview Transcript
                                </h5>
                              </div>
                              <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border">
                                {interview.transcripts.filter(t => t.speakerType !== "SYSTEM").length} exchanges
                              </div>
                            </div>

                            <div className="space-y-4 max-h-80 overflow-y-auto">
                              {interview.transcripts
                                .filter(transcript => transcript.speakerType !== "SYSTEM")
                                .slice(0, 8)
                                .map((transcript) => (
                                  <div key={transcript.id} className="flex gap-3">
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                                      transcript.speakerType === "AI_ASSISTANT"
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-blue-100 text-blue-700"
                                    }`}>
                                      {transcript.speakerType === "AI_ASSISTANT" ? "AI" : "C"}
                                    </div>
                                    <div className="flex-1 bg-white rounded-lg p-3 border border-gray-200">
                                      <div className="text-sm text-gray-900 leading-relaxed">
                                        {transcript.content}
                                      </div>
                                      <div className="text-xs text-gray-500 mt-2">
                                        {new Date(transcript.createdAt).toLocaleTimeString()}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              
                              {interview.transcripts.filter(t => t.speakerType !== "SYSTEM").length > 8 && (
                                <div className="text-center py-3">
                                  <span className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full border">
                                    +{interview.transcripts.filter(t => t.speakerType !== "SYSTEM").length - 8} more exchanges
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                          {interview.videoLink && (
                            <a
                              href={interview.videoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0891b2] text-white rounded-lg hover:bg-[#0fc4b5] transition-colors font-medium"
                            >
                              <EyeIcon className="w-4 h-4" />
                              Watch Recording
                            </a>
                          )}
                          {interview.roomId && interview.status === "IN_PROGRESS" && (
                            <a
                              href={`/room/${interview.roomId}`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                              <CalendarDaysIcon className="w-4 h-4" />
                              Join Live Interview
                            </a>
                          )}
                          <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                            <DocumentTextIcon className="w-4 h-4" />
                            Download Report
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Actions & Status */}
            <div className="space-y-6">
              {/* Status Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Current Status
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <StatusIcon className="w-6 h-6 text-[#0891b2]" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {candidate.status === "SUBMITTED"
                          ? "Submitted"
                          : candidate.status.replace("_", " ")}
                      </p>
                      <p className="text-sm text-gray-600">
                        Last updated: {candidate.lastActivity}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => handleStatusUpdate("REVIEWING")}
                    disabled={updating || candidate.status === "REVIEWING"}
                    className="w-full px-4 py-2 bg-[#0891b2] text-white rounded-lg hover:bg-[#0fc4b5] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? "Updating..." : "Move to Review"}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate("INTERVIEW_SCHEDULED")}
                    disabled={
                      updating || candidate.status === "INTERVIEW_SCHEDULED"
                    }
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Schedule Interview
                  </button>
                  <button
                    onClick={() => handleStatusUpdate("INTERVIEWED")}
                    disabled={updating || candidate.status === "INTERVIEWED"}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mark Interviewed
                  </button>
                  <button
                    onClick={() => handleStatusUpdate("OFFERED")}
                    disabled={updating || candidate.status === "OFFERED"}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Offer
                  </button>
                  <button
                    onClick={() => handleStatusUpdate("REJECTED")}
                    disabled={updating || candidate.status === "REJECTED"}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject
                  </button>
                </div>
              </div>

              {/* Resume Download */}
              {candidate.resume && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Documents
                  </h3>
                  <a
                    href={candidate.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <DocumentTextIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">
                      View Resume/CV
                    </span>
                    <EyeIcon className="w-4 h-4 text-gray-500 ml-auto" />
                  </a>
                </div>
              )}

              {/* Notes Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Notes
                </h3>

                {/* Add new note */}
                <div className="mb-4">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note about this candidate..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0891b2] focus:border-transparent resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim() || addingNote}
                      className="px-4 py-2 bg-[#0891b2] text-white rounded-lg hover:bg-[#0fc4b5] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingNote ? "Adding..." : "Add Note"}
                    </button>
                  </div>
                </div>

                {/* Display notes */}
                <div className="space-y-3">
                  {notes.length > 0 ? (
                    notes.map((note) => (
                      <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-gray-800 text-sm">{note.text}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  note.source === "USER"
                                    ? "bg-blue-100 text-blue-800"
                                    : note.source === "AI"
                                    ? "bg-purple-100 text-purple-800"
                                    : note.source === "SYSTEM"
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {note.source === "USER"
                                  ? note.user?.name ||
                                    note.user?.email ||
                                    "USER"
                                  : note.source}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(note.createdAt).toLocaleDateString()}{" "}
                                at{" "}
                                {new Date(note.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No notes yet. Add the first note above.
                    </p>
                  )}
                </div>
              </div>

              {/* Application Timeline */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Application Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#0891b2] rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Application Submitted
                      </p>
                      <p className="text-xs text-gray-600">
                        {candidate.appliedDate}
                      </p>
                    </div>
                  </div>
                  {candidate.cvAnalysisResults && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#0891b2] rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          CV Analysis Completed
                        </p>
                        <p className="text-xs text-gray-600">
                          Score: {candidate.aiScore}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}