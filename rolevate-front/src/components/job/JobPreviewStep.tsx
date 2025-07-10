"use client";

import React from "react";
import { EyeIcon } from "@heroicons/react/24/outline";
import { JobFormData } from "./types";

interface JobPreviewStepProps {
  jobData: JobFormData;
}

export default function JobPreviewStep({ jobData }: JobPreviewStepProps) {
  return (
    <div className="p-8 lg:p-12 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-xl shadow-lg">
          <EyeIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">Preview & Publish</h2>
          <p className="text-[#6e6e73] text-sm mt-1">Review your job posting before publishing</p>
        </div>
      </div>

      <div className="bg-white/50 border border-[#d2d2d7] rounded-xl p-6 space-y-6">
        <div className="border-b border-[#d2d2d7] pb-4">
          <h3 className="text-2xl font-bold text-[#1d1d1f] mb-2">{jobData.title}</h3>
          <div className="flex flex-wrap gap-4 text-sm text-[#6e6e73]">
            <span>📍 {jobData.location}</span>
            <span>💼 {jobData.type}</span>
            <span>📈 {jobData.jobLevel}</span>
            <span>🏢 {jobData.workType}</span>
            <span>💰 {jobData.salary}</span>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-[#1d1d1f] mb-2">Job Description</h4>
          <p className="text-[#6e6e73] whitespace-pre-line">{jobData.description}</p>
        </div>

        <div>
          <h4 className="font-semibold text-[#1d1d1f] mb-2">Requirements</h4>
          <p className="text-[#6e6e73] whitespace-pre-line">{jobData.requirements}</p>
        </div>

        <div>
          <h4 className="font-semibold text-[#1d1d1f] mb-2">Required Skills</h4>
          <div className="flex flex-wrap gap-2">
            {jobData.skills.map((skill, index) => (
              <span key={index} className="px-2 py-1 bg-[#13ead9]/10 text-[#0891b2] rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {jobData.benefits && (
          <div>
            <h4 className="font-semibold text-[#1d1d1f] mb-2">Benefits & Perks</h4>
            <p className="text-[#6e6e73] whitespace-pre-line">{jobData.benefits}</p>
          </div>
        )}

        {jobData.screeningQuestions.length > 0 && (
          <div>
            <h4 className="font-semibold text-[#1d1d1f] mb-2">Screening Questions</h4>
            <div className="space-y-2">
              {jobData.screeningQuestions.map((question, index) => (
                <div key={question.id} className="bg-white/50 p-3 rounded-lg">
                  <p className="text-[#1d1d1f] font-medium">{index + 1}. {question.question}</p>
                  <p className="text-sm text-[#6e6e73]">
                    Type: {question.type.replace('_', ' ')} • {question.required ? 'Required' : 'Optional'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-[#6e6e73] pt-4 border-t border-[#d2d2d7]">
          <span>📅 Apply by: {new Date(jobData.deadline).toLocaleDateString()}</span>
          <span>🏢 {jobData.department}</span>
          <span>🏭 {jobData.industry}</span>
        </div>
      </div>
    </div>
  );
}