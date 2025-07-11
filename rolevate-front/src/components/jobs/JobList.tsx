"use client";

import React from "react";
import JobCard, { JobData } from "@/components/common/JobCard";
import { useSavedJobsStandalone } from "@/hooks/useSavedJobsStandalone";

interface JobListProps {
  jobs: JobData[];
  onApply?: (jobId: string) => void;
}

export default function JobList({ jobs, onApply }: JobListProps) {
  const { isJobSaved, toggleSaveJob, isLoading, error } =
    useSavedJobsStandalone();

  const handleSaveJob = async (jobId: string) => {
    try {
      await toggleSaveJob(jobId);
      // Optionally show a success message
    } catch (error) {
      // Error is already logged in the hook
      // Optionally show an error toast notification
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0fc4b5]"></div>
        <span className="ml-2 text-gray-600">Loading saved jobs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-800 text-sm">
          Error loading saved jobs: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          {...(onApply && { onApply })}
          onSave={handleSaveJob}
          isSaved={isJobSaved(job.id)}
          showDescription={true}
        />
      ))}
    </div>
  );
}
