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
  CreateNoteData
} from "@/services/application";

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
const transformApplicationToDetail = (application: Application): CandidateDetail => {
  console.log('Transforming application:', application);
  
  // Guard against undefined application
  if (!application) {
    console.error('Application is null or undefined');
    throw new Error("Application data is missing");
  }
  
  // Guard against missing required fields
  if (!application.id) {
    console.error('Application missing ID:', application);
    throw new Error("Application ID is missing");
  }
  
  // Guard against missing nested objects with more specific errors
  if (!application.candidate) {
    console.error('Missing candidate data in application:', application);
    throw new Error("Candidate data is missing from application");
  }
  
  if (!application.job) {
    console.error('Missing job data in application:', application);
    throw new Error("Job data is missing from application");
  }

  // Handle potential missing or placeholder data
  const firstName = application.candidate.firstName?.trim() || "Unknown";
  const lastName = application.candidate.lastName?.trim() || "";
  const fullName = `${firstName} ${lastName}`.trim() || "Unknown Candidate";
  const email = application.candidate.email?.trim() || "No email provided";
  
  // Check if CV analysis failed or has no meaningful data
  const hasValidAnalysis = application.cvAnalysisResults && 
    application.cvAnalysisResults.overallFit !== "Poor" &&
    !application.cvAnalysisResults.summary?.includes("analysis failed") &&
    !application.cvAnalysisResults.summary?.includes("CV analysis failed");
  
  console.log('Has valid CV analysis:', hasValidAnalysis);
  
  const result = {
    id: application.id,
    name: fullName,
    email: email,
    position: application.job.title || "Unknown Position",
    location: "Not specified", // No location in current API response
    experience: hasValidAnalysis && application.cvAnalysisResults?.experienceMatch?.years && application.cvAnalysisResults.experienceMatch.years > 0
      ? `${application.cvAnalysisResults.experienceMatch.years} years` 
      : "Experience not analyzed",
    education: hasValidAnalysis && application.cvAnalysisResults?.educationMatch?.details &&
      !application.cvAnalysisResults.educationMatch.details.includes("Analysis failed")
      ? application.cvAnalysisResults.educationMatch.details
      : "Education not analyzed",
    skills: hasValidAnalysis ? (application.cvAnalysisResults?.skillsMatch?.matched || []) : [],
    status: application.status,
    appliedDate: new Date(application.appliedAt).toLocaleDateString(),
    lastActivity: new Date(application.updatedAt).toLocaleDateString(),
    aiScore: application.cvAnalysisScore || 0,
    notes: application.cvAnalysisResults?.summary || "CV analysis not available",
    resume: application.resumeUrl || "",
    jobId: application.jobId,
    jobTitle: application.job.title || "Unknown Position",
    companyName: application.job?.company?.name || "Unknown Company",
    source: "direct" as const,
    priority: "medium" as const,
    coverLetter: application.coverLetter?.trim() || "No cover letter provided",
    expectedSalary: application.expectedSalary?.trim() || "Not specified",
    noticePeriod: application.noticePeriod?.trim() || "Not specified",
    cvAnalysisResults: application.cvAnalysisResults,
  };
  
  console.log('Transformation result:', result);
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
  const applicationId = params.id as string;
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState<ApplicationNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // Fetch application data on component mount
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        console.log('Fetching application with ID:', applicationId);
        const application = await getApplicationById(applicationId);
        console.log('Received application data:', application);
        
        if (!application) {
          throw new Error("No application data received from server");
        }
        
        const candidateDetail = transformApplicationToDetail(application);
        console.log('Transformed candidate detail:', candidateDetail);
        setCandidate(candidateDetail);

        // Fetch notes
        try {
          const applicationNotes = await getApplicationNotes(applicationId);
          setNotes(applicationNotes);
        } catch (noteErr) {
          console.warn('Failed to fetch notes:', noteErr);
          // Don't fail the whole page if notes fail
        }
      } catch (err) {
        console.error('Error fetching application:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch application');
      } finally {
        setLoading(false);
      }
    };

    if (applicationId) {
      fetchApplication();
    } else {
      setError('No application ID provided');
      setLoading(false);
    }
  }, [applicationId]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      setAddingNote(true);
      const noteData: CreateNoteData = {
        text: newNote.trim(),
        source: "USER"
      };
      const createdNote = await createApplicationNote(applicationId, noteData);
      setNotes(prev => [createdNote, ...prev]);
      setNewNote("");
    } catch (err) {
      console.error('Error adding note:', err);
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
      console.error('Error updating application status:', err);
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
        <Header
          title="Error"
          subtitle="Failed to load candidate information"
        />
        <div className="pt-20 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
              <XCircleIcon className="mx-auto h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Candidate</h3>
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Candidate Not Found</h3>
              <p className="text-gray-600 mb-4">The candidate you're looking for doesn't exist or you don't have permission to view it.</p>
              <Link
                href="/dashboard/candidates"
                className="inline-flex items-center px-4 py-2 bg-[#0891b2] text-white rounded-lg hover:bg-[#0fc4b5] transition-colors"
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
              className="inline-flex items-center gap-2 text-[#0891b2] hover:text-[#0fc4b5] font-medium mb-4"
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
                  <div className="w-20 h-20 bg-gradient-to-br from-[#0891b2] to-[#0fc4b5] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {candidate.name.split(' ').map(n => n[0]).join('')}
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
                        {candidate.status === "SUBMITTED" ? "Submitted" : candidate.status.replace("_", " ")}
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
                  
                  {candidate.cvAnalysisResults.overallFit === 'Poor' || 
                   candidate.cvAnalysisResults.summary?.includes('analysis failed') ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <XCircleIcon className="w-5 h-5 text-yellow-600 mr-2" />
                        <p className="text-yellow-800 font-medium">CV Analysis Unavailable</p>
                      </div>
                      <p className="text-yellow-700 text-sm mt-1">
                        The CV analysis could not be completed. This might be due to CV format issues or processing errors.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Overall Fit</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          candidate.cvAnalysisResults.overallFit === 'Good' ? 'bg-green-100 text-green-800' :
                          candidate.cvAnalysisResults.overallFit === 'Poor' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {candidate.cvAnalysisResults.overallFit}
                        </span>
                      </div>
                      
                      {candidate.cvAnalysisResults.skillsMatch && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Skills Match</span>
                          <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-[#0891b2] h-2 rounded-full" 
                              style={{ width: `${candidate.cvAnalysisResults.skillsMatch.percentage || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{candidate.cvAnalysisResults.skillsMatch.percentage || 0}% match</span>
                        </div>
                      )}

                      {candidate.cvAnalysisResults.strengths && candidate.cvAnalysisResults.strengths.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Strengths</span>
                          <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                            {candidate.cvAnalysisResults.strengths.map((strength, index) => (
                              <li key={index}>{strength}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {candidate.cvAnalysisResults.weaknesses && candidate.cvAnalysisResults.weaknesses.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Areas for Improvement</span>
                          <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                            {candidate.cvAnalysisResults.weaknesses.map((weakness, index) => (
                              <li key={index}>{weakness}</li>
                            ))}
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
                      <p className="text-gray-700 font-medium">Analysis Not Available</p>
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
                    <h4 className="font-medium text-gray-900 mb-3">
                      Skills
                    </h4>
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
                    <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                      {candidate.coverLetter && candidate.coverLetter !== "No cover letter provided" 
                        ? candidate.coverLetter 
                        : "No cover letter provided"}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Expected Salary</h4>
                    <p className="text-gray-700">
                      {candidate.expectedSalary && candidate.expectedSalary !== "Not specified"
                        ? candidate.expectedSalary
                        : "Not specified"}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Notice Period</h4>
                    <p className="text-gray-700">
                      {candidate.noticePeriod && candidate.noticePeriod !== "Not specified"
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
                        {candidate.status === "SUBMITTED" ? "Submitted" : candidate.status.replace("_", " ")}
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
                    disabled={updating || candidate.status === "INTERVIEW_SCHEDULED"}
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
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                note.source === 'USER' ? 'bg-blue-100 text-blue-800' :
                                note.source === 'AI' ? 'bg-purple-100 text-purple-800' :
                                note.source === 'SYSTEM' ? 'bg-gray-100 text-gray-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {note.source === 'USER' 
                                  ? (note.user?.name || note.user?.email || 'USER')
                                  : note.source}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString()}
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
                      <p className="text-xs text-gray-600">{candidate.appliedDate}</p>
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