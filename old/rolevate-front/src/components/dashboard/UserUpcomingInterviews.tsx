"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDaysIcon,
  ArrowRightIcon,
  VideoCameraIcon,
  MapPinIcon,
  ClockIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

export interface Interview {
  id: string;
  jobTitle: string;
  company: string;
  date: string;
  time: string;
  type: "VIDEO" | "PHONE" | "ONSITE";
  location?: string;
  meetingLink?: string;
  jobId?: string;
  applicationId?: string;
}

interface UserUpcomingInterviewsProps {
  interviews: Interview[];
  loading?: boolean;
}

const getInterviewTypeInfo = (type: Interview["type"]) => {
  switch (type) {
    case "VIDEO":
      return { icon: VideoCameraIcon, color: "blue", label: "Video Call" };
    case "PHONE":
      return { icon: ClockIcon, color: "green", label: "Phone Call" };
    case "ONSITE":
      return { icon: MapPinIcon, color: "purple", label: "On-site" };
    default:
      return { icon: CalendarDaysIcon, color: "gray", label: "Interview" };
  }
};

export default function UserUpcomingInterviews({
  interviews,
  loading = false,
}: UserUpcomingInterviewsProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <CalendarDaysIcon className="w-6 h-6 text-primary-600" />
            Upcoming Interviews
          </h2>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
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
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <CalendarDaysIcon className="w-6 h-6 text-primary-600" />
          Upcoming Interviews
        </h2>
        <button
          onClick={() => router.push("/userdashboard/interviews")}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 group"
        >
          View All
          <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="space-y-3">
        {interviews.length === 0 ? (
          <div className="text-center py-12">
            <CalendarDaysIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">No upcoming interviews</p>
            <p className="text-sm text-gray-400">
              Your scheduled interviews will appear here
            </p>
          </div>
        ) : (
          interviews.slice(0, 3).map((interview, index) => {
            const typeInfo = getInterviewTypeInfo(interview.type);
            const TypeIcon = typeInfo.icon;

            return (
              <motion.div
                key={interview.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                onClick={() => {
                  if (interview.applicationId) {
                    router.push(`/userdashboard/applications/${interview.applicationId}`);
                  }
                }}
                className="p-5 bg-gradient-to-br from-primary-50 to-white rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer border border-primary-100 hover:border-primary-300 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                      {interview.jobTitle}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BuildingOfficeIcon className="w-4 h-4" />
                      <span>{interview.company}</span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium bg-${typeInfo.color}-100 text-${typeInfo.color}-700 flex items-center gap-1 whitespace-nowrap`}
                  >
                    <TypeIcon className="w-3 h-3" />
                    {typeInfo.label}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <CalendarDaysIcon className="w-4 h-4 text-primary-600" />
                    <span className="font-medium">
                      {new Date(interview.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <ClockIcon className="w-4 h-4 text-primary-600" />
                    <span className="font-medium">{interview.time}</span>
                  </div>
                  {interview.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{interview.location}</span>
                    </div>
                  )}
                </div>

                {interview.meetingLink && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(interview.meetingLink, "_blank");
                      }}
                      className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <VideoCameraIcon className="w-4 h-4" />
                      Join Meeting
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
