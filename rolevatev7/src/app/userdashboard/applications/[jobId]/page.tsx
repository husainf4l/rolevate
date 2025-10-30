"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowLeftIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import {
  getCandidateApplicationDetails,
  Application,
} from "@/services/application";

export default function ApplicationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const jobId = params?.jobId as string;

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      if (!jobId) return;

      try {
        setLoading(true);
        setError(null);
        const applicationDetails = await getCandidateApplicationDetails(jobId);
        setApplication(applicationDetails);
      } catch (err) {
        console.error("Error fetching application details:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch application details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [jobId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <ClockIcon className="w-4 h-4 text-gray-400" />;
      case "REVIEWED":
        return <EyeIcon className="w-4 h-4 text-gray-400" />;
      case "SHORTLISTED":
      case "INTERVIEWED":
        return <EyeIcon className="w-4 h-4 text-gray-400" />;
      case "OFFERED":
        return <CheckCircleIcon className="w-4 h-4 text-gray-900" />;
      case "REJECTED":
        return <XCircleIcon className="w-4 h-4 text-gray-400" />;
      case "WITHDRAWN":
        return <XCircleIcon className="w-4 h-4 text-gray-400" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border border-gray-200 border-t-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-lg font-semibold text-gray-900 mb-4">Error loading application</h1>
            <p className="text-gray-600 text-sm mb-6">{error || "Application not found"}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Minimalist Header */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-1">
            Application Details
          </h1>
          <p className="text-gray-500 text-base">
            Review your application and career insights
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="max-w-6xl mx-auto mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden sticky top-8">
              {/* Job Details */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 font-semibold text-gray-900 text-sm">
                    {application.job.company?.name?.charAt(0).toUpperCase() || 'C'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">
                      {application.job.title}
                    </h3>
                    <p className="text-gray-600 font-medium text-sm mb-2">
                      {application.job.company?.name || 'Unknown'}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Applied {new Date(application.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="p-6 border-b border-gray-200">
                <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Status</h4>
                <div className="flex items-center space-x-2 mb-3">
                  {getStatusIcon(application.status)}
                  <span className="text-sm font-medium text-gray-900">{application.status.replace('_', ' ')}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {application.status === 'PENDING' && 'Awaiting review from the hiring team.'}
                  {application.status === 'REVIEWED' && 'Your application is being reviewed.'}
                  {application.status === 'SHORTLISTED' && 'Interview scheduled.'}
                  {application.status === 'INTERVIEWED' && 'Decision pending.'}
                  {application.status === 'OFFERED' && 'You have received an offer!'}
                  {application.status === 'REJECTED' && 'We moved forward with other candidates.'}
                  {application.status === 'WITHDRAWN' && 'Application withdrawn.'}
                </p>
              </div>

              {/* Additional Info */}
              {(application.expectedSalary || application.coverLetter) && (
                <div className="p-6 space-y-4">
                  {application.expectedSalary && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Expected Salary</h4>
                      <p className="text-base font-semibold text-gray-900">{application.expectedSalary}</p>
                    </div>
                  )}
                  {application.coverLetter && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Cover Letter</h4>
                      <p className="text-xs text-gray-600 line-clamp-3">{application.coverLetter}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Analysis Status */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Application Analysis
                </h2>
                {application.cvAnalysisResults?.detailed_feedback?.includes("failed") ? (
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Manual Review</span>
                ) : (
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Complete</span>
                )}
              </div>

              {application.cvAnalysisResults?.detailed_feedback?.includes("failed") ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    Our team is personally reviewing your application to ensure your qualifications receive proper attention.
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    {application.cvAnalysisResults?.detailed_feedback || 'Your CV has been analyzed against the job requirements.'}
                  </p>
                </div>
              )}
            </div>

            {/* Match Score */}
            {application.cvAnalysisResults &&
              !application.cvAnalysisResults.detailed_feedback?.includes("failed") && (
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left: Large Score */}
                    <div className="md:col-span-1 flex flex-col justify-center items-start">
                      <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide font-semibold">Match Score</p>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-5xl font-bold text-gray-900">{application.cvAnalysisScore || 0}</span>
                        <span className="text-xl text-gray-400 font-light">/100</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mt-3">
                        {application.cvAnalysisResults.recommendation || 'Fair'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Fit Rating</p>
                    </div>

                    {/* Middle: Progress Bar */}
                    <div className="md:col-span-1">
                      <p className="text-xs text-gray-500 mb-4 uppercase tracking-wide font-semibold">Overall Compatibility</p>
                      <div className="w-full bg-gray-200 rounded-full h-4 mb-3 overflow-hidden">
                        <div
                          className="h-4 bg-gray-900 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.max(application.cvAnalysisScore || 0, 2)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 font-medium">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Right: Description */}
                    <div className="md:col-span-1">
                      <p className="text-xs text-gray-500 mb-4 uppercase tracking-wide font-semibold">Assessment</p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {(application.cvAnalysisScore ?? 0) >= 80 && 'Excellent alignment with position requirements. Your profile is a strong match.'}
                        {(application.cvAnalysisScore ?? 0) >= 60 && (application.cvAnalysisScore ?? 0) < 80 && 'Good qualifications and alignment with the role. Well-suited candidate.'}
                        {(application.cvAnalysisScore ?? 0) >= 40 && (application.cvAnalysisScore ?? 0) < 60 && 'Fair match meeting several key requirements. Consider highlighting strengths.'}
                        {(application.cvAnalysisScore ?? 0) < 40 && 'Developing fit. Focus on building skills relevant to this role.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Skills Analysis */}
            {application.cvAnalysisResults &&
              !application.cvAnalysisResults.detailed_feedback?.includes("failed") &&
              (application.cvAnalysisResults.skills_matched?.length > 0 ||
                application.cvAnalysisResults.skills_missing?.length > 0) && (
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  {/* Header with stats */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-8 border-b border-gray-200">
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-2">Skills Match</h3>
                      <p className="text-sm text-gray-600">
                        {application.cvAnalysisResults.skills_matched?.length || 0} matched · {application.cvAnalysisResults.skills_missing?.length || 0} to develop
                      </p>
                    </div>
                    
                    {/* Coverage badge */}
                    <div className="mt-4 md:mt-0 inline-flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                      <span className="text-sm font-semibold text-gray-900">
                        {Math.round(
                          ((application.cvAnalysisResults.skills_matched?.length || 0) /
                            ((application.cvAnalysisResults.skills_matched?.length || 0) + (application.cvAnalysisResults.skills_missing?.length || 0))) *
                            100
                        ) || 0}%
                      </span>
                      <span className="text-xs text-gray-600">Coverage</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Matched Skills */}
                    {application.cvAnalysisResults.skills_matched?.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          Matched Skills
                        </h4>
                        <div className="space-y-2">
                          {application.cvAnalysisResults.skills_matched.map((skill: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-900 flex-shrink-0"></div>
                              <span className="text-sm font-medium text-gray-900">{skill}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Skills */}
                    {application.cvAnalysisResults.skills_missing?.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          To Develop
                        </h4>
                        <div className="space-y-2">
                          {application.cvAnalysisResults.skills_missing.map((skill: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0"></div>
                              <span className="text-sm font-medium text-gray-900">{skill}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* AI Recommendations */}
            {(application.aiCvRecommendations || application.aiInterviewRecommendations) && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Career Recommendations</h3>

                <div className="space-y-6">
                  {application.aiCvRecommendations && (
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 mb-4">CV Enhancement Tips</h4>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
                        {application.aiCvRecommendations}
                      </div>
                    </div>
                  )}

                  {application.aiInterviewRecommendations && (
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 mb-4">Interview Preparation</h4>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
                        {application.aiInterviewRecommendations}
                      </div>
                    </div>
                  )}

                  {application.aiSecondInterviewRecommendations && (
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 mb-4">Advanced Interview Strategy</h4>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
                        {application.aiSecondInterviewRecommendations}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Loading State */}
            {!application.cvAnalysisResults && (
              <div className="bg-white rounded-lg border border-gray-200 p-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Analysis In Progress</h3>
                  <p className="text-gray-600 text-sm mb-6">Our AI is reviewing your CV. This usually takes a few minutes.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
