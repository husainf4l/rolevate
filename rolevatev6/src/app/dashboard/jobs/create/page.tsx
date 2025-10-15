"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function CreateJobPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Create New Job</h1>
            <p className="text-gray-600 mt-2">
              Create and manage job postings for your organization.
            </p>
          </div>

          {/* Placeholder Content */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Job Creation Form
              </h2>
              <p className="text-gray-600">
                This feature is currently under development. The job creation form 
                will be available soon with AI-powered job description generation 
                and advanced configuration options.
              </p>
              <button
                onClick={() => router.push('/dashboard/jobs')}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                View Existing Jobs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}