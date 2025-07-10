import React from "react";
import { BriefcaseIcon, MapPinIcon, CurrencyDollarIcon, EyeIcon, UsersIcon } from "@heroicons/react/24/outline";

interface JobPost {
  id: string;
  title: string;
  department: string;
  location: string;
  salary: string;
  type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "REMOTE";
  postedAt: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "CLOSED" | "EXPIRED";
  applicants: number;
  views: number;
}

const recentJobs: JobPost[] = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: "San Francisco, CA",
    salary: "$120k - $150k",
    type: "FULL_TIME",
    postedAt: "2 hours ago",
    status: "ACTIVE",
    applicants: 24,
    views: 156
  },
  {
    id: "2",
    title: "React Developer",
    department: "Engineering",
    location: "Remote",
    salary: "$90k - $110k",
    type: "REMOTE",
    postedAt: "5 hours ago",
    status: "ACTIVE",
    applicants: 18,
    views: 89
  },
  {
    id: "3",
    title: "UI/UX Designer",
    department: "Design",
    location: "New York, NY",
    salary: "$80k - $100k",
    type: "FULL_TIME",
    postedAt: "1 day ago",
    status: "PAUSED",
    applicants: 31,
    views: 203
  },
  {
    id: "4",
    title: "Full Stack Developer",
    department: "Engineering",
    location: "Austin, TX",
    salary: "$100k - $130k",
    type: "FULL_TIME",
    postedAt: "2 days ago",
    status: "CLOSED",
    applicants: 45,
    views: 278
  }
];

const getTypeColor = (type: JobPost["type"]) => {
  switch (type) {
    case "FULL_TIME":
      return "bg-green-100 text-green-800";
    case "PART_TIME":
      return "bg-blue-100 text-blue-800";
    case "CONTRACT":
      return "bg-purple-100 text-purple-800";
    case "REMOTE":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusColor = (status: JobPost["status"]) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800";
    case "PAUSED":
      return "bg-yellow-100 text-yellow-800";
    case "CLOSED":
      return "bg-red-100 text-red-800";
    case "DRAFT":
      return "bg-gray-100 text-gray-800";
    case "EXPIRED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getTypeDisplayText = (type: JobPost["type"]) => {
  switch (type) {
    case "FULL_TIME":
      return "Full-time";
    case "PART_TIME":
      return "Part-time";
    case "CONTRACT":
      return "Contract";
    case "REMOTE":
      return "Remote";
    default:
      return type;
  }
};

const getStatusDisplayText = (status: JobPost["status"]) => {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "PAUSED":
      return "Paused";
    case "CLOSED":
      return "Closed";
    case "DRAFT":
      return "Draft";
    case "EXPIRED":
      return "Expired";
    default:
      return status;
  }
};

export default function RecentJobs() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-300/70">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <BriefcaseIcon className="w-5 h-5 text-[#0fc4b5]" />
          Your Job Postings
        </h2>
        <button className="text-sm text-[#0fc4b5] hover:text-[#0891b2] font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {recentJobs.map((job) => (
          <div
            key={job.id}
            className="p-4 border border-gray-300 rounded-lg hover:border-[#0fc4b5]/50 hover:shadow-sm transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
                <p className="text-gray-600 font-medium">{job.department}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(job.type)}`}>
                  {getTypeDisplayText(job.type)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                  {getStatusDisplayText(job.status)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CurrencyDollarIcon className="w-4 h-4" />
                  <span>{job.salary}</span>
                </div>
              </div>
              <span>{job.postedAt}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <UsersIcon className="w-4 h-4" />
                  <span>{job.applicants} applicants</span>
                </div>
                <div className="flex items-center gap-1">
                  <EyeIcon className="w-4 h-4" />
                  <span>{job.views} views</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}