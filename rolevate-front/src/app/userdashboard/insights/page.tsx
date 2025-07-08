import React from "react";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface CareerMetric {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease" | "neutral";
  icon: React.ElementType;
  color: string;
}

interface MarketTrend {
  skill: string;
  demand: number;
  growth: string;
  avgSalary: string;
}

interface JobMarketInsight {
  location: string;
  avgSalary: string;
  jobOpenings: number;
  competitionLevel: "Low" | "Medium" | "High";
}

const careerMetrics: CareerMetric[] = [
  {
    title: "Profile Views",
    value: "1,234",
    change: "+15% this month",
    changeType: "increase",
    icon: EyeIcon,
    color: "bg-blue-500",
  },
  {
    title: "Application Rate",
    value: "78%",
    change: "+5% this month",
    changeType: "increase",
    icon: ClipboardDocumentListIcon,
    color: "bg-green-500",
  },
  {
    title: "Interview Rate",
    value: "23%",
    change: "-2% this month",
    changeType: "decrease",
    icon: UserGroupIcon,
    color: "bg-yellow-500",
  },
  {
    title: "Avg. Response Time",
    value: "3.2 days",
    change: "No change",
    changeType: "neutral",
    icon: ClockIcon,
    color: "bg-purple-500",
  },
];

const marketTrends: MarketTrend[] = [
  {
    skill: "React",
    demand: 92,
    growth: "+12%",
    avgSalary: "$115k",
  },
  {
    skill: "TypeScript",
    demand: 88,
    growth: "+18%",
    avgSalary: "$120k",
  },
  {
    skill: "Node.js",
    demand: 85,
    growth: "+8%",
    avgSalary: "$110k",
  },
  {
    skill: "Python",
    demand: 90,
    growth: "+15%",
    avgSalary: "$125k",
  },
  {
    skill: "AWS",
    demand: 87,
    growth: "+22%",
    avgSalary: "$130k",
  },
];

const jobMarketInsights: JobMarketInsight[] = [
  {
    location: "San Francisco, CA",
    avgSalary: "$145k",
    jobOpenings: 1250,
    competitionLevel: "High",
  },
  {
    location: "New York, NY",
    avgSalary: "$135k",
    jobOpenings: 980,
    competitionLevel: "High",
  },
  {
    location: "Austin, TX",
    avgSalary: "$120k",
    jobOpenings: 450,
    competitionLevel: "Medium",
  },
  {
    location: "Seattle, WA",
    avgSalary: "$140k",
    jobOpenings: 720,
    competitionLevel: "Medium",
  },
  {
    location: "Remote",
    avgSalary: "$125k",
    jobOpenings: 2100,
    competitionLevel: "High",
  },
];

const getCompetitionColor = (level: string) => {
  switch (level) {
    case "High":
      return "bg-red-100 text-red-800";
    case "Medium":
      return "bg-yellow-100 text-yellow-800";
    case "Low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function InsightsPage() {
  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Career Insights
          </h1>
          <p className="text-gray-600">
            Understand your career progress and market trends to make informed
            decisions.
          </p>
        </div>

        {/* Career Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {careerMetrics.map((metric) => (
            <div
              key={metric.title}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${metric.color} bg-opacity-10`}>
                  <metric.icon
                    className={`w-6 h-6 ${metric.color.replace(
                      "bg-",
                      "text-"
                    )}`}
                  />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.value}
                  </p>
                  <p className="text-sm text-gray-600">{metric.title}</p>
                </div>
              </div>
              <div className="flex items-center">
                {metric.changeType === "increase" ? (
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                ) : metric.changeType === "decrease" ? (
                  <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                ) : null}
                <span
                  className={`text-sm ${
                    metric.changeType === "increase"
                      ? "text-green-600"
                      : metric.changeType === "decrease"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {metric.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Market Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Skills in Demand
              </h2>
              <ChartBarIcon className="w-6 h-6 text-[#0fc4b5]" />
            </div>
            <div className="space-y-4">
              {marketTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {trend.skill}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-green-600 font-medium">
                          {trend.growth}
                        </span>
                        <span className="text-sm text-gray-500">
                          {trend.avgSalary}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#0fc4b5] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${trend.demand}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Job Market by Location
              </h2>
              <MapPinIcon className="w-6 h-6 text-[#0fc4b5]" />
            </div>
            <div className="space-y-4">
              {jobMarketInsights.map((insight, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {insight.location}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center space-x-1">
                        <CurrencyDollarIcon className="w-4 h-4" />
                        <span>{insight.avgSalary}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ClipboardDocumentListIcon className="w-4 h-4" />
                        <span>{insight.jobOpenings} jobs</span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCompetitionColor(
                      insight.competitionLevel
                    )}`}
                  >
                    {insight.competitionLevel} Competition
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Career Recommendations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Career Recommendations
            </h2>
            <LightBulbIcon className="w-6 h-6 text-[#0fc4b5]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <h3 className="font-medium text-gray-900">Skill Development</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Based on market trends, consider learning these skills:
              </p>
              <div className="flex flex-wrap gap-2">
                {["GraphQL", "Docker", "Kubernetes", "Next.js"].map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex px-2 py-1 text-xs bg-[#0fc4b5] bg-opacity-10 text-[#0fc4b5] rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h3 className="font-medium text-gray-900">
                  Profile Optimization
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Improve your profile visibility:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Add portfolio projects</li>
                <li>• Update skills section</li>
                <li>• Get endorsements</li>
                <li>• Write technical articles</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <h3 className="font-medium text-gray-900">
                  Job Search Strategy
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Optimize your job search approach:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Apply within 24 hours</li>
                <li>• Tailor your applications</li>
                <li>• Network actively</li>
                <li>• Follow up on applications</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <h3 className="font-medium text-gray-900">
                  Salary Negotiation
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Your market value insights:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Current market rate: $120k-$140k</li>
                <li>• 15% above average for your skills</li>
                <li>• Research company salary ranges</li>
                <li>• Highlight unique value propositions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Progress Tracking */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Progress This Month
            </h2>
            <div className="text-sm text-gray-500">January 2025</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 relative">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke="#e5e7eb"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke="#0fc4b5"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray="220"
                    strokeDashoffset="44"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">80%</span>
                </div>
              </div>
              <h3 className="font-medium text-gray-900">Application Goal</h3>
              <p className="text-sm text-gray-600">16 of 20 applications</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 relative">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke="#e5e7eb"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke="#0fc4b5"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray="220"
                    strokeDashoffset="88"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">60%</span>
                </div>
              </div>
              <h3 className="font-medium text-gray-900">Interview Goal</h3>
              <p className="text-sm text-gray-600">3 of 5 interviews</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 relative">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke="#e5e7eb"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke="#0fc4b5"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray="220"
                    strokeDashoffset="176"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">20%</span>
                </div>
              </div>
              <h3 className="font-medium text-gray-900">Skill Learning</h3>
              <p className="text-sm text-gray-600">1 of 5 skills</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
