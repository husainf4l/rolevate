"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getJobDetails, Job } from "@/services/jobs.service";
import { JobApplicationForm } from "@/components/jobs/JobApplicationForm";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const JobApplicationPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const jobId = params?.id as string;

  useEffect(() => {
    if (!jobId) return;

    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const jobData = await getJobDetails(jobId);
        setJob(jobData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load job details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const handleApplicationSuccess = (applicationId: string) => {
    console.log("Application submitted successfully:", applicationId);
    // Redirect to a success page or back to the job detail
    router.push(`/jobs/${jobId}?applied=true&applicationId=${applicationId}`);
  };

  const handleApplicationError = (error: string) => {
    console.error("Application failed:", error);
    // Error is handled in the form component
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center gap-6 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#00C6AD] border-t-[#14B8A6] mx-auto"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Loading Job Details
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Preparing your application form...
          </p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center gap-6 p-8 rounded-2xl shadow-lg border border-red-200 dark:border-red-800 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900">
            <svg
              className="w-6 h-6 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Job Not Found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs">
            {error ||
              "The job you are looking for does not exist or may have been removed."}
          </p>
          <button
            onClick={() => router.push("/jobs")}
            className="bg-[#00C6AD] hover:bg-[#14B8A6] text-white font-medium px-6 py-2 rounded-lg transition"
          >
            Browse All Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Navigation */}
        <div className="mb-10">
          <button
            onClick={() => router.push("/jobs")}
            className="flex items-center gap-2 text-gray-500 hover:text-[#00C6AD] transition"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span className="font-medium">Back to Jobs</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Application Form - Larger area */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <JobApplicationForm
              jobId={job.id}
              jobTitle={job.title}
              companyName={job.company.displayName || job.company.name}
              onSuccess={handleApplicationSuccess}
              onError={handleApplicationError}
            />
          </div>

          {/* Job Information Sidebar */}
          <div className="lg:col-span-1 space-y-8 order-1 lg:order-2">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                {job.company.logo && (
                  <img
                    src={job.company.logo}
                    alt={job.company.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {job.title}
                  </h2>
                  <p className="text-[#00C6AD] font-medium">
                    {job.company.displayName || job.company.name}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 dark:text-gray-400">
                      Location:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {job.location}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 dark:text-gray-400">
                      Type:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {job.workType}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 dark:text-gray-400">
                      Level:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {job.experienceLevel}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 dark:text-gray-400">
                      Applications:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {job.applicationCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {job.requirements && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
                <h3 className="text-[#00C6AD] font-bold text-base mb-3 uppercase tracking-tight">
                  Requirements
                </h3>
                <div className="text-gray-700 dark:text-gray-300 text-sm">
                  {job.requirements.length > 200
                    ? `${job.requirements.substring(0, 200)}...`
                    : job.requirements}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
              <h3 className="text-[#00C6AD] font-bold text-base mb-3 uppercase tracking-tight">
                About {job.company.displayName || job.company.name}
              </h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                <div>
                  <span className="font-medium">Location:</span>{" "}
                  {job.company.location}
                </div>
                {job.company.industry && (
                  <div>
                    <span className="font-medium">Industry:</span>{" "}
                    {job.company.industry}
                  </div>
                )}
                <div>
                  <span className="font-medium">Jobs:</span>{" "}
                  {job.company.id ? "Multiple" : "Growing"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationPage;
