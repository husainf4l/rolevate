"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarDaysIcon,
  ClockIcon,
  VideoCameraIcon,
  MapPinIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent } from "@/components/ui/card";
import { getAllInterviews, Interview as APIInterview } from "@/services/interview.service";

interface Interview {
  id: string;
  jobTitle: string;
  company: string;
  date: string;
  time: string;
  type: "video" | "phone" | "in-person";
  location?: string;
  interviewer: string;
  interviewerRole: string;
  status: "upcoming" | "completed" | "cancelled" | "rescheduled";
  round: number;
  duration: string;
  notes?: string;
  meetingLink?: string;
}

// Helper function to convert API Interview to display format
const convertToDisplayFormat = (apiInterview: APIInterview): Interview => {
  const scheduledDate = new Date(apiInterview.scheduledAt);
  
  // Map API status to display status
  const statusMap: Record<string, Interview["status"]> = {
    SCHEDULED: "upcoming",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
    NO_SHOW: "cancelled",
  };

  // Map API type to display type
  const typeMap: Record<string, Interview["type"]> = {
    VIDEO: "video",
    PHONE: "phone",
    IN_PERSON: "in-person",
  };

  return {
    id: apiInterview.id,
    jobTitle: apiInterview.application.job.title,
    company: apiInterview.application.job.company?.name || "Unknown Company",
    date: scheduledDate.toISOString().split('T')[0],
    time: scheduledDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    type: typeMap[apiInterview.type] || "video",
    interviewer: apiInterview.interviewer.name || apiInterview.interviewer.email,
    interviewerRole: "Interviewer", // API doesn't provide role
    status: statusMap[apiInterview.status] || "upcoming",
    round: 1, // API doesn't provide round number
    duration: apiInterview.duration ? `${apiInterview.duration} minutes` : "60 minutes",
    notes: apiInterview.notes || undefined,
    meetingLink: apiInterview.roomId ? `/room?roomId=${apiInterview.roomId}` : undefined,
  };
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "video":
      return <VideoCameraIcon className="w-5 h-5 text-blue-500" />;
    case "phone":
      return <PhoneIcon className="w-5 h-5 text-green-500" />;
    case "in-person":
      return <MapPinIcon className="w-5 h-5 text-purple-500" />;
    default:
      return <ClockIcon className="w-5 h-5 text-gray-500" />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "upcoming":
      return <ClockIcon className="w-5 h-5 text-blue-500" />;
    case "completed":
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    case "cancelled":
      return <XCircleIcon className="w-5 h-5 text-red-500" />;
    case "rescheduled":
      return <ClockIcon className="w-5 h-5 text-yellow-500" />;
    default:
      return <ClockIcon className="w-5 h-5 text-gray-500" />;
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
    case "rescheduled":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const isUpcoming = (date: string) => {
  return new Date(date) > new Date();
};

// Helper function to get today's date as YYYY-MM-DD string
const getTodayDateString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

// Calendar View Component
const CalendarView = ({ interviews }: { interviews: Interview[] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const todayDateString = getTodayDateString();
  
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Check if currently viewing the current month
  const isCurrentMonth = year === currentYear && month === currentMonth;
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Group interviews by date
  const interviewsByDate = interviews.reduce((acc, interview) => {
    const date = interview.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(interview);
    return acc;
  }, {} as Record<string, Interview[]>);
  
  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayInterviews = interviewsByDate[dateStr] || [];
      // Only show "today" styling if viewing the current month AND it's today's date
      const isToday = isCurrentMonth && dateStr === todayDateString;
      
      days.push(
        <div
          key={day}
          className={`h-24 border border-gray-200 p-2 overflow-hidden ${
            isToday ? 'bg-blue-50 border-[#0fc4b5]' : 'bg-white'
          }`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-[#0fc4b5]' : 'text-gray-700'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayInterviews.slice(0, 2).map((interview) => (
              <div
                key={interview.id}
                className={`text-xs p-1 rounded truncate ${
                  interview.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                  interview.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}
                title={`${interview.time} - ${interview.jobTitle}`}
              >
                {interview.time} {interview.jobTitle}
              </div>
            ))}
            {dayInterviews.length > 2 && (
              <div className="text-xs text-gray-500">+{dayInterviews.length - 2} more</div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {monthNames[month]} {year}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Today
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-0 border border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700 border-b border-gray-200">
              {day}
            </div>
          ))}
          {renderCalendarDays()}
        </div>
      </CardContent>
    </Card>
  );
};

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiInterviews = await getAllInterviews();
        const displayInterviews = apiInterviews.map(convertToDisplayFormat);
        setInterviews(displayInterviews);
      } catch (err) {
        console.error("Error fetching interviews:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch interviews");
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0fc4b5]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-600 font-medium mb-2">Error loading interviews</div>
            <div className="text-red-500 text-sm">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const upcomingInterviews = interviews.filter(
    (interview) => interview.status === "upcoming" && isUpcoming(interview.date)
  );
  const completedInterviews = interviews.filter(
    (interview) => interview.status === "completed"
  );
  const cancelledInterviews = interviews.filter(
    (interview) => interview.status === "cancelled"
  );

  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interview Schedule
          </h1>
          <p className="text-gray-600">
            Manage your interview schedule and track your progress.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Interviews
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {interviews.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">
                  {upcomingInterviews.length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {completedInterviews.length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cancelledInterviews.length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircleIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
          </Card>
        </div>

        {/* View Toggle */}
        <div className="mb-8 flex items-center justify-end">
          <div className="inline-flex rounded-lg border border-gray-300 bg-white">
            <button
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                viewMode === "list"
                  ? "bg-[#0fc4b5] text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span>List View</span>
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                viewMode === "calendar"
                  ? "bg-[#0fc4b5] text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <CalendarDaysIcon className="w-4 h-4" />
              <span>Calendar View</span>
            </button>
          </div>
        </div>

        {viewMode === "calendar" ? (
          <CalendarView interviews={interviews} />
        ) : (
          <>
        {/* Upcoming Interviews */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Upcoming Interviews ({upcomingInterviews.length})
          </h2>
          {upcomingInterviews.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming interviews</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingInterviews.map((interview) => (
                <Card key={interview.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {interview.jobTitle}
                        </h3>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            interview.status
                          )}`}
                        >
                          Round {interview.round}
                        </span>
                      </div>
                      <p className="text-[#0fc4b5] font-medium mb-2">
                        {interview.company}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <CalendarDaysIcon className="w-4 h-4" />
                          <span>
                            {new Date(interview.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>{interview.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getTypeIcon(interview.type)}
                          <span className="capitalize">{interview.type}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>Duration: {interview.duration}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Interviewer:</span>{" "}
                        {interview.interviewer} ({interview.interviewerRole})
                      </div>
                      {interview.notes && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Notes:</span>{" "}
                          {interview.notes}
                        </div>
                      )}
                      {interview.location && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600 mt-2">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{interview.location}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(interview.status)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      {interview.meetingLink && (
                        <a
                          href={interview.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-[#0fc4b5] text-white text-sm rounded-lg hover:bg-[#0ba399] transition-colors"
                        >
                          Join Meeting
                        </a>
                      )}
                      <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                        Reschedule
                      </button>
                      <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                        Details
                      </button>
                    </div>
                  </div>
                </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* All Interviews */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            All Interviews
          </h2>
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Interview History
                </h3>
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  <option>All Status</option>
                  <option>Upcoming</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {interviews.map((interview) => (
                <div
                  key={interview.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(interview.status)}
                        {getTypeIcon(interview.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {interview.jobTitle}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {interview.company}
                        </p>
                        <p className="text-sm text-gray-500">
                          {interview.interviewer} • Round {interview.round}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-900">
                          {new Date(interview.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {interview.time}
                        </p>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          interview.status
                        )}`}
                      >
                        {interview.status.charAt(0).toUpperCase() +
                          interview.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        </>
        )}

        {/* Interview Tips */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5" />
            Interview Preparation Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <p className="font-medium mb-1">Research the Company</p>
              <p>Learn about the company's mission, values, and recent news.</p>
            </div>
            <div>
              <p className="font-medium mb-1">Prepare Your Questions</p>
              <p>Have thoughtful questions ready about the role and company.</p>
            </div>
            <div>
              <p className="font-medium mb-1">Practice Common Questions</p>
              <p>
                Review typical interview questions and practice your responses.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Test Your Setup</p>
              <p>
                For video interviews, test your camera, microphone, and
                internet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

