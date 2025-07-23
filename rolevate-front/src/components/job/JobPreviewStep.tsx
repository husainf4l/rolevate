"use client";

import React from "react";
import { EyeIcon } from "@heroicons/react/24/outline";
import { JobFormData } from "./types";

interface JobPreviewStepProps {
  jobData: JobFormData;
}

// Helper functions for display text
const getTypeDisplayText = (type: JobFormData["type"]) => {
  switch (type) {
    case "FULL_TIME":
      return "Full-time";
    case "PART_TIME":
      return "Part-time";
    case "CONTRACT":
      return "Contract";
    case "REMOTE":
      return "Remote";
    default:
      return type;
  }
};

const getJobLevelDisplayText = (jobLevel: JobFormData["jobLevel"]) => {
  switch (jobLevel) {
    case "ENTRY":
      return "Entry Level";
    case "MID":
      return "Mid Level";
    case "SENIOR":
      return "Senior Level";
    case "EXECUTIVE":
      return "Executive";
    default:
      return jobLevel;
  }
};

const getWorkTypeDisplayText = (workType: JobFormData["workType"]) => {
  switch (workType) {
    case "ONSITE":
      return "On-site";
    case "REMOTE":
      return "Remote";
    case "HYBRID":
      return "Hybrid";
    default:
      return workType;
  }
};

export default function JobPreviewStep({ jobData }: JobPreviewStepProps) {
  return (
    <div className="p-8 lg:p-12 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-xl shadow-lg">
          <EyeIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">
            Preview & Publish
          </h2>
          <p className="text-[#6e6e73] text-sm mt-1">
            Review your job posting before publishing
          </p>
        </div>
      </div>

      <div className="bg-white/50 border border-[#d2d2d7] rounded-xl p-6 space-y-6">
        <div className="border-b border-[#d2d2d7] pb-4">
          <h3 className="text-2xl font-bold text-[#1d1d1f] mb-2">
            {jobData.title}
          </h3>
          <div className="flex flex-wrap gap-4 text-sm text-[#6e6e73] mb-3">
            <span>📍 {jobData.location}</span>
            <span>💼 {getTypeDisplayText(jobData.type)}</span>
            <span>📈 {getJobLevelDisplayText(jobData.jobLevel)}</span>
            <span>🏢 {getWorkTypeDisplayText(jobData.workType)}</span>
            <span>💰 {jobData.salary}</span>
          </div>
          {jobData.shortDescription && (
            <p className="text-[#6e6e73] bg-gray-50 p-3 rounded-lg text-sm">
              {jobData.shortDescription}
            </p>
          )}
        </div>

        <div>
          <h4 className="font-semibold text-[#1d1d1f] mb-2">Job Description</h4>
          <p className="text-[#6e6e73] whitespace-pre-line">
            {jobData.description}
          </p>
        </div>

        {jobData.responsibilities && (
          <div>
            <h4 className="font-semibold text-[#1d1d1f] mb-2">
              Key Responsibilities
            </h4>
            <p className="text-[#6e6e73] whitespace-pre-line">
              {jobData.responsibilities}
            </p>
          </div>
        )}

        <div>
          <h4 className="font-semibold text-[#1d1d1f] mb-2">Requirements</h4>
          <p className="text-[#6e6e73] whitespace-pre-line">
            {jobData.requirements}
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-[#1d1d1f] mb-2">Required Skills</h4>
          <div className="flex flex-wrap gap-2">
            {jobData.skills.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-[#13ead9]/10 text-[#0891b2] rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {jobData.benefits && (
          <div>
            <h4 className="font-semibold text-[#1d1d1f] mb-2">
              Benefits & Perks
            </h4>
            <p className="text-[#6e6e73] whitespace-pre-line">
              {jobData.benefits}
            </p>
          </div>
        )}

        {/* AI Configuration Preview */}
        {(jobData.aiCvAnalysisPrompt ||
          jobData.aiFirstInterviewPrompt ||
          jobData.aiSecondInterviewPrompt) && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              AI Recruitment Configuration
            </h4>
            <div className="space-y-3">
              {jobData.aiCvAnalysisPrompt && (
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-1">
                    CV Analysis Prompt:
                  </p>
                  <p className="text-sm text-blue-700 bg-white/50 p-2 rounded">
                    {jobData.aiCvAnalysisPrompt}
                  </p>
                </div>
              )}
              {jobData.aiFirstInterviewPrompt && (
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-1">
                    First Interview Prompt:
                  </p>
                  <p className="text-sm text-blue-700 bg-white/50 p-2 rounded">
                    {jobData.aiFirstInterviewPrompt}
                  </p>
                </div>
              )}
              {jobData.aiSecondInterviewPrompt && (
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-1">
                    Second Interview Prompt:
                  </p>
                  <p className="text-sm text-blue-700 bg-white/50 p-2 rounded">
                    {jobData.aiSecondInterviewPrompt}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {jobData.screeningQuestions.length > 0 && (
          <div>
            <h4 className="font-semibold text-[#1d1d1f] mb-2">
              Screening Questions
            </h4>
            <div className="space-y-2">
              {jobData.screeningQuestions.map((question, index) => (
                <div key={question.id} className="bg-white/50 p-3 rounded-lg">
                  <p className="text-[#1d1d1f] font-medium">
                    {index + 1}. {question.question}
                  </p>
                  <p className="text-sm text-[#6e6e73]">
                    Type: {question.type.replace("_", " ")} •{" "}
                    {question.required ? "Required" : "Optional"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-[#6e6e73] pt-4 border-t border-[#d2d2d7]">
          <span>
            📅 Apply by: {new Date(jobData.deadline).toLocaleDateString()}
          </span>
          <span>🏢 {jobData.department}</span>
          <span>🏭 {jobData.industry}</span>
        </div>
      </div>
    </div>
  );
}
