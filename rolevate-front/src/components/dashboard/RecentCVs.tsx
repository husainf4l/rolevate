import React from "react";
import {
  DocumentTextIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface ApplicationItem {
  id: string;
  candidateName: string;
  position: string;
  email: string;
  submittedDate: string;
  status: "pending" | "reviewed" | "shortlisted" | "rejected";
  experience: string;
  cvSize: string;
}

const recentApplications: ApplicationItem[] = [
  {
    id: "1",
    candidateName: "Sarah Johnson",
    position: "Senior Software Engineer",
    email: "sarah.johnson@email.com",
    submittedDate: "2 hours ago",
    status: "pending",
    experience: "5 years",
    cvSize: "245 KB",
  },
  {
    id: "2",
    candidateName: "Mike Chen",
    position: "Frontend Developer",
    email: "mike.chen@email.com",
    submittedDate: "1 day ago",
    status: "reviewed",
    experience: "3 years",
    cvSize: "198 KB",
  },
  {
    id: "3",
    candidateName: "Emily Rodriguez",
    position: "UI/UX Designer",
    email: "emily.rodriguez@email.com",
    submittedDate: "3 days ago",
    status: "shortlisted",
    experience: "4 years",
    cvSize: "387 KB",
  },
  {
    id: "4",
    candidateName: "David Wilson",
    position: "Full Stack Developer",
    email: "david.wilson@email.com",
    submittedDate: "1 week ago",
    status: "rejected",
    experience: "6 years",
    cvSize: "223 KB",
  },
];

const getStatusColor = (status: ApplicationItem["status"]) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "reviewed":
      return "bg-blue-100 text-blue-800";
    case "shortlisted":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function RecentApplications() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200/60">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <DocumentTextIcon className="w-5 h-5 text-[#0fc4b5]" />
          Recent Applications
        </h2>
        <button className="text-sm text-[#0fc4b5] hover:text-[#0891b2] font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {recentApplications.map((application) => (
          <div
            key={application.id}
            className="p-4 border border-gray-200 rounded-lg hover:border-[#0fc4b5]/30 hover:shadow-sm transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <DocumentTextIcon className="w-5 h-5 text-[#0fc4b5]" />
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    {application.candidateName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {application.position} • {application.submittedDate}
                  </p>
                  <p className="text-xs text-gray-400">{application.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-[#0fc4b5] transition-colors duration-200">
                  <EyeIcon className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-[#0fc4b5] transition-colors duration-200">
                  <ArrowDownTrayIcon className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-green-600 transition-colors duration-200">
                  <CheckCircleIcon className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200">
                  <XCircleIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4 text-gray-500">
                <span>{application.experience} experience</span>
                <span>{application.cvSize}</span>
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  application.status
                )}`}
              >
                {application.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
