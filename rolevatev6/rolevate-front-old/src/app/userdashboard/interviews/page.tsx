import React from "react";
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

const mockInterviews: Interview[] = [
  {
    id: "1",
    jobTitle: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    date: "2025-01-10",
    time: "10:00 AM",
    type: "video",
    interviewer: "Sarah Johnson",
    interviewerRole: "Engineering Manager",
    status: "upcoming",
    round: 1,
    duration: "60 minutes",
    meetingLink: "https://meet.google.com/abc-def-ghi",
  },
  {
    id: "2",
    jobTitle: "UI/UX Designer",
    company: "DesignHub",
    date: "2025-01-12",
    time: "2:00 PM",
    type: "in-person",
    location: "123 Design St, New York, NY",
    interviewer: "Mike Chen",
    interviewerRole: "Design Director",
    status: "upcoming",
    round: 2,
    duration: "90 minutes",
    notes: "Bring portfolio and design samples",
  },
  {
    id: "3",
    jobTitle: "Full Stack Developer",
    company: "StartupXYZ",
    date: "2025-01-08",
    time: "11:30 AM",
    type: "phone",
    interviewer: "Alex Rodriguez",
    interviewerRole: "CTO",
    status: "completed",
    round: 1,
    duration: "45 minutes",
  },
  {
    id: "4",
    jobTitle: "React Developer",
    company: "WebSolutions",
    date: "2025-01-15",
    time: "3:00 PM",
    type: "video",
    interviewer: "Emily Davis",
    interviewerRole: "Senior Developer",
    status: "upcoming",
    round: 3,
    duration: "120 minutes",
    notes: "Technical coding round",
    meetingLink: "https://zoom.us/j/123456789",
  },
  {
    id: "5",
    jobTitle: "Frontend Engineer",
    company: "Innovation Labs",
    date: "2025-01-05",
    time: "9:00 AM",
    type: "video",
    interviewer: "David Wilson",
    interviewerRole: "Team Lead",
    status: "cancelled",
    round: 1,
    duration: "60 minutes",
  },
];

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

export default function InterviewsPage() {
  const upcomingInterviews = mockInterviews.filter(
    (interview) => interview.status === "upcoming" && isUpcoming(interview.date)
  );
  const completedInterviews = mockInterviews.filter(
    (interview) => interview.status === "completed"
  );
  const cancelledInterviews = mockInterviews.filter(
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
                  {mockInterviews.length}
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

        {/* Quick Actions */}
        <div className="mb-8 flex items-center space-x-4">
          <button className="inline-flex items-center space-x-2 px-4 py-2 bg-[#0fc4b5] text-white rounded-lg hover:bg-[#0ba399] transition-colors">
            <PlusIcon className="w-4 h-4" />
            <span>Add Interview</span>
          </button>
          <button className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <CalendarDaysIcon className="w-4 h-4" />
            <span>Calendar View</span>
          </button>
        </div>

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
              {mockInterviews.map((interview) => (
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

