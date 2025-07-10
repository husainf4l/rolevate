"use client";

import React from "react";
import {
  DocumentTextIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { JobFormData, FormErrors } from "./types";
import SkillsManager from "./SkillsManager";

interface JobDetailsStepProps {
  jobData: JobFormData;
  errors: FormErrors;
  aiGenerating?: boolean;
  regeneratingRequirements?: boolean;
  onInputChange: (field: keyof JobFormData, value: string | string[]) => void;
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
  onRegenerateDescription?: () => void;
  onRegenerateRequirements?: () => void;
  skillSuggestions: string[];
}

export default function JobDetailsStep({ 
  jobData, 
  errors, 
  aiGenerating,
  regeneratingRequirements,
  onInputChange, 
  onAddSkill, 
  onRemoveSkill,
  onRegenerateDescription,
  onRegenerateRequirements,
  skillSuggestions 
}: JobDetailsStepProps) {
  return (
    <div className="p-8 lg:p-12 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-xl shadow-lg">
          <DocumentTextIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">Job Details</h2>
          <p className="text-[#6e6e73] text-sm mt-1">Detailed description and requirements</p>
        </div>
      </div>
      
      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="description" className="block text-sm font-semibold text-[#1d1d1f]">
              Job Description *
            </label>
            {onRegenerateDescription && jobData.description.trim() && (
              <button
                type="button"
                onClick={onRegenerateDescription}
                disabled={aiGenerating}
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#13ead9] to-[#0891b2] rounded-lg disabled:opacity-50 hover:from-[#0891b2] hover:to-[#0e7490] transition-all duration-200"
              >
                {aiGenerating ? (
                  <>
                    <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Rewriting...
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate with AI
                  </>
                )}
              </button>
            )}
          </div>
          <div className="relative">
            <textarea
              id="description"
              rows={8}
              value={jobData.description}
              onChange={(e) => onInputChange("description", e.target.value)}
              className={`w-full px-4 py-4 bg-white/80 border rounded-xl focus:ring-2 focus:ring-[#13ead9] focus:border-transparent resize-none transition-all duration-200 placeholder-[#86868b] text-[#1d1d1f] backdrop-blur-sm ${
                errors.description ? 'border-red-400' : 'border-[#d2d2d7]'
              }`}
              placeholder="Provide a comprehensive description of the role, including key responsibilities, day-to-day tasks, and what success looks like in this position..."
              maxLength={2000}
            />
            <div className="absolute bottom-3 right-3 text-xs text-[#86868b]">
              {jobData.description.length}/2000
            </div>
          </div>
          {errors.description && <p className="mt-2 text-sm text-red-500">{errors.description}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="requirements" className="block text-sm font-semibold text-[#1d1d1f]">
              Requirements & Qualifications *
            </label>
            {onRegenerateRequirements && jobData.requirements.trim() && (
              <button
                type="button"
                onClick={onRegenerateRequirements}
                disabled={regeneratingRequirements}
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#13ead9] to-[#0891b2] rounded-lg disabled:opacity-50 hover:from-[#0891b2] hover:to-[#0e7490] transition-all duration-200"
              >
                {regeneratingRequirements ? (
                  <>
                    <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Rewriting...
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate with AI
                  </>
                )}
              </button>
            )}
          </div>
          <div className="relative">
            <textarea
              id="requirements"
              rows={6}
              value={jobData.requirements}
              onChange={(e) => onInputChange("requirements", e.target.value)}
              className={`w-full px-4 py-4 bg-white/80 border rounded-xl focus:ring-2 focus:ring-[#13ead9] focus:border-transparent resize-none transition-all duration-200 placeholder-[#86868b] text-[#1d1d1f] backdrop-blur-sm ${
                errors.requirements ? 'border-red-400' : 'border-[#d2d2d7]'
              }`}
              placeholder="List essential qualifications, skills, experience level, education requirements, and any certifications needed..."
              maxLength={1500}
            />
            <div className="absolute bottom-3 right-3 text-xs text-[#86868b]">
              {jobData.requirements.length}/1500
            </div>
          </div>
          {errors.requirements && <p className="mt-2 text-sm text-red-500">{errors.requirements}</p>}
        </div>

        <div>
          <label htmlFor="experience" className="block text-sm font-semibold text-[#1d1d1f] mb-3">
            Experience Level *
          </label>
          <select
            id="experience"
            value={jobData.experience}
            onChange={(e) => onInputChange("experience", e.target.value)}
            className={`w-full px-4 py-4 bg-white/80 border rounded-xl focus:ring-2 focus:ring-[#13ead9] focus:border-transparent transition-all duration-200 text-[#1d1d1f] backdrop-blur-sm appearance-none ${
              errors.experience ? 'border-red-400' : 'border-[#d2d2d7]'
            }`}
          >
            <option value="">Select experience level</option>
            <option value="0-1 years">0-1 years</option>
            <option value="1-3 years">1-3 years</option>
            <option value="3-5 years">3-5 years</option>
            <option value="5-7 years">5-7 years</option>
            <option value="7+ years">7+ years</option>
          </select>
          {errors.experience && <p className="mt-2 text-sm text-red-500">{errors.experience}</p>}
        </div>

        <div>
          <label htmlFor="education" className="block text-sm font-semibold text-[#1d1d1f] mb-3">
            Education Requirements
          </label>
          <select
            id="education"
            value={jobData.education}
            onChange={(e) => onInputChange("education", e.target.value)}
            className="w-full px-4 py-4 bg-white/80 border border-[#d2d2d7] rounded-xl focus:ring-2 focus:ring-[#13ead9] focus:border-transparent transition-all duration-200 text-[#1d1d1f] backdrop-blur-sm appearance-none"
          >
            <option value="">Select education level</option>
            <option value="High School">High School</option>
            <option value="Bachelor's Degree">Bachelor's Degree</option>
            <option value="Master's Degree">Master's Degree</option>
            <option value="PhD">PhD</option>
            <option value="Professional Certification">Professional Certification</option>
            <option value="Not Required">Not Required</option>
          </select>
        </div>

        <div>
          <label htmlFor="salary" className="text-sm font-semibold text-[#1d1d1f] mb-3 flex items-center gap-2">
            <CurrencyDollarIcon className="w-4 h-4 text-[#6e6e73]" />
            Salary Range *
          </label>
          <input
            type="text"
            id="salary"
            value={jobData.salary}
            onChange={(e) => onInputChange("salary", e.target.value)}
            className={`w-full px-4 py-4 bg-white/80 border rounded-xl focus:ring-2 focus:ring-[#13ead9] focus:border-transparent transition-all duration-200 placeholder-[#86868b] text-[#1d1d1f] backdrop-blur-sm ${
              errors.salary ? 'border-red-400' : 'border-[#d2d2d7]'
            }`}
            placeholder="e.g. AED 15,000 - 20,000 (AI will suggest based on job details)"
          />
          {errors.salary && <p className="mt-2 text-sm text-red-500">{errors.salary}</p>}
          <p className="mt-1 text-xs text-[#6e6e73]">💡 AI will suggest competitive salary ranges based on your job requirements</p>
        </div>

        <SkillsManager
          skills={jobData.skills}
          skillSuggestions={skillSuggestions}
          onAddSkill={onAddSkill}
          onRemoveSkill={onRemoveSkill}
          error={errors.skills}
        />

        <div>
          <label htmlFor="benefits" className="block text-sm font-semibold text-[#1d1d1f] mb-3">
            Benefits & Perks
            <span className="text-[#6e6e73] font-normal ml-1">(Optional)</span>
          </label>
          <div className="relative">
            <textarea
              id="benefits"
              rows={5}
              value={jobData.benefits}
              onChange={(e) => onInputChange("benefits", e.target.value)}
              className="w-full px-4 py-4 bg-white/80 border border-[#d2d2d7] rounded-xl focus:ring-2 focus:ring-[#13ead9] focus:border-transparent resize-none transition-all duration-200 placeholder-[#86868b] text-[#1d1d1f] backdrop-blur-sm"
              placeholder="Highlight what makes your company special - health insurance, flexible work arrangements, professional development opportunities, company culture, etc..."
              maxLength={1000}
            />
            <div className="absolute bottom-3 right-3 text-xs text-[#86868b]">
              {jobData.benefits.length}/1000
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}