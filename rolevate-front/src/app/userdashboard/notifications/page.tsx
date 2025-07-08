import React from "react";
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
  ClockIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

interface Notification {
  id: string;
  type: "success" | "warning" | "info" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  category: "application" | "interview" | "job" | "system";
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "Application Submitted",
    message:
      "Your application for Senior Frontend Developer at TechCorp Inc. has been successfully submitted.",
    timestamp: "2025-01-09T10:30:00Z",
    read: false,
    category: "application",
    actionUrl: "/userdashboard/applications/1",
    actionText: "View Application",
  },
  {
    id: "2",
    type: "info",
    title: "Interview Scheduled",
    message:
      "Your interview for UI/UX Designer at DesignHub is scheduled for January 12, 2025 at 2:00 PM.",
    timestamp: "2025-01-09T09:15:00Z",
    read: false,
    category: "interview",
    actionUrl: "/userdashboard/interviews/2",
    actionText: "View Details",
  },
  {
    id: "3",
    type: "warning",
    title: "Application Deadline Soon",
    message:
      "The application deadline for Full Stack Developer at StartupXYZ is in 2 days. Don't miss out!",
    timestamp: "2025-01-08T16:45:00Z",
    read: true,
    category: "job",
    actionUrl: "/jobs/3",
    actionText: "Apply Now",
  },
  {
    id: "4",
    type: "success",
    title: "Profile View Increase",
    message:
      "Your profile has been viewed 25 times this week, up 40% from last week.",
    timestamp: "2025-01-08T14:20:00Z",
    read: true,
    category: "system",
    actionUrl: "/userdashboard/profile",
    actionText: "View Profile",
  },
  {
    id: "5",
    type: "info",
    title: "New Job Matches",
    message: "5 new job opportunities match your skills and preferences.",
    timestamp: "2025-01-08T11:30:00Z",
    read: false,
    category: "job",
    actionUrl: "/userdashboard/jobs",
    actionText: "View Jobs",
  },
  {
    id: "6",
    type: "warning",
    title: "Interview Reminder",
    message:
      "Your interview with TechCorp Inc. is tomorrow at 10:00 AM. Don't forget to prepare!",
    timestamp: "2025-01-08T08:00:00Z",
    read: false,
    category: "interview",
    actionUrl: "/userdashboard/interviews/1",
    actionText: "View Interview",
  },
  {
    id: "7",
    type: "error",
    title: "Application Rejected",
    message:
      "Unfortunately, your application for React Developer at WebSolutions was not successful.",
    timestamp: "2025-01-07T15:30:00Z",
    read: true,
    category: "application",
    actionUrl: "/userdashboard/applications/4",
    actionText: "View Feedback",
  },
  {
    id: "8",
    type: "info",
    title: "CV Updated",
    message:
      "Your CV has been successfully updated with new skills and experience.",
    timestamp: "2025-01-07T13:15:00Z",
    read: true,
    category: "system",
    actionUrl: "/userdashboard/cv",
    actionText: "View CV",
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "success":
      return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
    case "warning":
      return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />;
    case "info":
      return <InformationCircleIcon className="w-6 h-6 text-blue-500" />;
    case "error":
      return <XMarkIcon className="w-6 h-6 text-red-500" />;
    default:
      return <BellIcon className="w-6 h-6 text-gray-500" />;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "application":
      return <BriefcaseIcon className="w-4 h-4" />;
    case "interview":
      return <CalendarDaysIcon className="w-4 h-4" />;
    case "job":
      return <EyeIcon className="w-4 h-4" />;
    case "system":
      return <InformationCircleIcon className="w-4 h-4" />;
    default:
      return <BellIcon className="w-4 h-4" />;
  }
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor(
    (now.getTime() - time.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  } else {
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }
};

export default function NotificationsPage() {
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Notifications
              </h1>
              <p className="text-gray-600">
                Stay updated with your job search progress and important
                updates.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-[#0fc4b5] border border-[#0fc4b5] rounded-lg hover:bg-[#0fc4b5] hover:text-white transition-colors">
                Mark All Read
              </button>
              <button className="px-4 py-2 bg-[#0fc4b5] text-white rounded-lg hover:bg-[#0ba399] transition-colors">
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockNotifications.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BellIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900">
                  {unreadCount}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">6</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Actions Needed
                </p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <option>All Categories</option>
                <option>Applications</option>
                <option>Interviews</option>
                <option>Jobs</option>
                <option>System</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <option>All Status</option>
                <option>Unread</option>
                <option>Read</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              {mockNotifications.length} notifications
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {mockNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow-sm border transition-all hover:shadow-md ${
                notification.read
                  ? "border-gray-200"
                  : "border-[#0fc4b5] border-l-4"
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3
                          className={`text-sm font-medium ${
                            notification.read
                              ? "text-gray-900"
                              : "text-gray-900 font-semibold"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-1 text-gray-500">
                          {getCategoryIcon(notification.category)}
                          <span className="text-xs capitalize">
                            {notification.category}
                          </span>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-[#0fc4b5] rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTimeAgo(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {notification.actionUrl && (
                      <a
                        href={notification.actionUrl}
                        className="px-3 py-1 text-sm bg-[#0fc4b5] text-white rounded-md hover:bg-[#0ba399] transition-colors"
                      >
                        {notification.actionText}
                      </a>
                    )}
                    <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {mockNotifications.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <BellIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications yet
            </h3>
            <p className="text-gray-600 mb-4">
              You'll see updates about your job search progress here.
            </p>
          </div>
        )}

        {/* Notification Settings */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📱 Notification Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded text-[#0fc4b5]"
                  defaultChecked
                />
                <span>Application status updates</span>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded text-[#0fc4b5]"
                  defaultChecked
                />
                <span>Interview reminders</span>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded text-[#0fc4b5]"
                  defaultChecked
                />
                <span>New job matches</span>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded text-[#0fc4b5]" />
                <span>Weekly progress reports</span>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded text-[#0fc4b5]"
                  defaultChecked
                />
                <span>Application deadlines</span>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded text-[#0fc4b5]" />
                <span>Marketing updates</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
