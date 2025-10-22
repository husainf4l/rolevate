"use client";

import React from "react";
import {
  BriefcaseIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

interface UserStats {
  totalApplications: number;
  activeApplications: number;
  interviews: number;
  offers: number;
  pending: number;
  rejected: number;
}

interface UserStatsCardsProps {
  stats: UserStats;
  loading?: boolean;
}

const statCards = [
  {
    key: "totalApplications" as keyof UserStats,
    label: "Total Applications",
    icon: ClipboardDocumentListIcon,
    color: "blue",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    borderColor: "border-blue-100",
  },
  {
    key: "activeApplications" as keyof UserStats,
    label: "Active",
    icon: BriefcaseIcon,
    color: "green",
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    borderColor: "border-green-100",
  },
  {
    key: "interviews" as keyof UserStats,
    label: "Interviews",
    icon: CalendarDaysIcon,
    color: "purple",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    borderColor: "border-purple-100",
  },
  {
    key: "offers" as keyof UserStats,
    label: "Offers",
    icon: CheckCircleIcon,
    color: "teal",
    bgColor: "bg-teal-50",
    iconColor: "text-teal-600",
    borderColor: "border-teal-100",
  },
  {
    key: "pending" as keyof UserStats,
    label: "Under Review",
    icon: ClockIcon,
    color: "amber",
    bgColor: "bg-amber-50",
    iconColor: "text-amber-600",
    borderColor: "border-amber-100",
  },
  {
    key: "rejected" as keyof UserStats,
    label: "Not Selected",
    icon: XCircleIcon,
    color: "red",
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
    borderColor: "border-red-100",
  },
];

export default function UserStatsCards({ stats, loading = false }: UserStatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((card, index) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className={`bg-white rounded-xl p-6 border ${card.borderColor} hover:shadow-lg transition-all duration-300 cursor-pointer group`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`${card.bgColor} p-3 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
              <card.icon className={`w-6 h-6 ${card.iconColor}`} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-gray-900">
              {stats[card.key].toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 font-medium">{card.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
