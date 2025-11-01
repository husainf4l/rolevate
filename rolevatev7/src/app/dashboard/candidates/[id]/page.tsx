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
import { getInterviewsByApplication, Interview } from "@/services/interview.service";

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
  aiCvRecommendations?: string;
  aiInterviewRecommendations?: string;
  aiSecondInterviewRecommendations?: string;
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
  const fullName = application.candidate.name?.trim() || "Unknown Candidate";
  const email = application.candidate.email?.trim() || "No email provided";

  // Check if CV analysis failed or has no meaningful data
  const hasValidAnalysis =
    application.cvAnalysisResults &&
    application.cvAnalysisResults.match_score !== undefined &&
    application.cvAnalysisResults.match_score >= 0 &&
    !application.cvAnalysisResults.experience_summary?.includes("analysis failed") &&
    !application.cvAnalysisResults.experience_summary?.includes("CV analysis failed");

  console.log("Has valid CV analysis:", hasValidAnalysis);

  const result = {
    id: application.id,
    name: fullName,
    email: email,
    position: application.job.title || "Unknown Position",
    location: "Not specified", // No location in current API response
    experience:
      hasValidAnalysis &&
      application.cvAnalysisResults?.experience_summary
        ? application.cvAnalysisResults.experience_summary
        : "Experience not analyzed",
    education: "Education not analyzed", // Not available in current API response
    skills: hasValidAnalysis
      ? application.cvAnalysisResults?.skills_matched || []
      : [],
    status: application.status,
    appliedDate: new Date(application.appliedAt).toLocaleDateString(),
    lastActivity: new Date(application.updatedAt).toLocaleDateString(),
    aiScore: application.cvAnalysisScore || 0,
    notes:
      application.cvAnalysisResults?.detailed_feedback ||
      application.cvAnalysisResults?.experience_summary ||
      "CV analysis not available",
    resume: application.resumeUrl || "",
    jobId: application.job.id,
    jobTitle: application.job.title || "Unknown Position",
    companyName: application.job?.company?.name || "Unknown Company",
    source: "direct" as const,
    priority: "medium" as const,
    coverLetter: application.coverLetter?.trim() || "No cover letter provided",
    expectedSalary: application.expectedSalary?.trim() || "Not specified",
    noticePeriod: application.noticePeriod?.trim() || "Not specified",
    cvAnalysisResults: application.cvAnalysisResults,
    aiCvRecommendations: application.aiCvRecommendations,
    aiInterviewRecommendations: application.aiInterviewRecommendations,
    aiSecondInterviewRecommendations: application.aiSecondInterviewRecommendations,
  };

  console.log("Transformation result:", result);
  return result;
};

const getStatusColor = (status: Application["status"]) => {
  switch (status) {
    case "PENDING":
      return "bg-gray-100 text-gray-800";
    case "REVIEWED":
      return "bg-blue-100 text-blue-800";
    case "SHORTLISTED":
      return "bg-purple-100 text-purple-800";
    case "INTERVIEWED":
      return "bg-indigo-100 text-indigo-800";
    case "OFFERED":
      return "bg-green-100 text-green-800";
    case "HIRED":
      return "bg-emerald-100 text-emerald-800";
    case "ANALYZED":
      return "bg-cyan-100 text-cyan-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    case "WITHDRAWN":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Remove unused function - keeping for future use if needed
// const getPriorityColor = (priority: CandidateDetail["priority"]) => {
//   switch (priority) {
//     case "high":
//       return "bg-red-100 text-red-800";
//     case "medium":
//       return "bg-yellow-100 text-yellow-800";
//     case "low":
//       return "bg-green-100 text-green-800";
//     default:
//       return "bg-gray-100 text-gray-800";
//   }
// };

const getSourceIcon = (source: CandidateDetail["source"]) => {
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

const getStatusIcon = (status: Application["status"]) => {
  switch (status) {
    case "PENDING":
      return ClockIcon;
    case "REVIEWED":
      return ChatBubbleLeftRightIcon;
    case "SHORTLISTED":
      return CalendarDaysIcon;
    case "INTERVIEWED":
      return UserIcon;
    case "OFFERED":
      return CheckCircleIcon;
    case "HIRED":
      return CheckCircleIcon;
    case "ANALYZED":
      return ChartBarIcon;
    case "REJECTED":
      return XCircleIcon;
    case "WITHDRAWN":
      return XCircleIcon;
    default:
      return ClockIcon;
  }
};

// Remove unused pipeline stages - keeping for future use if needed
// const aiPipelineStages = [
//   {
//     id: "ai_analysis",
//     name: "AI Analysis",
//     description: "Initial AI screening",
//   },
//   {
//     id: "ai_interview_1",
//     name: "AI Interview 1",
//     description: "First AI interview",
//   },
//   {
//     id: "ai_interview_2",
//     name: "AI Interview 2",
//     description: "Second AI interview",
//   },
//   {
//     id: "hr_interview",
//     name: "HR Interview",
//     description: "Human recruiter interview",
//   },
//   { id: "offer", name: "Offer", description: "Job offer extended" },
//   { id: "hired", name: "Hired", description: "Successfully hired" },
// ];

export default function CandidateProfile() {
  const params = useParams();
  const applicationId = params?.id as string;
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState<ApplicationNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [interviews, setInterviews] = useState<Interview[]>([]);

  // Fetch application data on component mount
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        const application = await getApplicationById(applicationId);
        if (!application)
          throw new Error("No application data received from server");
        const candidateDetail = transformApplicationToDetail(application);
        setCandidate(candidateDetail);
        // Fetch notes
        try {
          const applicationNotes = await getApplicationNotes(applicationId);
          setNotes(applicationNotes);
        } catch (err) {
          console.error('Failed to fetch application notes:', err);
          // Notes are optional, don't show error to user
        }
        // Fetch interviews
        try {
          const interviewData = await getInterviewsByApplication(applicationId);
          setInterviews(interviewData);
        } catch (err) {
          console.error('Failed to fetch interviews:', err);
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
    if (applicationId) {
      fetchApplication();
    } else {
      setError("No application ID provided");
      setLoading(false);
    }
  }, [applicationId]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      setAddingNote(true);
      const noteData: CreateNoteData = {
        note: newNote.trim(),
        isPrivate: false,
      };
      const createdNote = await createApplicationNote(applicationId, noteData.note, noteData.isPrivate);
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
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
                  href="/dashboard/candidates"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back to Candidates
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
                href="/dashboard/candidates"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Candidates
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
        subtitle={`${candidate.position} • Applied ${candidate.appliedDate}`}
      />

      <div className="pt-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link
              href="/dashboard/candidates"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-4"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Candidates
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
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
                        <span className="text-sm font-bold text-primary-600 bg-primary-600/10 px-2 py-1 rounded">
                          AI Score: {candidate.aiScore}%
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          candidate.status
                        )}`}
                      >
                        {candidate.status.replace("_", " ")}
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

                  {!candidate.cvAnalysisResults.match_score ||
                  candidate.cvAnalysisResults.match_score < 0 ? (
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
                          Overall Match Score
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            candidate.cvAnalysisResults.match_score >= 80
                              ? "bg-green-100 text-green-800"
                              : candidate.cvAnalysisResults.match_score >= 60
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {candidate.cvAnalysisResults.match_score}%
                        </span>
                      </div>

                      {/* Progress Bar for Match Score */}
                      <div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                candidate.cvAnalysisResults.match_score,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-1 block">
                          {candidate.cvAnalysisResults.match_score}% match
                        </span>
                      </div>

                      {/* Skills Matched */}
                      {candidate.cvAnalysisResults.skills_matched &&
                        candidate.cvAnalysisResults.skills_matched.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">
                              Skills You Have
                            </span>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {candidate.cvAnalysisResults.skills_matched.map(
                                (skill: string, index: number) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                                  >
                                    {skill}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Skills Missing */}
                      {candidate.cvAnalysisResults.skills_missing &&
                        candidate.cvAnalysisResults.skills_missing.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">
                              Skills to Develop
                            </span>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {candidate.cvAnalysisResults.skills_missing.map(
                                (skill: string, index: number) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                                  >
                                    {skill}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Strengths */}
                      {candidate.cvAnalysisResults.strengths &&
                        candidate.cvAnalysisResults.strengths.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">
                              Strengths
                            </span>
                            <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                              {candidate.cvAnalysisResults.strengths.map(
                                (strength: string, index: number) => (
                                  <li key={index}>{strength}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                      {/* Concerns */}
                      {candidate.cvAnalysisResults.concerns &&
                        candidate.cvAnalysisResults.concerns.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">
                              Areas for Improvement
                            </span>
                            <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                              {candidate.cvAnalysisResults.concerns.map(
                                (concern: string, index: number) => (
                                  <li key={index}>{concern}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                      {/* Recommendation */}
                      {candidate.cvAnalysisResults.recommendation && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Recommendation
                          </span>
                          <p className="mt-1 text-sm text-gray-600 capitalize">
                            {candidate.cvAnalysisResults.recommendation.replace("_", " ")}
                          </p>
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
                          className="px-3 py-1 bg-primary-600/15 text-primary-600 rounded-full text-sm font-semibold border border-primary-600/20"
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

              {/* AI CV Recommendations */}
              {candidate.cvAnalysisResults?.detailed_feedback && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Detailed CV Feedback
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {candidate.cvAnalysisResults.detailed_feedback}
                  </p>
                </div>
              )}

              {/* AI Recommendations */}
              {candidate.aiCvRecommendations && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    AI CV Recommendations
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: candidate.aiCvRecommendations.replace(/\n/g, '<br />') }} />
                  </div>
                </div>
              )}

              {/* AI Interview Recommendations */}
              {candidate.aiInterviewRecommendations && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    AI Interview Recommendations
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: candidate.aiInterviewRecommendations.replace(/\n/g, '<br />') }} />
                  </div>
                </div>
              )}

              {/* AI Second Interview Recommendations */}
              {candidate.aiSecondInterviewRecommendations && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    AI Second Interview Recommendations
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: candidate.aiSecondInterviewRecommendations.replace(/\n/g, '<br />') }} />
                  </div>
                </div>
              )}

              {/* Interview History Section - Modern Clean Style */}
              {interviews.length > 0 && (
                <div className="bg-white rounded-3xl shadow-lg border-0 overflow-hidden">
                  {/* Header - Modern Minimal */}
                  <div className="px-8 py-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Interview Sessions
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {interviews.length} session{interviews.length !== 1 ? "s" : ""} completed
                        </p>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">
                            {interviews.filter(i => i.status === "COMPLETED").length} Complete
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">
                            {interviews.filter(i => i.recordingUrl).length} Recorded
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interview List - Modern Clean Rows */}
                  <div className="divide-y divide-gray-50">
                    {interviews.map((interview, index) => (
                      <div
                        key={interview.id}
                        className="px-8 py-5 hover:bg-gray-50/50 transition-colors duration-150 group"
                      >
                        <div className="flex items-center justify-between">
                          {/* Left Side - Session Info */}
                          <div className="flex items-center gap-6 flex-1">
                            {/* Session Number & Status */}
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">
                                  {index + 1}
                                </div>
                                {interview.status === "COMPLETED" && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                )}
                              </div>
                              
                              {/* Session Details */}
                              <div>
                                <div className="text-base font-medium text-gray-900">
                                  Session {index + 1}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {interview.createdAt 
                                    ? new Date(interview.createdAt).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                    : "No date"}
                                </div>
                              </div>
                            </div>

                            {/* Metrics */}
                            <div className="flex items-center gap-12">
                              {/* AI Score */}
                              {interview.aiAnalysis && typeof interview.aiAnalysis === 'object' && 'score' in interview.aiAnalysis ? (
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <div className="text-lg font-semibold text-gray-900">
                                      {interview.aiAnalysis.score}%
                                    </div>
                                    <div className="text-xs text-gray-500">AI Score</div>
                                  </div>
                                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                    <div
                                      className={`h-1.5 rounded-full ${
                                        interview.aiAnalysis.score >= 70
                                          ? "bg-green-500"
                                          : interview.aiAnalysis.score >= 40
                                          ? "bg-yellow-500"
                                          : "bg-red-500"
                                      }`}
                                      style={{
                                        width: `${Math.min(interview.aiAnalysis.score, 100)}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-right">
                                  <div className="text-lg font-semibold text-gray-300">—</div>
                                  <div className="text-xs text-gray-400">No Score</div>
                                </div>
                              )}

                              {/* Transcript Count */}
                              <div className="text-right">
                                <div className="text-lg font-semibold text-gray-900">
                                  {interview.transcripts?.length || 0}
                                </div>
                                <div className="text-xs text-gray-500">Exchanges</div>
                              </div>

                              {/* Status Badge */}
                              <div>
                                {interview.status === "COMPLETED" ? (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                    ✓ Complete
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                                    {interview.status.replace("_", " ")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right Side - Actions */}
                          <div className="flex items-center gap-2">
                            {interview.recordingUrl && (
                              <a
                                href={interview.recordingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors duration-150"
                              >
                                <EyeIcon className="w-4 h-4" />
                                Watch
                              </a>
                            )}
                            
                            <Link
                              href={`/dashboard/candidates/${candidate.id}/interviews/${interview.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors duration-150"
                            >
                              <DocumentTextIcon className="w-4 h-4" />
                              Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-8 py-4 border-t border-gray-100 bg-gray-50/30">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {interviews.length} session{interviews.length !== 1 ? "s" : ""}
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-150">
                          <ChartBarIcon className="w-4 h-4" />
                          Export
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors duration-150">
                          <DocumentTextIcon className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>
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
                    <StatusIcon className="w-6 h-6 text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {candidate.status.replace("_", " ")}
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
                    onClick={() => handleStatusUpdate("REVIEWED")}
                    disabled={updating || candidate.status === "REVIEWED"}
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? "Updating..." : "Move to Review"}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate("SHORTLISTED")}
                    disabled={
                      updating || candidate.status === "SHORTLISTED"
                    }
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Shortlist
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim() || addingNote}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                            <p className="text-gray-800 text-sm">{note.note}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  note.isPrivate
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {note.isPrivate ? "Private" : "Public"}
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
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
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
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
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

              {/* Interview Summary for Right Column */}
              {interviews.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Interview Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {interviews.filter(i => i.status === "COMPLETED").length}
                        </div>
                        <div className="text-xs text-green-700 font-medium">Completed</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {interviews.filter(i => i.recordingUrl).length}
                        </div>
                        <div className="text-xs text-blue-700 font-medium">Recorded</div>
                      </div>
                    </div>
                    
                    {/* Latest Interview */}
                    {interviews[0] && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-900 mb-2">
                          Latest Session
                        </div>
                        <div className="text-xs text-gray-600">
                          Interview #{interviews.length} • {interviews[0].createdAt 
                            ? new Date(interviews[0].createdAt).toLocaleDateString()
                            : "Recent"}
                        </div>
                        {interviews[0].aiAnalysis && typeof interviews[0].aiAnalysis === 'object' && 'score' in interviews[0].aiAnalysis && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-gray-600">AI Score:</span>
                            <span className="text-sm font-bold text-primary-600">
                              {interviews[0].aiAnalysis.score}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 text-center">
                        See full interview history in main section
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
