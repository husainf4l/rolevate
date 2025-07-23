"use client";

import React from "react";
import {
  CalendarDaysIcon,
  ClockIcon,
  VideoCameraIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

interface Interview {
  id: string;
  jobTitle: string;
  company: string;
  date: string;
  time: string;
  type: "video" | "phone" | "in-person";
  location?: string;
  interviewer: string;
  status: "upcoming" | "completed" | "cancelled";
}

const mockInterviews: Interview[] = [];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "video":
      return <VideoCameraIcon className="w-4 h-4" />;
    case "phone":
      return <ClockIcon className="w-4 h-4" />;
    case "in-person":
      return <MapPinIcon className="w-4 h-4" />;
    default:
      return <ClockIcon className="w-4 h-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "upcoming":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function InterviewSchedule() {
  const upcomingInterviews = mockInterviews.filter(
    (interview) => interview.status === "upcoming"
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Upcoming Interviews
        </h2>
        <a
          href="/userdashboard/interviews"
          className="text-[#0fc4b5] hover:text-[#0ba399] font-medium text-sm transition-colors"
        >
          View all
        </a>
      </div>

      {upcomingInterviews.length === 0 ? (
        <div className="text-center py-8">
          <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No upcoming interviews</p>
          <p className="text-sm text-gray-400 mt-1">
            Your scheduled interviews will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {upcomingInterviews.map((interview) => (
            <div
              key={interview.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900">
                      {interview.jobTitle}
                    </h3>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        interview.status
                      )}`}
                    >
                      {interview.status.charAt(0).toUpperCase() +
                        interview.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {interview.company}
                  </p>
                  <p className="text-sm text-gray-500">
                    Interviewer: {interview.interviewer}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <CalendarDaysIcon className="w-4 h-4" />
                    <span>{new Date(interview.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>{interview.time}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getTypeIcon(interview.type)}
                    <span className="capitalize">{interview.type}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 bg-[#0fc4b5] text-white text-xs rounded-md hover:bg-[#0ba399] transition-colors">
                    Join
                  </button>
                  <button className="px-3 py-1 border border-gray-300 text-gray-700 text-xs rounded-md hover:bg-gray-50 transition-colors">
                    Details
                  </button>
                </div>
              </div>

              {interview.location && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{interview.location}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
