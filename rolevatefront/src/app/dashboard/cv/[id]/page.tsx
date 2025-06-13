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
      alert(
        "An interview has already been scheduled for this application. You can manage it from the interviews section."
      );
      // In a real implementation:
      // router.push(`/dashboard/interviews/${applicationId}`);
    } else {
      // If not scheduled, allow scheduling
      alert(
        "Interview scheduling functionality will be implemented in the future."
      );
      // In a real implementation:
      // router.push(`/dashboard/interview/schedule/${applicationId}`);
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
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case ApplicationStatus.SCREENING:
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
      case ApplicationStatus.INTERVIEW_SCHEDULED:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case ApplicationStatus.INTERVIEWED:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case ApplicationStatus.SHORTLISTED:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case ApplicationStatus.REJECTED:
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case ApplicationStatus.HIRED:
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  // Helper function for score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-500";
    if (score >= 75) return "text-blue-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-8 max-w-md">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Error Loading Application
          </h3>
          <p className="text-red-600 dark:text-red-300">
            {error || "Application not found"}
          </p>
          <button
            onClick={() => router.push("/dashboard/cv")}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Return to CV Manager
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/cv">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to CV Manager
            </button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Application Details
          </h1>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleScheduleInterview}
            className={`px-4 py-2 ${
              application.status === ApplicationStatus.INTERVIEW_SCHEDULED
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white rounded-lg`}
          >
            {application.status === ApplicationStatus.INTERVIEW_SCHEDULED
              ? "View Scheduled Interview"
              : "Schedule Interview"}
          </button>
        </div>
      </div>

      {/* Main content: Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Candidate & Application Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Overview Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Application for
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
                  {application.jobPost.title}
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {application.jobPost.company.displayName ||
                    application.jobPost.company.name}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 text-right">
                  Applied on
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                  {formatDate(application.appliedAt)}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Current Status
              </div>
              <div className="mt-2 flex items-center space-x-4">
                <span
                  className={`px-3 py-1 inline-flex text-sm font-medium rounded-full ${getStatusColor(
                    application.status
                  )}`}
                >
                  {application.status.charAt(0) +
                    application.status
                      .slice(1)
                      .toLowerCase()
                      .replace(/_/g, " ")}
                </span>

                {application.status ===
                  ApplicationStatus.INTERVIEW_SCHEDULED && (
                  <span className="text-xs text-amber-600 dark:text-amber-400">
                    Interview has been scheduled for this candidate
                  </span>
                )}

                <div className="relative">
                  <select
                    className="appearance-none bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-1 px-3 pr-8 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {application.coverLetter && (
              <div className="mt-6">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Cover Letter
                </div>
                <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                  {application.coverLetter}
                </div>
              </div>
            )}
          </div>

          {/* Candidate Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Candidate Information
            </h3>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Name
                </div>
                <div className="mt-1 text-gray-900 dark:text-white">
                  {application.candidate.fullName ||
                    application.candidate.firstName ||
                    "N/A"}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email
                </div>
                <div className="mt-1 text-gray-900 dark:text-white">
                  {application.candidate.email || "N/A"}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Phone Number
                </div>
                <div className="mt-1 text-gray-900 dark:text-white">
                  {application.candidate.phoneNumber}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() =>
                  router.push(
                    `/dashboard/candidates/${application.candidate.id}`
                  )
                }
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
              >
                View Full Candidate Profile
              </button>
            </div>
          </div>

          {/* CV Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Resume / CV
            </h3>

            {application.cvUrl ? (
              <div className="mt-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <svg
                      className="h-8 w-8 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {application.cvFileName || "Candidate_CV.pdf"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Uploaded with application
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={application.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      View
                    </a>
                    <a
                      href={application.cvUrl}
                      download
                      className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-500 dark:text-gray-400 text-center">
                No CV/Resume uploaded with this application
              </div>
            )}
          </div>

          {/* Right column: CV Analysis */}
          <div className="lg:col-span-1 space-y-6">
            {/* CV Analysis Score Card */}
            {cvAnalysis && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  CV Analysis
                </h3>

                <div className="mt-6 flex flex-col items-center">
                  <div className="relative inline-flex mb-3">
                    <div
                      className={`text-4xl font-bold ${getScoreColor(
                        cvAnalysis.overallScore || 0
                      )}`}
                    >
                      {cvAnalysis.overallScore || 0}
                    </div>
                    <div className="absolute top-0 -right-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      /100
                    </div>
                  </div>

                  {"skills" in application.jobPost &&
                    (application.jobPost as any).skills?.length > 0 && (
                      <div className="w-full mt-2 text-center">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Job Requirements Match
                        </div>
                        <div className="flex flex-wrap justify-center gap-1.5">
                          {(application.jobPost as any).skills.map(
                            (skill: string, index: number) => {
                              const hasSkill = cvAnalysis.skills?.some(
                                (s) => s.toLowerCase() === skill.toLowerCase()
                              );
                              return (
                                <span
                                  key={index}
                                  className={`text-xs px-2 py-0.5 rounded-full flex items-center ${
                                    hasSkill
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                      : "bg-gray-100 text-gray-500 dark:bg-gray-800/40 dark:text-gray-400"
                                  }`}
                                >
                                  {hasSkill && (
                                    <svg
                                      className="w-3 h-3 mr-1"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                  {skill}
                                </span>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}
                </div>

                <div className="mt-6 space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Skills Match
                      </span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {cvAnalysis.skillsScore || 0}%
                      </span>
                    </div>
                    <div className="mt-1 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${cvAnalysis.skillsScore || 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Experience Match
                      </span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {cvAnalysis.experienceScore || 0}%
                      </span>
                    </div>
                    <div className="mt-1 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${cvAnalysis.experienceScore || 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Education Match
                      </span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {cvAnalysis.educationScore || 0}%
                      </span>
                    </div>
                    <div className="mt-1 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${cvAnalysis.educationScore || 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {cvAnalysis.languageScore && (
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Language Skills
                        </span>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {cvAnalysis.languageScore}%
                        </span>
                      </div>
                      <div className="mt-1 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${cvAnalysis.languageScore}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Strengths and Weaknesses */}
            {cvAnalysis && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Strengths & Weaknesses
                </h3>

                <div className="mt-4 space-y-4">
                  {cvAnalysis.strengths && cvAnalysis.strengths.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-green-600 dark:text-green-400">
                        Strengths
                      </h4>
                      <ul className="mt-2 list-disc list-inside space-y-1">
                        {cvAnalysis.strengths.map((strength, index) => (
                          <li
                            key={index}
                            className="text-sm text-gray-700 dark:text-gray-300"
                          >
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {cvAnalysis.weaknesses &&
                    cvAnalysis.weaknesses.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-red-600 dark:text-red-400">
                          Areas for Improvement
                        </h4>
                        <ul className="mt-2 list-disc list-inside space-y-1">
                          {cvAnalysis.weaknesses.map((weakness, index) => (
                            <li
                              key={index}
                              className="text-sm text-gray-700 dark:text-gray-300"
                            >
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {cvAnalysis.suggestedImprovements &&
                    cvAnalysis.suggestedImprovements.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-amber-600 dark:text-amber-400">
                          Suggested Improvements
                        </h4>
                        <ul className="mt-2 list-disc list-inside space-y-1">
                          {cvAnalysis.suggestedImprovements.map(
                            (suggestion, index) => (
                              <li
                                key={index}
                                className="text-sm text-gray-700 dark:text-gray-300"
                              >
                                {suggestion}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Summary and Skills */}
            {cvAnalysis && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  CV Summary
                </h3>

                {cvAnalysis.summary && (
                  <div className="mt-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-700 dark:text-gray-300 text-sm">
                      {cvAnalysis.summary}
                    </div>
                  </div>
                )}

                {cvAnalysis.skills && cvAnalysis.skills.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Identified Skills
                    </h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {cvAnalysis.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  Analysis generated on{" "}
                  {cvAnalysis.analyzedAt
                    ? formatDate(cvAnalysis.analyzedAt)
                    : "N/A"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailPage;
