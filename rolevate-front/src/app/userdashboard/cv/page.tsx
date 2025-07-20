"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  DocumentArrowUpIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  StarIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  CVData,
  uploadCV,
  getCVs,
  deleteCV,
  activateCV,
  transformCVData,
} from "@/services/cv";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "current":
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    case "processing":
      return <ArrowPathIcon className="w-5 h-5 text-blue-500 animate-spin" />;
    case "uploaded":
      return <ClockIcon className="w-5 h-5 text-yellow-500" />;
    case "error":
      return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
    default:
      return <ClockIcon className="w-5 h-5 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "current":
      return "bg-green-100 text-green-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "uploaded":
      return "bg-yellow-100 text-yellow-800";
    case "error":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function CVPage() {
  const [cvs, setCvs] = useState<CVData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [pendingActivationCV, setPendingActivationCV] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load CVs on component mount
  useEffect(() => {
    loadCVs();
  }, []);

  const loadCVs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCVs();
      const transformedCVs = response.map(transformCVData);
      setCvs(transformedCVs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load CVs");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      setError(null);
      const response = await uploadCV(file);
      const transformedCV = transformCVData(response);
      setCvs((prev) => [transformedCV, ...prev]);

      // Show activation modal for the newly uploaded CV
      setPendingActivationCV({ id: response.id, name: file.name });
      setShowActivationModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload CV");
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmActivation = async () => {
    if (!pendingActivationCV) return;

    try {
      await handleActivateCV(pendingActivationCV.id);
      setSuccessMessage(
        `CV "${pendingActivationCV.name}" has been uploaded and activated successfully!`
      );
    } catch (activateErr) {
      setError(
        activateErr instanceof Error
          ? activateErr.message
          : "Failed to activate CV"
      );
    }

    setShowActivationModal(false);
    setPendingActivationCV(null);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleDeclineActivation = () => {
    if (pendingActivationCV) {
      setSuccessMessage(
        `CV "${pendingActivationCV.name}" uploaded successfully! You can activate it later from the CV list.`
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    }

    setShowActivationModal(false);
    setPendingActivationCV(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDeleteCV = async (cvId: string) => {
    if (!confirm("Are you sure you want to delete this CV?")) {
      return;
    }

    try {
      await deleteCV(cvId);
      setCvs((prev) => prev.filter((cv) => cv.id !== cvId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete CV");
    }
  };

  const handleActivateCV = async (cvId: string) => {
    try {
      setError(null);
      setSuccessMessage(null);
      await activateCV(cvId);

      // Update the CVs list - deactivate all others and activate the selected one
      setCvs((prev) =>
        prev.map((cv) => ({
          ...cv,
          isActive: cv.id === cvId,
        }))
      );

      setSuccessMessage("CV activated successfully!");
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to activate CV");
    }
  };

  const handleDownload = (cv: CVData) => {
    window.open(cv.downloadUrl, "_blank");
  };

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

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{successMessage}</p>
            <button
              onClick={() => setSuccessMessage(null)}
              className="mt-2 text-sm text-green-600 hover:text-green-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8 flex items-center space-x-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-[#0fc4b5] text-white rounded-md hover:bg-[#0ba399] transition-colors disabled:opacity-50"
          >
            <PlusIcon className="w-4 h-4" />
            <span>{uploading ? "Uploading..." : "Upload New CV"}</span>
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Upload Area */}
        <div className="mb-8">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-white cursor-pointer hover:border-[#0fc4b5] transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <DocumentArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload a new CV
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your CV file here, or click to browse
            </p>
            <button
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#0fc4b5] text-white rounded-md hover:bg-[#0ba399] transition-colors"
              disabled={uploading}
            >
              <DocumentArrowUpIcon className="w-4 h-4" />
              <span>{uploading ? "Uploading..." : "Choose File"}</span>
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
              Your CVs ({cvs.length})
            </h2>
          </div>

          {loading ? (
            <div className="px-6 py-8 text-center">
              <ArrowPathIcon className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
              <p className="text-gray-500">Loading your CVs...</p>
            </div>
          ) : cvs.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <DocumentArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No CVs uploaded yet
              </h3>
              <p className="text-gray-600 mb-4">
                Upload your first CV to get started
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-[#0fc4b5] text-white rounded-md hover:bg-[#0ba399] transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Upload CV</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {cvs.map((cv) => (
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
                            {cv.originalFileName}
                          </h3>
                          {cv.isActive && (
                            <span className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full bg-[#0fc4b5] text-white">
                              <StarIcon className="w-3 h-3" />
                              <span>Active</span>
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
                          {cv.status.charAt(0).toUpperCase() +
                            cv.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownload(cv)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-md transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCV(cv.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownload(cv)}
                          className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          Download
                        </button>
                        {!cv.isActive && (
                          <button
                            onClick={() => handleActivateCV(cv.id)}
                            className="inline-flex items-center space-x-1 px-3 py-1 text-sm bg-[#0fc4b5] text-white rounded-md hover:bg-[#0ba399] transition-colors"
                          >
                            <StarIcon className="w-3 h-3" />
                            <span>Set as Active</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

        {/* Activation Modal */}
        {showActivationModal && pendingActivationCV && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={handleDeclineActivation}
                aria-hidden="true"
              ></div>

              {/* This element is to trick the browser into centering the modal contents. */}
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>

              {/* Modal panel */}
              <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-[#0fc4b5] bg-opacity-10 sm:mx-0 sm:h-10 sm:w-10">
                    <DocumentArrowUpIcon
                      className="h-6 w-6 text-[#0fc4b5]"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="modal-title"
                    >
                      CV Uploaded Successfully!
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Would you like to set "{pendingActivationCV.name}" as
                        your active CV?
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex">
                    <InformationCircleIcon className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Setting this as active will deactivate your current CV
                        and make this one visible to employers.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleConfirmActivation}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#0fc4b5] text-base font-medium text-white hover:bg-[#0ba399] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0fc4b5] sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  >
                    <StarIcon className="w-4 h-4 mr-2" />
                    Set as Active
                  </button>
                  <button
                    type="button"
                    onClick={handleDeclineActivation}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                  >
                    Keep Inactive
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
