"use client";

import React, { useState } from "react";
import Header from "@/components/dashboard/Header";
import {
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MapPinIcon,
  BriefcaseIcon,
  ClockIcon,
  StarIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FunnelIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";

// Comprehensive analytics data with meaningful insights
type AnalyticsData = {
  overview: OverviewData;
  pipelineData: PipelineStage[];
  timelineData: TimelineData[];
  sourceData: SourceData[];
  aiPerformance: AiPerformanceData;
  departmentData: DepartmentData[];
  locationData: LocationData[];
  topSkills: SkillData[];
  insights: Insight[];
};

const analyticsData: AnalyticsData = {
  overview: {
    totalCandidates: 247,
    totalCandidatesChange: 12,
    activeJobs: 8,
    activeJobsChange: 2,
    avgTimeToHire: 14,
    avgTimeToHireChange: -2,
    hiringRate: 68,
    hiringRateChange: 5,
    costPerHire: 4500,
    costPerHireChange: -8,
    qualityScore: 82,
    qualityScoreChange: 6,
  },
  pipelineData: [
    {
      stage: "Applications Received",
      count: 247,
      percentage: 100,
      color: "#0891b2",
      dropOffRate: 0,
    },
    {
      stage: "AI Resume Analysis",
      count: 189,
      percentage: 77,
      color: "#0fc4b5",
      dropOffRate: 23,
    },
    {
      stage: "AI Interview Round 1",
      count: 142,
      percentage: 58,
      color: "#06b6d4",
      dropOffRate: 25,
    },
    {
      stage: "AI Interview Round 2",
      count: 98,
      percentage: 40,
      color: "#0284c7",
      dropOffRate: 31,
    },
    {
      stage: "HR Interview",
      count: 67,
      percentage: 27,
      color: "#f59e0b",
      dropOffRate: 32,
    },
    {
      stage: "Final Offer",
      count: 34,
      percentage: 14,
      color: "#10b981",
      dropOffRate: 49,
    },
    {
      stage: "Successfully Hired",
      count: 28,
      percentage: 11,
      color: "#059669",
      dropOffRate: 18,
    },
  ],
  timelineData: [
    {
      month: "Jul",
      applications: 45,
      hires: 8,
      interviews: 28,
      avgAiScore: 72,
    },
    {
      month: "Aug",
      applications: 52,
      hires: 12,
      interviews: 32,
      avgAiScore: 74,
    },
    {
      month: "Sep",
      applications: 38,
      hires: 6,
      interviews: 24,
      avgAiScore: 69,
    },
    {
      month: "Oct",
      applications: 61,
      hires: 14,
      interviews: 38,
      avgAiScore: 76,
    },
    {
      month: "Nov",
      applications: 58,
      hires: 11,
      interviews: 35,
      avgAiScore: 78,
    },
    {
      month: "Dec",
      applications: 43,
      hires: 9,
      interviews: 26,
      avgAiScore: 75,
    },
  ],
  sourceData: [
    {
      source: "LinkedIn",
      count: 89,
      percentage: 36,
      color: "#0077b5",
      quality: 85,
      cost: 120,
    },
    {
      source: "Company Website",
      count: 76,
      percentage: 31,
      color: "#10b981",
      quality: 78,
      cost: 45,
    },
    {
      source: "Employee Referral",
      count: 54,
      percentage: 22,
      color: "#f59e0b",
      quality: 92,
      cost: 200,
    },
    {
      source: "Recruitment Agency",
      count: 28,
      percentage: 11,
      color: "#8b5cf6",
      quality: 88,
      cost: 350,
    },
  ],
  aiPerformance: {
    avgAiScore: 74,
    avgAiScoreChange: 3,
    aiAccuracy: 86,
    aiAccuracyChange: 2,
    avgProcessingTime: 2.4,
    avgProcessingTimeChange: -0.3,
    predictiveAccuracy: 91,
    predictiveAccuracyChange: 4,
    falsePositiveRate: 8,
    falsePositiveRateChange: -2,
  },
  departmentData: [
    {
      department: "Engineering",
      candidates: 142,
      hires: 18,
      rate: 12.7,
      avgSalary: "AED 16,500",
      timeToHire: 16,
    },
    {
      department: "Design",
      candidates: 43,
      hires: 6,
      rate: 14.0,
      avgSalary: "AED 12,000",
      timeToHire: 12,
    },
    {
      department: "Product Management",
      candidates: 28,
      hires: 3,
      rate: 10.7,
      avgSalary: "AED 20,000",
      timeToHire: 18,
    },
    {
      department: "Marketing",
      candidates: 21,
      hires: 2,
      rate: 9.5,
      avgSalary: "AED 11,000",
      timeToHire: 14,
    },
    {
      department: "Sales",
      candidates: 13,
      hires: 1,
      rate: 7.7,
      avgSalary: "AED 13,500",
      timeToHire: 10,
    },
  ],
  locationData: [
    {
      location: "Dubai, UAE",
      candidates: 67,
      percentage: 27,
      avgSalary: "AED 15,200",
      hiringRate: 13.4,
    },
    {
      location: "Riyadh, Saudi Arabia",
      candidates: 45,
      percentage: 18,
      avgSalary: "SAR 13,500",
      hiringRate: 11.1,
    },
    {
      location: "Doha, Qatar",
      candidates: 34,
      percentage: 14,
      avgSalary: "QAR 11,800",
      hiringRate: 14.7,
    },
    {
      location: "Cairo, Egypt",
      candidates: 32,
      percentage: 13,
      avgSalary: "EGP 28,000",
      hiringRate: 9.4,
    },
    {
      location: "Kuwait City, Kuwait",
      candidates: 28,
      percentage: 11,
      avgSalary: "KWD 950",
      hiringRate: 12.5,
    },
    {
      location: "Others",
      candidates: 41,
      percentage: 17,
      avgSalary: "USD 4,200",
      hiringRate: 8.5,
    },
  ],
  topSkills: [
    {
      skill: "React",
      count: 89,
      trend: "up",
      demandScore: 95,
      salaryPremium: 12,
    },
    {
      skill: "JavaScript",
      count: 76,
      trend: "up",
      demandScore: 88,
      salaryPremium: 8,
    },
    {
      skill: "Node.js",
      count: 54,
      trend: "stable",
      demandScore: 82,
      salaryPremium: 15,
    },
    {
      skill: "Python",
      count: 43,
      trend: "up",
      demandScore: 90,
      salaryPremium: 18,
    },
    {
      skill: "AWS",
      count: 38,
      trend: "up",
      demandScore: 85,
      salaryPremium: 22,
    },
    {
      skill: "TypeScript",
      count: 32,
      trend: "up",
      demandScore: 87,
      salaryPremium: 14,
    },
    {
      skill: "Docker",
      count: 28,
      trend: "stable",
      demandScore: 78,
      salaryPremium: 16,
    },
    {
      skill: "GraphQL",
      count: 21,
      trend: "down",
      demandScore: 72,
      salaryPremium: 10,
    },
  ],
  insights: [
    {
      type: "success",
      title: "AI Interview Performance",
      description: "86% accuracy rate in predicting successful hires",
      metric: "↑ 4% from last month",
      icon: "cpu",
    },
    {
      type: "warning",
      title: "Pipeline Bottleneck",
      description: "49% drop-off rate between HR Interview and Final Offer",
      metric: "Needs attention",
      icon: "funnel",
    },
    {
      type: "info",
      title: "Top Performing Source",
      description: "Employee referrals show highest quality score (92%)",
      metric: "Quality leader",
      icon: "users",
    },
    {
      type: "success",
      title: "Cost Efficiency",
      description: "Cost per hire reduced by 8% this month",
      metric: "AED 4,500 average",
      icon: "currency",
    },
  ],
};

interface OverviewData {
  totalCandidates: number;
  totalCandidatesChange: number;
  activeJobs: number;
  activeJobsChange: number;
  avgTimeToHire: number;
  avgTimeToHireChange: number;
  hiringRate: number;
  hiringRateChange: number;
  costPerHire: number;
  costPerHireChange: number;
  qualityScore: number;
  qualityScoreChange: number;
}

interface PipelineStage {
  stage: string;
  count: number;
  percentage: number;
  color: string;
  dropOffRate: number;
}

interface TimelineData {
  month: string;
  applications: number;
  hires: number;
  interviews: number;
  avgAiScore: number;
}

interface SourceData {
  source: string;
  count: number;
  percentage: number;
  color: string;
  quality: number;
  cost: number;
}

interface AiPerformanceData {
  avgAiScore: number;
  avgAiScoreChange: number;
  aiAccuracy: number;
  aiAccuracyChange: number;
  avgProcessingTime: number;
  avgProcessingTimeChange: number;
  predictiveAccuracy: number;
  predictiveAccuracyChange: number;
  falsePositiveRate: number;
  falsePositiveRateChange: number;
}

interface DepartmentData {
  department: string;
  candidates: number;
  hires: number;
  rate: number;
  avgSalary: string;
  timeToHire: number;
}

interface LocationData {
  location: string;
  candidates: number;
  percentage: number;
  avgSalary: string;
  hiringRate: number;
}

interface SkillData {
  skill: string;
  count: number;
  trend: "up" | "down" | "stable";
  demandScore: number;
  salaryPremium: number;
}

interface Insight {
  type: "success" | "warning" | "error" | "info";
  title: string;
  description: string;
  metric: string;
  icon: string;
}

const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  color = "text-gray-600",
}: {
  title: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
  color?: string;
}) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <div className="flex items-center mt-2">
          {change > 0 ? (
            <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span
            className={`text-sm font-medium ${
              change > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {Math.abs(change)}%
          </span>
          <span className="text-xs text-gray-500 ml-1">vs last month</span>
        </div>
      </div>
      <div className={`p-3 rounded-lg bg-[#0891b2]/10`}>
        <Icon className={`w-6 h-6 text-[#0891b2]`} />
      </div>
    </div>
  </div>
);

const PipelineChart = ({ data }: { data: PipelineStage[] }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      AI Recruitment Pipeline Analysis
    </h3>
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={item.stage} className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">
              {item.stage}
            </span>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-gray-900">
                {item.count} candidates
              </span>
              <span className="text-xs text-gray-500">
                ({item.percentage}% of total)
              </span>
              {item.dropOffRate > 0 && (
                <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                  -{item.dropOffRate}% drop-off
                </span>
              )}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="h-4 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color,
              }}
            >
              <span className="text-xs text-white font-medium">
                {item.percentage}%
              </span>
            </div>
          </div>
          {index < data.length - 1 && (
            <div className="absolute left-8 top-12 w-0.5 h-4 bg-gray-300" />
          )}
        </div>
      ))}
    </div>
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium text-gray-900 mb-2">Pipeline Efficiency</h4>
      <div className="text-sm text-gray-600">
        <p>
          • Overall conversion rate:{" "}
          <span className="font-semibold text-[#0891b2]">11.3%</span> (28/247
          candidates hired)
        </p>
        <p>
          • Biggest drop-off:{" "}
          <span className="font-semibold text-red-600">HR to Offer stage</span>{" "}
          (49% drop-off)
        </p>
        <p>
          • AI efficiency:{" "}
          <span className="font-semibold text-green-600">77% pass rate</span> in
          initial screening
        </p>
      </div>
    </div>
  </div>
);

const TimelineChart = ({ data }: { data: TimelineData[] }) => {
  const maxValue = Math.max(...data.map((item) => item.applications));
  const chartHeight = 200;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        6-Month Recruitment Trends
      </h3>

      {/* Chart Legend */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#0891b2] rounded-full" />
          <span className="text-sm text-gray-600">Applications</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#0fc4b5] rounded-full" />
          <span className="text-sm text-gray-600">Interviews</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-sm text-gray-600">Hires</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full" />
          <span className="text-sm text-gray-600">Avg AI Score</span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative" style={{ height: chartHeight + 40 }}>
        {/* Y-axis grid lines */}
        <div className="absolute inset-0">
          {[0, 20, 40, 60, 80].map((value) => (
            <div
              key={value}
              className="absolute left-0 right-0 border-t border-gray-100"
              style={{ bottom: `${(value / maxValue) * chartHeight + 40}px` }}
            >
              <span className="absolute -left-8 -top-2 text-xs text-gray-500">
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Chart bars and lines */}
        <div className="absolute inset-0 flex items-end justify-between px-4">
          {data.map((item, index) => (
            <div
              key={item.month}
              className="flex flex-col items-center flex-1 relative"
            >
              {/* Bars */}
              <div className="flex items-end gap-1 mb-4">
                <div
                  className="w-4 bg-[#0891b2] rounded-t hover:bg-[#0891b2]/80 transition-colors cursor-pointer group relative"
                  style={{
                    height: `${(item.applications / maxValue) * chartHeight}px`,
                  }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.applications}
                  </div>
                </div>
                <div
                  className="w-4 bg-[#0fc4b5] rounded-t hover:bg-[#0fc4b5]/80 transition-colors cursor-pointer group relative"
                  style={{
                    height: `${(item.interviews / maxValue) * chartHeight}px`,
                  }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.interviews}
                  </div>
                </div>
                <div
                  className="w-4 bg-green-500 rounded-t hover:bg-green-500/80 transition-colors cursor-pointer group relative"
                  style={{
                    height: `${(item.hires / maxValue) * chartHeight}px`,
                  }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.hires}
                  </div>
                </div>
              </div>

              {/* Month label */}
              <div className="text-center">
                <div className="text-xs font-medium text-gray-900">
                  {item.month}
                </div>
                <div className="text-xs text-gray-500">2024</div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Score trend line */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ height: chartHeight + 40 }}
        >
          <defs>
            <linearGradient
              id="aiScoreGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <path
            d={`M ${data
              .map(
                (item, index) =>
                  `${index * (100 / (data.length - 1))}% ${
                    chartHeight - (item.avgAiScore / 100) * chartHeight + 40
                  }px`
              )
              .join(" L ")}`}
            fill="none"
            stroke="url(#aiScoreGradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {data.map((item, index) => (
            <circle
              key={index}
              cx={`${index * (100 / (data.length - 1))}%`}
              cy={chartHeight - (item.avgAiScore / 100) * chartHeight + 40}
              r="4"
              fill="#f97316"
              stroke="white"
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#0891b2]">
            {data.reduce((sum, item) => sum + item.applications, 0)}
          </div>
          <div className="text-xs text-gray-500">Total Applications</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#0fc4b5]">
            {data.reduce((sum, item) => sum + item.interviews, 0)}
          </div>
          <div className="text-xs text-gray-500">Total Interviews</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500">
            {data.reduce((sum, item) => sum + item.hires, 0)}
          </div>
          <div className="text-xs text-gray-500">Total Hires</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-500">
            {Math.round(
              data.reduce((sum, item) => sum + item.avgAiScore, 0) / data.length
            )}
            %
          </div>
          <div className="text-xs text-gray-500">Avg AI Score</div>
        </div>
      </div>
    </div>
  );
};

const SourcePieChart = ({ data }: { data: SourceData[] }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      Application Sources
    </h3>
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.source} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm font-medium text-gray-900">
              {item.source}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">
              {item.count}
            </span>
            <span className="text-xs text-gray-500">({item.percentage}%)</span>
          </div>
        </div>
      ))}
    </div>
    <div className="mt-6 relative h-32">
      <div className="flex items-center justify-center h-full">
        <div className="relative w-24 h-24 rounded-full border-8 border-gray-200">
          {data.map((item, index) => {
            const offset = data
              .slice(0, index)
              .reduce((acc, curr) => acc + curr.percentage, 0);
            return (
              <div
                key={item.source}
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(${item.color} 0deg ${
                    item.percentage * 3.6
                  }deg, transparent ${item.percentage * 3.6}deg 360deg)`,
                  transform: `rotate(${offset * 3.6}deg)`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  </div>
);

const AIPerformanceCard = ({ data }: { data: AiPerformanceData }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <div className="flex items-center gap-2 mb-6">
      <CpuChipIcon className="w-5 h-5 text-[#0891b2]" />
      <h3 className="text-lg font-semibold text-gray-900">
        AI Performance Metrics
      </h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-[#0891b2]">
          {data.avgAiScore}%
        </div>
        <div className="text-sm text-gray-600">Avg AI Score</div>
        <div className="flex items-center justify-center mt-1">
          <ArrowUpIcon className="w-3 h-3 text-green-500 mr-1" />
          <span className="text-xs text-green-600">
            +{data.avgAiScoreChange}%
          </span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-[#0891b2]">
          {data.aiAccuracy}%
        </div>
        <div className="text-sm text-gray-600">AI Accuracy</div>
        <div className="flex items-center justify-center mt-1">
          <ArrowUpIcon className="w-3 h-3 text-green-500 mr-1" />
          <span className="text-xs text-green-600">
            +{data.aiAccuracyChange}%
          </span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-[#0891b2]">
          {data.avgProcessingTime}s
        </div>
        <div className="text-sm text-gray-600">Processing Time</div>
        <div className="flex items-center justify-center mt-1">
          <ArrowDownIcon className="w-3 h-3 text-green-500 mr-1" />
          <span className="text-xs text-green-600">
            {data.avgProcessingTimeChange}s
          </span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-[#0891b2]">
          {data.predictiveAccuracy}%
        </div>
        <div className="text-sm text-gray-600">Predictive Accuracy</div>
        <div className="flex items-center justify-center mt-1">
          <ArrowUpIcon className="w-3 h-3 text-green-500 mr-1" />
          <span className="text-xs text-green-600">
            +{data.predictiveAccuracyChange}%
          </span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-[#0891b2]">
          {data.falsePositiveRate}%
        </div>
        <div className="text-sm text-gray-600">False Positive Rate</div>
        <div className="flex items-center justify-center mt-1">
          <ArrowDownIcon className="w-3 h-3 text-green-500 mr-1" />
          <span className="text-xs text-green-600">
            {data.falsePositiveRateChange}%
          </span>
        </div>
      </div>
    </div>
  </div>
);

const InsightsCard = ({ insights }: { insights: Insight[] }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      Key Insights & Recommendations
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {insights.map((insight, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border-l-4 ${
            insight.type === "success"
              ? "border-green-500 bg-green-50"
              : insight.type === "warning"
              ? "border-yellow-500 bg-yellow-50"
              : insight.type === "error"
              ? "border-red-500 bg-red-50"
              : "border-blue-500 bg-blue-50"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {insight.icon === "cpu" && (
              <CpuChipIcon className="w-5 h-5 text-[#0891b2]" />
            )}
            {insight.icon === "funnel" && (
              <FunnelIcon className="w-5 h-5 text-[#0891b2]" />
            )}
            {insight.icon === "users" && (
              <UsersIcon className="w-5 h-5 text-[#0891b2]" />
            )}
            {insight.icon === "currency" && (
              <CurrencyDollarIcon className="w-5 h-5 text-[#0891b2]" />
            )}
            <h4 className="font-semibold text-gray-900">{insight.title}</h4>
          </div>
          <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
          <span
            className={`text-xs font-medium ${
              insight.type === "success"
                ? "text-green-700"
                : insight.type === "warning"
                ? "text-yellow-700"
                : insight.type === "error"
                ? "text-red-700"
                : "text-blue-700"
            }`}
          >
            {insight.metric}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const DepartmentAnalytics = ({ data }: { data: DepartmentData[] }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      Department Performance Analysis
    </h3>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 text-sm font-medium text-gray-600">
              Department
            </th>
            <th className="text-right py-3 text-sm font-medium text-gray-600">
              Candidates
            </th>
            <th className="text-right py-3 text-sm font-medium text-gray-600">
              Hires
            </th>
            <th className="text-right py-3 text-sm font-medium text-gray-600">
              Success Rate
            </th>
            <th className="text-right py-3 text-sm font-medium text-gray-600">
              Avg Salary
            </th>
            <th className="text-right py-3 text-sm font-medium text-gray-600">
              Time to Hire
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.department} className="border-b border-gray-100">
              <td className="py-3 text-sm font-medium text-gray-900">
                {item.department}
              </td>
              <td className="py-3 text-sm text-gray-600 text-right">
                {item.candidates}
              </td>
              <td className="py-3 text-sm text-gray-600 text-right">
                {item.hires}
              </td>
              <td className="py-3 text-sm font-medium text-right">
                <span
                  className={`${
                    item.rate > 12
                      ? "text-green-600"
                      : item.rate > 10
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {item.rate}%
                </span>
              </td>
              <td className="py-3 text-sm text-gray-600 text-right">
                {item.avgSalary}
              </td>
              <td className="py-3 text-sm text-gray-600 text-right">
                {item.timeToHire} days
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const LocationAnalytics = ({ data }: { data: LocationData[] }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      Geographic Distribution
    </h3>
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.location} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">
              {item.location}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className="h-2 bg-[#0891b2] rounded-full"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-900 w-8">
              {item.candidates}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SkillsAnalytics = ({ data }: { data: SkillData[] }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      Skills Market Analysis
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((item) => (
        <div key={item.skill} className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                {item.skill}
              </span>
              <div className="flex items-center">
                {item.trend === "up" && (
                  <ArrowTrendingUpIcon className="w-3 h-3 text-green-500" />
                )}
                {item.trend === "down" && (
                  <ArrowTrendingDownIcon className="w-3 h-3 text-red-500" />
                )}
                {item.trend === "stable" && (
                  <div className="w-3 h-0.5 bg-gray-400" />
                )}
              </div>
            </div>
            <span className="text-sm font-bold text-[#0891b2]">
              {item.count} candidates
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>
              Demand Score:{" "}
              <span className="font-semibold text-[#0891b2]">
                {item.demandScore}/100
              </span>
            </span>
            <span>
              Salary Premium:{" "}
              <span className="font-semibold text-green-600">
                +{item.salaryPremium}%
              </span>
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("6months");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Analytics & Insights"
        subtitle="Comprehensive recruitment analytics and AI performance metrics"
      />

      <div className="pt-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Time Range Selector */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Recruitment Analytics
              </h1>
              <p className="text-gray-600 mt-1">
                Track performance and optimize your hiring process
              </p>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0891b2] focus:border-transparent"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <StatCard
              title="Total Candidates"
              value={analyticsData.overview.totalCandidates}
              change={analyticsData.overview.totalCandidatesChange}
              icon={UsersIcon}
            />
            <StatCard
              title="Active Jobs"
              value={analyticsData.overview.activeJobs}
              change={analyticsData.overview.activeJobsChange}
              icon={BriefcaseIcon}
            />
            <StatCard
              title="Avg Time to Hire"
              value={`${analyticsData.overview.avgTimeToHire} days`}
              change={analyticsData.overview.avgTimeToHireChange}
              icon={ClockIcon}
            />
            <StatCard
              title="Hiring Success Rate"
              value={`${analyticsData.overview.hiringRate}%`}
              change={analyticsData.overview.hiringRateChange}
              icon={CheckCircleIcon}
            />
            <StatCard
              title="Cost per Hire"
              value={`AED ${analyticsData.overview.costPerHire}`}
              change={analyticsData.overview.costPerHireChange}
              icon={CurrencyDollarIcon}
            />
            <StatCard
              title="Quality Score"
              value={`${analyticsData.overview.qualityScore}%`}
              change={analyticsData.overview.qualityScoreChange}
              icon={StarIcon}
            />
          </div>

          {/* AI Performance */}
          <div className="mb-8">
            <AIPerformanceCard data={analyticsData.aiPerformance} />
          </div>

          {/* Key Insights */}
          <div className="mb-8">
            <InsightsCard insights={analyticsData.insights} />
          </div>

          {/* Pipeline & Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <PipelineChart data={analyticsData.pipelineData} />
            <TimelineChart data={analyticsData.timelineData} />
          </div>

          {/* Sources & Department Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <SourcePieChart data={analyticsData.sourceData} />
            <DepartmentAnalytics data={analyticsData.departmentData} />
          </div>

          {/* Location & Skills */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <LocationAnalytics data={analyticsData.locationData} />
            <SkillsAnalytics data={analyticsData.topSkills} />
          </div>
        </div>
      </div>
    </div>
  );
}
