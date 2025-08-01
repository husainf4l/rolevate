"use client";

import React, { useState, useRef, useEffect } from "react";
import { BellIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { logout } from "@/services/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { API_CONFIG } from "@/lib/config";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

interface Notification {
  id: string;
  type: "success" | "warning" | "info" | "error";
  category: "application" | "interview" | "system" | "candidate" | "offer";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    candidateName?: string;
    jobTitle?: string;
  };
}

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

const getNotificationIcon = (type: Notification["type"]) => {
  const colorClass = {
    success: "bg-green-100 text-green-600",
    warning: "bg-yellow-100 text-yellow-600",
    info: "bg-blue-100 text-blue-600",
    error: "bg-red-100 text-red-600",
  }[type];

  return <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>;
};

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({
  title = "Dashboard",
  subtitle = "Welcome back! Here's your recruitment overview.",
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useAuth();

  // Helper function to get user initials
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper function to get company display name
  const getCompanyDisplayName = () => {
    if (user?.company?.name) {
      return user.company.name;
    }
    if (user?.name) {
      return user.name;
    }
    return "Company User";
  };

  // Fetch notifications from API
  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const res = await fetch(`${API_CONFIG.API_BASE_URL}/notifications`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : data.notifications || []);
    } catch (err: any) {
      console.error("Error fetching notifications:", err);
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.read);
  const unreadCount = unreadNotifications.length;

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close menus on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target as Node)
      ) {
        setNotificationOpen(false);
      }
    }
    if (menuOpen || notificationOpen) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen, notificationOpen]);

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      // Update local state optimistically
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );

      // Make API call to mark as read
      const res = await fetch(
        `${API_CONFIG.API_BASE_URL}/notifications/${notificationId}/read`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (!res.ok) {
        // Revert on error
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: false } : n))
        );
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
      // Revert on error
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: false } : n))
      );
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/");
    } catch (err) {
      // Optionally show error
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 lg:left-64 bg-white z-32 ">
      <div className="px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center h-16">
            {/* Title Section - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:block">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-700 font-medium">{subtitle}</p>
            </div>

            {/* Mobile Layout - Absolute positioning for perfect centering */}
            <div className="lg:hidden flex-1 relative">
              {/* Centered Title */}
              <div className="absolute inset-0 flex items-center justify-center">
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              </div>

              {/* Right Section - Positioned on the right */}
              <div className="flex items-center justify-end space-x-2">
                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <BellIcon className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">
                            Notifications
                          </h3>
                          <Link
                            href="/dashboard/notifications"
                            className="text-xs text-[#0891b2] hover:text-[#0fc4b5] font-medium"
                            onClick={() => setNotificationOpen(false)}
                          >
                            View All
                          </Link>
                        </div>
                      </div>

                      <div className="max-h-64 overflow-y-auto">
                        {notificationsLoading ? (
                          <div className="px-4 py-6 text-center text-gray-500 text-sm">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#13ead9] mx-auto mb-2"></div>
                            Loading notifications...
                          </div>
                        ) : unreadNotifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-gray-500 text-sm">
                            No new notifications
                          </div>
                        ) : (
                          unreadNotifications
                            .slice(0, 5)
                            .map((notification) => (
                              <div
                                key={notification.id}
                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                onClick={() => {
                                  markNotificationAsRead(notification.id);
                                  setNotificationOpen(false);
                                  if (notification.actionUrl) {
                                    router.push(notification.actionUrl);
                                  }
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  {getNotificationIcon(notification.type)}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {notification.title}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {formatTimestamp(notification.timestamp)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                        )}
                      </div>

                      {unreadNotifications.length > 5 && (
                        <div className="px-4 py-2 border-t border-gray-200 text-center">
                          <Link
                            href="/dashboard/notifications"
                            className="text-xs text-[#0891b2] hover:text-[#0fc4b5] font-medium"
                            onClick={() => setNotificationOpen(false)}
                          >
                            View {unreadNotifications.length - 5} more
                            notifications
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Profile Avatar */}
                <div className="relative" ref={menuRef}>
                  <button
                    className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setMenuOpen((v) => !v)}
                  >
                    <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center overflow-hidden">
                      {user?.avatar ? (
                        <img
                          src={
                            user.avatar.startsWith('http') 
                              ? user.avatar 
                              : `/api/proxy-image?url=${encodeURIComponent(`${API_CONFIG.UPLOADS_URL}/${user.avatar}`)}`
                          }
                          alt={user.name || "User"}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.setAttribute('style', 'display: flex');
                          }}
                        />
                      ) : null}
                      <span 
                        className="text-white text-sm font-medium flex items-center justify-center w-full h-full"
                        style={{ display: user?.avatar ? 'none' : 'flex' }}
                      >
                        {user?.name ? getUserInitials(user.name) : "U"}
                      </span>
                    </div>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                      <a
                        href="/dashboard/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
                        onClick={() => setMenuOpen(false)}
                      >
                        Profile
                      </a>
                      <button
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 text-sm"
                        onClick={() => {
                          setMenuOpen(false);
                          handleLogout();
                        }}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Right Section */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0fc4b5] focus:border-transparent text-sm"
                />
              </div>

              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <BellIcon className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">
                          Notifications
                        </h3>
                        <Link
                          href="/dashboard/notifications"
                          className="text-xs text-[#0891b2] hover:text-[#0fc4b5] font-medium"
                          onClick={() => setNotificationOpen(false)}
                        >
                          View All
                        </Link>
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                      {notificationsLoading ? (
                        <div className="px-4 py-6 text-center text-gray-500 text-sm">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#13ead9] mx-auto mb-2"></div>
                          Loading notifications...
                        </div>
                      ) : unreadNotifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-gray-500 text-sm">
                          No new notifications
                        </div>
                      ) : (
                        unreadNotifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() => {
                              markNotificationAsRead(notification.id);
                              setNotificationOpen(false);
                              if (notification.actionUrl) {
                                router.push(notification.actionUrl);
                              }
                            }}
                          >
                            <div className="flex items-start gap-3">
                              {getNotificationIcon(notification.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatTimestamp(notification.timestamp)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {unreadNotifications.length > 5 && (
                      <div className="px-4 py-2 border-t border-gray-200 text-center">
                        <Link
                          href="/dashboard/notifications"
                          className="text-xs text-[#0891b2] hover:text-[#0fc4b5] font-medium"
                          onClick={() => setNotificationOpen(false)}
                        >
                          View {unreadNotifications.length - 5} more
                          notifications
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Avatar + Dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.avatar ? (
                      <img
                        src={
                          user.avatar.startsWith('http') 
                            ? user.avatar 
                            : `/api/proxy-image?url=${encodeURIComponent(`${API_CONFIG.UPLOADS_URL}/${user.avatar}`)}`
                        }
                        alt={user.name || "User"}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.setAttribute('style', 'display: flex');
                        }}
                      />
                    ) : null}
                    <span 
                      className="text-white text-sm font-medium flex items-center justify-center w-full h-full"
                      style={{ display: user?.avatar ? 'none' : 'flex' }}
                    >
                      {user?.name ? getUserInitials(user.name) : "U"}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {getCompanyDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.email || "user@company.com"}
                    </p>
                  </div>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                    <a
                      href="/dashboard/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
                      onClick={() => setMenuOpen(false)}
                    >
                      Profile
                    </a>
                    <button
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 text-sm"
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      Sign Out
                    </button>
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
