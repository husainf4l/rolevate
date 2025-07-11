"use client";

import React from "react";
import {
  DocumentArrowUpIcon,
  PencilIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

interface CVData {
  fileName: string;
  lastUpdated: string;
  status: "current" | "draft" | "outdated";
  downloadUrl?: string;
}

interface CVManagerProps {
  cvData?: CVData | null;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "current":
      return "bg-green-100 text-green-800";
    case "draft":
      return "bg-yellow-100 text-yellow-800";
    case "outdated":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function CVManager({ cvData }: CVManagerProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">My CV</h2>
        <a
          href="/userdashboard/cv"
          className="text-[#0fc4b5] hover:text-[#0ba399] font-medium text-sm transition-colors"
        >
          Manage CV
        </a>
      </div>

      <div className="space-y-4">
        {cvData ? (
          <>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#0fc4b5] bg-opacity-10 rounded-lg flex items-center justify-center">
                    <DocumentArrowUpIcon className="w-5 h-5 text-[#0fc4b5]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{cvData.fileName}</h3>
                    <p className="text-sm text-gray-600">
                      Last updated:{" "}
                      {new Date(cvData.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    cvData.status
                  )}`}
                >
                  {cvData.status.charAt(0).toUpperCase() + cvData.status.slice(1)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-1 px-3 py-1.5 text-sm text-[#0fc4b5] hover:text-[#0ba399] hover:bg-[#0fc4b5] hover:bg-opacity-10 rounded-md transition-colors">
                  <EyeIcon className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button className="flex items-center space-x-1 px-3 py-1.5 text-sm text-[#0fc4b5] hover:text-[#0ba399] hover:bg-[#0fc4b5] hover:bg-opacity-10 rounded-md transition-colors">
                  <PencilIcon className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button className="flex items-center space-x-1 px-3 py-1.5 text-sm text-[#0fc4b5] hover:text-[#0ba399] hover:bg-[#0fc4b5] hover:bg-opacity-10 rounded-md transition-colors">
                  <DocumentArrowUpIcon className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <DocumentArrowUpIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Want to upload a new version?
              </p>
              <button className="inline-flex items-center space-x-2 px-4 py-2 bg-[#0fc4b5] text-white rounded-md hover:bg-[#0ba399] transition-colors">
                <DocumentArrowUpIcon className="w-4 h-4" />
                <span>Upload New CV</span>
              </button>
            </div>
          </>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <DocumentArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No CV uploaded yet
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload your CV to get better job recommendations and improve your profile visibility.
            </p>
            <button className="inline-flex items-center space-x-2 px-6 py-3 bg-[#0fc4b5] text-white rounded-md hover:bg-[#0ba399] transition-colors">
              <DocumentArrowUpIcon className="w-5 h-5" />
              <span>Upload Your CV</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
