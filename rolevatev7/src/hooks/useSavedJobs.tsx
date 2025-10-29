import { useState, useEffect, useCallback } from 'react';
import { savedJobsService, SavedJob } from '@/services/savedJobs';
import { useAuth } from '@/hooks/useAuth';

export type { SavedJob };

export const useSavedJobs = () => {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch saved jobs on mount (only if user is authenticated)
  const fetchSavedJobs = useCallback(async () => {
    // Don't fetch if user is not authenticated
    if (!user) {
      setLoading(false);
      setSavedJobs([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const jobs = await savedJobsService.getMySavedJobs();
      setSavedJobs(jobs);
    } catch (err: any) {
      console.error('Error fetching saved jobs:', err);
      setError(err?.message || 'Failed to fetch saved jobs');
      // Reset saved jobs on error
      setSavedJobs([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  // Save a job
  const saveJob = async (jobId: string) => {
    if (!user) {
      const error = new Error('Please login to save jobs');
      setError(error.message);
      throw error;
    }

    try {
      setError(null);
      const savedJob = await savedJobsService.saveJob(jobId);
      // Optimistically update the UI
      setSavedJobs(prev => [...prev, savedJob as SavedJob]);
      return savedJob;
    } catch (err: any) {
      console.error('Error saving job:', err);
      setError(err?.message || 'Failed to save job');
      throw err;
    }
  };

  // Unsave a job
  const unsaveJob = async (jobId: string) => {
    if (!user) {
      const error = new Error('Please login to manage saved jobs');
      setError(error.message);
      throw error;
    }

    try {
      setError(null);
      const success = await savedJobsService.unsaveJob(jobId);
      if (success) {
        // Optimistically update the UI
        setSavedJobs(prev => prev.filter(saved => saved.jobId !== jobId));
      }
      return success;
    } catch (err: any) {
      console.error('Error unsaving job:', err);
      setError(err?.message || 'Failed to unsave job');
      throw err;
    }
  };

  // Check if a job is saved
  const isJobSaved = useCallback((jobId: string) => {
    return savedJobs.some(saved => saved.jobId === jobId);
  }, [savedJobs]);

  // Toggle save status
  const toggleSaveJob = async (jobId: string) => {
    if (isJobSaved(jobId)) {
      return unsaveJob(jobId);
    } else {
      return saveJob(jobId);
    }
  };

  return {
    savedJobs,
    loading,
    error,
    saveJob,
    unsaveJob,
    isJobSaved,
    toggleSaveJob,
    refetch: fetchSavedJobs
  };
};
