import React from "react";
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  EyeIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

interface FormHeaderProps {
  progress: number;
  autoSaveStatus: "saved" | "saving" | "unsaved";
  showPreview: boolean;
  onCancel: () => void;
  onTogglePreview: () => void;
  onClearDraft: () => void;
}

const FormHeader: React.FC<FormHeaderProps> = ({
  progress,
  autoSaveStatus,
  showPreview,
  onCancel,
  onTogglePreview,
  onClearDraft,
}) => {
  return (
    <div className="flex items-center gap-4 mb-8">
      <button
        onClick={onCancel}
        className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
      >
        <ArrowLeftIcon className="h-6 w-6 text-gray-400" />
      </button>
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <BriefcaseIcon className="h-8 w-8 text-[#00C6AD]" />
          Create New Job Post
        </h1>
        <p className="text-gray-400 mt-1">
          Fill in the details below to create a new job posting
        </p>
      </div>
      <div className="flex items-center gap-4">
        {/* Auto-save status */}
        <div className="flex items-center gap-2 text-sm">
          {autoSaveStatus === "saving" && (
            <>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-yellow-400">Saving...</span>
            </>
          )}
          {autoSaveStatus === "saved" && (
            <>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-400">Saved</span>
            </>
          )}
          {autoSaveStatus === "unsaved" && (
            <>
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-gray-400">Unsaved changes</span>
            </>
          )}
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-3">
          <div className="w-32 bg-gray-700 rounded-full h-2">
            <div
              className="bg-[#00C6AD] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-400">{progress}%</span>
        </div>

        {/* Action buttons */}
        <button
          onClick={onTogglePreview}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <EyeIcon className="h-4 w-4" />
          {showPreview ? "Edit" : "Preview"}
        </button>

        <button
          onClick={onClearDraft}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <DocumentTextIcon className="h-4 w-4" />
          Clear
        </button>
      </div>
    </div>
  );
};

export default FormHeader;
