"use client";

import React from "react";
import { Button } from "@/components/common/Button";

export interface JobData {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  skills: string[];
  posted: string;
  applicants: number;
  logo: string;
  description?: string;
  urgent?: boolean;
}

interface JobCardProps {
  job: JobData;
  onApply?: (jobId: number) => void;
  showDescription?: boolean;
  compact?: boolean;
}

export default function JobCard({ 
  job, 
  onApply, 
  showDescription = false, 
  compact = false 
}: JobCardProps) {
  const handleApply = () => {
    if (onApply) {
      onApply(job.id);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200 group relative hover:-translate-y-1 ${
        compact ? 'p-4' : 'p-6'
      }`}
    >
      {/* Urgent Badge */}
      {job.urgent && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
          Urgent
        </div>
      )}

      {/* Content */}
      <div className="relative">
        {/* Company Info */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-xl border border-gray-200">
            {job.logo}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base leading-tight group-hover:text-gray-700 transition-colors duration-300">
              {job.company}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{job.location}</span>
            </div>
          </div>
        </div>

        {/* Job Title */}
        <h4 className={`font-bold text-gray-900 mb-3 leading-tight ${
          compact ? 'text-base' : 'text-lg'
        }`}>
          {job.title}
        </h4>

        {/* Job Description */}
        {showDescription && job.description && (
          <p className="text-gray-500 text-sm mb-3 line-clamp-1 leading-relaxed">
            {job.description.length > 80 ? `${job.description.substring(0, 80)}...` : job.description}
          </p>
        )}

        {/* Job Details */}
        <div className="flex items-center gap-2 mb-4 text-sm">
          <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-medium">
            {job.type}
          </span>
          <span className="font-semibold text-gray-900 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
            {job.salary}
          </span>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-5">
          {job.skills.slice(0, compact ? 2 : 3).map((skill, index) => (
            <span
              key={index}
              className="bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-200"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > (compact ? 2 : 3) && (
            <span className="text-gray-400 text-xs px-2.5 py-1 font-medium">
              +{job.skills.length - (compact ? 2 : 3)} more
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{job.posted}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              href={`/jobs/${job.id}`}
              className="hidden md:inline-flex"
            >
              View Details
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleApply}
              className="hidden md:inline-flex"
            >
              Apply Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}