"use client";

import React from "react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisHorizontalIcon,
  BriefcaseIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

type JobPostStatus = "active" | "paused" | "draft" | "completed";

interface JobPost {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "full-time" | "part-time" | "contract";
  status: JobPostStatus;
  applicants: number;
  createdBy: string;
  createdAt: string;
  description: string;
  agents: {
    cvAnalysis: { id: string; name: string; status: "active" | "inactive" };
    interview: { id: string; name: string; status: "active" | "inactive" };
    whatsapp: { id: string; name: string; status: "active" | "inactive" };
  };
}

type Props = {};

const JobPostDashboard = (props: Props) => {
  const router = useRouter();

  // Mock data for banking job posts
  const jobPosts: JobPost[] = [
    {
      id: "job-1",
      title: "Senior Relationship Manager",
      department: "Corporate Banking",
      location: "Dubai, UAE",
      type: "full-time",
      status: "active",
      applicants: 127,
      createdBy: "Al-hussein Abdullah",
      createdAt: "May 18, 2025, 2:34 AM",
      description: "Manage high-value corporate clients and develop banking relationships",
      agents: {
        cvAnalysis: { id: "cv-agent-1", name: "CV Analyzer Pro", status: "active" },
        interview: { id: "interview-agent-1", name: "Laila Interview AI", status: "active" },
        whatsapp: { id: "whatsapp-agent-1", name: "WhatsApp Communicator", status: "active" },
      },
    },
    {
      id: "job-2",
      title: "Branch Manager",
      department: "Retail Banking",
      location: "Riyadh, KSA",
      type: "full-time",
      status: "active",
      applicants: 89,
      createdBy: "Al-hussein Abdullah",
      createdAt: "May 15, 2025, 1:20 PM",
      description: "Lead branch operations and customer service excellence",
      agents: {
        cvAnalysis: { id: "cv-agent-2", name: "CV Analyzer Pro", status: "active" },
        interview: { id: "interview-agent-2", name: "Laila Interview AI", status: "active" },
        whatsapp: { id: "whatsapp-agent-2", name: "WhatsApp Communicator", status: "active" },
      },
    },
    {
      id: "job-3",
      title: "Risk Analyst",
      department: "Risk Management",
      location: "Abu Dhabi, UAE",
      type: "full-time",
      status: "paused",
      applicants: 43,
      createdBy: "Al-hussein Abdullah",
      createdAt: "May 12, 2025, 9:45 AM",
      description: "Analyze and assess credit and operational risks",
      agents: {
        cvAnalysis: { id: "cv-agent-3", name: "CV Analyzer Pro", status: "inactive" },
        interview: { id: "interview-agent-3", name: "Laila Interview AI", status: "inactive" },
        whatsapp: { id: "whatsapp-agent-3", name: "WhatsApp Communicator", status: "inactive" },
      },
    },
    {
      id: "job-4",
      title: "Compliance Officer",
      department: "Compliance",
      location: "Kuwait City, Kuwait",
      type: "full-time",
      status: "draft",
      applicants: 0,
      createdBy: "Al-hussein Abdullah",
      createdAt: "May 10, 2025, 4:15 PM",
      description: "Ensure regulatory compliance and risk mitigation",
      agents: {
        cvAnalysis: { id: "cv-agent-4", name: "CV Analyzer Pro", status: "inactive" },
        interview: { id: "interview-agent-4", name: "Laila Interview AI", status: "inactive" },
        whatsapp: { id: "whatsapp-agent-4", name: "WhatsApp Communicator", status: "inactive" },
      },
    },
  ];

  const getStatusBadge = (status: JobPostStatus) => {
    const statusConfig = {
      active: { color: "bg-green-500/20 text-green-400 border-green-500/30", text: "Active" },
      paused: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", text: "Paused" },
      draft: { color: "bg-gray-500/20 text-gray-400 border-gray-500/30", text: "Draft" },
      completed: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", text: "Completed" },
    };
    
    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const handleRowClick = (jobId: string) => {
    router.push(`/dashboard/jobpost/${jobId}`);
  };

  const handleActionClick = (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    console.log("Action clicked for job:", jobId);
  };

  const handleNewJob = () => {
    router.push("/dashboard/jobpost/new");
  };

  return (
    <div className="flex-1 items-center justify-center min-h-screen bg-gray-900">
      <div className="px-20 py-20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BriefcaseIcon className="h-8 w-8 text-[#00C6AD]" />
              Job Posts
            </h1>
            <p className="text-gray-400 mt-1">
              Create and manage banking positions with AI-powered recruitment
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleNewJob}
              className="bg-[#00C6AD] hover:bg-[#14B8A6] text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
            >
              <PlusIcon className="h-5 w-5" />
              New Job Post
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Jobs</p>
                <p className="text-2xl font-bold text-white">{jobPosts.length}</p>
              </div>
              <BriefcaseIcon className="h-8 w-8 text-[#00C6AD]" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Jobs</p>
                <p className="text-2xl font-bold text-white">
                  {jobPosts.filter(job => job.status === 'active').length}
                </p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Applicants</p>
                <p className="text-2xl font-bold text-white">
                  {jobPosts.reduce((sum, job) => sum + job.applicants, 0)}
                </p>
              </div>
              <UserGroupIcon className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg. Response</p>
                <p className="text-2xl font-bold text-white">2.3h</p>
              </div>
              <ClockIcon className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="search"
            className="block w-full pl-11 pr-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#00C6AD] focus:border-[#00C6AD] transition-all bg-gray-800 text-white placeholder-gray-400"
            placeholder="Search job posts..."
          />
        </div>

        <div className="w-full border border-gray-800 rounded-xl overflow-hidden shadow-lg bg-gray-800">
          <table className="w-full">
            <thead className="bg-gray-850 border-b border-gray-700">
              <tr className="text-left text-sm">
                <th className="px-6 py-4 text-gray-300 font-semibold">Position</th>
                <th className="px-6 py-4 text-gray-300 font-semibold">Department</th>
                <th className="px-6 py-4 text-gray-300 font-semibold">Location</th>
                <th className="px-6 py-4 text-gray-300 font-semibold">Status</th>
                <th className="px-6 py-4 text-gray-300 font-semibold">Applicants</th>
                <th className="px-6 py-4 text-gray-300 font-semibold">AI Agents</th>
                <th className="px-6 py-4 text-gray-300 font-semibold">Created</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {jobPosts.map((job, index) => (
                <tr
                  key={job.id}
                  onClick={() => handleRowClick(job.id)}
                  className="border-b border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-[#00C6AD] group-hover:underline">
                        {job.title}
                      </span>
                      <span className="text-xs text-gray-400 capitalize">{job.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{job.department}</td>
                  <td className="px-6 py-4 text-gray-300">{job.location}</td>
                  <td className="px-6 py-4">{getStatusBadge(job.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <UserGroupIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300">{job.applicants}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <div className={`w-2 h-2 rounded-full ${job.agents.cvAnalysis.status === 'active' ? 'bg-green-400' : 'bg-gray-500'}`} title="CV Analysis Agent"></div>
                      <div className={`w-2 h-2 rounded-full ${job.agents.interview.status === 'active' ? 'bg-green-400' : 'bg-gray-500'}`} title="Interview Agent"></div>
                      <div className={`w-2 h-2 rounded-full ${job.agents.whatsapp.status === 'active' ? 'bg-green-400' : 'bg-gray-500'}`} title="WhatsApp Agent"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{job.createdAt}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="p-1.5 rounded-full hover:bg-gray-700"
                      onClick={(e) => handleActionClick(e, job.id)}
                    >
                      <EllipsisHorizontalIcon className="h-5 w-5 text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Info Panel */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-[#00C6AD] rounded-full"></div>
            Quick Info
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-medium mb-2">AI Agent Indicators</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Active Agent</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-gray-300">Inactive Agent</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Rolevate AI System</h4>
              <p className="text-gray-400 text-sm">
                Each job post is powered by 3 specialized AI agents working together to automate your recruitment pipeline from CV screening to final interviews.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPostDashboard;
