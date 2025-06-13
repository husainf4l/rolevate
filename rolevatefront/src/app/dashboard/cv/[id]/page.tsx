"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  getApplicationById,
  Application,
  updateApplication,
  ApplicationStatus,
} from "@/services/applications.service";
import {
  getCvAnalysesByApplication,
  generateCvAnalysis,
  CVAnalysis,
} from "@/services/cv-analysis.service";

const ApplicationDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cvAnalysis, setCvAnalysis] = useState<CVAnalysis | null>(null);
  const [countdowns, setCountdowns] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch application data
        const applicationData = await getApplicationById(applicationId); // Check if the response includes interviews data and format accordingly
        const interviews = Array.isArray(applicationData.interviews)
          ? applicationData.interviews
          : applicationData.interviews
          ? [applicationData.interviews]
          : [];

        // Sort interviews by scheduled date (most recent first)
        const sortedInterviews = [...interviews].sort(
          (a, b) =>
            new Date(b.scheduledAt).getTime() -
            new Date(a.scheduledAt).getTime()
        );

        const appWithInterviews = {
          ...applicationData,
          interviews: sortedInterviews,
        };

        setApplication(appWithInterviews);

        // Fetch CV analysis data
        try {
          const analyses = await getCvAnalysesByApplication(applicationId);
          if (analyses && analyses.length > 0) {
            setCvAnalysis(analyses[0]); // Get the first/latest analysis
          } else {
            // If no analysis exists, create one using the generate function
            const generatedAnalysis = await generateCvAnalysis(applicationId);
            setCvAnalysis(generatedAnalysis);
          }
        } catch (error) {
          console.warn("Error fetching CV analysis:", error);
          // Fall back to generating one
          const generatedAnalysis = await generateCvAnalysis(applicationId);
          setCvAnalysis(generatedAnalysis);
        }
      } catch (err) {
        console.error("Error fetching application details:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load application details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (applicationId) {
      fetchApplicationData();
    }
  }, [applicationId]);

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (!application) return;

    try {
      // In a real implementation, this would update the status
      // For now, just show it working in the UI
      setApplication({
        ...application,
        status: newStatus,
      });

      // In real implementation, uncomment:
      // await updateApplication(applicationId, { status: newStatus });
    } catch (err) {
      console.error("Error updating application status:", err);
      // Revert the status in the UI
      setApplication(application);
    }
  };

  const handleScheduleInterview = () => {
    // Check if the interview is already scheduled
    if (application?.status === ApplicationStatus.INTERVIEW_SCHEDULED) {
      // If interview is already scheduled, show different message or navigate to view interview
      router.push(`/dashboard/interviews/${applicationId}`);
    } else {
      // If not scheduled, allow scheduling
      router.push(`/dashboard/interview/schedule/${applicationId}`);
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function to get status color
  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING:
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300";
      case ApplicationStatus.SCREENING:
        return "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300";
      case ApplicationStatus.INTERVIEW_SCHEDULED:
        return "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300";
      case ApplicationStatus.INTERVIEWED:
        return "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300";
      case ApplicationStatus.SHORTLISTED:
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300";
      case ApplicationStatus.REJECTED:
        return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300";
      case ApplicationStatus.HIRED:
        return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  // Helper function for score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-500 dark:text-emerald-400";
    if (score >= 75) return "text-blue-500 dark:text-blue-400";
    if (score >= 60) return "text-amber-500 dark:text-amber-400";
    return "text-red-500 dark:text-red-400";
  };

  // Helper function for score stroke color
  const getScoreStrokeColor = (score: number) => {
    if (score >= 90) return "stroke-emerald-500 dark:stroke-emerald-400";
    if (score >= 75) return "stroke-blue-500 dark:stroke-blue-400";
    if (score >= 60) return "stroke-amber-500 dark:stroke-amber-400";
    return "stroke-red-500 dark:stroke-red-400";
  };

  // Helper function to calculate countdown
  const calculateTimeLeft = (scheduledDate: string) => {
    const difference = new Date(scheduledDate).getTime() - new Date().getTime();

    if (difference <= 0) {
      return "Starting now";
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    let timeLeft = "";
    if (days > 0) timeLeft += `${days}d `;
    if (hours > 0 || days > 0) timeLeft += `${hours}h `;
    timeLeft += `${minutes}m`;

    return timeLeft;
  };

  // Update countdown every minute
  useEffect(() => {
    if (!application?.interviews?.length) return;

    // Initial calculation
    const initialCountdowns: { [key: string]: string } = {};
    application.interviews.forEach((interview) => {
      if (
        interview.status !== "COMPLETED" &&
        interview.status !== "CANCELLED" &&
        interview.scheduledAt
      ) {
        initialCountdowns[interview.id] = calculateTimeLeft(
          interview.scheduledAt
        );
      }
    });
    setCountdowns(initialCountdowns);

    // Set up interval
    const intervalId = setInterval(() => {
      const updatedCountdowns: { [key: string]: string } = {};
      application.interviews.forEach((interview) => {
        if (
          interview.status !== "COMPLETED" &&
          interview.status !== "CANCELLED" &&
          interview.scheduledAt
        ) {
          updatedCountdowns[interview.id] = calculateTimeLeft(
            interview.scheduledAt
          );
        }
      });
      setCountdowns(updatedCountdowns);
    }, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, [application?.interviews]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
            <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Loading Application
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Please wait while we fetch the details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.081 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Application Not Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error ||
              "The application you're looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => router.push("/dashboard/cv")}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Return to Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
        <Link
          href="/dashboard"
          className="hover:text-gray-700 dark:hover:text-gray-300"
        >
          Dashboard
        </Link>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <Link
          href="/dashboard/cv"
          className="hover:text-gray-700 dark:hover:text-gray-300"
        >
          Applications
        </Link>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span className="text-gray-900 dark:text-white font-medium">
          {application.candidate.fullName ||
            application.candidate.firstName ||
            "Application"}
        </span>
      </nav>

      {/* Modern header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/cv">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {application.candidate.fullName ||
                application.candidate.firstName ||
                "Candidate"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Applied for {application.jobPost.title} at{" "}
              {application.jobPost.company.displayName ||
                application.jobPost.company.name}
            </p>
          </div>
        </div>
        <button
          onClick={handleScheduleInterview}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm"
        >
          {application.status === ApplicationStatus.INTERVIEW_SCHEDULED
            ? "View Interview"
            : "Schedule Interview"}
        </button>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Primary content */}

        {/* Sidebar: CV Analysis */}
        <div className="xl:col-span-2 space-y-8">
          {cvAnalysis && (
            <>
              {/* CV Score Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  CV Analysis
                </h3>

                <div className="text-center mb-8">
                  <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                    {/* Circular progress background */}
                    <svg
                      className="w-32 h-32 transform -rotate-90"
                      viewBox="0 0 120 120"
                    >
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 54}`}
                        strokeDashoffset={`${
                          2 *
                          Math.PI *
                          54 *
                          (1 - (cvAnalysis.overallScore || 0) / 100)
                        }`}
                        className={getScoreStrokeColor(
                          cvAnalysis.overallScore || 0
                        )}
                        strokeLinecap="round"
                      />
                    </svg>
                    {/* Score text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className={`text-3xl font-bold ${getScoreColor(
                          cvAnalysis.overallScore || 0
                        )}`}
                      >
                        {cvAnalysis.overallScore || 0}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    Overall Match Score
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Skills Match
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {cvAnalysis.skillsScore || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${cvAnalysis.skillsScore || 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Experience
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {cvAnalysis.experienceScore || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-1000 ease-out delay-150"
                        style={{ width: `${cvAnalysis.experienceScore || 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Education
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {cvAnalysis.educationScore || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out delay-300"
                        style={{ width: `${cvAnalysis.educationScore || 0}%` }}
                      />
                    </div>
                  </div>

                  {cvAnalysis.certificationScore && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Certifications
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {cvAnalysis.certificationScore}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-3 rounded-full transition-all duration-1000 ease-out delay-450"
                          style={{ width: `${cvAnalysis.certificationScore}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {cvAnalysis.languageScore && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Languages
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {cvAnalysis.languageScore}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-teal-500 to-teal-600 h-3 rounded-full transition-all duration-1000 ease-out delay-600"
                          style={{ width: `${cvAnalysis.languageScore}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills & Insights */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Key Insights
                </h3>

                {cvAnalysis.summary && (
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                      Summary
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-200">
                      {cvAnalysis.summary}
                    </p>
                  </div>
                )}

                {cvAnalysis.strengths && cvAnalysis.strengths.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-3">
                      Strengths
                    </h4>
                    <div className="space-y-2">
                      {cvAnalysis.strengths
                        .slice(0, 3)
                        .map((strength, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <svg
                              className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {strength}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {cvAnalysis.weaknesses && cvAnalysis.weaknesses.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-3">
                      Areas for Improvement
                    </h4>
                    <div className="space-y-2">
                      {cvAnalysis.weaknesses
                        .slice(0, 3)
                        .map((weakness, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <svg
                              className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {weakness}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {cvAnalysis.skills && cvAnalysis.skills.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Key Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {cvAnalysis.skills.slice(0, 8).map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {cvAnalysis.certifications &&
                  cvAnalysis.certifications.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-3">
                        Certifications
                      </h4>
                      <div className="space-y-2">
                        {cvAnalysis.certifications.map((cert, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <svg
                              className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {cert}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Analysis generated on{" "}
                    {cvAnalysis.analyzedAt
                      ? formatDate(cvAnalysis.analyzedAt)
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Experience & Education Details */}
              {(cvAnalysis.experience || cvAnalysis.education) && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Background Details
                  </h3>

                  {cvAnalysis.experience && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Work Experience
                      </h4>
                      <div className="space-y-3">
                        {(() => {
                          try {
                            const experience = JSON.parse(
                              cvAnalysis.experience
                            );
                            return experience.positions
                              ?.slice(0, 3)
                              .map((position: any, index: number) => (
                                <div
                                  key={index}
                                  className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                                      {position.title}
                                    </h5>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {position.startDate} - {position.endDate}
                                    </span>
                                  </div>
                                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                                    {position.company}
                                  </p>
                                  {position.location && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                      {position.location}
                                    </p>
                                  )}
                                  {position.description && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                      {position.description}
                                    </p>
                                  )}
                                </div>
                              ));
                          } catch (e) {
                            return (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Experience data available but could not be
                                parsed.
                              </p>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  )}

                  {cvAnalysis.education && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Education
                      </h4>
                      <div className="space-y-3">
                        {(() => {
                          try {
                            const education = JSON.parse(cvAnalysis.education);
                            return education.degrees?.map(
                              (degree: any, index: number) => (
                                <div
                                  key={index}
                                  className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                                >
                                  <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                                    {degree.degree}
                                  </h5>
                                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                                    {degree.institution}
                                  </p>
                                  <div className="flex justify-between items-center">
                                    {degree.location && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {degree.location}
                                      </p>
                                    )}
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {degree.startDate} - {degree.endDate}
                                    </span>
                                  </div>
                                </div>
                              )
                            );
                          } catch (e) {
                            return (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Education data available but could not be
                                parsed.
                              </p>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="xl:col-span-1 space-y-8">
          {/* Quick Actions Bar */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-blue-100 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() =>
                  router.push(
                    `/dashboard/candidates/${application.candidate.id}`
                  )
                }
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                View Profile
              </button>

              <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all text-sm font-medium text-gray-700 dark:text-gray-300">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Send Email
              </button>

              <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all text-sm font-medium text-gray-700 dark:text-gray-300">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Add Note
              </button>
            </div>
          </div>
          {/* Application status and details */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                    application.status
                  )}`}
                >
                  {application.status.charAt(0) +
                    application.status
                      .slice(1)
                      .toLowerCase()
                      .replace(/_/g, " ")}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Applied {formatDate(application.appliedAt)}
                </span>
              </div>
              <select
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={application.status}
                onChange={(e) =>
                  handleStatusChange(e.target.value as ApplicationStatus)
                }
              >
                {Object.values(ApplicationStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0) +
                      status.slice(1).toLowerCase().replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Contact info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Contact Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Email:</span>{" "}
                    {application.candidate.email || "N/A"}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Phone:</span>{" "}
                    {application.candidate.phoneNumber || "N/A"}
                  </p>
                </div>
              </div>

              {application.coverLetter && (
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Cover Letter
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {application.coverLetter}
                  </div>
                  <button
                    onClick={() => {
                      const modal = document.createElement("div");
                      modal.className =
                        "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";
                      modal.innerHTML = `
                        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
                          <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Cover Letter</h3>
                            <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                              </svg>
                            </button>
                          </div>
                          <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">${application.coverLetter}</p>
                        </div>
                      `;
                      document.body.appendChild(modal);
                    }}
                    className="text-blue-600 dark:text-blue-400 text-sm mt-1 hover:underline"
                  >
                    Read full letter
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* CV Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Resume
            </h3>

            {application.cvUrl ? (
              <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-red-600 dark:text-red-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {application.cvFileName || "Resume.pdf"}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Uploaded with application
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <a
                    href={application.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    View
                  </a>
                  <a
                    href={application.cvUrl}
                    download
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm font-medium"
                  >
                    Download
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-center">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">
                  No resume uploaded
                </p>
              </div>
            )}
          </div>

          {/* Interviews Section */}
          {application.interviews && application.interviews.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Interviews ({application.interviews.length})
              </h3>

              <div className="space-y-4">
                {application.interviews.map((interview, index) => (
                  <div
                    key={interview.id}
                    className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            interview.status === "COMPLETED"
                              ? "bg-green-500"
                              : interview.status === "IN_PROGRESS"
                              ? "bg-blue-500"
                              : interview.status === "SCHEDULED"
                              ? "bg-yellow-500"
                              : "bg-gray-400"
                          }`}
                        />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {interview.type === "AI_SCREENING"
                              ? "AI Screening Interview"
                              : interview.type === "HUMAN"
                              ? "Human Interview"
                              : interview.type}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {interview.language} • {interview.expectedDuration}{" "}
                            minutes
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          interview.status === "COMPLETED"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : interview.status === "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            : interview.status === "SCHEDULED"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                        }`}
                      >
                        {interview.status.charAt(0) +
                          interview.status
                            .slice(1)
                            .toLowerCase()
                            .replace("_", " ")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Scheduled:
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 ml-2">
                          {formatDate(interview.scheduledAt)}
                        </span>
                      </div>

                      {interview.roomCode && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Room Code:
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 ml-2 font-mono">
                            {interview.roomCode}
                          </span>
                        </div>
                      )}

                      {interview.duration && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Duration:
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 ml-2">
                            {Math.round(interview.duration / 60)} minutes
                          </span>
                        </div>
                      )}

                      {interview.status === "IN_PROGRESS" &&
                        countdowns[interview.id] && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Time left:
                            </span>
                            <span className="text-blue-600 dark:text-blue-400 ml-2 font-medium">
                              {countdowns[interview.id]}
                            </span>
                          </div>
                        )}
                    </div>

                    {interview.instructions && (
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <span className="font-medium">Instructions:</span>{" "}
                          {interview.instructions}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailPage;
