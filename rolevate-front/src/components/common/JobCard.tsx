"use client";

import React from "react";
import Link from "next/link";
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
      className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-corporate hover:shadow-xl transition-all duration-300 border border-gray-200/30 hover:border-[#0891b2]/30 group relative hover:scale-[1.02] ${
        compact ? 'p-5' : 'p-8'
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
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-[#13ead9]/10 to-[#0891b2]/10 rounded-2xl flex items-center justify-center text-2xl border border-[#0891b2]/20">
            {job.logo}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-gray-900 text-lg leading-tight group-hover:text-[#0891b2] transition-colors duration-300">
              {job.company}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-text">{job.location}</span>
            </div>
          </div>
        </div>

        {/* Job Title */}
        <h4 className={`font-display font-bold text-gray-900 mb-4 leading-tight group-hover:text-[#0891b2] transition-colors duration-300 ${
          compact ? 'text-lg' : 'text-xl'
        }`}>
          {job.title}
        </h4>

        {/* Job Description */}
        {showDescription && job.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {job.description}
          </p>
        )}

        {/* Job Details */}
        <div className="flex items-center gap-3 mb-5 text-sm">
          <span className="bg-gray-100/80 text-gray-700 px-4 py-2 rounded-2xl font-text font-medium border border-gray-200/50">
            {job.type}
          </span>
          <span className="font-display font-bold text-[#0891b2] bg-gradient-to-r from-[#13ead9]/10 to-[#0891b2]/10 px-4 py-2 rounded-2xl border border-[#0891b2]/20">
            {job.salary}
          </span>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-3 mb-6">
          {job.skills.slice(0, compact ? 2 : 3).map((skill, index) => (
            <span
              key={index}
              className="bg-gradient-to-r from-[#13ead9]/10 to-[#0891b2]/10 text-[#0891b2] px-4 py-2 rounded-2xl text-sm font-text font-medium border border-[#0891b2]/20 hover:bg-gradient-to-r hover:from-[#13ead9]/20 hover:to-[#0891b2]/20 transition-all duration-200"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > (compact ? 2 : 3) && (
            <span className="text-gray-500 text-sm px-4 py-2 font-text font-medium">
              +{job.skills.length - (compact ? 2 : 3)} more
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200/30">
          <div className="text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-text">{job.posted}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              href={`/jobs/${job.id}`}
              variant="ghost"
              size="sm"
            >
              View Details
            </Button>
            <Button
              onClick={handleApply}
              variant="primary"
              size="md"
            >
              Apply Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}