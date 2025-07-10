"use client";

import React from "react";
import {
  BriefcaseIcon,
  MapPinIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { JobFormData, FormErrors } from "./types";

interface BasicInformationStepProps {
  jobData: JobFormData;
  errors: FormErrors;
  onInputChange: (field: keyof JobFormData, value: string) => void;
}

export default function BasicInformationStep({ 
  jobData, 
  errors, 
  onInputChange 
}: BasicInformationStepProps) {
  return (
    <div className="p-8 lg:p-12 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-xl shadow-lg">
          <BriefcaseIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">Basic Information</h2>
          <p className="text-[#6e6e73] text-sm mt-1">Essential details about the position</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-2">
          <label htmlFor="title" className="block text-sm font-semibold text-[#1d1d1f] mb-3">
            Job Title *
          </label>
          <input
            type="text"
            id="title"
            value={jobData.title}
            onChange={(e) => onInputChange("title", e.target.value)}
            className={`w-full px-4 py-4 bg-white/80 border rounded-xl focus:ring-2 focus:ring-[#13ead9] focus:border-transparent transition-all duration-200 placeholder-[#86868b] text-[#1d1d1f] backdrop-blur-sm text-lg ${
              errors.title ? 'border-red-400' : 'border-[#d2d2d7]'
            }`}
            placeholder="e.g. Senior Frontend Developer"
          />
          {errors.title && <p className="mt-2 text-sm text-red-500">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="department" className="block text-sm font-semibold text-[#1d1d1f] mb-3">
            Department *
          </label>
          <input
            type="text"
            id="department"
            value={jobData.department}
            onChange={(e) => onInputChange("department", e.target.value)}
            className={`w-full px-4 py-4 bg-white/80 border rounded-xl focus:ring-2 focus:ring-[#13ead9] focus:border-transparent transition-all duration-200 placeholder-[#86868b] text-[#1d1d1f] backdrop-blur-sm ${
              errors.department ? 'border-red-400' : 'border-[#d2d2d7]'
            }`}
            placeholder="e.g. Engineering"
          />
          {errors.department && <p className="mt-2 text-sm text-red-500">{errors.department}</p>}
        </div>

        <div>
          <label htmlFor="industry" className="block text-sm font-semibold text-[#1d1d1f] mb-3">
            Industry *
          </label>
          <select
            id="industry"
            value={jobData.industry}
            onChange={(e) => onInputChange("industry", e.target.value)}
            className={`w-full px-4 py-4 bg-white/80 border rounded-xl focus:ring-2 focus:ring-[#13ead9] focus:border-transparent transition-all duration-200 text-[#1d1d1f] backdrop-blur-sm appearance-none ${
              errors.industry ? 'border-red-400' : 'border-[#d2d2d7]'
            }`}
          >
            <option value="">Select industry</option>
            <option value="technology">Technology</option>
            <option value="finance">Finance</option>
            <option value="healthcare">Healthcare</option>
            <option value="education">Education</option>
            <option value="retail">Retail</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="consulting">Consulting</option>
            <option value="other">Other</option>
          </select>
          {errors.industry && <p className="mt-2 text-sm text-red-500">{errors.industry}</p>}
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-semibold text-[#1d1d1f] mb-3">
            Employment Type *
          </label>
          <select
            id="type"
            value={jobData.type}
            onChange={(e) => onInputChange("type", e.target.value as JobFormData["type"])}
            className="w-full px-4 py-4 bg-white/80 border border-[#d2d2d7] rounded-xl focus:ring-2 focus:ring-[#13ead9] focus:border-transparent transition-all duration-200 text-[#1d1d1f] backdrop-blur-sm appearance-none"
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="remote">Remote</option>
          </select>
        </div>

        <div>
          <label htmlFor="jobLevel" className="block text-sm font-semibold text-[#1d1d1f] mb-3">
            Job Level *
          </label>
          <select
            id="jobLevel"
            value={jobData.jobLevel}
            onChange={(e) => onInputChange("jobLevel", e.target.value as JobFormData["jobLevel"])}
            className="w-full px-4 py-4 bg-white/80 border border-[#d2d2d7] rounded-xl focus:ring-2 focus:ring-[#13ead9] focus:border-transparent transition-all duration-200 text-[#1d1d1f] backdrop-blur-sm appearance-none"
          >
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior Level</option>
            <option value="executive">Executive</option>
          </select>
        </div>

        <div>
          <label htmlFor="workType" className="block text-sm font-semibold text-[#1d1d1f] mb-3">
            Work Type *
          </label>
          <select
            id="workType"
            value={jobData.workType}
            onChange={(e) => onInputChange("workType", e.target.value as JobFormData["workType"])}
            className="w-full px-4 py-4 bg-white/80 border border-[#d2d2d7] rounded-xl focus:ring-2 focus:ring-[#13ead9] focus:border-transparent transition-all duration-200 text-[#1d1d1f] backdrop-blur-sm appearance-none"
          >
            <option value="onsite">On-site</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        <div>
          <label htmlFor="location" className="text-sm font-semibold text-[#1d1d1f] mb-3 flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 text-[#6e6e73]" />
            Location *
          </label>
          <select
            id="location"
            value={jobData.location}
            onChange={(e) => onInputChange("location", e.target.value)}
            className={`w-full px-4 py-4 bg-white/80 border rounded-xl focus:ring-2 focus:ring-[#13ead9] focus:border-transparent transition-all duration-200 text-[#1d1d1f] backdrop-blur-sm appearance-none ${
              errors.location ? 'border-red-400' : 'border-[#d2d2d7]'
            }`}
          >
            <option value="">Select location</option>
            <option value="Amman, Jordan">Amman, Jordan</option>
            <option value="Dubai, UAE">Dubai, UAE</option>
            <option value="Abu Dhabi, UAE">Abu Dhabi, UAE</option>
            <option value="Sharjah, UAE">Sharjah, UAE</option>
            <option value="Ajman, UAE">Ajman, UAE</option>
            <option value="Ras Al Khaimah, UAE">Ras Al Khaimah, UAE</option>
            <option value="Fujairah, UAE">Fujairah, UAE</option>
            <option value="Umm Al Quwain, UAE">Umm Al Quwain, UAE</option>
            <option value="Riyadh, Saudi Arabia">Riyadh, Saudi Arabia</option>
            <option value="Jeddah, Saudi Arabia">Jeddah, Saudi Arabia</option>
            <option value="Dammam, Saudi Arabia">Dammam, Saudi Arabia</option>
            <option value="Doha, Qatar">Doha, Qatar</option>
            <option value="Kuwait City, Kuwait">Kuwait City, Kuwait</option>
            <option value="Manama, Bahrain">Manama, Bahrain</option>
            <option value="Muscat, Oman">Muscat, Oman</option>
            <option value="Remote">Remote</option>
            <option value="Multiple Locations">Multiple Locations</option>
          </select>
          {errors.location && <p className="mt-2 text-sm text-red-500">{errors.location}</p>}
        </div>

        <div>
          <label htmlFor="deadline" className="text-sm font-semibold text-[#1d1d1f] mb-3 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#6e6e73]" />
            Application Deadline *
          </label>
          <input
            type="date"
            id="deadline"
            value={jobData.deadline}
            onChange={(e) => onInputChange("deadline", e.target.value)}
            className={`w-full px-4 py-4 bg-white/80 border rounded-xl focus:ring-2 focus:ring-[#13ead9] focus:border-transparent transition-all duration-200 text-[#1d1d1f] backdrop-blur-sm ${
              errors.deadline ? 'border-red-400' : 'border-[#d2d2d7]'
            }`}
          />
          {errors.deadline && <p className="mt-2 text-sm text-red-500">{errors.deadline}</p>}
        </div>
      </div>
    </div>
  );
}