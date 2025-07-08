"use client";

import React, { useState } from "react";
import Header from "@/components/dashboard/Header";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  EyeIcon,
  UsersIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

interface JobPost {
  id: string;
  title: string;
  department: string;
  location: string;
  salary: string;
  type: "full-time" | "part-time" | "contract" | "remote";
  status: "active" | "paused" | "closed";
  applicants: number;
  views: number;
  postedAt: string;
  deadline: string;
  description: string;
}

const jobPosts: JobPost[] = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: "Dubai, UAE",
    salary: "AED 15,000 - 20,000",
    type: "full-time",
    status: "active",
    applicants: 24,
    views: 156,
    postedAt: "2 hours ago",
    deadline: "Dec 30, 2024",
    description:
      "We are looking for a Senior Frontend Developer to join our fintech team in Dubai's financial district...",
  },
  {
    id: "2",
    title: "React Developer",
    department: "Engineering",
    location: "Riyadh, Saudi Arabia",
    salary: "SAR 12,000 - 16,000",
    type: "full-time",
    status: "active",
    applicants: 18,
    views: 89,
    postedAt: "5 hours ago",
    deadline: "Jan 15, 2025",
    description:
      "Join our growing tech team in Riyadh to develop cutting-edge e-commerce solutions...",
  },
  {
    id: "3",
    title: "UI/UX Designer",
    department: "Design",
    location: "Doha, Qatar",
    salary: "QAR 10,000 - 14,000",
    type: "full-time",
    status: "paused",
    applicants: 31,
    views: 203,
    postedAt: "1 day ago",
    deadline: "Jan 10, 2025",
    description:
      "We need a creative UI/UX Designer to enhance our digital banking platform user experience...",
  },
  {
    id: "4",
    title: "Full Stack Developer",
    department: "Engineering",
    location: "Kuwait City, Kuwait",
    salary: "KWD 800 - 1,200",
    type: "full-time",
    status: "closed",
    applicants: 45,
    views: 278,
    postedAt: "2 days ago",
    deadline: "Dec 15, 2024",
    description:
      "Join our team as a Full Stack Developer to work on government digital transformation projects...",
  },
  {
    id: "5",
    title: "Product Manager",
    department: "Product",
    location: "Abu Dhabi, UAE",
    salary: "AED 18,000 - 25,000",
    type: "full-time",
    status: "active",
    applicants: 12,
    views: 67,
    postedAt: "3 days ago",
    deadline: "Jan 20, 2025",
    description:
      "We're seeking a Product Manager to drive our healthcare technology product strategy...",
  },
  {
    id: "6",
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Manama, Bahrain",
    salary: "BHD 1,000 - 1,400",
    type: "remote",
    status: "active",
    applicants: 8,
    views: 43,
    postedAt: "1 week ago",
    deadline: "Feb 1, 2025",
    description:
      "Looking for a DevOps Engineer to manage our cloud infrastructure for regional operations...",
  },
  {
    id: "7",
    title: "Mobile App Developer",
    department: "Engineering",
    location: "Amman, Jordan",
    salary: "JOD 800 - 1,200",
    type: "full-time",
    status: "active",
    applicants: 15,
    views: 92,
    postedAt: "4 days ago",
    deadline: "Jan 25, 2025",
    description:
      "Develop innovative mobile applications for our growing fintech startup in Jordan...",
  },
  {
    id: "8",
    title: "Data Scientist",
    department: "Analytics",
    location: "Cairo, Egypt",
    salary: "EGP 25,000 - 35,000",
    type: "full-time",
    status: "active",
    applicants: 22,
    views: 134,
    postedAt: "6 days ago",
    deadline: "Feb 10, 2025",
    description:
      "Join our data science team to analyze market trends and customer behavior in the MENA region...",
  },
];

const getTypeColor = (type: JobPost["type"]) => {
  switch (type) {
    case "full-time":
      return "bg-green-100 text-green-800";
    case "part-time":
      return "bg-blue-100 text-blue-800";
    case "contract":
      return "bg-purple-100 text-purple-800";
    case "remote":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusColor = (status: JobPost["status"]) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "paused":
      return "bg-yellow-100 text-yellow-800";
    case "closed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const filteredJobs = jobPosts.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || job.status === filterStatus;
    const matchesType = filterType === "all" || job.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <Header
          title="Job Postings"
          subtitle="Manage your job listings and track applications"
        />

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0fc4b5] focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0fc4b5] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0fc4b5] focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="remote">Remote</option>
            </select>

            <button className="flex items-center gap-2 px-4 py-2 bg-[#0fc4b5] text-white rounded-lg hover:bg-[#0891b2] transition-colors">
              <PlusIcon className="w-5 h-5" />
              New Job
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-300/70">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#0fc4b5]/15 rounded-lg">
                <BriefcaseIcon className="w-6 h-6 text-[#0fc4b5]" />
              </div>
              <div className="text-sm font-medium text-green-600">+15%</div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">
                {jobPosts.filter((job) => job.status === "active").length}
              </p>
              <p className="text-sm text-gray-600 font-medium">Active Jobs</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-300/70">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#0fc4b5]/15 rounded-lg">
                <UsersIcon className="w-6 h-6 text-[#0fc4b5]" />
              </div>
              <div className="text-sm font-medium text-green-600">+32%</div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">
                {jobPosts.reduce((sum, job) => sum + job.applicants, 0)}
              </p>
              <p className="text-sm text-gray-600 font-medium">
                Total Applicants
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-300/70">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#0fc4b5]/15 rounded-lg">
                <EyeIcon className="w-6 h-6 text-[#0fc4b5]" />
              </div>
              <div className="text-sm font-medium text-green-600">+18%</div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">
                {jobPosts.reduce((sum, job) => sum + job.views, 0)}
              </p>
              <p className="text-sm text-gray-600 font-medium">Total Views</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-300/70">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#0fc4b5]/15 rounded-lg">
                <ClipboardDocumentListIcon className="w-6 h-6 text-[#0fc4b5]" />
              </div>
              <div className="text-sm font-medium text-red-600">-5%</div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(
                  (jobPosts.reduce((sum, job) => sum + job.applicants, 0) /
                    jobPosts.reduce((sum, job) => sum + job.views, 0)) *
                    100
                )}
                %
              </p>
              <p className="text-sm text-gray-600 font-medium">
                Application Rate
              </p>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="bg-white rounded-xl shadow-md border border-gray-300/70">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              All Job Postings ({filteredJobs.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {job.title}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                          job.type
                        )}`}
                      >
                        {job.type}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          job.status
                        )}`}
                      >
                        {job.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{job.department}</p>
                    <p className="text-gray-700 mb-4">{job.description}</p>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CurrencyDollarIcon className="w-4 h-4" />
                        <span>{job.salary}</span>
                      </div>
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

                  <div className="flex items-center gap-2 ml-4">
                    <button className="p-2 text-gray-400 hover:text-[#0fc4b5] transition-colors">
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-[#0fc4b5] transition-colors">
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>Posted {job.postedAt}</span>
                    <span>Deadline: {job.deadline}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 text-[#0fc4b5] hover:bg-[#0fc4b5]/10 rounded-lg transition-colors">
                      View Applications
                    </button>
                    <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      {job.status === "active"
                        ? "Pause"
                        : job.status === "paused"
                        ? "Activate"
                        : "Reopen"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
