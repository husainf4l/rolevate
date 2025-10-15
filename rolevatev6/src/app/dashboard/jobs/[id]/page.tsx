"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { JobService, UpdateJobRequest } from "@/services/job";
import Header from "@/components/dashboard/Header";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id as string;

  const [job, setJob] = useState<UpdateJobRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!jobId) return;

    const fetchJob = async () => {
      try {
        setLoading(true);
        console.log("Fetching job with ID:", jobId);
        const jobData = await JobService.getJob(jobId);

        console.log("Received job data:", jobData);

        // Check if jobData exists
        if (!jobData) {
          throw new Error("Job not found");
        }

        // Format deadline properly to avoid type issues
        const formattedDeadline = jobData.deadline
          ? new Date(jobData.deadline).toISOString().split("T")[0]
          : "";

        const jobUpdateData: UpdateJobRequest = {
          title: jobData.title || "",
          description: jobData.description || "",
          shortDescription: jobData.shortDescription || "",
          department: jobData.department || "",
          location: jobData.location || "",
          salary: jobData.salary || "",
          type: jobData.type || "FULL_TIME",
          ...(formattedDeadline && { deadline: formattedDeadline }),
          responsibilities: jobData.responsibilities || "",
          requirements: jobData.requirements || "",
          skills: jobData.skills || [],
          benefits: jobData.benefits || "",
          experience: jobData.experience || "",
          education: jobData.education || "",
          jobLevel: jobData.jobLevel || "",
          workType: jobData.workType || "",
          industry: jobData.industry || "",
          interviewLanguage: jobData.interviewLanguage || "english",
          cvAnalysisPrompt:
            jobData.cvAnalysisPrompt || "",
          interviewPrompt:
            jobData.interviewPrompt || "",
          aiSecondInterviewPrompt: jobData.aiSecondInterviewPrompt || "",
        };

        setJob(jobUpdateData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch job details."
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (!job) return;
    const { name, value } = e.target;
    setJob({
      ...job,
      [name]: value,
    });
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!job) return;
    setJob({
      ...job,
      skills: e.target.value.split(",").map((skill) => skill.trim()),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !jobId) return;

    setIsUpdating(true);
    setError(null);

    try {
      await JobService.updateJob(jobId, job);
      toast.success("Job updated successfully!");
      router.push("/dashboard/jobs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update job.");
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-lg font-semibold text-gray-700">
              Loading Job Details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold">
              Failed to load job details
            </h3>
            <p className="mt-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return null; // or some other placeholder
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Jobs
        </button>

        <Header
          title="Edit Job Post"
          subtitle={`Update the details for "${job.title}"`}
        />

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mt-8 space-y-8"
        >
          {/* Basic Information */}
          <div className="border-b border-gray-200 pb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Job Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={job.title}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  id="department"
                  value={job.department}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  id="location"
                  value={job.location}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="salary"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Salary Range
                </label>
                <input
                  type="text"
                  name="salary"
                  id="salary"
                  value={job.salary}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Job Type
                </label>
                <select
                  name="type"
                  id="type"
                  value={job.type}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                  required
                >
                  <option value="FULL_TIME">Full-time</option>
                  <option value="PART_TIME">Part-time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="REMOTE">Remote</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="deadline"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Application Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  id="deadline"
                  value={job.deadline || ""}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                />
              </div>
              <div>
                <label
                  htmlFor="jobLevel"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Job Level
                </label>
                <input
                  type="text"
                  name="jobLevel"
                  id="jobLevel"
                  value={job.jobLevel}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                />
              </div>
              <div>
                <label
                  htmlFor="workType"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Work Type
                </label>
                <input
                  type="text"
                  name="workType"
                  id="workType"
                  value={job.workType}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                />
              </div>
              <div>
                <label
                  htmlFor="industry"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Industry
                </label>
                <input
                  type="text"
                  name="industry"
                  id="industry"
                  value={job.industry}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                />
              </div>
              <div>
                <label
                  htmlFor="interviewLanguage"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Interview Language
                </label>
                <select
                  name="interviewLanguage"
                  id="interviewLanguage"
                  value={job.interviewLanguage || "english"}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                  required
                >
                  <option value="english">English</option>
                  <option value="arabic">Arabic</option>
                </select>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="border-b border-gray-200 pb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Job Details
            </h3>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="shortDescription"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Short Description
                </label>
                <textarea
                  name="shortDescription"
                  id="shortDescription"
                  value={job.shortDescription}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                  required
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  value={job.description}
                  onChange={handleChange}
                  rows={8}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                  required
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="responsibilities"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Responsibilities
                </label>
                <textarea
                  name="responsibilities"
                  id="responsibilities"
                  value={job.responsibilities}
                  onChange={handleChange}
                  rows={5}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="requirements"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Requirements
                </label>
                <textarea
                  name="requirements"
                  id="requirements"
                  value={job.requirements}
                  onChange={handleChange}
                  rows={5}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="benefits"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Benefits
                </label>
                <textarea
                  name="benefits"
                  id="benefits"
                  value={job.benefits}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="skills"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  name="skills"
                  id="skills"
                  value={job.skills?.join(", ")}
                  onChange={handleSkillsChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                />
              </div>
              <div>
                <label
                  htmlFor="experience"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Experience
                </label>
                <input
                  type="text"
                  name="experience"
                  id="experience"
                  value={job.experience}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                />
              </div>
              <div>
                <label
                  htmlFor="education"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Education
                </label>
                <input
                  type="text"
                  name="education"
                  id="education"
                  value={job.education}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                />
              </div>
            </div>
          </div>

          {/* AI Prompts */}
          <div className="border-b border-gray-200 pb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              AI Recruitment Configuration
            </h3>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="cvAnalysisPrompt"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  AI CV Analysis Prompt
                </label>
                <textarea
                  name="cvAnalysisPrompt"
                  id="cvAnalysisPrompt"
                  value={job.cvAnalysisPrompt}
                  onChange={handleChange}
                  rows={5}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="interviewPrompt"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  AI First Interview Prompt
                </label>
                <textarea
                  name="interviewPrompt"
                  id="interviewPrompt"
                  value={job.interviewPrompt}
                  onChange={handleChange}
                  rows={5}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="aiSecondInterviewPrompt"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  AI Second Interview Prompt
                </label>
                <textarea
                  name="aiSecondInterviewPrompt"
                  id="aiSecondInterviewPrompt"
                  value={job.aiSecondInterviewPrompt}
                  onChange={handleChange}
                  rows={5}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                ></textarea>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-between items-center pt-8">
            <button
              type="button"
              onClick={() =>
                router.push(`/dashboard/jobs/${jobId}/applications`)
              }
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              View Applications
            </button>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isUpdating ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
