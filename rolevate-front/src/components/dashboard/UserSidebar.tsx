"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/common/logo";
import {
  HomeIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  ClipboardDocumentListIcon,
  BookmarkIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { logout } from "@/services/auth";

const navigationItems = [
  {
    icon: HomeIcon,
    label: "Dashboard",
    href: "/userdashboard",
  },
  {
    icon: BriefcaseIcon,
    label: "Browse Jobs",
    href: "/jobs",
  },
  {
    icon: ClipboardDocumentListIcon,
    label: "My Applications",
    href: "/userdashboard/applications",
  },
  {
    icon: BookmarkIcon,
    label: "Saved Jobs",
    href: "/userdashboard/saved-jobs",
  },
  {
    icon: DocumentTextIcon,
    label: "My CV",
    href: "/userdashboard/cv",
  },
  {
    icon: UserIcon,
    label: "Profile",
    href: "/userdashboard/profile",
  },
];

interface CompanyData {
  name?: string;
  logo?: string;
}

export default function UserSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData>({});
  const pathname = usePathname();
  const router = useRouter();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Fetch company data for logo display
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:4005/api/company/me/company",
          {
            credentials: "include",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCompanyData({
            name: data.name,
            logo: data.logo,
          });
        }
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    };

    fetchCompanyData();
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
        className="fixed top-4 left-4 z-50 lg:hidden bg-white text-gray-700 p-2 rounded-lg shadow-lg hover:bg-gray-50 border border-gray-200 transition-colors"
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
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-300/70 shadow-md z-40 transition-transform duration-300 lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:block`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex justify-center items-center px-6 py-6">
            <Logo size={48} />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/userdashboard" &&
                    pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-[#0fc4b5] text-white shadow-md"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                        isActive
                          ? "text-white"
                          : "text-gray-500 group-hover:text-gray-700"
                      }`}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Profile & Logout */}
          <div className="border-t border-gray-200 p-3">
            <div className="flex items-center px-3 py-2 text-sm mb-2">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 bg-[#0fc4b5] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">JD</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    John Doe
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    john.doe@example.com
                  </p>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              onClick={handleLogout}
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
