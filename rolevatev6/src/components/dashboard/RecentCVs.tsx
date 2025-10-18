import React, { useState, useEffect } from "react";
import {
  DocumentTextIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { getCompanyApplications, Application, updateApplicationStatus } from "@/services/application";

export default function RecentApplications() {
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentApplications();
  }, []);

  const fetchRecentApplications = async () => {
    try {
      setLoading(true);
      const applications = await getCompanyApplications();
      // Get the most recent 4 applications
      const sortedApplications = [...applications]
        .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
        .slice(0, 4);
      setRecentApplications(sortedApplications);
    } catch (error) {
      console.error('Error fetching recent applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAppliedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: Application['status']) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      // Refresh the applications list
      await fetchRecentApplications();
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };
  const getStatusColor = (status: Application["status"]) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-yellow-100 text-yellow-800";
      case "REVIEWING":
        return "bg-blue-100 text-blue-800";
      case "INTERVIEW_SCHEDULED":
        return "bg-purple-100 text-purple-800";
      case "INTERVIEWED":
        return "bg-indigo-100 text-indigo-800";
      case "OFFERED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "WITHDRAWN":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDisplayText = (status: Application["status"]) => {
    switch (status) {
      case "SUBMITTED":
        return "Submitted";
      case "REVIEWING":
        return "Under Review";
      case "INTERVIEW_SCHEDULED":
        return "Interview Scheduled";
      case "INTERVIEWED":
        return "Interviewed";
      case "OFFERED":
        return "Offered";
      case "REJECTED":
        return "Rejected";
      case "WITHDRAWN":
        return "Withdrawn";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200/60">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-primary-600" />
            Recent Applications
          </h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200/60">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <DocumentTextIcon className="w-5 h-5 text-primary-600" />
          Recent Applications
        </h2>
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {recentApplications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No applications yet</p>
            <p className="text-sm">Applications will appear here when candidates apply to your jobs</p>
          </div>
        ) : (
          recentApplications.map((application) => (
            <div
              key={application.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-600/30 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <DocumentTextIcon className="w-5 h-5 text-primary-600" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {application.candidate.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {application.job.title} • {formatAppliedDate(application.appliedAt)}
                    </p>
                    <p className="text-xs text-gray-400">{application.candidate.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors duration-200"
                    title="View Application"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  {application.resumeUrl && (
                    <a 
                      href={application.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors duration-200"
                      title="Download CV"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                    </a>
                  )}
                  {application.status !== "OFFERED" && application.status !== "REJECTED" && (
                    <>
                      <button 
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors duration-200"
                        title="Accept Application"
                        onClick={() => handleStatusUpdate(application.id, "OFFERED")}
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                        title="Reject Application"
                        onClick={() => handleStatusUpdate(application.id, "REJECTED")}
                      >
                        <XCircleIcon className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-gray-500">
                  <span>Score: {application.cvAnalysisScore || 'N/A'}</span>
                  <span>Expected: {application.expectedSalary}</span>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    application.status
                  )}`}
                >
                  {getStatusDisplayText(application.status)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

