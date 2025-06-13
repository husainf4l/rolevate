import React from "react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { JobFormData } from "./types";

interface JobPreviewProps {
  formData: JobFormData;
}

const JobPreview: React.FC<JobPreviewProps> = ({ formData }) => {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Job Preview</h2>
        <span className="px-3 py-1 bg-[#00C6AD]/20 text-[#00C6AD] rounded-full text-sm">
          Preview Mode
        </span>
      </div>

      {/* Job Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          {formData.title || "Job Title"}
        </h1>
        <div className="flex flex-wrap gap-4 text-gray-400">
          <span>{formData.department || "Department"}</span>
          <span>•</span>
          <span>{formData.location || "Location"}</span>
          <span>•</span>
          <span className="capitalize">{formData.workType.toLowerCase()}</span>
          <span>•</span>
          <span>{formData.experienceLevel.replace("_", " ")}</span>
        </div>
        {(formData.salaryMin || formData.salaryMax) && (
          <div className="mt-2">
            <span className="text-[#00C6AD] font-medium">
              {formData.currency} {formData.salaryMin?.toLocaleString()} -{" "}
              {formData.salaryMax?.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Job Content */}
      <div className="space-y-6">
        {formData.description && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              Job Description
            </h3>
            <p className="text-gray-300 whitespace-pre-wrap">
              {formData.description}
            </p>
          </div>
        )}

        {formData.requirements && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              Requirements
            </h3>
            <p className="text-gray-300 whitespace-pre-wrap">
              {formData.requirements}
            </p>
          </div>
        )}

        {formData.responsibilities && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              Responsibilities
            </h3>
            <p className="text-gray-300 whitespace-pre-wrap">
              {formData.responsibilities}
            </p>
          </div>
        )}

        {formData.benefits && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Benefits</h3>
            <p className="text-gray-300 whitespace-pre-wrap">
              {formData.benefits}
            </p>
          </div>
        )}

        {formData.skills.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              Required Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-[#00C6AD]/20 text-[#00C6AD] rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {formData.enableAiInterview && (
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <h3 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5" />
              AI Interview Configuration
            </h3>
            <div className="space-y-3 text-sm">
              <p className="text-blue-200">
                <strong>Duration:</strong> {formData.interviewDuration} minutes
              </p>
              <p className="text-blue-200">
                <strong>Language Support:</strong> Arabic & English
              </p>
              {formData.aiPrompt && (
                <div>
                  <p className="text-blue-200 font-medium mb-1">
                    AI Interviewer Prompt:
                  </p>
                  <div className="bg-blue-900/30 rounded p-2 text-blue-100 text-xs max-h-20 overflow-y-auto">
                    {formData.aiPrompt.substring(0, 150)}...
                  </div>
                </div>
              )}
              {formData.aiInstructions && (
                <div>
                  <p className="text-blue-200 font-medium mb-1">
                    Interview Instructions:
                  </p>
                  <div className="bg-blue-900/30 rounded p-2 text-blue-100 text-xs max-h-20 overflow-y-auto">
                    {formData.aiInstructions.substring(0, 150)}...
                  </div>
                </div>
              )}
              <p className="text-blue-200 text-xs italic">
                Qualified candidates will be automatically invited to complete
                an AI-powered interview.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobPreview;
