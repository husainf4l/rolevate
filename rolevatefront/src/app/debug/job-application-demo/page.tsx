"use client";

import React, { useState } from "react";
import { JobApplicationForm } from "@/components/jobs/JobApplicationForm";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

const JobApplicationDemo = () => {
  const router = useRouter();
  const [showForm, setShowForm] = useState(true);

  // Mock job data for demonstration
  const mockJob = {
    id: "398c4ff8-05ad-4ed5-960a-ef2e7a727321",
    title: "Senior Backend Developer - Fintech",
    company: "Roxate Technologies",
  };

  const handleApplicationSuccess = (applicationId: string) => {
    console.log("Application submitted successfully:", applicationId);
    alert(
      `Application submitted successfully! Application ID: ${applicationId}`
    );
  };

  const handleApplicationError = (error: string) => {
    console.error("Application failed:", error);
    alert(`Application failed: ${error}`);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back
          </button>

          <h1 className="text-3xl font-bold text-white mb-4">
            Job Application Demo
          </h1>
          <p className="text-gray-400 text-lg mb-6">
            This page demonstrates the job application functionality with the
            API integration.
          </p>

          {/* Demo Job Card */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">
              {mockJob.title}
            </h2>
            <p className="text-gray-400 mb-4">
              at <span className="text-[#00C6AD]">{mockJob.company}</span>
            </p>
            <p className="text-gray-300 text-sm mb-4">
              This is a mock job posting for demonstration purposes. When you
              submit the application form below, it will send the data to the
              API endpoint{" "}
              <code className="bg-gray-700 px-2 py-1 rounded">
                POST /api/jobs/{mockJob.id}/apply
              </code>
              and automatically trigger the N8N webhook integration.
            </p>

            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-[#00C6AD] hover:bg-[#14B8A6] text-white px-6 py-2 rounded-lg transition-colors"
              >
                Apply Now
              </button>
            )}
          </div>
        </div>

        {/* Application Form */}
        {showForm && (
          <div className="max-w-2xl mx-auto">
            <JobApplicationForm
              jobId={mockJob.id}
              jobTitle={mockJob.title}
              companyName={mockJob.company}
              onSuccess={handleApplicationSuccess}
              onError={handleApplicationError}
            />
          </div>
        )}

        {/* API Documentation */}
        <div className="mt-12 bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            API Integration Details
          </h3>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="text-[#00C6AD] font-medium mb-2">Endpoint:</h4>
              <code className="bg-gray-700 px-3 py-2 rounded block text-gray-300">
                POST /api/jobs/{mockJob.id}/apply
              </code>
            </div>

            <div>
              <h4 className="text-[#00C6AD] font-medium mb-2">Request Body:</h4>
              <pre className="bg-gray-700 px-3 py-2 rounded text-gray-300 overflow-x-auto">
                {`{
  "jobId": "${mockJob.id}",
  "firstName": "Ahmad",
  "lastName": "Al-Rashid",
  "email": "ahmad.rashid@email.com",
  "phoneNumber": "+962791234567",
  "cvUrl": "https://storage.com/cv.pdf",
  "coverLetter": "I am very interested in this position..."
}`}
              </pre>
            </div>

            <div>
              <h4 className="text-[#00C6AD] font-medium mb-2">
                N8N Webhook Integration:
              </h4>
              <p className="text-gray-300 mb-2">
                Upon successful application submission, the data is
                automatically sent to:
              </p>
              <code className="bg-gray-700 px-3 py-2 rounded block text-gray-300">
                https://n8n.widd.ai/webhook-test/rovate2
              </code>
            </div>

            <div>
              <h4 className="text-[#00C6AD] font-medium mb-2">Features:</h4>
              <ul className="text-gray-300 space-y-1 ml-4">
                <li>• Form validation with real-time error handling</li>
                <li>• File upload for CV/Resume (PDF only, 5MB limit)</li>
                <li>• Automatic phone number formatting</li>
                <li>• Email validation</li>
                <li>• Success/error state management</li>
                <li>• Integration with N8N workflow automation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationDemo;
