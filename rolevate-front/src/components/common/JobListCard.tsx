"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSavedJobsStandalone } from "@/hooks/useSavedJobsStandalone";
import { MapPin } from "lucide-react";
import { BookmarkIcon } from "@heroicons/react/24/outline";

export interface JobData {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  skills: string[];
  posted: string;
  applicants: number;
  logo?: string;
  description?: string;
  urgent?: boolean;
  experience?: string;
}

interface JobListCardProps {
  job: JobData;
  onApply?: (jobId: string) => void;
  onSave?: (jobId: string) => void;
  isSaved?: boolean;
}

export default function JobListCard({
  job,
  onApply,
  onSave,
  isSaved,
}: JobListCardProps) {
  const { isJobSaved, canSaveJobs, toggleSaveJob } = useSavedJobsStandalone();
  const [isSaving, setIsSaving] = useState(false);

  const jobIsSaved = isSaved !== undefined ? isSaved : isJobSaved(job.id);
  const showSaveButton = canSaveJobs();

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (onSave) {
        onSave(job.id);
      } else {
        await toggleSaveJob(job.id);
      }
    } catch (error) {
      console.error("Failed to save/unsave job:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 border border-slate-200/60 bg-white hover:bg-slate-50/50 rounded-sm p-4 sm:p-4">
      {/* Mobile Layout */}
      <div className="block sm:hidden">
        {/* Top row - Avatar and basic info */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="w-12 h-12 flex-shrink-0 mt-0.5">
            <AvatarFallback className="bg-[#0891b2] text-white font-semibold text-sm">
              {job.company.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 leading-tight text-base group-hover:text-teal-700 transition-colors mb-1">
              {job.title}
            </h3>
            <p className="text-xs font-medium text-slate-700 mb-2">{job.company}</p>
            <div className="flex items-center gap-1 text-xs text-slate-600 mb-2">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{job.location}</span>
            </div>
          </div>
        </div>

        {/* Bottom row - Type, Salary, Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 font-medium">
              {job.type}
            </Badge>
            <span className="text-xs font-medium text-slate-600">
              {job.salary}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => onApply?.(job.id)}
              className="bg-[#0891b2] hover:bg-[#0891b2]/90 text-white font-medium px-3 py-1.5 text-xs shadow-sm"
            >
              Details
            </Button>
            {showSaveButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                disabled={isSaving}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50"
                aria-label={jobIsSaved ? "Unsave job" : "Save job"}
              >
                <BookmarkIcon
                  className={`w-5 h-5 transition-colors ${
                    jobIsSaved
                      ? "fill-primary-600 text-primary-600"
                      : "text-slate-400 hover:text-primary-600"
                  }`}
                  strokeWidth={1.5}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex sm:items-center sm:justify-between gap-4">
        {/* Left side - Job info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            {/* Company avatar */}
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarFallback className="bg-[#0891b2] text-white font-semibold text-sm">
                {job.company.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Job details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 leading-tight text-base group-hover:text-teal-700 transition-colors">
                {job.title}
              </h3>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <p className="text-sm font-medium text-slate-700">{job.company}</p>
                <div className="flex items-center gap-1 text-sm text-slate-600">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span>{job.location}</span>
                </div>
                <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600">
                  {job.type}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Salary, Apply button, Save button */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-sm font-medium text-slate-600">
            {job.salary}
          </span>
          <Button 
            onClick={() => onApply?.(job.id)}
            className="bg-[#0891b2] hover:bg-[#0891b2]/90 text-white font-medium px-4 py-2 text-sm"
          >
            Details
          </Button>
          {showSaveButton && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              disabled={isSaving}
              className="p-1.5 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50 flex-shrink-0"
              aria-label={jobIsSaved ? "Unsave job" : "Save job"}
            >
              <BookmarkIcon
                className={`w-4 h-4 transition-colors ${
                  jobIsSaved
                    ? "fill-primary-600 text-primary-600"
                    : "text-slate-400 hover:text-primary-600"
                }`}
                strokeWidth={1.5}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
