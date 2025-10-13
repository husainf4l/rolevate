"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { API_CONFIG } from "@/lib/config";
import Link from "next/link";
import {
  HomeIcon,
  BriefcaseIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ClipboardDocumentListIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import { logout } from "@/services/auth";
import UserProfileSection from "./UserProfileSection";

const navigationItems = [
  {
    icon: HomeIcon,
    label: "Home",
    href: "/userdashboard",
  },
  {
    icon: BriefcaseIcon,
    label: "Jobs",
    href: "/userdashboard/jobs",
  },
  {
    icon: ClipboardDocumentListIcon,
    label: "Applications",
    href: "/userdashboard/applications",
  },
  {
    icon: BookmarkIcon,
    label: "Saved",
    href: "/userdashboard/saved-jobs",
  },
  {
    icon: UserIcon,
    label: "Profile",
    href: "/userdashboard/profile",
  },
];

interface UserData {
  name?: string;
  email?: string;
  avatar?: string;
}

export default function UserSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<UserData>({});
  const pathname = usePathname();
  const router = useRouter();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Fetch user data for profile display
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${API_CONFIG.API_BASE_URL}/users/me`, {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          // Check if response has content and is JSON
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const text = await response.text();
            if (text) {
              try {
                const data = JSON.parse(text);
                setUserData({
                  name: data.name || data.firstName + " " + data.lastName,
                  email: data.email,
                  avatar: data.avatar,
                });
              } catch (parseError) {
                console.error("Error parsing JSON:", parseError);
              }
            }
          }
        } else {
          console.error("API request failed with status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

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
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white text-gray-700 p-2 rounded-lg border border-gray-200 transition-colors hover:bg-gray-50"
        aria-label="Toggle mobile menu"
      >
        {isMobileMenuOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <Bars3Icon className="w-6 h-6" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-24 bg-white border-r border-gray-200 z-40 transition-all duration-300 ease-out lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:block`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex justify-center items-center px-4 py-6 border-b border-gray-100">
            <img
              src="/logo/Rolevate-icon.webp"
              alt="Rolevate Icon"
              className="object-contain"
              style={{ width: 48, height: 48 }}
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-6">
            <div className="space-y-4">
              {navigationItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/userdashboard" &&
                    pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`group flex flex-col items-center justify-center px-2 py-3 text-xs font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-primary-600 text-white"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                    title={item.label}
                  >
                    <item.icon
                      className={`h-6 w-6 mb-1 transition-colors duration-200 ${
                        isActive
                          ? "text-white"
                          : "text-gray-400 group-hover:text-primary-600"
                      }`}
                    />
                    <span className="text-center leading-tight">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Profile & Logout */}
          <UserProfileSection userData={userData} onLogout={handleLogout} />
        </div>
      </aside>
    </>
  );
}

