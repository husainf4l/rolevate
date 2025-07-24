"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/dashboard/Header";
import JobList from "@/components/dashboard/JobList";
import { JobService, JobPost } from "@/services/job";
import {
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

// Remove the local JobPost interface since we're importing it from the service

function JobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(() => {
    const searchParam = searchParams.get('search');
    return searchParam === null ? "" : searchParam;
  });
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(() => {
    const searchParam = searchParams.get('search');
    return searchParam === null ? "" : searchParam;
  });
  const [filterStatus, setFilterStatus] = useState<string>(() => searchParams.get('status') || "all");
  const [filterType, setFilterType] = useState<string>(() => searchParams.get('type') || "all");

  const [isInitialized, setIsInitialized] = useState(false);

  // Update URL when search term changes
  const updateSearchParams = (search: string, status: string, type: string) => {
    const params = new URLSearchParams();
    
    // Always set search param (even if empty) to maintain explicit state
    params.set('search', search);
    
    // Always set status and type to maintain explicit state
    params.set('status', status);
    params.set('type', type);
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  };

  // Initialize state from URL and mark as initialized
  useEffect(() => {
    // Set initial debouncedSearchTerm to prevent immediate second fetch
    const initialSearchTerm = searchParams.get('search') || '';
    console.log('Initializing with search term:', initialSearchTerm);
    setDebouncedSearchTerm(initialSearchTerm);
    setIsInitialized(true);
  }, [searchParams]);

  // Debounce search term and update URL (only after initialization)
  useEffect(() => {
    if (!isInitialized) return; // Skip on initial render
    
    console.log('Debouncing search term:', searchTerm);
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      updateSearchParams(searchTerm, filterStatus, filterType);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm, filterStatus, filterType, isInitialized]);

  // Fetch jobs - only when debouncedSearchTerm changes and we're initialized
  useEffect(() => {
    if (!isInitialized) return; // Don't fetch until we're initialized
    
    console.log('Fetching jobs with search term:', debouncedSearchTerm);
    
    let isMounted = true;
    let abortController = new AbortController();
    
    const fetchJobs = async () => {
      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }
        
        const response = await JobService.getCompanyJobs(1, 100, debouncedSearchTerm);
        
        if (isMounted && !abortController.signal.aborted) {
          setJobPosts(response.jobs);
          console.log('Jobs fetched:', response.jobs.length, 'jobs');
          console.log('Search term:', debouncedSearchTerm);
          console.log('Total jobs:', response.total);
          console.log('Jobs by status:', {
            ACTIVE: response.jobs.filter(job => job.status === 'ACTIVE').length,
            DRAFT: response.jobs.filter(job => job.status === 'DRAFT').length,
            PAUSED: response.jobs.filter(job => job.status === 'PAUSED').length,
            DELETED: response.jobs.filter(job => job.status === 'DELETED').length,
          });
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('Fetch aborted');
          return;
        }
        console.error('Failed to fetch jobs:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchJobs();
    
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [debouncedSearchTerm, isInitialized]); // Re-fetch when search term changes and we're initialized

  // Check for success message from job creation
  useEffect(() => {
    if (searchParams.get('created') === 'true') {
      // Show success message or toast
      console.log('Job created successfully!');
      // You might want to show a toast notification here
    }
  }, [searchParams]);

  // Handle filter changes
  const handleStatusFilterChange = (status: string) => {
    setFilterStatus(status);
    updateSearchParams(searchTerm, status, filterType);
  };

  const handleTypeFilterChange = (type: string) => {
    setFilterType(type);
    updateSearchParams(searchTerm, filterStatus, type);
  };

  // Filter jobs based on status and type filters (search is handled server-side)
  const filteredJobs = jobPosts.filter((job) => {
    // Exclude deleted jobs by default unless specifically filtering for them
    if (filterStatus !== "DELETED" && job.status === "DELETED") {
      return false;
    }

    const matchesStatus = filterStatus === "all" || job.status === filterStatus;
    const matchesType = filterType === "all" || job.type === filterType;

    return matchesStatus && matchesType;
  });

  // Refresh jobs function
  const refreshJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await JobService.getCompanyJobs(1, 100, debouncedSearchTerm); // Get first 100 jobs with current search
      setJobPosts(response.jobs);
      console.log('Jobs refreshed:', response.jobs.length, 'jobs');
    } catch (err) {
      console.error('Failed to refresh jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh jobs');
    } finally {
      setLoading(false);
    }
  };

  // Activate job function
  const activateJob = async (jobId: string, jobTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to publish "${jobTitle}"?\n\nThis will make the job visible to candidates and they can start applying.`
    );
    
    if (!confirmed) return;

    // Store original job for rollback on error
    const originalJob = jobPosts.find(job => job.id === jobId);
    if (!originalJob) return;

    try {
      // Optimistically update UI first
      setJobPosts(prev => 
        prev.map(job => 
          job.id === jobId 
            ? { ...job, status: 'ACTIVE' as const }
            : job
        )
      );

      // Then call backend API
      console.log('Activating job:', jobId);
      await JobService.activateJob(jobId);
      
      // Show success message
      alert('Job published successfully!');
    } catch (err) {
      // Rollback on error
      setJobPosts(prev => 
        prev.map(job => 
          job.id === jobId 
            ? originalJob
            : job
        )
      );
      
      console.error('Failed to activate job:', err);
      alert('Failed to publish job. Please try again.');
    }
  };

  // Pause job function
  const pauseJob = async (jobId: string, jobTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to pause "${jobTitle}"?\n\nThis will temporarily hide the job from candidates. You can reactivate it later.`
    );
    
    if (!confirmed) return;

    // Store original job for rollback on error
    const originalJob = jobPosts.find(job => job.id === jobId);
    if (!originalJob) return;

    try {
      // Optimistically update UI first
      setJobPosts(prev => 
        prev.map(job => 
          job.id === jobId 
            ? { ...job, status: 'PAUSED' as const }
            : job
        )
      );

      // Then call backend API
      console.log('Pausing job:', jobId);
      await JobService.pauseJob(jobId);
      
      // Show success message
      alert('Job paused successfully!');
    } catch (err) {
      // Rollback on error
      setJobPosts(prev => 
        prev.map(job => 
          job.id === jobId 
            ? originalJob
            : job
        )
      );
      
      console.error('Failed to pause job:', err);
      alert('Failed to pause job. Please try again.');
    }
  };

  // Delete job function
  const deleteJob = async (jobId: string, jobTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${jobTitle}"?\n\nThis will mark the job as deleted and hide it from your active listings. You can still view it by filtering for deleted jobs.`
    );
    
    if (!confirmed) return;

    // Store original job for rollback on error
    const originalJob = jobPosts.find(job => job.id === jobId);
    if (!originalJob) return;

    try {
      // Optimistically update UI first
      setJobPosts(prev => 
        prev.map(job => 
          job.id === jobId 
            ? { ...job, status: 'DELETED' as const }
            : job
        )
      );

      // Then call backend API
      console.log('Deleting job:', jobId);
      await JobService.deleteJob(jobId);
      
      // Show success message
      alert('Job deleted successfully!');
    } catch (err) {
      // Rollback on error
      setJobPosts(prev => 
        prev.map(job => 
          job.id === jobId 
            ? originalJob
            : job
        )
      );
      
      console.error('Failed to delete job:', err);
      alert('Failed to delete job. Please try again.');
    }
  };

  // Handle job action (pause, activate, publish, reopen, delete)
  const handleJobAction = async (job: JobPost, action: string) => {
    try {
      switch (action) {
        case 'Publish':
          await activateJob(job.id, job.title);
          break;
        case 'Activate':
          // For paused jobs, reactivate them
          await activateJob(job.id, job.title);
          break;
        case 'Reopen':
          // For closed/expired jobs, reopen them (same as activate for now)
          const confirmed = window.confirm(
            `Are you sure you want to reopen "${job.title}"?\n\nThis will make the job active again and visible to candidates.`
          );
          if (confirmed) {
            await activateJob(job.id, job.title);
          }
          break;
        case 'Pause':
          await pauseJob(job.id, job.title);
          break;
        case 'Delete':
          await deleteJob(job.id, job.title);
          break;
        default:
          console.log('Unknown action:', action);
      }
    } catch (err) {
      console.error('Failed to perform action:', err);
      alert(`Failed to ${action.toLowerCase()} job. Please try again.`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 pt-24">
        <div className="max-w-7xl mx-auto">
          <Header
            title="Job Management"
            subtitle="Create, manage, and track your job postings"
          />
          <div className="flex items-center justify-center h-64">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 border-3 border-[#0fc4b5] border-t-transparent rounded-full animate-spin"></div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">Loading jobs...</div>
                  <div className="text-sm text-gray-600">Please wait while we fetch your job postings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 pt-24">
        <div className="max-w-7xl mx-auto">
          <Header
            title="Job Management"
            subtitle="Create, manage, and track your job postings"
          />
          <div className="flex items-center justify-center h-64">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load jobs</h3>
              <p className="text-gray-600 text-sm mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-[#0fc4b5] to-[#0891b2] text-white rounded-lg hover:from-[#0891b2] hover:to-[#0369a1] transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <Header
          title="Job Management"
          subtitle="Create, manage, and track your job postings"
        />

        {/* Action Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                {loading && debouncedSearchTerm && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-[#0fc4b5] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Search by job title, department, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0fc4b5] focus:border-[#0fc4b5] transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0fc4b5] focus:border-[#0fc4b5] bg-white text-sm font-medium"
                >
                  <option value="all">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PAUSED">Paused</option>
                  <option value="CLOSED">Closed</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="DELETED">Deleted</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Type:</label>
                <select
                  value={filterType}
                  onChange={(e) => handleTypeFilterChange(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0fc4b5] focus:border-[#0fc4b5] bg-white text-sm font-medium"
                >
                  <option value="all">All Types</option>
                  <option value="FULL_TIME">Full-time</option>
                  <option value="PART_TIME">Part-time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="REMOTE">Remote</option>
                </select>
              </div>

              <div className="flex items-center gap-2 ml-2">
                <button 
                  onClick={refreshJobs}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>

                <button 
                  onClick={() => router.push('/dashboard/jobs/create')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0fc4b5] to-[#0891b2] text-white rounded-lg hover:from-[#0891b2] hover:to-[#0369a1] transition-all duration-200 shadow-lg hover:shadow-xl text-sm font-semibold"
                >
                  <PlusIcon className="w-4 h-4" />
                  Create Job
                </button>
              </div>
            </div>
          </div>
        </div>

   

        {/* Jobs List */}
        <JobList
          jobs={jobPosts}
          filteredJobs={filteredJobs}
          onJobAction={handleJobAction}
          onDeleteJob={deleteJob}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JobsContent />
    </Suspense>
  );
}
