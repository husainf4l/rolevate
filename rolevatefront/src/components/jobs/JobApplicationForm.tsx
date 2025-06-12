"use client";

import React, { useState } from "react";
import { applyToJob, JobApplication } from "@/services/jobs.service";
import {
  PhoneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";

interface JobApplicationFormProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  onSuccess?: (applicationId: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export const JobApplicationForm: React.FC<JobApplicationFormProps> = ({
  jobId,
  jobTitle,
  companyName,
  onSuccess,
  onError,
  className = "",
}) => {
  const [formData, setFormData] = useState<Omit<JobApplication, "jobId">>({
    phoneNumber: "",
    coverLetter: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type - accept PDF, DOC, DOCX
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (
      !allowedTypes.includes(file.type) &&
      !file.name.match(/\.(pdf|doc|docx)$/i)
    ) {
      setError("Please upload a PDF, DOC, or DOCX file for your CV");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("CV file size must be less than 5MB");
      return;
    }

    setCvFile(file);
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.phoneNumber.trim()) {
      setError("Phone number is required");
      return false;
    }

    if (!cvFile) {
      setError("Please upload your CV/Resume");
      return false;
    }

    // Validate Jordan phone number format
    const phoneRegex = /^\+962[7-9]\d{8}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError("Please enter a valid Jordan phone number (+962XXXXXXXXX)");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !cvFile) return;

    setLoading(true);
    setError(null);

    try {
      const response = await applyToJob(jobId, formData, cvFile);
      setSuccess(true);
      onSuccess?.(response.applicationId);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to submit application";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`bg-gray-800 rounded-2xl p-8 shadow-2xl ${className}`}>
        <div className="text-center relative">
          {/* Success Animation */}
          <div className="relative mb-6">
            <div className="relative bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full p-4 mx-auto w-fit">
              <CheckCircleIcon className="h-12 w-12 text-white" />
            </div>
          </div>

          {/* Success Message */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-3">
              Application Submitted Successfully!
            </h3>
            <p className="text-emerald-100/90 mb-4 leading-relaxed">
              Your application for{" "}
              <span className="text-emerald-300 font-semibold">{jobTitle}</span>{" "}
              at{" "}
              <span className="text-emerald-300 font-semibold">
                {companyName}
              </span>{" "}
              has been submitted successfully.
            </p>
          </div>

          {/* Next Steps */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-left">
            <h4 className="text-[#00C6AD] font-semibold mb-3 flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-[#00C6AD]" />
              What happens next?
            </h4>
            <ul className="space-y-2 text-gray-700 dark:text-gray-200 text-sm">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-[#00C6AD] rounded-full mt-2 flex-shrink-0 inline-block"></span>
                <span>
                  You'll receive a confirmation WhatsApp within 5 minutes.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-[#00C6AD] rounded-full mt-2 flex-shrink-0 inline-block"></span>
                <span>
                  We're preparing your interview. You’ll receive a link once
                  it’s ready.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-[#00C6AD] rounded-full mt-2 flex-shrink-0 inline-block"></span>
                <span>
                  The interview will be recorded for review by our HR team.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-[#00C6AD] rounded-full mt-2 flex-shrink-0 inline-block"></span>
                <span>
                  Please make sure you’re in a quiet place when joining the
                  interview.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-[#00C6AD] rounded-full mt-2 flex-shrink-0 inline-block"></span>
                <span>
                  Our HR team will review your application within 2-3 business
                  days.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-[#00C6AD] rounded-full mt-2 flex-shrink-0 inline-block"></span>
                <span>
                  If selected, we'll contact you via phone for next steps.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-700/80 backdrop-blur-sm border border-gray-600/40 rounded-2xl shadow-2xl overflow-hidden ${className}`}
    >
      {/* Form Header */}
      <div className="bg-gradient-to-r from-[#00C6AD]/10 to-[#14B8A6]/10 border-b border-gray-600/30 p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-[#00C6AD] to-[#14B8A6] rounded-xl shadow-lg">
            <PaperAirplaneIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">
              Submit Your Application
            </h3>
            <p className="text-gray-400 text-sm">
              for <span className="text-[#00C6AD] font-medium">{jobTitle}</span>{" "}
              at{" "}
              <span className="text-[#00C6AD] font-medium">{companyName}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Phone Number Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#00C6AD]/20 rounded-lg flex items-center justify-center">
              <PhoneIcon className="h-4 w-4 text-[#00C6AD]" />
            </div>
            <h4 className="text-lg font-semibold text-white">
              Contact Information
            </h4>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Phone Number *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent transition-all duration-200 hover:border-gray-500"
                placeholder="+962791234567"
                required
              />
            </div>
            <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
              <span className="w-1 h-1 bg-[#00C6AD] rounded-full inline-block"></span>
              Enter your Jordan mobile number in the format +962XXXXXXXXX
            </div>
          </div>
        </div>
        {/* Cover Letter Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="h-4 w-4 text-teal-400" />
            </div>
            <h4 className="text-lg font-semibold text-white">
              Cover Letter{" "}
              <span className="text-gray-400 text-sm font-normal">
                (Optional)
              </span>
            </h4>
          </div>

          <div className="relative">
            <textarea
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-4 py-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none transition-all duration-200 hover:border-gray-500"
              placeholder="Tell us why you're interested in this position and what makes you a great fit for this role. Highlight your relevant experience, skills, and enthusiasm for joining the team..."
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-500">
              {formData.coverLetter.length}/1000
            </div>
          </div>
        </div>

        {/* CV Upload Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="h-4 w-4 text-emerald-400" />
            </div>
            <h4 className="text-lg font-semibold text-white">CV/Resume *</h4>
          </div>

          <div className="relative">
            <div className="border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-xl p-8 text-center transition-all duration-200 bg-gray-700/20 hover:bg-gray-700/30">
              {cvFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-3 text-emerald-400">
                    <CheckCircleIcon className="h-8 w-8" />
                    <div>
                      <div className="font-medium text-white">
                        CV Uploaded Successfully
                      </div>
                      <div className="text-sm text-gray-400">{cvFile.name}</div>
                      <div className="text-xs text-gray-500">
                        {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCvFile(null)}
                    className="text-sm text-gray-400 hover:text-white underline"
                  >
                    Upload a different file
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gray-600/30 rounded-full flex items-center justify-center">
                    <CloudArrowUpIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium mb-2">
                      Upload your CV/Resume
                    </div>
                    <div className="text-sm text-gray-400 mb-4">
                      Drop your file here or click to browse
                    </div>
                    <label className="cursor-pointer">
                      <span className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5">
                        <CloudArrowUpIcon className="h-4 w-4" />
                        Choose File
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleCvUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="text-xs text-gray-500">
                    PDF, DOC, or DOCX format • Max 5MB
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 text-red-300 bg-red-900/30 border border-red-600/30 rounded-xl p-4 backdrop-blur-sm">
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium mb-1">Application Error</div>
              <div className="text-sm text-red-200">{error}</div>
            </div>
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading || !cvFile}
            className="group w-full bg-gradient-to-r from-[#00C6AD] to-[#14B8A6] hover:from-[#14B8A6] hover:to-[#00C6AD] disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-[#00C6AD]/25 transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Submitting Application...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <PaperAirplaneIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                <span>
                  {!cvFile ? "Upload CV to Submit" : "Submit Application"}
                </span>
              </div>
            )}
          </button>
          {!cvFile && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Please upload your CV/Resume to continue
            </p>
          )}
        </div>
      </form>
    </div>
  );
};
