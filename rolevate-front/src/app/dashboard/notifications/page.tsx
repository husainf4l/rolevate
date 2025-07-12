"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/dashboard/Header";
import {
  BellIcon,
  InformationCircleIcon,
  UserIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";


interface Notification {
  id: string;
  type: "SUCCESS" | "WARNING" | "INFO" | "ERROR";
  category: "APPLICATION" | "INTERVIEW" | "SYSTEM" | "CANDIDATE" | "OFFER";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    candidateName?: string;
    jobTitle?: string;
    interviewDate?: string;
    applicationId?: string;
    [key: string]: any;
  };
  userId?: string;
  companyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Notifications state will be loaded from backend

const getNotificationIcon = (
  type: Notification["type"],
  category: Notification["category"]
) => {
  const categoryIcon = {
    APPLICATION: BriefcaseIcon,
    INTERVIEW: ChatBubbleLeftRightIcon,
    SYSTEM: InformationCircleIcon,
    CANDIDATE: UserIcon,
    OFFER: DocumentTextIcon,
  }[category];

  const Icon = categoryIcon;
  const colorClass = {
    SUCCESS: "text-green-600 bg-green-100",
    WARNING: "text-yellow-600 bg-yellow-100",
    INFO: "text-blue-600 bg-blue-100",
    ERROR: "text-red-600 bg-red-100",
  }[type];

  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}
    >
      <Icon className="w-5 h-5" />
    </div>
  );
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) {
    return "Just now";
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:4005/api/notifications", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch notifications");
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : data.notifications || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch notifications");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter((notification: Notification) => {
    const matchesReadFilter =
      filter === "all" ||
      (filter === "read" && notification.read) ||
      (filter === "unread" && !notification.read);

    const matchesCategoryFilter =
      categoryFilter === "all" || notification.category === categoryFilter;

    const matchesSearchTerm =
      searchTerm === "" ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesReadFilter && matchesCategoryFilter && matchesSearchTerm;
  });

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    if (selectedNotification?.id === notificationId) {
      setSelectedNotification(null);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0891b2] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#0891b2] text-white rounded-lg hover:bg-[#0fc4b5] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Notifications"
        subtitle={`${unreadCount} unread notifications`}
      />

      <div className="pt-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Notification List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      All Notifications
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={markAllAsRead}
                        className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                      >
                        Mark All Read
                      </button>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-5">
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search notifications..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0891b2] focus:border-transparent text-sm"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-3">
                      <select
                        value={filter}
                        onChange={(e) =>
                          setFilter(e.target.value as "all" | "unread" | "read")
                        }
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0891b2] focus:border-transparent text-sm"
                      >
                        <option value="all">All Notifications</option>
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                      </select>
                    </div>

                    <div className="md:col-span-3">
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0891b2] focus:border-transparent text-sm"
                      >
                        <option value="all">All Categories</option>
                        <option value="application">Applications</option>
                        <option value="interview">Interviews</option>
                        <option value="candidate">Candidates</option>
                        <option value="offer">Offers</option>
                        <option value="system">System</option>
                      </select>
                    </div>

                    <div className="md:col-span-1">
                      <button className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm">
                        <FunnelIcon className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notification List */}
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No notifications found</p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.read ? "bg-blue-50" : ""
                        } ${
                          selectedNotification?.id === notification.id
                            ? "bg-blue-100"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedNotification(notification);
                          if (!notification.read) {
                            markAsRead(notification.id);
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(
                            notification.type,
                            notification.category
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3
                                className={`text-sm font-medium ${
                                  !notification.read
                                    ? "text-gray-900"
                                    : "text-gray-700"
                                }`}
                              >
                                {notification.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            {notification.metadata && (
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                {notification.metadata.candidateName && (
                                  <span>
                                    👤 {notification.metadata.candidateName}
                                  </span>
                                )}
                                {notification.metadata.jobTitle && (
                                  <span>
                                    💼 {notification.metadata.jobTitle}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Notification Details */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-24">
                {selectedNotification ? (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Notification Details
                      </h3>
                      <button
                        onClick={() =>
                          deleteNotification(selectedNotification.id)
                        }
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        {getNotificationIcon(
                          selectedNotification.type,
                          selectedNotification.category
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {selectedNotification.title}
                          </h4>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              selectedNotification.read
                                ? "bg-gray-100 text-gray-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {selectedNotification.read ? "Read" : "Unread"}
                          </span>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">
                          Message
                        </h5>
                        <p className="text-sm text-gray-700">
                          {selectedNotification.message}
                        </p>
                      </div>

                      <div className="border-t pt-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">
                          Details
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Type:</span>
                            <span className="text-gray-900 capitalize">
                              {selectedNotification.type}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Category:</span>
                            <span className="text-gray-900 capitalize">
                              {selectedNotification.category}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Time:</span>
                            <span className="text-gray-900">
                              {new Date(
                                selectedNotification.timestamp
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {selectedNotification.metadata && (
                        <div className="border-t pt-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">
                            Additional Info
                          </h5>
                          <div className="space-y-2 text-sm">
                            {selectedNotification.metadata.candidateName && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">
                                  Candidate:
                                </span>
                                <span className="text-gray-900">
                                  {selectedNotification.metadata.candidateName}
                                </span>
                              </div>
                            )}
                            {selectedNotification.metadata.jobTitle && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Position:</span>
                                <span className="text-gray-900">
                                  {selectedNotification.metadata.jobTitle}
                                </span>
                              </div>
                            )}
                            {selectedNotification.metadata.applicationId && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">
                                  Application ID:
                                </span>
                                <span className="text-gray-900">
                                  {selectedNotification.metadata.applicationId}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedNotification.actionUrl && (
                        <div className="border-t pt-4">
                          <button
                            onClick={() =>
                              (window.location.href =
                                selectedNotification.actionUrl!)
                            }
                            className="w-full px-4 py-2 bg-[#0891b2] text-white rounded-lg hover:bg-[#0fc4b5] transition-colors font-medium text-sm"
                          >
                            View Details
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Select a notification to view details
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
