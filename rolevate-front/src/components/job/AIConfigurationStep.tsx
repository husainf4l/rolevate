"use client";

import React from "react";
import { CpuChipIcon } from "@heroicons/react/24/outline";
import { JobFormData, FormErrors } from "./types";
import { Textarea } from "@/components/ui/textarea";

interface AIConfigurationStepProps {
  jobData: JobFormData;
  errors: FormErrors;
  onInputChange: (field: keyof JobFormData, value: string) => void;
  isGenerating?: boolean;
  onRegeneratePrompts?: () => void;
}

export default function AIConfigurationStep({
  jobData,
  errors: _errors,
  onInputChange,
  isGenerating = false,
  onRegeneratePrompts,
}: AIConfigurationStepProps) {
  return (
    <div className="p-8 lg:p-12 space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
          <CpuChipIcon className="w-6 h-6 text-gray-700" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            AI Recruitment Configuration
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Configure AI prompts for automated CV analysis and interview stages
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-600"
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
              AI-Powered Recruitment
            </h3>
            <p className="text-gray-600 text-sm">
              Configure how AI will analyze CVs and conduct interviews for this
              position. These prompts will guide the AI through each stage of
              your recruitment process, ensuring consistent and effective
              candidate evaluation.
            </p>
            {isGenerating && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-sm text-blue-700 font-medium">
                  Generating AI prompts based on your job details...
                </span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* AI CV Analysis Prompt */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label
                  htmlFor="aiCvAnalysisPrompt"
                  className="block text-sm font-semibold text-gray-900"
                >
                  AI CV Analysis Prompt
                </label>
                {jobData.aiCvAnalysisPrompt && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    AI Generated
                  </span>
                )}
              </div>
              <div className="relative">
                <Textarea
                  id="aiCvAnalysisPrompt"
                  rows={5}
                  value={jobData.aiCvAnalysisPrompt}
                  onChange={(e) =>
                    onInputChange("aiCvAnalysisPrompt", e.target.value)
                  }
                  className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all duration-200 placeholder-gray-500 text-gray-900"
                  placeholder="Define how AI should analyze candidate CVs for this position. Example: Analyze the candidate's technical skills, experience level, and project portfolio. Focus on React expertise, problem-solving abilities, and team collaboration experience. Look for relevant education, certifications, and career progression that aligns with our requirements..."
                  maxLength={1000}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                  {jobData.aiCvAnalysisPrompt.length}/1000
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                This prompt guides how AI evaluates and scores candidate CVs
                before proceeding to interviews.
              </p>
            </div>

            {/* AI First Interview Questions Prompt */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label
                  htmlFor="aiFirstInterviewPrompt"
                  className="block text-sm font-semibold text-gray-900"
                >
                  AI First Interview Questions Prompt
                </label>
                {jobData.aiFirstInterviewPrompt && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    AI Generated
                  </span>
                )}
              </div>
              <div className="relative">
                <Textarea
                  id="aiFirstInterviewPrompt"
                  rows={5}
                  value={jobData.aiFirstInterviewPrompt}
                  onChange={(e) =>
                    onInputChange("aiFirstInterviewPrompt", e.target.value)
                  }
                  className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all duration-200 placeholder-gray-500 text-gray-900"
                  placeholder="Define questions and evaluation criteria for the first AI interview. Example: Ask about technical fundamentals, coding experience, and problem-solving approach. Evaluate communication skills and basic technical knowledge. Include questions about motivation, career goals, and understanding of the role..."
                  maxLength={1000}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                  {jobData.aiFirstInterviewPrompt.length}/1000
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                First interview focuses on basic qualifications and cultural fit
                assessment.
              </p>
            </div>

            {/* AI Second Interview Questions Prompt */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label
                  htmlFor="aiSecondInterviewPrompt"
                  className="block text-sm font-semibold text-gray-900"
                >
                  AI Second Interview Questions Prompt
                </label>
                {jobData.aiSecondInterviewPrompt && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    AI Generated
                  </span>
                )}
              </div>
              <div className="relative">
                <Textarea
                  id="aiSecondInterviewPrompt"
                  rows={5}
                  value={jobData.aiSecondInterviewPrompt}
                  onChange={(e) =>
                    onInputChange("aiSecondInterviewPrompt", e.target.value)
                  }
                  className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all duration-200 placeholder-gray-500 text-gray-900"
                  placeholder="Define advanced questions and evaluation criteria for the second AI interview. Example: Assess advanced technical skills, system design thinking, leadership potential, and cultural fit. Include scenario-based questions, problem-solving challenges, and deeper technical discussions relevant to the role..."
                  maxLength={1000}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                  {jobData.aiSecondInterviewPrompt.length}/1000
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Second interview dives deeper into technical skills and advanced
                competencies.
              </p>
            </div>
          </div>

          {/* Regenerate Button */}
          {(jobData.aiCvAnalysisPrompt ||
            jobData.aiFirstInterviewPrompt ||
            jobData.aiSecondInterviewPrompt) &&
            onRegeneratePrompts && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onRegeneratePrompts}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Regenerate AI Prompts
                    </>
                  )}
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

