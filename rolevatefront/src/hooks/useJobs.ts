"use client";

import { useState, useEffect } from 'react';
import { getJobs, JobFilters, JobsResponse, Job } from '@/services/jobs.service';

export const useJobs = (initialFilters: JobFilters = {}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<JobsResponse['pagination'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async (filters: JobFilters = initialFilters) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getJobs(filters);
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return {
    jobs,
    pagination,
    loading,
    error,
    refetch: fetchJobs,
  };
};
