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
      case "SUBMITTED":
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case "REVIEWING":
        return <EyeIcon className="w-5 h-5 text-blue-500" />;
      case "INTERVIEW_SCHEDULED":
      case "INTERVIEWED":
        return <EyeIcon className="w-5 h-5 text-purple-500" />;
      case "OFFERED":
        return <CheckCircleIcon className="w-5 h-5 text-emerald-500" />;
      case "REJECTED":
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case "WITHDRAWN":
        return <XCircleIcon className="w-5 h-5 text-gray-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-yellow-100 text-yellow-800";
      case "REVIEWING":
        return "bg-blue-100 text-blue-800";
      case "INTERVIEW_SCHEDULED":
      case "INTERVIEWED":
        return "bg-purple-100 text-purple-800";
      case "OFFERED":
        return "bg-emerald-100 text-emerald-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "WITHDRAWN":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
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

  if (error || !application) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-red-50 border border-red-200 rounded-sm p-4">
            <div className="text-red-600 font-medium mb-2">
              Error loading application details
            </div>
            <div className="text-red-500 text-sm">{error || "Application not found"}</div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-600 text-white rounded-sm hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-sm hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
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
              Application{" "}
              <span className="text-primary-600">
                Details
              </span>
            </h1>
            <p className="font-text text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Detailed view of your job application and CV analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Application Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-8">
        {/* Back Button */}
        <div className="max-w-6xl mx-auto mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors font-medium"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Applications</span>
          </button>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Application Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">
                  Application Summary
                </h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Job Details */}
                <div className="bg-gray-50 rounded-sm p-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-sm flex items-center justify-center flex-shrink-0 text-primary-600 font-bold text-lg">
                      {application.job.company.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
                        {application.job.title}
                      </h3>
                      <p className="text-primary-600 font-medium mb-3">
                        {application.job.company.name}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <ClockIcon className="w-4 h-4" />
                        <span>
                          Applied{" "}
                          {new Date(application.appliedAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Card */}
                <div className="bg-white border border-gray-200 rounded-sm p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">
                    Current Status
                  </h4>
                  <div className="flex items-center space-x-3 mb-4">
                    {getStatusIcon(application.status)}
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-medium rounded-sm ${getStatusColor(
                        application.status
                      )}`}
                    >
                      {application.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Status description */}
                  <div className="bg-gray-50 rounded-sm p-3">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {application.status === "SUBMITTED" &&
                        "Your application has been received and is awaiting review."}
                      {application.status === "REVIEWING" &&
                        "Our team is currently reviewing your application."}
                      {application.status === "INTERVIEW_SCHEDULED" &&
                        "Congratulations! An interview has been scheduled."}
                      {application.status === "INTERVIEWED" &&
                        "Your interview has been completed. We're making our decision."}
                      {application.status === "OFFERED" &&
                        "Congratulations! You've received an offer."}
                      {application.status === "REJECTED" &&
                        "Unfortunately, we've decided to move forward with other candidates."}
                      {application.status === "WITHDRAWN" &&
                        "This application has been withdrawn."}
                    </p>
                  </div>
                </div>

                {/* Application Details */}
                <div className="space-y-4">
                  {application.expectedSalary && (
                    <div className="bg-primary-50 rounded-sm p-4 border border-primary-200">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-5 h-5 bg-primary-100 rounded-sm flex items-center justify-center">
                          <svg className="w-3 h-3 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-primary-800">
                          Expected Salary
                        </p>
                      </div>
                      <p className="font-bold text-primary-900 text-xl">
                        {application.expectedSalary}
                      </p>
                    </div>
                  )}

                  {application.coverLetter && (
                    <div className="bg-white border border-gray-200 rounded-sm p-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-5 h-5 bg-blue-100 rounded-sm flex items-center justify-center">
                          <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-gray-700">
                          Your Cover Letter
                        </p>
                      </div>
                      <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-sm border border-gray-100 max-h-32 overflow-y-auto leading-relaxed">
                        {application.coverLetter}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CV Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Analysis Status Header */}
            <div className="bg-white rounded-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary-100 rounded-sm flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Your Application Analysis
                  </h2>
                </div>
                {application.cvAnalysisResults?.summary?.includes("failed") ? (
                  <div className="flex items-center space-x-3 bg-amber-50 px-4 py-2 rounded-sm border border-amber-200">
                    <span className="text-sm font-semibold text-amber-700">
                      Manual Review
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 bg-primary-50 px-4 py-2 rounded-sm border border-primary-200">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600" />
                    <span className="text-sm font-semibold text-primary-700">
                      Analysis Complete
                    </span>
                  </div>
                )}
              </div>

              {application.cvAnalysisResults?.summary?.includes("failed") ? (
                <div className="bg-blue-50 border border-blue-200 rounded-sm p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-sm flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-900 mb-3 text-lg">
                        Your application is under manual review
                      </h3>
                      <p className="text-blue-700 text-sm leading-relaxed">
                        Our HR team is personally reviewing your application and
                        CV. This ensures we give your qualifications the
                        attention they deserve. We'll be in touch soon with
                        feedback and next steps!
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-primary-50 border border-primary-200 rounded-sm p-6">
                  <div className="flex items-start space-x-4">
                    <CheckCircleIcon className="w-8 h-8 text-primary-600 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-bold text-primary-900 mb-3 text-lg">
                        Analysis completed successfully
                      </h3>
                      <p className="text-primary-700 text-sm leading-relaxed">
                        {application.cvAnalysisResults?.summary ||
                          "Your CV has been analyzed against the job requirements."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Only show detailed analysis if CV analysis was successful */}
            {application.cvAnalysisResults &&
              !application.cvAnalysisResults.summary?.includes("failed") && (
                <>
                  {/* Match Score Section */}
                  <div className="bg-white rounded-sm border border-gray-200 p-6 sm:p-8">
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="w-12 h-12 bg-primary-100 rounded-sm flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        Your Match Score
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-6 rounded-sm border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                          <svg className="w-5 h-5 mr-3 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          CV Match Score
                        </h4>
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <div className="w-full bg-primary-200 rounded-sm h-3">
                              <div
                                className={`h-3 rounded-sm transition-all duration-1000 ${getScoreBarColor(
                                  application.cvAnalysisScore
                                )}`}
                                style={{
                                  width: `${Math.max(
                                    application.cvAnalysisScore,
                                    5
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-primary-600 mt-2 font-medium">
                              <span>0</span>
                              <span>50</span>
                              <span>100</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`text-4xl font-bold ${getScoreColor(
                                application.cvAnalysisScore
                              )}`}
                            >
                              {application.cvAnalysisScore}
                            </span>
                            <span className="text-lg text-gray-500">/100</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-sm border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                          <StarIcon className="w-5 h-5 mr-3 text-primary-600" />
                          Overall Assessment
                        </h4>
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-5 h-5 rounded-full ${
                              application.cvAnalysisResults.overallFit ===
                              "Excellent"
                                ? "bg-primary-500"
                                : application.cvAnalysisResults.overallFit ===
                                  "Good"
                                ? "bg-yellow-500"
                                : application.cvAnalysisResults.overallFit ===
                                  "Fair"
                                ? "bg-orange-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          <div className="flex-1">
                            <span className="text-2xl font-bold text-gray-900 block">
                              {application.cvAnalysisResults.overallFit}
                            </span>
                            <span className="text-sm text-gray-500">
                              Fit Rating
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills Analysis */}
                  {(application.cvAnalysisResults.skillsMatch?.matched?.length >
                    0 ||
                    application.cvAnalysisResults.skillsMatch?.missing?.length >
                      0) && (
                    <div className="bg-white rounded-sm border border-gray-200 p-6 sm:p-8">
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="w-12 h-12 bg-primary-100 rounded-sm flex items-center justify-center">
                          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          Skills Match Analysis
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {application.cvAnalysisResults.skillsMatch?.matched
                          ?.length > 0 && (
                          <div className="bg-white p-6 rounded-sm border border-gray-200">
                            <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                              <CheckCircleIcon className="w-5 h-5 mr-3 text-primary-600" />
                              Your Matching Skills (
                              {
                                application.cvAnalysisResults.skillsMatch
                                  .matched.length
                              }
                              )
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {application.cvAnalysisResults.skillsMatch.matched.map(
                                (skill: string, index: number) => (
                                  <span
                                    key={index}
                                    className="px-3 py-2 bg-primary-100 text-primary-800 text-sm rounded-sm border border-primary-300 font-medium flex items-center space-x-1"
                                  >
                                    <span className="text-primary-600">
                                      <CheckCircleIcon className="w-3 h-3" />
                                    </span>
                                    <span>{skill}</span>
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {application.cvAnalysisResults.skillsMatch?.missing
                          ?.length > 0 && (
                          <div className="bg-white p-6 rounded-sm border border-gray-200">
                            <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                              <span className="w-5 h-5 mr-3 text-orange-600 flex items-center justify-center bg-orange-100 rounded-sm text-xs">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                              </span>
                              Skills to Develop (
                              {
                                application.cvAnalysisResults.skillsMatch
                                  .missing.length
                              }
                              )
                            </h4>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {application.cvAnalysisResults.skillsMatch.missing.map(
                                (skill: string, index: number) => (
                                  <span
                                    key={index}
                                    className="px-3 py-2 bg-orange-100 text-orange-800 text-sm rounded-sm border border-orange-300 font-medium flex items-center space-x-1"
                                  >
                                    <span className="text-orange-600">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                      </svg>
                                    </span>
                                    <span>{skill}</span>
                                  </span>
                                )
                              )}
                            </div>
                            <div className="bg-orange-100 rounded-sm p-3 border border-orange-200">
                              <p className="text-xs text-orange-700 italic">
                                <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                Consider highlighting these skills in future
                                applications or developing them through
                                training.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

            {/* AI Recommendations - Show regardless of CV analysis status */}
            {(application.aiCvRecommendations ||
              application.aiInterviewRecommendations) && (
              <div className="bg-white rounded-sm border border-gray-200 p-6 sm:p-8">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-primary-100 rounded-sm flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    AI Career Recommendations
                  </h3>
                </div>

                <div className="space-y-6">
                  {application.aiCvRecommendations && (
                    <div className="bg-white p-8 rounded-sm border border-gray-200">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-10 h-10 bg-primary-100 rounded-sm flex items-center justify-center">
                          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 mb-1">
                            CV Enhancement Tips
                          </h4>
                          <p className="text-gray-600 text-xs">
                            Personalized recommendations to improve your CV
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {application.aiCvRecommendations
                          .split(/\n\s*\n/)
                          .filter((section) => section.trim())
                          .map((section: string, sectionIndex: number) => {
                            // Parse content with better text handling
                            const parseContent = (text: string) => {
                              // Handle **bold** text
                              const parts = text.split(/(\*\*[^*]+\*\*)/g);
                              return parts.map((part, index) => {
                                if (
                                  part.startsWith("**") &&
                                  part.endsWith("**")
                                ) {
                                  return (
                                    <span
                                      key={index}
                                      className="font-medium text-gray-900"
                                    >
                                      {part.slice(2, -2)}
                                    </span>
                                  );
                                }
                                return part;
                              });
                            };

                            // Section headers (###)
                            if (section.trim().startsWith("###")) {
                              const title = section.replace("###", "").trim();
                              return (
                                <div
                                  key={sectionIndex}
                                  className="bg-gray-50 p-4 rounded-sm border border-gray-200"
                                >
                                  <h5 className="font-medium text-gray-900 text-base flex items-center">
                                    <div className="w-5 h-5 bg-primary-100 rounded-sm flex items-center justify-center mr-3">
                                      <span className="w-1.5 h-1.5 bg-primary-600 rounded-full"></span>
                                    </div>
                                    {title}
                                  </h5>
                                </div>
                              );
                            }

                            // List items (-)
                            if (section.trim().startsWith("-")) {
                              const items = section
                                .split("\n")
                                .filter((line) => line.trim().startsWith("-"))
                                .map((line) =>
                                  line.replace(/^-\s*/, "").trim()
                                );

                              return (
                                <div key={sectionIndex} className="space-y-2">
                                  {items.map(
                                    (item: string, itemIndex: number) => (
                                      <div
                                        key={itemIndex}
                                        className="bg-white p-3 rounded-sm border border-gray-200 hover:shadow-sm transition-all duration-200"
                                      >
                                        <div className="flex items-start space-x-3">
                                          <div className="w-5 h-5 bg-primary-100 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                                          </div>
                                          <div className="flex-1">
                                            <p className="text-gray-700 text-xs leading-relaxed">
                                              {parseContent(item)}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              );
                            }

                            // Regular paragraphs
                            if (section.trim()) {
                              return (
                                <div
                                  key={sectionIndex}
                                  className="bg-gray-50 p-3 rounded-sm border border-gray-200"
                                >
                                  <div className="text-gray-700 text-xs leading-relaxed">
                                    {parseContent(section.trim())}
                                  </div>
                                </div>
                              );
                            }

                            return null;
                          })}
                      </div>
                    </div>
                  )}

                  {application.aiInterviewRecommendations && (
                    <div className="bg-white p-8 rounded-sm border border-gray-200">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-10 h-10 bg-primary-100 rounded-sm flex items-center justify-center">
                          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 mb-1">
                            Interview Preparation Guide
                          </h4>
                          <p className="text-gray-600 text-xs">
                            Strategic advice to ace your interview
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {application.aiInterviewRecommendations
                          .split(/\n\s*\n/)
                          .filter((section) => section.trim())
                          .map((section: string, sectionIndex: number) => {
                            // Parse content with better text handling
                            const parseContent = (text: string) => {
                              // Handle **bold** text
                              const parts = text.split(/(\*\*[^*]+\*\*)/g);
                              return parts.map((part, index) => {
                                if (
                                  part.startsWith("**") &&
                                  part.endsWith("**")
                                ) {
                                  return (
                                    <span
                                      key={index}
                                      className="font-medium text-gray-900"
                                    >
                                      {part.slice(2, -2)}
                                    </span>
                                  );
                                }
                                return part;
                              });
                            };

                            // Section headers (###)
                            if (section.trim().startsWith("###")) {
                              const title = section.replace("###", "").trim();
                              return (
                                <div
                                  key={sectionIndex}
                                  className="bg-gray-50 p-4 rounded-sm border border-gray-200"
                                >
                                  <h5 className="font-medium text-gray-900 text-base flex items-center">
                                    <div className="w-5 h-5 bg-primary-100 rounded-sm flex items-center justify-center mr-3">
                                      <span className="w-1.5 h-1.5 bg-primary-600 rounded-full"></span>
                                    </div>
                                    {title}
                                  </h5>
                                </div>
                              );
                            }

                            // List items (-)
                            if (section.trim().startsWith("-")) {
                              const items = section
                                .split("\n")
                                .filter((line) => line.trim().startsWith("-"))
                                .map((line) =>
                                  line.replace(/^-\s*/, "").trim()
                                );

                              return (
                                <div key={sectionIndex} className="space-y-2">
                                  {items.map(
                                    (item: string, itemIndex: number) => (
                                      <div
                                        key={itemIndex}
                                        className="bg-white p-3 rounded-sm border border-gray-200 hover:shadow-sm transition-all duration-200"
                                      >
                                        <div className="flex items-start space-x-3">
                                          <div className="w-5 h-5 bg-primary-100 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                                          </div>
                                          <div className="flex-1">
                                            <p className="text-gray-700 text-xs leading-relaxed">
                                              {parseContent(item)}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              );
                            }

                            // Regular paragraphs
                            if (section.trim()) {
                              return (
                                <div
                                  key={sectionIndex}
                                  className="bg-gray-50 p-3 rounded-sm border border-gray-200"
                                >
                                  <div className="text-gray-700 text-xs leading-relaxed">
                                    {parseContent(section.trim())}
                                  </div>
                                </div>
                              );
                            }

                        return null;
                          })}
                      </div>
                    </div>
                  )}

                  {application.aiSecondInterviewRecommendations && (
                    <div className="bg-white p-8 rounded-sm border border-gray-200">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-10 h-10 bg-primary-100 rounded-sm flex items-center justify-center">
                          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 mb-1">
                            Advanced Interview Strategy
                          </h4>
                          <p className="text-gray-600 text-xs">
                            Expert-level preparation for senior interviews
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {application.aiSecondInterviewRecommendations
                          .split(/\n\s*\n/)
                          .filter((section) => section.trim())
                          .map((section: string, sectionIndex: number) => {
                            // Parse content with better text handling
                            const parseContent = (text: string) => {
                              // Handle **bold** text
                              const parts = text.split(/(\*\*[^*]+\*\*)/g);
                              return parts.map((part, index) => {
                                if (
                                  part.startsWith("**") &&
                                  part.endsWith("**")
                                ) {
                                  return (
                                    <span
                                      key={index}
                                      className="font-medium text-gray-900"
                                    >
                                      {part.slice(2, -2)}
                                    </span>
                                  );
                                }
                                return part;
                              });
                            };

                            // Section headers (###)
                            if (section.trim().startsWith("###")) {
                              const title = section.replace("###", "").trim();
                              return (
                                <div
                                  key={sectionIndex}
                                  className="bg-gray-50 p-4 rounded-sm border border-gray-200"
                                >
                                  <h5 className="font-medium text-gray-900 text-base flex items-center">
                                    <div className="w-5 h-5 bg-primary-100 rounded-sm flex items-center justify-center mr-3">
                                      <span className="w-1.5 h-1.5 bg-primary-600 rounded-full"></span>
                                    </div>
                                    {title}
                                  </h5>
                                </div>
                              );
                            }

                            // List items (-)
                            if (section.trim().startsWith("-")) {
                              const items = section
                                .split("\n")
                                .filter((line) => line.trim().startsWith("-"))
                                .map((line) =>
                                  line.replace(/^-\s*/, "").trim()
                                );

                              return (
                                <div key={sectionIndex} className="space-y-2">
                                  {items.map(
                                    (item: string, itemIndex: number) => (
                                      <div
                                        key={itemIndex}
                                        className="bg-white p-3 rounded-sm border border-gray-200 hover:shadow-sm transition-all duration-200"
                                      >
                                        <div className="flex items-start space-x-3">
                                          <div className="w-5 h-5 bg-primary-100 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                                          </div>
                                          <div className="flex-1">
                                            <p className="text-gray-700 text-xs leading-relaxed">
                                              {parseContent(item)}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              );
                            }

                            // Regular paragraphs
                            if (section.trim()) {
                              return (
                                <div
                                  key={sectionIndex}
                                  className="bg-gray-50 p-3 rounded-sm border border-gray-200"
                                >
                                  <div className="text-gray-700 text-xs leading-relaxed">
                                    {parseContent(section.trim())}
                                  </div>
                                </div>
                              );
                            }

                            return null;
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Loading state for when no CV analysis results exist */}
            {!application.cvAnalysisResults && (
              <div className="bg-white rounded-sm border border-gray-200 p-12">
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary-100 rounded-sm flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-primary-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Analysis In Progress
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg leading-relaxed">
                    Our AI is carefully reviewing your CV against the job
                    requirements. This usually takes just a few minutes!
                  </p>
                  <div className="inline-flex items-center space-x-3 bg-primary-50 px-6 py-4 rounded-sm border border-primary-200">
                    <div className="w-3 h-3 bg-primary-600 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-primary-700">
                      Processing your application...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
