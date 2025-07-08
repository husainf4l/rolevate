import React from "react";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentApplications from "@/components/dashboard/RecentApplications";
import CVManager from "@/components/dashboard/CVManager";
import JobRecommendations from "@/components/dashboard/JobRecommendations";
import InterviewSchedule from "@/components/dashboard/InterviewSchedule";

export default function UserDashboardPage() {
  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, John!
          </h1>
          <p className="text-gray-600">
            Here's your job search overview and recent activity.
          </p>
        </div>

        {/* Stats */}
        <DashboardStats />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <RecentApplications />
            <JobRecommendations />
          </div>

          {/* Right Column - Sidebar Content */}
          <div className="space-y-8">
            <CVManager />
            <InterviewSchedule />
          </div>
        </div>
      </div>
    </div>
  );
}
