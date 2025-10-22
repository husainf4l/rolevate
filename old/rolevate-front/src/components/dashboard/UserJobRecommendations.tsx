"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  SparklesIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { JobPost } from "@/services/job";
import { motion } from "framer-motion";

interface UserJobRecommendationsProps {
  jobs: JobPost[];
  loading?: boolean;
  savedJobIds?: Set<string>;
  onSaveJob?: (jobId: string) => void;
  onUnsaveJob?: (jobId: string) => void;
}

export default function UserJobRecommendations({
  jobs,
  loading = false,
  savedJobIds = new Set(),
  onSaveJob,
  onUnsaveJob,
}: UserJobRecommendationsProps) {
  const router = useRouter();

  const handleSaveToggle = (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    if (savedJobIds.has(jobId)) {
      onUnsaveJob?.(jobId);
    } else {
      onSaveJob?.(jobId);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-primary-600" />
            Recommended for You
          </h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 bg-gray-50 rounded-lg animate-pulse">
              <div className="h-5 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <SparklesIcon className="w-6 h-6 text-primary-600" />
          Recommended for You
        </h2>
        <button
          onClick={() => router.push("/userdashboard/jobs")}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 group"
        >
          View All
          <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="space-y-3">
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <SparklesIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">No recommendations yet</p>
            <p className="text-sm text-gray-400 mb-4">
              Complete your profile to get personalized job recommendations
            </p>
            <button
              onClick={() => router.push("/userdashboard/profile")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Complete Profile
            </button>
          </div>
        ) : (
          jobs.slice(0, 4).map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              onClick={() => router.push(`/jobs/${job.id}`)}
              className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 hover:border-primary-200 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {job.company?.logo || job.companyLogo ? (
                      <img
                        src={job.company?.logo || job.companyLogo}
                        alt={job.company?.name || "Company"}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                        <BriefcaseIcon className="w-5 h-5 text-primary-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {job.company?.name || "Company"}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => handleSaveToggle(e, job.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label={savedJobIds.has(job.id) ? "Unsave job" : "Save job"}
                >
                  {savedJobIds.has(job.id) ? (
                    <BookmarkSolidIcon className="w-5 h-5 text-primary-600" />
                  ) : (
                    <BookmarkIcon className="w-5 h-5 text-gray-400 hover:text-primary-600" />
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  <span className="capitalize">{job.type.toLowerCase().replace("_", " ")}</span>
                </div>
                {job.salary && (
                  <div className="flex items-center gap-1">
                    <CurrencyDollarIcon className="w-4 h-4" />
                    <span>{job.salary}</span>
                  </div>
                )}
              </div>

              {job.skills && job.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {job.skills.slice(0, 3).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-md font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                      +{job.skills.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                <span>Posted {new Date(job.postedAt).toLocaleDateString()}</span>
                <span className="text-primary-600 font-medium group-hover:underline">
                  View Details →
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
