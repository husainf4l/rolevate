"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowLeftIcon,
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

  const jobId = params.jobId as string;

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
      <div className="flex-1 min-h-screen bg-[#fafbfc]">
        <div className="container-corporate py-12">
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="w-16 h-16 glass rounded-3xl flex items-center justify-center mx-auto mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#13ead9] border-t-transparent"></div>
              </div>
              <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">
                Loading Application Details
              </h3>
              <p className="text-[#6b7280]">
                Please wait while we fetch your application information...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex-1 min-h-screen bg-[#fafbfc]">
        <div className="container-corporate py-12">
          <div className="flex items-center justify-center py-24">
            <div className="glass-strong rounded-3xl p-8 max-w-md w-full" style={{boxShadow: "var(--shadow-medium)"}}>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <XCircleIcon className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-red-600 mb-3">
                  Error Loading Application
                </h3>
                <p className="text-red-500 text-sm mb-6">
                  {error || "Application not found"}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => router.back()}
                    className="flex-1 px-4 py-3 bg-[#6b7280] text-white rounded-2xl hover:bg-[#4b5563] transition-all duration-200 text-sm font-medium"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all duration-200 text-sm font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-[#fafbfc]">
      <div className="container-corporate py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center space-x-2 text-[#6b7280] hover:text-[#0891b2] transition-all duration-200 mb-6 group"
          >
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Applications</span>
          </button>
          <div className="glass-strong rounded-3xl p-8" style={{boxShadow: "var(--shadow-soft)"}}>
            <h1 className="text-4xl font-bold text-[#1d1d1f] mb-3">
              Application Details
            </h1>
            <p className="text-[#6b7280] text-lg">
              Detailed view of your job application and CV analysis.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Information */}
          <div className="lg:col-span-1">
            <div className="glass-strong rounded-3xl overflow-hidden sticky top-8" style={{boxShadow: "var(--shadow-medium)"}}>
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-[#13ead9] to-[#0891b2] p-6 text-white">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                    <span className="text-xl">📋</span>
                  </div>
                  <h2 className="text-xl font-bold">Application Summary</h2>
                </div>
                <p className="text-white/80 text-sm">
                  Track your progress and status
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Job Details */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 text-xl font-bold">
                        {application.job.company.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">
                        {application.job.title}
                      </h3>
                      <p className="text-primary-600 font-semibold mb-3">
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
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                    Current Status
                  </h4>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(application.status)}
                    </div>
                    <div className="flex-1">
                      <span
                        className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {application.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Status description */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {application.status === "SUBMITTED" &&
                        "Your application has been received and is awaiting review."}
                      {application.status === "REVIEWING" &&
                        "Our team is currently reviewing your application."}
                      {application.status === "INTERVIEW_SCHEDULED" &&
                        "Congratulations! An interview has been scheduled."}
                      {application.status === "INTERVIEWED" &&
                        "Your interview has been completed. We're making our decision."}
                      {application.status === "OFFERED" &&
                        "🎉 Congratulations! You've received an offer."}
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
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-green-600 text-lg">💰</span>
                        </div>
                        <p className="text-sm font-semibold text-green-800">
                          Expected Salary
                        </p>
                      </div>
                      <p className="font-bold text-green-900 text-xl ml-11">
                        {application.expectedSalary}
                      </p>
                    </div>
                  )}

                  {application.coverLetter && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 text-lg">📝</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-700">
                          Your Cover Letter
                        </p>
                      </div>
                      <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 max-h-32 overflow-y-auto leading-relaxed">
                        {application.coverLetter}
                      </div>
                    </div>
                  )}
                </div>

                {/* Next Steps */}
                {application.status === "SUBMITTED" && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                    <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-blue-600">⏭️</span>
                      </div>
                      What's Next?
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-2 ml-11">
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Our team will review your application</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>You'll receive an update within 3-5 business days</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>If selected, we'll contact you for an interview</span>
                      </li>
                    </ul>
                  </div>
                )}

                {application.status === "REVIEWING" && (
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-5 border border-yellow-200">
                    <h4 className="text-sm font-bold text-yellow-900 mb-3 flex items-center">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-yellow-600">👀</span>
                      </div>
                      Under Review
                    </h4>
                    <p className="text-sm text-yellow-800 leading-relaxed ml-11">
                      Great news! Your application caught our attention and is
                      being carefully reviewed by our hiring team.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CV Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Analysis Status Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <span className="text-primary-600 text-xl">📊</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Your Application Analysis
                  </h2>
                </div>
                {application.cvAnalysisResults?.summary?.includes("failed") ? (
                  <div className="flex items-center space-x-3 bg-amber-50 px-4 py-3 rounded-xl border border-amber-200">
                    <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-amber-700">
                      Manual Review
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 bg-green-50 px-4 py-3 rounded-xl border border-green-200">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">
                      Analysis Complete
                    </span>
                  </div>
                )}
              </div>

              {application.cvAnalysisResults?.summary?.includes("failed") ? (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-2xl">👥</span>
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
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-start space-x-4">
                    <CheckCircleIcon className="w-8 h-8 text-green-600 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-bold text-green-900 mb-3 text-lg">
                        Analysis completed successfully
                      </h3>
                      <p className="text-green-700 text-sm leading-relaxed">
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
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                        <span className="text-primary-600 text-xl">📈</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        Your Match Score
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-xl border border-primary-200">
                        <h4 className="text-sm font-semibold text-primary-800 mb-4 flex items-center">
                          <span className="mr-3">🎯</span>
                          CV Match Score
                        </h4>
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <div className="w-full bg-primary-200 rounded-full h-3">
                              <div
                                className={`h-3 rounded-full transition-all duration-1000 ${getScoreBarColor(
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

                      <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-xl border border-purple-200">
                        <h4 className="text-sm font-semibold text-purple-800 mb-4 flex items-center">
                          <span className="mr-3">🌟</span>
                          Overall Assessment
                        </h4>
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-5 h-5 rounded-full ${
                              application.cvAnalysisResults.overallFit ===
                              "Excellent"
                                ? "bg-green-500"
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
                            <span className="text-sm text-gray-500">Fit Rating</span>
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
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                          <span className="text-primary-600 text-xl">🎯</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          Skills Match Analysis
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {application.cvAnalysisResults.skillsMatch?.matched
                          ?.length > 0 && (
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                            <h4 className="text-sm font-bold text-green-800 mb-4 flex items-center">
                              <CheckCircleIcon className="w-5 h-5 mr-3" />
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
                                    className="px-3 py-2 bg-green-100 text-green-800 text-sm rounded-full border border-green-300 font-medium flex items-center space-x-1"
                                  >
                                    <span className="text-green-600">✓</span>
                                    <span>{skill}</span>
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {application.cvAnalysisResults.skillsMatch?.missing
                          ?.length > 0 && (
                          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
                            <h4 className="text-sm font-bold text-orange-800 mb-4 flex items-center">
                              <span className="w-5 h-5 mr-3 text-orange-600 flex items-center justify-center bg-orange-100 rounded-full text-xs">
                                ⚡
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
                                    className="px-3 py-2 bg-orange-100 text-orange-800 text-sm rounded-full border border-orange-300 font-medium flex items-center space-x-1"
                                  >
                                    <span className="text-orange-600">📚</span>
                                    <span>{skill}</span>
                                  </span>
                                )
                              )}
                            </div>
                            <div className="bg-orange-100 rounded-lg p-3 border border-orange-200">
                              <p className="text-xs text-orange-700 italic">
                                💡 Consider highlighting these skills in future
                                applications or developing them through training.
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
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 hover:shadow-md transition-all duration-300">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <span className="text-purple-600 text-xl">🤖</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    AI Career Recommendations
                  </h3>
                </div>

                <div className="space-y-6">
                  {application.aiCvRecommendations && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <span className="text-blue-600 text-lg">📄</span>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">
                          CV Enhancement Tips
                        </h4>
                      </div>
                      <div className="text-gray-800 max-w-none">
                        <div className="space-y-4">
                          {application.aiCvRecommendations
                            .split("\n\n")
                            .map((section: string, sectionIndex: number) => {
                              if (section.trim().startsWith("###")) {
                                const title = section.replace("###", "").trim();
                                return (
                                  <div
                                    key={sectionIndex}
                                    className="bg-white rounded-xl p-5 border border-blue-200 shadow-sm"
                                  >
                                    <h5 className="font-bold text-gray-900 text-lg mb-2 flex items-center">
                                      <span className="w-3 h-3 bg-primary-600 rounded-full mr-3"></span>
                                      {title}
                                    </h5>
                                  </div>
                                );
                              } else if (
                                section.trim().startsWith("**") &&
                                section.trim().endsWith("**")
                              ) {
                                const boldText = section
                                  .replace(/\*\*/g, "")
                                  .trim();
                                return (
                                  <div
                                    key={sectionIndex}
                                    className="bg-blue-50 rounded-xl p-4 border-l-4 border-primary-600"
                                  >
                                    <p className="font-bold text-gray-900 text-base">
                                      {boldText}
                                    </p>
                                  </div>
                                );
                              } else if (section.trim().startsWith("-")) {
                                const items = section
                                  .split("\n")
                                  .filter((line) =>
                                    line.trim().startsWith("-")
                                  );
                                return (
                                  <div key={sectionIndex} className="space-y-2">
                                    {items.map(
                                      (item: string, itemIndex: number) => {
                                        const cleanItem = item
                                          .replace(/^-\s*/, "")
                                          .trim();
                                        const splitResult =
                                          cleanItem.split(":");
                                        const boldPart = splitResult[0] || "";
                                        const description = splitResult
                                          .slice(1)
                                          .join(":")
                                          .trim();

                                        return (
                                          <div
                                            key={itemIndex}
                                            className="flex items-start space-x-3 bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-all duration-200"
                                          >
                                            <div className="w-2 h-2 bg-[#0891b2] rounded-full mt-2 flex-shrink-0"></div>
                                            <div className="flex-1">
                                              {description ? (
                                                <>
                                                  <span className="font-semibold text-gray-900 text-sm">
                                                    {boldPart.replace(
                                                      /\*\*/g,
                                                      ""
                                                    )}
                                                    :
                                                  </span>
                                                  <span className="text-gray-600 text-sm ml-1">
                                                    {description}
                                                  </span>
                                                </>
                                              ) : (
                                                <span className="text-gray-700 text-sm">
                                                  {boldPart.replace(
                                                    /\*\*/g,
                                                    ""
                                                  )}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                );
                              } else if (section.trim()) {
                                return (
                                  <div
                                    key={sectionIndex}
                                    className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-200"
                                  >
                                    {section
                                      .split("\n")
                                      .map(
                                        (line: string, lineIndex: number) => (
                                          <p
                                            key={lineIndex}
                                            className="mb-2 last:mb-0"
                                          >
                                            {line.replace(/\*\*/g, "").trim()}
                                          </p>
                                        )
                                      )}
                                  </div>
                                );
                              }
                              return null;
                            })}
                        </div>
                      </div>
                    </div>
                  )}

                  {application.aiInterviewRecommendations && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="mr-2">🎤</span>
                        Interview Preparation Guide
                      </h4>
                      <div className="text-gray-800 max-w-none">
                        <div className="space-y-4">
                          {application.aiInterviewRecommendations
                            .split("\n\n")
                            .map((section: string, sectionIndex: number) => {
                              if (section.trim().startsWith("###")) {
                                const title = section.replace("###", "").trim();
                                return (
                                  <div
                                    key={sectionIndex}
                                    className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                                  >
                                    <h5 className="font-semibold text-gray-900 text-base mb-2 flex items-center">
                                      <span className="w-2 h-2 bg-[#0891b2] rounded-full mr-3"></span>
                                      {title}
                                    </h5>
                                  </div>
                                );
                              } else if (
                                section.trim().startsWith("**") &&
                                section.trim().endsWith("**")
                              ) {
                                const boldText = section
                                  .replace(/\*\*/g, "")
                                  .trim();
                                return (
                                  <div
                                    key={sectionIndex}
                                    className="bg-gray-50 rounded-lg p-3 border-l-4 border-[#0891b2]"
                                  >
                                    <p className="font-semibold text-gray-900 text-sm">
                                      {boldText}
                                    </p>
                                  </div>
                                );
                              } else if (section.trim().startsWith("-")) {
                                const items = section
                                  .split("\n")
                                  .filter((line) =>
                                    line.trim().startsWith("-")
                                  );
                                return (
                                  <div key={sectionIndex} className="space-y-2">
                                    {items.map(
                                      (item: string, itemIndex: number) => {
                                        const cleanItem = item
                                          .replace(/^-\s*/, "")
                                          .trim();
                                        const splitResult =
                                          cleanItem.split(":");
                                        const boldPart = splitResult[0] || "";
                                        const description = splitResult
                                          .slice(1)
                                          .join(":")
                                          .trim();

                                        return (
                                          <div
                                            key={itemIndex}
                                            className="flex items-start space-x-3 bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-all duration-200"
                                          >
                                            <div className="w-2 h-2 bg-[#0891b2] rounded-full mt-2 flex-shrink-0"></div>
                                            <div className="flex-1">
                                              {description ? (
                                                <>
                                                  <span className="font-semibold text-gray-900 text-sm">
                                                    {boldPart.replace(
                                                      /\*\*/g,
                                                      ""
                                                    )}
                                                    :
                                                  </span>
                                                  <span className="text-gray-600 text-sm ml-1">
                                                    {description}
                                                  </span>
                                                </>
                                              ) : (
                                                <span className="text-gray-700 text-sm">
                                                  {boldPart.replace(
                                                    /\*\*/g,
                                                    ""
                                                  )}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                );
                              } else if (section.trim()) {
                                return (
                                  <div
                                    key={sectionIndex}
                                    className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-200"
                                  >
                                    {section
                                      .split("\n")
                                      .map(
                                        (line: string, lineIndex: number) => (
                                          <p
                                            key={lineIndex}
                                            className="mb-2 last:mb-0"
                                          >
                                            {line.replace(/\*\*/g, "").trim()}
                                          </p>
                                        )
                                      )}
                                  </div>
                                );
                              }
                              return null;
                            })}
                        </div>
                      </div>
                    </div>
                  )}

                  {application.aiSecondInterviewRecommendations && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="mr-2">🚀</span>
                        Advanced Interview Strategy
                      </h4>
                      <div className="text-gray-800 max-w-none">
                        <div className="space-y-4">
                          {application.aiSecondInterviewRecommendations
                            .split("\n\n")
                            .map((section: string, sectionIndex: number) => {
                              if (section.trim().startsWith("###")) {
                                const title = section.replace("###", "").trim();
                                return (
                                  <div
                                    key={sectionIndex}
                                    className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                                  >
                                    <h5 className="font-semibold text-gray-900 text-base mb-2 flex items-center">
                                      <span className="w-2 h-2 bg-[#0891b2] rounded-full mr-3"></span>
                                      {title}
                                    </h5>
                                  </div>
                                );
                              } else if (
                                section.trim().startsWith("**") &&
                                section.trim().endsWith("**")
                              ) {
                                const boldText = section
                                  .replace(/\*\*/g, "")
                                  .trim();
                                return (
                                  <div
                                    key={sectionIndex}
                                    className="bg-gray-50 rounded-lg p-3 border-l-4 border-[#0891b2]"
                                  >
                                    <p className="font-semibold text-gray-900 text-sm">
                                      {boldText}
                                    </p>
                                  </div>
                                );
                              } else if (section.trim().startsWith("-")) {
                                const items = section
                                  .split("\n")
                                  .filter((line) =>
                                    line.trim().startsWith("-")
                                  );
                                return (
                                  <div key={sectionIndex} className="space-y-2">
                                    {items.map(
                                      (item: string, itemIndex: number) => {
                                        const cleanItem = item
                                          .replace(/^-\s*/, "")
                                          .trim();
                                        const splitResult =
                                          cleanItem.split(":");
                                        const boldPart = splitResult[0] || "";
                                        const description = splitResult
                                          .slice(1)
                                          .join(":")
                                          .trim();

                                        return (
                                          <div
                                            key={itemIndex}
                                            className="flex items-start space-x-3 bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-all duration-200"
                                          >
                                            <div className="w-2 h-2 bg-[#0891b2] rounded-full mt-2 flex-shrink-0"></div>
                                            <div className="flex-1">
                                              {description ? (
                                                <>
                                                  <span className="font-semibold text-gray-900 text-sm">
                                                    {boldPart.replace(
                                                      /\*\*/g,
                                                      ""
                                                    )}
                                                    :
                                                  </span>
                                                  <span className="text-gray-600 text-sm ml-1">
                                                    {description}
                                                  </span>
                                                </>
                                              ) : (
                                                <span className="text-gray-700 text-sm">
                                                  {boldPart.replace(
                                                    /\*\*/g,
                                                    ""
                                                  )}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                );
                              } else if (section.trim()) {
                                return (
                                  <div
                                    key={sectionIndex}
                                    className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-200"
                                  >
                                    {section
                                      .split("\n")
                                      .map(
                                        (line: string, lineIndex: number) => (
                                          <p
                                            key={lineIndex}
                                            className="mb-2 last:mb-0"
                                          >
                                            {line.replace(/\*\*/g, "").trim()}
                                          </p>
                                        )
                                      )}
                                  </div>
                                );
                              }
                              return null;
                            })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Loading state for when no CV analysis results exist */}
            {!application.cvAnalysisResults && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12 hover:shadow-md transition-all duration-300">
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <div className="text-4xl animate-pulse">⏳</div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Analysis In Progress
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg leading-relaxed">
                    Our AI is carefully reviewing your CV against the job
                    requirements. This usually takes just a few minutes!
                  </p>
                  <div className="inline-flex items-center space-x-3 bg-primary-50 px-6 py-4 rounded-xl border border-primary-200">
                    <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
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
