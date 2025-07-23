"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { JobPost } from "@/services/job";
import {
  PlusIcon,
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  EyeIcon,
  UsersIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface JobListProps {
  jobs: JobPost[];
  filteredJobs: JobPost[];
  onJobAction: (job: JobPost, action: string) => void;
  onDeleteJob: (jobId: string, jobTitle: string) => void;
  loading?: boolean;
}

// Utility functions for styling and display
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

const JobList: React.FC<JobListProps> = ({
  jobs,
  filteredJobs,
  onJobAction,
  onDeleteJob,
  loading = false,
}) => {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white rounded-t-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Job Postings
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredJobs.length} of {jobs.length} jobs
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
              <span className="text-xs font-medium text-gray-700">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full shadow-sm"></div>
              <span className="text-xs font-medium text-gray-700">Draft</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm"></div>
              <span className="text-xs font-medium text-gray-700">Paused</span>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="p-12 text-center">
            <div className="flex items-center justify-center gap-4">
              <div className="w-8 h-8 border-3 border-[#0fc4b5] border-t-transparent rounded-full animate-spin"></div>
              <div>
                <div className="text-lg font-semibold text-gray-900">Loading jobs...</div>
                <div className="text-sm text-gray-600">Please wait while we fetch your job postings</div>
              </div>
            </div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-inner">
              <BriefcaseIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {jobs.length === 0 ? 'No jobs posted yet' : 'No jobs match your filters'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
              {jobs.length === 0 
                ? 'Start building your team by posting your first job listing and attract top talent.' 
                : 'Try adjusting your search criteria or filters to find more jobs.'}
            </p>
            {jobs.length === 0 && (
              <button
                onClick={() => router.push('/dashboard/jobs/create')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0fc4b5] to-[#0891b2] text-white rounded-lg hover:from-[#0891b2] hover:to-[#0369a1] transition-all duration-200 shadow-lg hover:shadow-xl font-semibold transform hover:scale-105"
              >
                <PlusIcon className="w-5 h-5" />
                Create Your First Job
              </button>
            )}
          </div>
        ) : (
          filteredJobs.map((job) => (
            <JobListItem
              key={job.id}
              job={job}
              onJobAction={onJobAction}
              onDeleteJob={onDeleteJob}
              router={router}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface JobListItemProps {
  job: JobPost;
  onJobAction: (job: JobPost, action: string) => void;
  onDeleteJob: (jobId: string, jobTitle: string) => void;
  router: ReturnType<typeof useRouter>;
}

const JobListItem: React.FC<JobListItemProps> = ({
  job,
  onJobAction,
  onDeleteJob,
  router,
}) => {
  const getActionButtonText = (status: JobPost["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "Pause";
      case "PAUSED":
        return "Activate";
      case "DRAFT":
        return "Publish";
      case "CLOSED":
      case "EXPIRED":
        return "Reopen";
      default:
        return "Activate";
    }
  };

  const getActionButtonStyle = (status: JobPost["status"]) => {
    return status === "DRAFT" 
      ? "bg-gradient-to-r from-[#0fc4b5] to-[#0891b2] text-white hover:from-[#0891b2] hover:to-[#0369a1] shadow-md hover:shadow-lg transform hover:scale-105" 
      : "text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-gray-300";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-[#0fc4b5] transition-colors duration-200">
                {job.title}
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getTypeColor(
                  job.type
                )}`}
              >
                {getTypeDisplayText(job.type)}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(
                  job.status
                )}`}
              >
                {getStatusDisplayText(job.status)}
              </span>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <div className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full shadow-sm">
                <span className="text-sm font-semibold text-gray-700">{job.department}</span>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4 text-sm leading-relaxed">
              {job.shortDescription || job.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-sm">
                  <MapPinIcon className="w-4 h-4" />
                </div>
                <span className="font-medium">{job.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-sm">
                  <CurrencyDollarIcon className="w-4 h-4" />
                </div>
                <span className="font-medium">{job.salary}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-sm">
                  <UsersIcon className="w-4 h-4" />
                </div>
                <span className="font-medium">{job.applicants} applicants</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-sm">
                  <EyeIcon className="w-4 h-4" />
                </div>
                <span className="font-medium">{job.views} views</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-6">
            <button 
              title="View Details"
              className="p-2 text-gray-400 hover:text-[#0fc4b5] hover:bg-[#0fc4b5]/10 rounded-lg transition-all duration-200 transform hover:scale-110"
            >
              <EyeIcon className="w-5 h-5" />
            </button>
            <button 
              title="Edit Job"
              onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button 
              title="Delete Job"
              onClick={() => onDeleteJob(job.id, job.title)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
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
            <button 
              onClick={() => router.push(`/dashboard/jobs/${job.id}/applications`)}
              className="px-4 py-2 text-[#0fc4b5] hover:bg-[#0fc4b5]/10 rounded-lg transition-all duration-200 font-medium text-sm border border-[#0fc4b5]/20 hover:border-[#0fc4b5]/40"
            >
              View Applications
            </button>
            <button 
              onClick={() => {
                const action = getActionButtonText(job.status);
                onJobAction(job, action);
              }}
              className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${getActionButtonStyle(job.status)}`}
            >
              {getActionButtonText(job.status)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobList;
