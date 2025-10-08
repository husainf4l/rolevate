"use client";

import React from "react";
import {
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import { Skeleton } from "@/components/ui/skeleton";

interface JobRecommendation {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  postedDate: string;
  matchScore: number;
  description: string;
}

const mockRecommendations: JobRecommendation[] = [];

const getMatchScoreColor = (score: number) => {
  if (score >= 90) return "bg-green-100 text-green-800";
  if (score >= 80) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
};

interface JobRecommendationsProps {
  loading?: boolean;
}

export default function JobRecommendations({ loading = false }: JobRecommendationsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Recommended Jobs
        </h2>
        <a
          href="/userdashboard/jobs"
          className="text-[#0fc4b5] hover:text-[#0ba399] font-medium text-sm transition-colors"
        >
          View all jobs
        </a>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-white rounded-lg shadow-none border border-gray-300">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <Skeleton className="w-3/4 h-5 mb-2" />
                  <Skeleton className="w-1/2 h-4" />
                </div>
                <Skeleton className="w-16 h-6 rounded-full" />
              </div>
              <Skeleton className="w-full h-10 mb-3" />
              <div className="flex items-center space-x-4">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-28 h-4" />
              </div>
            </div>
          ))}
        </div>
      ) : mockRecommendations.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 text-gray-400 mx-auto mb-4">
            <svg
              className="w-full h-full"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2"
              />
            </svg>
          </div>
          <p className="text-gray-500">No job recommendations available</p>
          <p className="text-sm text-gray-400 mt-1">
            We'll show personalized job recommendations based on your profile
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {mockRecommendations.map((job) => (
            <div
              key={job.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900">{job.title}</h3>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getMatchScoreColor(
                        job.matchScore
                      )}`}
                    >
                      {job.matchScore}% match
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{job.company}</p>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {job.description}
                  </p>
                </div>
                <button className="p-2 text-gray-400 hover:text-[#0fc4b5] hover:bg-[#0fc4b5] hover:bg-opacity-10 rounded-md transition-colors">
                  <BookmarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CurrencyDollarIcon className="w-4 h-4" />
                    <span>{job.salary}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>{job.type}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs">
                    {new Date(job.postedDate).toLocaleDateString()}
                  </span>
                  <button className="px-3 py-1 bg-[#0fc4b5] text-white text-xs rounded-md hover:bg-[#0ba399] transition-colors">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

