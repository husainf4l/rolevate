"use client";

import React, { useState } from "react";
import { applyToJob, JobApplication } from "@/services/jobs.service";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
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
    firstName: "",
    lastName: "",
    email: "",
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

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type - accept PDF, DOC, DOCX as per backend
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type) && 
        !file.name.match(/\.(pdf|doc|docx)$/i)) {
      setError("Please upload a PDF, DOC, or DOCX file for your CV");
      return;
    }

    // Validate file size (5MB limit as per backend)
    if (file.size > 5 * 1024 * 1024) {
      setError("CV file size must be less than 5MB");
      return;
    }

    setCvFile(file);
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError("First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      setError("Last name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      setError("Phone number is required");
      return false;
    }
    if (!cvFile) {
      setError("Please upload your CV");
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
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
      <div
        className={`bg-gray-800 border border-gray-700 rounded-lg p-8 ${className}`}
      >
        <div className="text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Application Submitted Successfully!
          </h3>
          <p className="text-gray-400 mb-4">
            Your application for{" "}
            <span className="text-[#00C6AD] font-medium">{jobTitle}</span> at{" "}
            <span className="text-[#00C6AD] font-medium">{companyName}</span>{" "}
            has been submitted.
          </p>
          <p className="text-gray-400 text-sm">
            You will receive a confirmation email shortly with next steps.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gray-800 border border-gray-700 rounded-lg p-6 ${className}`}
    >
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">
          Apply for {jobTitle}
        </h3>
        <p className="text-gray-400">
          at <span className="text-[#00C6AD]">{companyName}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <UserIcon className="h-4 w-4 inline mr-1" />
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
              placeholder="Enter your first name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <UserIcon className="h-4 w-4 inline mr-1" />
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
              placeholder="Enter your last name"
              required
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <EnvelopeIcon className="h-4 w-4 inline mr-1" />
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
              placeholder="your.email@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <PhoneIcon className="h-4 w-4 inline mr-1" />
              Phone Number *
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
              placeholder="+962791234567"
              required
            />
          </div>
        </div>

        {/* CV Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <DocumentTextIcon className="h-4 w-4 inline mr-1" />
            Upload CV/Resume *
          </label>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            {cvFile ? (
              <div className="flex items-center justify-center space-x-2 text-green-400">
                <CheckCircleIcon className="h-5 w-5" />
                <span className="text-sm">
                  CV uploaded: {cvFile.name}
                </span>
              </div>
            ) : (
              <div>
                <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-sm text-gray-400 mb-2">
                  Drop your CV here or
                </div>
                <label className="cursor-pointer">
                  <span className="text-[#00C6AD] hover:text-[#14B8A6] font-medium">
                    browse files
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCvUpload}
                    className="hidden"
                  />
                </label>
                <div className="text-xs text-gray-500 mt-1">
                  PDF, DOC, or DOCX format, max 5MB
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cover Letter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Cover Letter (Optional)
          </label>
          <textarea
            name="coverLetter"
            value={formData.coverLetter}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent resize-none"
            placeholder="Tell us why you're interested in this position and what makes you a great fit..."
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center space-x-2 text-red-400 bg-red-900/20 border border-red-800 rounded-lg p-3">
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !cvFile}
          className="w-full bg-[#00C6AD] hover:bg-[#14B8A6] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Submitting Application...</span>
            </div>
          ) : (
            "Submit Application"
          )}
        </button>
      </form>
    </div>
  );
};
