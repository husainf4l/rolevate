"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getJobDetails, Job } from "@/services/jobs.service";
import {
  EXPERIENCE_LEVELS,
  WORK_TYPES,
  APPLICATION_STATUS,
} from "@/constants/jobs.constants";
import {
  MapPinIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  EyeIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ShareIcon,
  BookmarkIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const JobDetailsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const jobId = params?.id as string;
  const applied = searchParams.get('applied');
  const applicationId = searchParams.get('applicationId');

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

  // Show success message if user returned after applying
  useEffect(() => {
    if (applied === 'true' && applicationId) {
      setShowSuccessMessage(true);
      // Clean up URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('applied');
      url.searchParams.delete('applicationId');
      window.history.replaceState({}, '', url.toString());
    }
  }, [applied, applicationId]);

  const handleApply = () => {
    console.log("Apply button clicked, navigating to application page");
    router.push(`/jobs/${jobId}/apply`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: `Check out this job opportunity: ${job?.title} at ${
          job?.company.displayName || job?.company.name
        }`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  const handleSave = () => {
    // TODO: Implement save job logic
    console.log("Save job:", job?.id);
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
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Jobs
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Success Message */}
          {showSuccessMessage && (
            <div className="lg:col-span-3 bg-green-900/20 border border-green-600 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-400" />
                  <div>
                    <h3 className="text-green-400 font-medium">Application Submitted Successfully!</h3>
                    <p className="text-green-200 text-sm">
                      Your application has been received. We'll review it and get back to you soon.
                      {applicationId && (
                        <span className="block mt-1">
                          Application ID: <span className="font-mono">{applicationId}</span>
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSuccessMessage(false)}
                  className="text-green-400 hover:text-green-300 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Header */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-start gap-4 mb-6">
                {job.company.logo && (
                  <img
                    src={job.company.logo}
                    alt={job.company.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white mb-2">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <BuildingOfficeIcon className="h-5 w-5" />
                    <span className="text-lg">
                      {job.company.displayName || job.company.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
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

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium">
                  {EXPERIENCE_LEVELS[
                    job.experienceLevel as keyof typeof EXPERIENCE_LEVELS
                  ] || job.experienceLevel}
                </span>
                <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm font-medium">
                  {WORK_TYPES[job.workType as keyof typeof WORK_TYPES] ||
                    job.workType}
                </span>
                {job.isFeatured && (
                  <span className="px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-full text-sm font-medium">
                    Featured
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    console.log("Apply Now button clicked!");
                    handleApply();
                  }}
                  className="flex-1 bg-[#00C6AD] hover:bg-[#14B8A6] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Apply Now
                </button>
                <button
                  onClick={handleSave}
                  className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  title="Save Job"
                >
                  <BookmarkIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  title="Share Job"
                >
                  <ShareIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Job Description
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed">
                  {job.description}
                </p>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Requirements
              </h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed">
                  {job.requirements}
                </p>
              </div>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Responsibilities
                </h3>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed">
                    {job.responsibilities}
                  </p>
                </div>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Benefits
                </h3>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed">
                    {job.benefits}
                  </p>
                </div>
              </div>
            )}

            {/* Required Skills */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Interview Section */}
            {job.enableAiInterview && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  AI Interview Process
                </h3>
                <p className="text-gray-300 mb-4">
                  This position includes an AI-powered interview session as part
                  of the application process.
                </p>

                {job.interviewDuration && (
                  <div className="flex items-center gap-2 text-gray-400 mb-4">
                    <ClockIcon className="h-5 w-5" />
                    <span>Duration: {job.interviewDuration} minutes</span>
                  </div>
                )}

                {job.technicalQuestions &&
                  job.technicalQuestions.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-white font-medium mb-2">
                        Sample Technical Questions:
                      </h4>
                      <ul className="space-y-2">
                        {job.technicalQuestions.map((question, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-gray-300"
                          >
                            <CheckCircleIcon className="h-5 w-5 text-[#00C6AD] mt-0.5 flex-shrink-0" />
                            {question}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {job.behavioralQuestions &&
                  job.behavioralQuestions.length > 0 && (
                    <div>
                      <h4 className="text-white font-medium mb-2">
                        Sample Behavioral Questions:
                      </h4>
                      <ul className="space-y-2">
                        {job.behavioralQuestions.map((question, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-gray-300"
                          >
                            <CheckCircleIcon className="h-5 w-5 text-[#00C6AD] mt-0.5 flex-shrink-0" />
                            {question}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Info */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Job Information
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Experience Level</span>
                  <span className="text-white font-medium">
                    {EXPERIENCE_LEVELS[
                      job.experienceLevel as keyof typeof EXPERIENCE_LEVELS
                    ] || job.experienceLevel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Work Type</span>
                  <span className="text-white font-medium">
                    {WORK_TYPES[job.workType as keyof typeof WORK_TYPES] ||
                      job.workType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Location</span>
                  <span className="text-white font-medium">{job.location}</span>
                </div>
                {job.salaryMin && job.salaryMax && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Salary</span>
                    <span className="text-white font-medium">
                      {job.currency} {job.salaryMin.toLocaleString()} -{" "}
                      {job.salaryMax.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Posted</span>
                  <span className="text-white font-medium">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {job.expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Expires</span>
                    <span className="text-white font-medium">
                      {new Date(job.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                About the Company
              </h3>
              <div className="flex items-center gap-3 mb-4">
                {job.company.logo && (
                  <img
                    src={job.company.logo}
                    alt={job.company.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h4 className="text-white font-medium">
                    {job.company.displayName || job.company.name}
                  </h4>
                  {job.company.industry && (
                    <p className="text-gray-400 text-sm">
                      {job.company.industry}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPinIcon className="h-4 w-4" />
                <span>{job.company.location}</span>
              </div>
            </div>

            {/* Job Stats */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Job Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <UserGroupIcon className="h-5 w-5" />
                    <span>Applications</span>
                  </div>
                  <span className="text-white font-medium">
                    {job.applicationCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <EyeIcon className="h-5 w-5" />
                    <span>Views</span>
                  </div>
                  <span className="text-white font-medium">
                    {job.viewCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Applications */}
            {job.applications && job.applications.length > 0 && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Recent Applications
                </h3>
                <div className="space-y-3">
                  {job.applications.slice(0, 3).map((application) => (
                    <div
                      key={application.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-white text-sm font-medium">
                          {application.candidate.name}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {new Date(application.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                        {APPLICATION_STATUS[
                          application.status as keyof typeof APPLICATION_STATUS
                        ] || application.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
