"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/common/logo";
import {
  HomeIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  UsersIcon,
  BuildingOfficeIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

interface NavigationItem {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  href: string;
}

const navigationItems: NavigationItem[] = [
  {
    icon: HomeIcon,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: BriefcaseIcon,
    label: "Job Management",
    href: "/dashboard/jobs?search=&status=all&type=all",
  },
  {
    icon: UsersIcon,
    label: "Recruitment Pipeline",
    href: "/dashboard/candidates",
  },
  {
    icon: BellIcon,
    label: "Notifications",
    href: "/dashboard/notifications",
  },
  {
    icon: ChartBarIcon,
    label: "Analytics",
    href: "/dashboard/analytics",
  },
  {
    icon: BuildingOfficeIcon,
    label: "Company Profile",
    href: "/dashboard/company-profile",
  },
  {
    icon: ChatBubbleLeftRightIcon,
    label: "Communication",
    href: "/dashboard/messages",
  },
  {
    icon: Cog6ToothIcon,
    label: "Settings",
    href: "/dashboard/settings",
  },
];

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
                // Extract just the pathname part for comparison
                const itemPath = item.href.split("?")[0] || item.href;
                const isActive =
                  pathname === itemPath ||
                  (itemPath !== "/dashboard" && pathname.startsWith(itemPath));

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
        </div>
      </aside>
    </>
  );
}
