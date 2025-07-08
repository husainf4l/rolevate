import React from "react";
import { BriefcaseIcon, DocumentTextIcon, UsersIcon, ChartBarIcon } from "@heroicons/react/24/outline";

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  change?: {
    value: string;
    trend: "up" | "down";
  };
}

const statCards: StatCard[] = [
  {
    title: "Active Job Postings",
    value: "12",
    icon: BriefcaseIcon,
    change: { value: "+15%", trend: "up" }
  },
  {
    title: "Total Applications",
    value: "248",
    icon: DocumentTextIcon,
    change: { value: "+32%", trend: "up" }
  },
  {
    title: "Candidates Hired",
    value: "8",
    icon: UsersIcon,
    change: { value: "+25%", trend: "up" }
  },
  {
    title: "Hire Success Rate",
    value: "18%",
    icon: ChartBarIcon,
    change: { value: "+3%", trend: "up" }
  }
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-xl p-6 shadow-md border border-gray-300/70 hover:shadow-lg transition-shadow duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#0fc4b5]/15 rounded-lg">
              <card.icon className="w-6 h-6 text-[#0fc4b5]" />
            </div>
            {card.change && (
              <div className={`flex items-center text-sm font-medium ${
                card.change.trend === "up" ? "text-green-600" : "text-red-600"
              }`}>
                {card.change.value}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-600 font-medium">{card.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}