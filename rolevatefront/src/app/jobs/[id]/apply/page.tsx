"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getJobDetails, Job } from "@/services/jobs.service";
import { JobApplicationForm } from "@/components/jobs/JobApplicationForm";
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C6AD] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Job not found
          </h2>
          <p className="text-gray-400 mb-4">
            {error || "The job you are looking for does not exist."}
          </p>
          <button
            onClick={() => router.push("/jobs")}
            className="bg-[#00C6AD] hover:bg-[#14B8A6] text-white px-4 py-2 rounded-lg transition-colors"
          >
            Browse All Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/jobs/${jobId}`)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Job Details
          </button>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-[#00C6AD]/10 rounded-lg">
                <BriefcaseIcon className="h-8 w-8 text-[#00C6AD]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  Apply for {job.title}
                </h1>
                <div className="flex items-center gap-4 text-gray-400">
                  <div className="flex items-center gap-1">
                    <BuildingOfficeIcon className="h-4 w-4" />
                    <span>{job.company.displayName || job.company.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Summary */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-300 text-sm leading-relaxed">
                {job.description.length > 200
                  ? `${job.description.substring(0, 200)}...`
                  : job.description}
              </p>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="max-w-4xl mx-auto">
          <JobApplicationForm
            jobId={job.id}
            jobTitle={job.title}
            companyName={job.company.displayName || job.company.name}
            onSuccess={handleApplicationSuccess}
            onError={handleApplicationError}
          />
        </div>

        {/* Help Section */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-6">
            <h3 className="text-blue-400 font-semibold mb-3">
              Application Tips
            </h3>
            <ul className="space-y-2 text-blue-200 text-sm">
              <li>
                • Upload your CV in PDF, DOC, or DOCX format (max 5MB)
              </li>
              <li>
                • Make sure your CV is up-to-date and relevant to the position
              </li>
              <li>
                • Write a compelling cover letter that highlights your relevant
                experience
              </li>
              <li>• Use Jordan phone number format: +962XXXXXXXXX</li>
              <li>• Double-check all your contact information</li>
              {job.enableAiInterview && (
                <li>
                  • This position includes an AI interview - prepare to showcase
                  your communication skills
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationPage;
