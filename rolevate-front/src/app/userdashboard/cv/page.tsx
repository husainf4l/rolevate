import React from "react";
import {
  DocumentArrowUpIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface CVData {
  id: string;
  fileName: string;
  lastUpdated: string;
  status: "current" | "draft" | "outdated";
  downloadUrl: string;
  fileSize: string;
  isDefault: boolean;
}

const mockCVs: CVData[] = [
  {
    id: "1",
    fileName: "John_Doe_CV_2025.pdf",
    lastUpdated: "2025-01-05",
    status: "current",
    downloadUrl: "/cv/john-doe-cv.pdf",
    fileSize: "1.2 MB",
    isDefault: true,
  },
  {
    id: "2",
    fileName: "John_Doe_CV_Tech_Focus.pdf",
    lastUpdated: "2024-12-20",
    status: "draft",
    downloadUrl: "/cv/john-doe-cv-tech.pdf",
    fileSize: "1.1 MB",
    isDefault: false,
  },
  {
    id: "3",
    fileName: "John_Doe_CV_Old.pdf",
    lastUpdated: "2024-11-15",
    status: "outdated",
    downloadUrl: "/cv/john-doe-cv-old.pdf",
    fileSize: "980 KB",
    isDefault: false,
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "current":
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    case "draft":
      return <ClockIcon className="w-5 h-5 text-yellow-500" />;
    case "outdated":
      return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
    default:
      return <ClockIcon className="w-5 h-5 text-gray-500" />;
  }
};

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

export default function CVPage() {
  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My CV Manager
          </h1>
          <p className="text-gray-600">
            Manage your CVs and create targeted versions for different job
            applications.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex items-center space-x-4">
          <button className="inline-flex items-center space-x-2 px-4 py-2 bg-[#0fc4b5] text-white rounded-md hover:bg-[#0ba399] transition-colors">
            <PlusIcon className="w-4 h-4" />
            <span>Upload New CV</span>
          </button>
          <button className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
            <PencilIcon className="w-4 h-4" />
            <span>Create from Template</span>
          </button>
        </div>

        {/* Upload Area */}
        <div className="mb-8">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-white">
            <DocumentArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload a new CV
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your CV file here, or click to browse
            </p>
            <button className="inline-flex items-center space-x-2 px-4 py-2 bg-[#0fc4b5] text-white rounded-md hover:bg-[#0ba399] transition-colors">
              <DocumentArrowUpIcon className="w-4 h-4" />
              <span>Choose File</span>
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Supported formats: PDF, DOC, DOCX (Max 5MB)
            </p>
          </div>
        </div>

        {/* CVs List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Your CVs ({mockCVs.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {mockCVs.map((cv) => (
              <div
                key={cv.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#0fc4b5] bg-opacity-10 rounded-lg flex items-center justify-center">
                      <DocumentArrowUpIcon className="w-6 h-6 text-[#0fc4b5]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">
                          {cv.fileName}
                        </h3>
                        {cv.isDefault && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span>
                          Last updated:{" "}
                          {new Date(cv.lastUpdated).toLocaleDateString()}
                        </span>
                        <span>Size: {cv.fileSize}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(cv.status)}
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          cv.status
                        )}`}
                      >
                        {cv.status.charAt(0).toUpperCase() + cv.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-md transition-colors">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                        Download
                      </button>
                      {!cv.isDefault && (
                        <button className="px-3 py-1 text-sm bg-[#0fc4b5] text-white rounded-md hover:bg-[#0ba399] transition-colors">
                          Set as Default
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CV Tips */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            CV Tips & Best Practices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">✓ Keep it concise</h4>
              <p>Limit your CV to 2 pages maximum for most positions.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">✓ Tailor for each job</h4>
              <p>
                Customize your CV for each application to match job
                requirements.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">✓ Use keywords</h4>
              <p>Include relevant keywords from the job description.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">✓ Update regularly</h4>
              <p>
                Keep your CV current with your latest skills and experiences.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
