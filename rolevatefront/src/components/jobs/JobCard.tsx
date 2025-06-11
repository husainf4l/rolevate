"use client";

import React from "react";
import { Job } from "@/services/jobs.service";
import {
  MapPinIcon,
  BuildingOfficeIcon,
  EyeIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { EXPERIENCE_LEVELS, WORK_TYPES } from "@/constants/jobs.constants";

interface JobCardProps {
  job: Job;
  onViewDetails?: (jobId: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onViewDetails }) => {
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(job.id);
    }
  };

  return (
    <div className="job-card bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors">
      {/* Header */}
      <div className="job-header flex items-start gap-4 mb-4">
        {job.company.logo && (
          <img
            src={job.company.logo}
            alt={job.company.name}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1">
          <h3
            className="text-lg font-semibold text-white mb-1 hover:text-[#00C6AD] cursor-pointer"
            onClick={handleViewDetails}
          >
            {job.title}
          </h3>
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <BuildingOfficeIcon className="h-4 w-4" />
            <span>{job.company.displayName || job.company.name}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <MapPinIcon className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="badges flex flex-wrap gap-2 mb-4">
        <span className="experience-badge px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-medium">
          {EXPERIENCE_LEVELS[
            job.experienceLevel as keyof typeof EXPERIENCE_LEVELS
          ] || job.experienceLevel}
        </span>
        <span className="work-type-badge px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs font-medium">
          {WORK_TYPES[job.workType as keyof typeof WORK_TYPES] || job.workType}
        </span>
        {job.isFeatured && (
          <span className="featured-badge px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-full text-xs font-medium">
            Featured
          </span>
        )}
      </div>

      {/* Description */}
      <p className="description text-gray-300 text-sm mb-4 line-clamp-3">
        {job.description.substring(0, 150)}...
      </p>

      {/* Skills */}
      <div className="skills mb-4">
        <div className="flex flex-wrap gap-2">
          {job.skills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="skill-tag px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 3 && (
            <span className="text-gray-400 text-xs self-center">
              +{job.skills.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Salary */}
      {job.salaryMin && job.salaryMax && (
        <div className="salary mb-4">
          <span className="text-[#00C6AD] font-semibold">
            {job.currency} {job.salaryMin.toLocaleString()} -{" "}
            {job.salaryMax.toLocaleString()}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="job-footer flex items-center justify-between pt-4 border-t border-gray-700">
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <UserGroupIcon className="h-4 w-4" />
            <span className="applications">
              {job.applicationCount} applications
            </span>
          </div>
          <div className="flex items-center gap-1">
            <EyeIcon className="h-4 w-4" />
            <span className="views">{job.viewCount} views</span>
          </div>
        </div>

        <button
          onClick={handleViewDetails}
          className="bg-[#00C6AD] hover:bg-[#14B8A6] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
};
