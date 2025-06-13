import React from 'react';
import { JobCreationProps } from './types';

const JobDetails: React.FC<JobCreationProps> = ({
  formData,
  fieldErrors,
  onInputChange,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
      <h2 className="text-xl font-semibold text-white mb-6">
        Job Details
      </h2>

      {/* Description */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Job Description *
        </label>
        <div className="relative">
          <textarea
            name="description"
            value={formData.description}
            onChange={onInputChange}
            rows={4}
            className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent transition-colors ${
              fieldErrors.description
                ? "border-red-500"
                : "border-gray-600"
            }`}
            placeholder="Provide a comprehensive overview of the role. Include: what the candidate will do day-to-day, the team they'll work with, growth opportunities, company culture, and what makes this position unique and exciting. Be specific about the impact they'll have on the organization."
            required
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-500">
            {formData.description.length}/2000
          </div>
        </div>
        {fieldErrors.description && (
          <p className="text-red-400 text-sm mt-1">
            {fieldErrors.description}
          </p>
        )}
        {formData.description.length >= 50 && (
          <p className="text-green-400 text-sm mt-1">
            ✓ Good description length
          </p>
        )}
      </div>

      {/* Requirements */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Requirements *
        </label>
        <div className="relative">
          <textarea
            name="requirements"
            value={formData.requirements}
            onChange={onInputChange}
            rows={4}
            className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent transition-colors ${
              fieldErrors.requirements
                ? "border-red-500"
                : "border-gray-600"
            }`}
            placeholder="List essential qualifications, experience, and skills. Include: years of experience, specific technologies, education requirements, certifications, language skills, and any industry-specific knowledge. Be clear about what's required vs. preferred."
            required
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-500">
            {formData.requirements.length}/1500
          </div>
        </div>
        {fieldErrors.requirements && (
          <p className="text-red-400 text-sm mt-1">
            {fieldErrors.requirements}
          </p>
        )}
      </div>

      {/* Responsibilities */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Responsibilities
        </label>
        <textarea
          name="responsibilities"
          value={formData.responsibilities}
          onChange={onInputChange}
          rows={4}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
          placeholder="Detail the key responsibilities and day-to-day activities. Include: main duties, project involvement, stakeholder interactions, deliverables, and success metrics. Help candidates understand what they'll be accountable for."
        />
      </div>

      {/* Benefits */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Benefits
        </label>
        <textarea
          name="benefits"
          value={formData.benefits}
          onChange={onInputChange}
          rows={3}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
          placeholder="Highlight the compensation package and perks. Include: health insurance, flexible working, training budget, performance bonuses, vacation days, career development opportunities, and any unique company benefits."
        />
      </div>
    </div>
  );
};

export default JobDetails;
