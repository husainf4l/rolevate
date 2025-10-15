"use client";

import StatsCards from "@/components/dashboard/StatsCards";
import Calendar from "@/components/dashboard/Calendar";
import RecentJobs from "@/components/dashboard/RecentJobs";
import RecentApplications from "@/components/dashboard/RecentCVs";
import Header from "@/components/dashboard/Header";
import React from "react";

export default function DashboardPage() {
  return (
    <div className="p-8 pt-20">
      <div className="max-w-7xl mx-auto">
        <Header />
        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Calendar />
          <RecentApplications />
        </div>

        <RecentJobs />
      </div>
    </div>
  );
}

