"use client";

import React, { useState, useEffect } from "react";
import {
  DocumentTextIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { JobFormData, FormErrors } from "./types";
import SkillsManager from "./SkillsManager";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface JobDetailsStepProps {
  jobData: JobFormData;
  errors: FormErrors;
  aiGenerating?: boolean;
  regeneratingRequirements?: boolean;
  regeneratingBenefits?: boolean;
  regeneratingResponsibilities?: boolean;
  onInputChange: (field: keyof JobFormData, value: string | string[]) => void;
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
  onRegenerateDescription?: () => void;
  onRegenerateRequirements?: () => void;
  onRegenerateBenefits?: () => void;
  onRegenerateResponsibilities?: () => void;
  skillSuggestions: string[];
}

export default function JobDetailsStep({
  jobData,
  errors,
  aiGenerating,
  regeneratingRequirements,
  regeneratingBenefits,
  regeneratingResponsibilities,
  onInputChange,
  onAddSkill,
  onRemoveSkill,
  onRegenerateDescription,
  onRegenerateRequirements,
  onRegenerateBenefits,
  onRegenerateResponsibilities,
  skillSuggestions,
}: JobDetailsStepProps) {
  // State to track if custom experience range is selected
  const [showCustomExperience, setShowCustomExperience] = useState(false);
  const [minYears, setMinYears] = useState("");
  const [maxYears, setMaxYears] = useState("");

  // Predefined experience options
  const experienceOptions = [
    "0-1 years",
    "1-3 years",
    "3-5 years",
    "5-7 years",
    "7+ years",
  ];

  // Check if current experience value is a predefined option and parse custom values
  useEffect(() => {
    const isCustom = Boolean(
      jobData.experience && !experienceOptions.includes(jobData.experience)
    );
    setShowCustomExperience(isCustom);

    // Parse custom range if it exists (e.g., "2-4 years" -> min: 2, max: 4)
    if (isCustom && jobData.experience) {
      const match = jobData.experience.match(/(\d+)\s*-\s*(\d+)/);
      if (match && match[1] && match[2]) {
        setMinYears(match[1]);
        setMaxYears(match[2]);
      } else if (jobData.experience.includes("+")) {
        const plusMatch = jobData.experience.match(/(\d+)\+/);
        if (plusMatch && plusMatch[1]) {
          setMinYears(plusMatch[1]);
          setMaxYears("");
        }
      }
    }
  }, [jobData.experience]);

  // Handle experience selection change
  const handleExperienceChange = (value: string) => {
    if (value === "custom") {
      setShowCustomExperience(true);
      setMinYears("");
      setMaxYears("");
      onInputChange("experience", "");
    } else {
      setShowCustomExperience(false);
      onInputChange("experience", value);
    }
  };

  // Handle custom range changes
  const handleCustomRangeChange = () => {
    if (minYears && maxYears) {
      onInputChange("experience", `${minYears}-${maxYears} years`);
    } else if (minYears && !maxYears) {
      onInputChange("experience", `${minYears}+ years`);
    } else {
      onInputChange("experience", "");
    }
  };

  // Update experience when min/max changes
  useEffect(() => {
    if (showCustomExperience) {
      handleCustomRangeChange();
    }
  }, [minYears, maxYears, showCustomExperience]);

  return (
    <div className="p-8 lg:p-12 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-xl shadow-lg">
          <DocumentTextIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">
            Job Details
          </h2>
          <p className="text-[#6e6e73] text-sm mt-1">
            Detailed description and requirements
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-3">
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-[#1d1d1f]"
            >
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
                    <svg
                      className="w-3 h-3 mr-2"
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
                    Regenerate with AI
                  </>
                )}
              </button>
            )}
          </div>
          <div className="relative">
            <Textarea
              id="description"
              rows={8}
              value={jobData.description}
              onChange={(e) => onInputChange("description", e.target.value)}
              className={`w-full px-4 py-4 bg-white/80 border rounded-xl focus:ring-2 focus:ring-[#13ead9] focus:border-transparent resize-none transition-all duration-200 placeholder-[#86868b] text-[#1d1d1f] backdrop-blur-sm ${
                errors.description ? "border-red-400" : "border-[#d2d2d7]"
              }`}
              placeholder="Provide a comprehensive description of the role, including key responsibilities, day-to-day tasks, and what success looks like in this position..."
              maxLength={2000}
            />
            <div className="absolute bottom-3 right-3 text-xs text-[#86868b]">
              {jobData.description.length}/2000
            </div>
          </div>
          {errors.description && (
            <p className="mt-2 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        <div>
          <Label
            htmlFor="shortDescription"
            className="block text-sm font-semibold text-[#1d1d1f] mb-3"
          >
            Short Description *
          </Label>
          <div className="relative">
            <Textarea
              id="shortDescription"
              rows={3}
              value={jobData.shortDescription}
              onChange={(e) =>
                onInputChange("shortDescription", e.target.value)
              }
              className={`w-full px-4 py-4 bg-white/80 border rounded-xl focus:ring-2 focus:ring-[#13ead9] focus:border-transparent resize-none transition-all duration-200 placeholder-[#86868b] text-[#1d1d1f] backdrop-blur-sm ${
                errors.shortDescription ? "border-red-400" : "border-[#d2d2d7]"
              }`}
              placeholder="A brief summary of the role that will appear in job listings and search results..."
              maxLength={200}
            />
            <div className="absolute bottom-3 right-3 text-xs text-[#86868b]">
              {jobData.shortDescription.length}/200
            </div>
          </div>
          {errors.shortDescription && (
            <p className="mt-2 text-sm text-red-500">
              {errors.shortDescription}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label
              htmlFor="responsibilities"
              className="block text-sm font-semibold text-[#1d1d1f]"
            >
              Key Responsibilities *
            </label>
            {onRegenerateResponsibilities &&
              jobData.responsibilities.trim() && (
                <button
                  type="button"
                  onClick={onRegenerateResponsibilities}
                  disabled={regeneratingResponsibilities}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#13ead9] to-[#0891b2] rounded-lg disabled:opacity-50 hover:from-[#0891b2] hover:to-[#0e7490] transition-all duration-200"
                >
                  {regeneratingResponsibilities ? (
                    <>
                      <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Rewriting...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3 h-3 mr-2"
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
                      Regenerate with AI
                    </>
                  )}
                </button>
              )}
          </div>
          <div className="relative">
            <Textarea
              id="responsibilities"
              rows={6}
              value={jobData.responsibilities}
              onChange={(e) =>
                onInputChange("responsibilities", e.target.value)
              }
              className={`w-full px-4 py-4 bg-white/80 border rounded-xl focus:ring-2 focus:ring-[#13ead9] focus:border-transparent resize-none transition-all duration-200 placeholder-[#86868b] text-[#1d1d1f] backdrop-blur-sm ${
                errors.responsibilities ? "border-red-400" : "border-[#d2d2d7]"
              }`}
              placeholder="List the main duties and responsibilities for this role, including day-to-day tasks, key deliverables, and expected outcomes..."
              maxLength={1500}
            />
            <div className="absolute bottom-3 right-3 text-xs text-[#86868b]">
              {jobData.responsibilities.length}/1500
            </div>
          </div>
          {errors.responsibilities && (
            <p className="mt-2 text-sm text-red-500">
              {errors.responsibilities}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label
              htmlFor="requirements"
              className="block text-sm font-semibold text-[#1d1d1f]"
            >
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
                    <svg
                      className="w-3 h-3 mr-2"
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
                    Regenerate with AI
                  </>
                )}
              </button>
            )}
          </div>
          <div className="relative">
            <Textarea
              id="requirements"
              rows={6}
              value={jobData.requirements}
              onChange={(e) => onInputChange("requirements", e.target.value)}
              className={`w-full px-4 py-4 bg-white/80 border rounded-xl focus:ring-2 focus:ring-[#13ead9] focus:border-transparent resize-none transition-all duration-200 placeholder-[#86868b] text-[#1d1d1f] backdrop-blur-sm ${
                errors.requirements ? "border-red-400" : "border-[#d2d2d7]"
              }`}
              placeholder="List essential qualifications, skills, experience level, education requirements, and any certifications needed..."
              maxLength={1500}
            />
            <div className="absolute bottom-3 right-3 text-xs text-[#86868b]">
              {jobData.requirements.length}/1500
            </div>
          </div>
          {errors.requirements && (
            <p className="mt-2 text-sm text-red-500">{errors.requirements}</p>
          )}
        </div>

        <div>
          <Label
            htmlFor="experience"
            className="block text-sm font-semibold text-[#1d1d1f] mb-3"
          >
            Experience Level *
          </Label>

          <div className="space-y-4">
            <Select
              value={
                showCustomExperience
                  ? "custom"
                  : experienceOptions.includes(jobData.experience)
                  ? jobData.experience
                  : ""
              }
              onValueChange={(value) => handleExperienceChange(value)}
            >
              <SelectTrigger className={`w-full px-4 py-4 bg-white/80 border rounded-xl focus:ring-2 focus:ring-[#13ead9] focus:border-transparent transition-all duration-200 text-[#1d1d1f] backdrop-blur-sm appearance-none ${
                errors.experience ? "border-red-400" : "border-[#d2d2d7]"
              }`}>
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                {experienceOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {/* Custom Range Inputs */}
            {showCustomExperience && (
              <div className="bg-white/50 border border-[#d2d2d7] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-[#1d1d1f] mb-3">
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Custom Experience Range
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="min-years"
                      className="block text-xs font-medium text-[#6e6e73] mb-2"
                    >
                      Minimum Years
                    </Label>
                    <Input
                      type="number"
                      id="min-years"
                      min="0"
                      max="50"
                      value={minYears}
                      onChange={(e) => setMinYears(e.target.value)}
                      className="w-full px-3 py-2 bg-white/80 border border-[#d2d2d7] rounded-lg focus:ring-2 focus:ring-[#13ead9] focus:border-transparent transition-all duration-200 text-[#1d1d1f] text-sm"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="max-years"
                      className="block text-xs font-medium text-[#6e6e73] mb-2"
                    >
                      Maximum Years{" "}
                      <span className="text-[#86868b]">
                        (Leave empty for "X+ years")
                      </span>
                    </Label>
                    <Input
                      type="number"
                      id="max-years"
                      min="0"
                      max="50"
                      value={maxYears}
                      onChange={(e) => setMaxYears(e.target.value)}
                      className="w-full px-3 py-2 bg-white/80 border border-[#d2d2d7] rounded-lg focus:ring-2 focus:ring-[#13ead9] focus:border-transparent transition-all duration-200 text-[#1d1d1f] text-sm"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                {/* Preview */}
                {(minYears || maxYears) && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-[#13ead9]/10 to-[#0891b2]/10 rounded-lg border border-[#13ead9]/20">
                    <div className="text-xs font-medium text-[#6e6e73] mb-1">
                      Preview:
                    </div>
                    <div className="text-sm font-semibold text-[#1d1d1f]">
                      {minYears && maxYears
                        ? `${minYears}-${maxYears} years experience`
                        : minYears
                        ? `${minYears}+ years experience`
                        : "Please enter minimum years"}
                    </div>
                  </div>
                )}

                {/* Back to predefined options */}
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomExperience(false);
                    setMinYears("");
                    setMaxYears("");
                    onInputChange("experience", "");
                  }}
                  className="text-xs text-[#6e6e73] hover:text-[#13ead9] transition-colors duration-200 flex items-center gap-1"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to predefined options
                </button>
              </div>
            )}
          </div>

          {errors.experience && (
            <p className="mt-2 text-sm text-red-500">{errors.experience}</p>
          )}
        </div>

        <div>
          <Label
            htmlFor="education"
            className="block text-sm font-semibold text-[#1d1d1f] mb-3"
          >
            Education Requirements
          </Label>
          <Select
            value={jobData.education}
            onValueChange={(value) => onInputChange("education", value)}
          >
            <SelectTrigger className="w-full px-4 py-4 bg-white/80 border border-[#d2d2d7] rounded-xl focus:ring-2 focus:ring-[#13ead9] focus:border-transparent transition-all duration-200 text-[#1d1d1f] backdrop-blur-sm appearance-none">
              <SelectValue placeholder="Select education level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="High School">High School</SelectItem>
              <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
              <SelectItem value="Master's Degree">Master's Degree</SelectItem>
              <SelectItem value="PhD">PhD</SelectItem>
              <SelectItem value="Professional Certification">
                Professional Certification
              </SelectItem>
              <SelectItem value="Not Required">Not Required</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label
            htmlFor="salary"
            className="text-sm font-semibold text-[#1d1d1f] mb-3 flex items-center gap-2"
          >
            <CurrencyDollarIcon className="w-4 h-4 text-[#6e6e73]" />
            Salary Range *
          </Label>
          <Input
            type="text"
            id="salary"
            value={jobData.salary}
            onChange={(e) => onInputChange("salary", e.target.value)}
            className={`w-full px-4 py-4 bg-white/80 border rounded-xl focus:ring-2 focus:ring-[#13ead9] focus:border-transparent transition-all duration-200 placeholder-[#86868b] text-[#1d1d1f] backdrop-blur-sm ${
              errors.salary ? "border-red-400" : "border-[#d2d2d7]"
            }`}
            placeholder="e.g. AED 15,000 - 20,000 (AI will suggest based on job details)"
          />
          {errors.salary && (
            <p className="mt-2 text-sm text-red-500">{errors.salary}</p>
          )}
        </div>

        <SkillsManager
          skills={jobData.skills}
          skillSuggestions={skillSuggestions}
          onAddSkill={onAddSkill}
          onRemoveSkill={onRemoveSkill}
          error={errors.skills}
        />

        <div>
          <div className="flex items-center justify-between mb-3">
            <label
              htmlFor="benefits"
              className="block text-sm font-semibold text-[#1d1d1f]"
            >
              Benefits & Perks
              <span className="text-[#6e6e73] font-normal ml-1">
                (Optional)
              </span>
            </label>
            {onRegenerateBenefits && jobData.benefits.trim() && (
              <button
                type="button"
                onClick={onRegenerateBenefits}
                disabled={regeneratingBenefits}
                className="px-3 py-1.5 bg-gradient-to-r from-[#13ead9] to-[#0891b2] text-white rounded-lg hover:from-[#11d4c4] hover:to-[#0784a6] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
              >
                {regeneratingBenefits ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Regenerating...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3.5 h-3.5"
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
                    Regenerate with AI
                  </>
                )}
              </button>
            )}
          </div>
          <div className="relative">
            <Textarea
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

