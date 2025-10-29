"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardDocumentListIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { Application } from "@/services/application";
import { motion } from "framer-motion";

interface RecentApplicationsWidgetProps {
  applications: Application[];
  loading?: boolean;
}

const getStatusInfo = (status: Application["status"]) => {
  switch (status) {
    case "PENDING":
      return { label: "Submitted", color: "blue", icon: ClockIcon };
    case "REVIEWED":
      return { label: "Under Review", color: "amber", icon: ClockIcon };
    case "SHORTLISTED":
      return { label: "Interview Scheduled", color: "purple", icon: CalendarIcon };
    case "INTERVIEWED":
      return { label: "Interviewed", color: "indigo", icon: CheckCircleIcon };
    case "OFFERED":
      return { label: "Offer Received", color: "green", icon: CheckCircleIcon };
    case "REJECTED":
      return { label: "Not Selected", color: "red", icon: XCircleIcon };
    case "WITHDRAWN":
      return { label: "Withdrawn", color: "gray", icon: XCircleIcon };
    default:
      return { label: status, color: "gray", icon: ClockIcon };
  }
};

export default function RecentApplicationsWidget({
  applications,
  loading = false,
}: RecentApplicationsWidgetProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <ClipboardDocumentListIcon className="w-6 h-6 text-primary-600" />
            Recent Applications
          </h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
              <div className="h-5 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <ClipboardDocumentListIcon className="w-6 h-6 text-primary-600" />
          Recent Applications
        </h2>
        <button
          onClick={() => router.push("/userdashboard/applications")}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 group"
        >
          View All
          <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="space-y-3">
        {applications.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardDocumentListIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">No applications yet</p>
            <p className="text-sm text-gray-400 mb-4">
              Start applying to jobs to see them here
            </p>
            <button
              onClick={() => router.push("/userdashboard/jobs")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <BriefcaseIcon className="w-4 h-4" />
              Browse Jobs
            </button>
          </div>
        ) : (
          applications.slice(0, 5).map((application, index) => {
            const statusInfo = getStatusInfo(application.status);
            const StatusIcon = statusInfo.icon;

            return (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                onClick={() =>
                  router.push(`/userdashboard/applications/${application.id}`)
                }
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-200 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                      {application.job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <BuildingOfficeIcon className="w-4 h-4" />
                      <span>{application.job.company?.name || "Unknown"}</span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-700 flex items-center gap-1 whitespace-nowrap`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {statusInfo.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    <span>
                      Applied {new Date(application.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {application.cvAnalysisScore && (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Match: {application.cvAnalysisScore}%</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
