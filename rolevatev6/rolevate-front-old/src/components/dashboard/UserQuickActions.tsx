"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  BriefcaseIcon,
  UserCircleIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const quickActions = [
  {
    label: "Browse Jobs",
    description: "Find your next opportunity",
    icon: BriefcaseIcon,
    color: "blue",
    bgColor: "bg-blue-50",
    hoverBg: "hover:bg-blue-100",
    iconColor: "text-blue-600",
    href: "/userdashboard/jobs",
  },
  {
    label: "Update Profile",
    description: "Keep your profile current",
    icon: UserCircleIcon,
    color: "purple",
    bgColor: "bg-purple-50",
    hoverBg: "hover:bg-purple-100",
    iconColor: "text-purple-600",
    href: "/userdashboard/profile",
  },
  {
    label: "Upload Resume",
    description: "Update your CV",
    icon: DocumentTextIcon,
    color: "green",
    bgColor: "bg-green-50",
    hoverBg: "hover:bg-green-100",
    iconColor: "text-green-600",
    href: "/userdashboard/profile?tab=resume",
  },
  {
    label: "Saved Jobs",
    description: "View bookmarked positions",
    icon: BookmarkIcon,
    color: "amber",
    bgColor: "bg-amber-50",
    hoverBg: "hover:bg-amber-100",
    iconColor: "text-amber-600",
    href: "/userdashboard/saved-jobs",
  },
  {
    label: "Interview Prep",
    description: "Practice for interviews",
    icon: AcademicCapIcon,
    color: "teal",
    bgColor: "bg-teal-50",
    hoverBg: "hover:bg-teal-100",
    iconColor: "text-teal-600",
    href: "/userdashboard/interviews",
  },
  {
    label: "Job Search",
    description: "Advanced search options",
    icon: MagnifyingGlassIcon,
    color: "indigo",
    bgColor: "bg-indigo-50",
    hoverBg: "hover:bg-indigo-100",
    iconColor: "text-indigo-600",
    href: "/userdashboard/jobs?search=true",
  },
];

export default function UserQuickActions() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {quickActions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
            onClick={() => router.push(action.href)}
            className={`${action.bgColor} ${action.hoverBg} rounded-lg p-4 text-left transition-all duration-200 border border-transparent hover:border-${action.color}-200 hover:shadow-md group`}
          >
            <action.icon
              className={`w-8 h-8 ${action.iconColor} mb-3 group-hover:scale-110 transition-transform duration-200`}
            />
            <h3 className="font-semibold text-gray-900 mb-1">{action.label}</h3>
            <p className="text-sm text-gray-600">{action.description}</p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
