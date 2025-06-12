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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-600 border-t-[#00C6AD] mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-4 border-[#00C6AD]/20"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">Loading Job Details</h3>
            <p className="text-gray-400">Preparing your application form...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="bg-red-900/30 border border-red-600/30 rounded-2xl p-8 backdrop-blur-sm">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-3">
              Job Not Found
            </h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {error || "The job you are looking for does not exist or may have been removed."}
            </p>
            <button
              onClick={() => router.push("/jobs")}
              className="bg-gradient-to-r from-[#00C6AD] to-[#14B8A6] hover:from-[#14B8A6] hover:to-[#00C6AD] text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              Browse All Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,_white_1px,_transparent_0)] bg-[length:20px_20px]"></div>
      </div>
      
      <div className="relative max-w-6xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/jobs/${jobId}`)}
            className="group flex items-center gap-2 text-gray-400 hover:text-[#00C6AD] mb-8 transition-all duration-200 hover:translate-x-1"
          >
            <ArrowLeftIcon className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">Back to Job Details</span>
          </button>

          {/* Enhanced Job Header */}
          <div className="bg-gradient-to-r from-gray-800/80 via-gray-800/60 to-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              {/* Company Logo Placeholder & Icon */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-br from-[#00C6AD] to-[#14B8A6] rounded-2xl shadow-lg">
                    <BriefcaseIcon className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-800"></div>
                </div>
                
                {/* Company Info */}
                <div className="hidden lg:block">
                  <div className="text-[#00C6AD] font-semibold text-sm uppercase tracking-wide">
                    {job.company.displayName || job.company.name}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {job.company.industry || 'Technology'}
                  </div>
                </div>
              </div>

              {/* Job Title & Details */}
              <div className="flex-1">
                <div className="mb-4">
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
                    Apply for{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C6AD] to-[#14B8A6]">
                      {job.title}
                    </span>
                  </h1>
                  <div className="lg:hidden">
                    <div className="text-[#00C6AD] font-semibold text-sm uppercase tracking-wide">
                      {job.company.displayName || job.company.name}
                    </div>
                  </div>
                </div>

                {/* Job Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-gray-400">
                  <div className="flex items-center gap-2 bg-gray-700/30 px-3 py-1.5 rounded-full">
                    <BuildingOfficeIcon className="h-4 w-4 text-[#00C6AD]" />
                    <span className="text-sm font-medium">{job.company.displayName || job.company.name}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-700/30 px-3 py-1.5 rounded-full">
                    <MapPinIcon className="h-4 w-4 text-[#00C6AD]" />
                    <span className="text-sm font-medium">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-700/30 px-3 py-1.5 rounded-full">
                    <CalendarIcon className="h-4 w-4 text-[#00C6AD]" />
                    <span className="text-sm font-medium">
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Summary */}
            <div className="mt-6 p-6 bg-gradient-to-r from-gray-700/20 to-gray-600/20 rounded-xl border border-gray-600/30">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#00C6AD] rounded-full"></div>
                Position Overview
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {job.description.length > 300
                  ? `${job.description.substring(0, 300)}...`
                  : job.description}
              </p>
              
              {/* Key Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-600/30">
                <div className="text-center">
                  <div className="text-[#00C6AD] font-semibold text-lg">{job.experienceLevel.replace('_', ' ')}</div>
                  <div className="text-gray-400 text-sm">Experience Level</div>
                </div>
                <div className="text-center">
                  <div className="text-[#00C6AD] font-semibold text-lg">{job.workType}</div>
                  <div className="text-gray-400 text-sm">Work Type</div>
                </div>
                <div className="text-center">
                  <div className="text-[#00C6AD] font-semibold text-lg">{job.applicationCount || 0}</div>
                  <div className="text-gray-400 text-sm">Applications</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Application Form - Takes 2 columns */}
          <div className="lg:col-span-2">
            <JobApplicationForm
              jobId={job.id}
              jobTitle={job.title}
              companyName={job.company.displayName || job.company.name}
              onSuccess={handleApplicationSuccess}
              onError={handleApplicationError}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Application Tips */}
            <div className="bg-gradient-to-br from-blue-900/30 via-blue-800/20 to-indigo-900/30 backdrop-blur-sm border border-blue-600/30 rounded-2xl p-6 shadow-xl">
              <h3 className="text-blue-300 font-bold text-lg mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                Application Tips
              </h3>
              <ul className="space-y-3 text-blue-100/90 text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Upload a current CV/Resume in PDF, DOC, or DOCX format</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Ensure your phone number is correct - we'll contact you there</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Use the cover letter to highlight relevant experience</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Be specific about why you want this position</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Use Jordan phone format: +962XXXXXXXXX</span>
                </li>
                {job.enableAiInterview && (
                  <li className="flex items-start gap-3 p-3 bg-blue-800/30 rounded-lg border border-blue-600/30">
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-yellow-200">
                      This position includes an AI interview - prepare to showcase your communication skills
                    </span>
                  </li>
                )}
              </ul>
            </div>

            {/* Job Requirements Preview */}
            {job.requirements && (
              <div className="bg-gradient-to-br from-emerald-900/30 via-emerald-800/20 to-teal-900/30 backdrop-blur-sm border border-emerald-600/30 rounded-2xl p-6 shadow-xl">
                <h3 className="text-emerald-300 font-bold text-lg mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  Key Requirements
                </h3>
                <div className="text-emerald-100/90 text-sm leading-relaxed">
                  {job.requirements.length > 200
                    ? `${job.requirements.substring(0, 200)}...`
                    : job.requirements}
                </div>
              </div>
            )}

            {/* Company Info */}
            <div className="bg-gradient-to-br from-purple-900/30 via-purple-800/20 to-pink-900/30 backdrop-blur-sm border border-purple-600/30 rounded-2xl p-6 shadow-xl">
              <h3 className="text-purple-300 font-bold text-lg mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                About {job.company.displayName || job.company.name}
              </h3>
              <div className="space-y-3 text-purple-100/90 text-sm">
                <div>
                  <span className="text-purple-300 font-medium">Location:</span> {job.company.location}
                </div>
                {job.company.industry && (
                  <div>
                    <span className="text-purple-300 font-medium">Industry:</span> {job.company.industry}
                  </div>
                )}
                <div>
                  <span className="text-purple-300 font-medium">Total Jobs:</span> {job.company.id ? 'Multiple positions' : 'Growing team'}
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
