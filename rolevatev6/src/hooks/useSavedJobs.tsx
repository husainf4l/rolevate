import { useState, useEffect } from 'react';

export interface SavedJob {
  id: string;
  jobId: string;
  userId: string;
  savedAt: string;
  job?: {
    id: string;
    title: string;
    company: string;
    location: string;
  };
}

export const useSavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Implement fetching saved jobs
    setLoading(false);
  }, []);

  const saveJob = async (jobId: string) => {
    // TODO: Implement saving job
  };

  const unsaveJob = async (jobId: string) => {
    // TODO: Implement unsaving job
  };

  const isJobSaved = (jobId: string) => {
    return savedJobs.some(saved => saved.jobId === jobId);
  };

  return {
    savedJobs,
    loading,
    error,
    saveJob,
    unsaveJob,
    isJobSaved
  };
};
