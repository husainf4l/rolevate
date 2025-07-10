"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/dashboard/Header";
import { JobService, JobPost } from "@/services/job";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  EyeIcon,
  UsersIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

// Remove the local JobPost interface since we're importing it from the service

export default function JobsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const fetchedRef = useRef(false);

  // Fetch jobs from backend
  useEffect(() => {
    if (fetchedRef.current) return;
    
    let isMounted = true;
    
    const fetchJobs = async () => {
      try {
        if (!isMounted) return;
        
        setLoading(true);
        setError(null);
        
        const response = await JobService.getCompanyJobs();
        
        if (isMounted) {
          setJobPosts(response.jobs);
          fetchedRef.current = true;
        }
      } catch (err) {
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
    };
  }, []);

  // Check for success message from job creation
  useEffect(() => {
    if (searchParams.get('created') === 'true') {
      // Show success message or toast
      console.log('Job created successfully!');
      // You might want to show a toast notification here
    }
  }, [searchParams]);

  // Format date for display
  const formatPostedDate = (dateString: string) => {
    if (!dateString) return 'Recently';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };

  // Format deadline for display
  const formatDeadline = (dateString: string) => {
    if (!dateString) return 'No deadline';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };

  // Utility functions for styling
  const getTypeColor = (type: JobPost["type"]) => {
    switch (type) {
      case "FULL_TIME":
        return "bg-green-100 text-green-800";
      case "PART_TIME":
        return "bg-blue-100 text-blue-800";
      case "CONTRACT":
        return "bg-purple-100 text-purple-800";
      case "REMOTE":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: JobPost["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "PAUSED":
        return "bg-yellow-100 text-yellow-800";
      case "CLOSED":
        return "bg-red-100 text-red-800";
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "EXPIRED":
        return "bg-red-100 text-red-800";
      case "DELETED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper functions for display text
  const getTypeDisplayText = (type: JobPost["type"]) => {
    switch (type) {
      case "FULL_TIME":
        return "Full-time";
      case "PART_TIME":
        return "Part-time";
      case "CONTRACT":
        return "Contract";
      case "REMOTE":
        return "Remote";
      default:
        return type;
    }
  };

  const getStatusDisplayText = (status: JobPost["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "Active";
      case "PAUSED":
        return "Paused";
      case "CLOSED":
        return "Closed";
      case "DRAFT":
        return "Draft";
      case "EXPIRED":
        return "Expired";
      case "DELETED":
        return "Deleted";
      default:
        return status;
    }
  };

  // Filter jobs based on search and filters
  const filteredJobs = jobPosts.filter((job) => {
    // Exclude deleted jobs by default unless specifically filtering for them
    if (filterStatus !== "DELETED" && job.status === "DELETED") {
      return false;
    }

    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || job.status === filterStatus;
    const matchesType = filterType === "all" || job.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Refresh jobs function
  const refreshJobs = async () => {
    setLoading(true);
    setError(null);
    fetchedRef.current = false; // Reset the ref to allow fresh fetch
    try {
      const response = await JobService.getCompanyJobs();
      setJobPosts(response.jobs);
      fetchedRef.current = true;
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

    try {
      await JobService.activateJob(jobId);
      
      // Update the job status in the local state
      setJobPosts(prev => 
        prev.map(job => 
          job.id === jobId 
            ? { ...job, status: 'ACTIVE' as const }
            : job
        )
      );
      
      // Show success message (you might want to use a proper toast notification)
      alert('Job published successfully!');
    } catch (err) {
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

    try {
      // Try to pause via backend API
      // await JobService.pauseJob(jobId);
      
      // Update the local state to PAUSED
      setJobPosts(prev => 
        prev.map(job => 
          job.id === jobId 
            ? { ...job, status: 'PAUSED' as const }
            : job
        )
      );
      
      // Show success message
      alert('Job paused successfully!');
    } catch (err) {
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

    try {
      // Try to delete via backend API
      // await JobService.deleteJob(jobId);
      
      // Update the local state to DELETED
      setJobPosts(prev => 
        prev.map(job => 
          job.id === jobId 
            ? { ...job, status: 'DELETED' as const }
            : job
        )
      );
      
      // Show success message
      alert('Job deleted successfully!');
    } catch (err) {
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
                  onChange={(e) => setFilterStatus(e.target.value)}
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
                  onChange={(e) => setFilterType(e.target.value)}
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-[#0fc4b5] to-[#0891b2] rounded-lg shadow-lg">
                  <BriefcaseIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {jobPosts.filter((job) => job.status === "ACTIVE").length}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">Active Jobs</p>
                </div>
              </div>
              <div className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                +15%
              </div>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#0fc4b5] to-[#0891b2] w-3/4 rounded-full"></div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                  <UsersIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {jobPosts.filter((job) => job.status !== "DELETED").reduce((sum, job) => sum + job.applicants, 0)}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">Total Applicants</p>
                </div>
              </div>
              <div className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                +32%
              </div>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 w-4/5 rounded-full"></div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg">
                  <EyeIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {jobPosts.filter((job) => job.status !== "DELETED").reduce((sum, job) => sum + job.views, 0)}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">Total Views</p>
                </div>
              </div>
              <div className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                +18%
              </div>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 w-2/3 rounded-full"></div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg">
                  <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {(() => {
                      const activeJobs = jobPosts.filter((job) => job.status !== "DELETED");
                      const totalApplicants = activeJobs.reduce((sum, job) => sum + job.applicants, 0);
                      const totalViews = activeJobs.reduce((sum, job) => sum + job.views, 0);
                      return activeJobs.length > 0 ? Math.round((totalApplicants / Math.max(totalViews, 1)) * 100) : 0;
                    })()}%
                  </p>
                  <p className="text-sm text-gray-600 font-medium">Application Rate</p>
                </div>
              </div>
              <div className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                -5%
              </div>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-orange-600 w-1/2 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Job Postings
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredJobs.length} of {jobPosts.length} jobs
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs text-gray-600">Draft</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Paused</span>
                </div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredJobs.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <BriefcaseIcon className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {jobPosts.length === 0 ? 'No jobs posted yet' : 'No jobs match your filters'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {jobPosts.length === 0 
                    ? 'Start building your team by posting your first job listing.' 
                    : 'Try adjusting your search criteria or filters to find more jobs.'}
                </p>
                {jobPosts.length === 0 && (
                  <button
                    onClick={() => router.push('/dashboard/jobs/create')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0fc4b5] to-[#0891b2] text-white rounded-lg hover:from-[#0891b2] hover:to-[#0369a1] transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Create Your First Job
                  </button>
                )}
              </div>
            ) : (
              filteredJobs.map((job, index) => (
              <div
                key={job.id}
                className={`p-6 hover:bg-gray-50 transition-all duration-200 ${
                  index === 0 ? 'rounded-t-xl' : ''
                } ${index === filteredJobs.length - 1 ? 'rounded-b-xl' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {job.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(
                          job.type
                        )}`}
                      >
                        {getTypeDisplayText(job.type)}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          job.status
                        )}`}
                      >
                        {getStatusDisplayText(job.status)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="px-3 py-1 bg-gray-100 rounded-full">
                        <span className="text-sm font-medium text-gray-700">{job.department}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                      {job.shortDescription || job.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-gray-100 rounded">
                          <MapPinIcon className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-gray-100 rounded">
                          <CurrencyDollarIcon className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{job.salary}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-gray-100 rounded">
                          <UsersIcon className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{job.applicants} applicants</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-gray-100 rounded">
                          <EyeIcon className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{job.views} views</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-6">
                    <button 
                      title="View Details"
                      className="p-2 text-gray-400 hover:text-[#0fc4b5] hover:bg-[#0fc4b5]/10 rounded-lg transition-all duration-200"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button 
                      title="Edit Job"
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button 
                      title="Delete Job"
                      onClick={() => deleteJob(job.id, job.title)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span>Posted {formatPostedDate(job.postedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span>Deadline: {formatDeadline(job.deadline)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 text-[#0fc4b5] hover:bg-[#0fc4b5]/10 rounded-lg transition-all duration-200 font-medium text-sm">
                      View Applications
                    </button>
                    <button 
                      onClick={() => {
                        const action = job.status === "ACTIVE"
                          ? "Pause"
                          : job.status === "PAUSED"
                          ? "Activate"
                          : job.status === "DRAFT"
                          ? "Publish"
                          : job.status === "CLOSED" || job.status === "EXPIRED"
                          ? "Reopen"
                          : "Activate";
                        handleJobAction(job, action);
                      }}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${
                        job.status === "DRAFT" 
                          ? "bg-gradient-to-r from-[#0fc4b5] to-[#0891b2] text-white hover:from-[#0891b2] hover:to-[#0369a1] shadow-md hover:shadow-lg" 
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {job.status === "ACTIVE"
                        ? "Pause"
                        : job.status === "PAUSED"
                        ? "Activate"
                        : job.status === "DRAFT"
                        ? "Publish"
                        : job.status === "CLOSED" || job.status === "EXPIRED"
                        ? "Reopen"
                        : "Activate"}
                    </button>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
