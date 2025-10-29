"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from "react";
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
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationService,
  type Notification,
} from "@/services/notification";

const getNotificationIcon = (
  type: Notification["type"]
) => {
  const typeIcon = {
    application: BriefcaseIcon,
    message: ChatBubbleLeftRightIcon,
    system: InformationCircleIcon,
  }[type] || InformationCircleIcon;

  const Icon = typeIcon;
  const colorClass = {
    application: "text-green-600 bg-green-100",
    message: "text-blue-600 bg-blue-100",
    system: "text-yellow-600 bg-yellow-100",
  }[type] || "text-gray-600 bg-gray-100";

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
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications from backend
  const loadNotifications = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (err: any) {
      setError(err.message || "Failed to fetch notifications");
      showToast("Failed to load notifications", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Periodic polling every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Show toast notification
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredNotifications = notifications.filter(
    (notification: Notification) => {
      const matchesReadFilter =
        filter === "all" ||
        (filter === "read" && notification.read) ||
        (filter === "unread" && !notification.read);

      const matchesCategoryFilter =
        categoryFilter === "all" || notification.type === categoryFilter;

      const matchesSearchTerm =
        searchTerm === "" ||
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesReadFilter && matchesCategoryFilter && matchesSearchTerm;
    }
  );

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      // Removed toast to reduce noise when user clicks notifications
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      showToast("Failed to mark notification as read", "error");
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      showToast("All notifications marked as read", "success");
    } catch (err) {
      showToast("Failed to mark all as read", "error");
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotificationService(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      if (selectedNotification?.id === notificationId) {
        setSelectedNotification(null);
      }
      showToast("Notification deleted", "success");
    } catch (err) {
      showToast("Failed to delete notification", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
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
                        onClick={handleMarkAllAsRead}
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
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-3">
                      <select
                        value={filter}
                        onChange={(e) =>
                          setFilter(e.target.value as "all" | "unread" | "read")
                        }
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm"
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
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm"
                      >
                        <option value="all">All Types</option>
                        <option value="application">Applications</option>
                        <option value="message">Messages</option>
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
                        className={`p-4 hover: cursor-pointer transition-all duration-200 ${
                          !notification.read ? "bg-blue-50 border-l-4 border-blue-500" : "border-l-4 border-transparent"
                        } ${
                          selectedNotification?.id === notification.id
                            ? "bg-blue-100 ring-2 ring-blue-500 ring-inset"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedNotification(notification);
                          if (!notification.read) {
                            handleMarkAsRead(notification.id);
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(
                            notification.type
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
                                  {formatTimestamp(notification.createdAt)}
                                </span>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
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
                          handleDeleteNotification(selectedNotification.id)
                        }
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        {getNotificationIcon(
                          selectedNotification.type
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
                              {selectedNotification.type}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Time:</span>
                            <span className="text-gray-900">
                              {new Date(
                                selectedNotification.createdAt
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>


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

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
              toast.type === "success"
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <XCircleIcon className="w-5 h-5" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
