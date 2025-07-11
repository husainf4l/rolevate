"use client";

import React, { useState } from "react";
import { DocumentArrowUpIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface CVUploadPromptProps {
  onUpload: (file: File) => void;
  onSkip: () => void;
  onDismiss: () => void;
}

export default function CVUploadPrompt({
  onUpload,
  onSkip,
  onDismiss,
}: CVUploadPromptProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && file.type === "application/pdf") {
      setUploading(true);
      // Simulate upload delay
      setTimeout(() => {
        onUpload(file);
        setUploading(false);
      }, 1500);
    } else {
      alert("Please select a PDF file");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 mb-8 shadow-xl border border-white/20 overflow-hidden group">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#13ead9]/5 via-white/10 to-[#0891b2]/5 rounded-3xl"></div>

      {/* Decorative elements */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-[#13ead9]/10 to-[#0891b2]/10 rounded-full blur-xl"></div>
      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-tr from-[#0891b2]/10 to-[#13ead9]/10 rounded-full blur-lg"></div>

      <button
        onClick={onDismiss}
        className="absolute top-6 right-6 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100/80 backdrop-blur-sm text-gray-500 hover:text-gray-700 hover:bg-gray-200/80 transition-all duration-200 group/close"
      >
        <XMarkIcon className="w-4 h-4 transition-transform duration-200 group-hover/close:scale-110" />
      </button>

      <div className="relative z-10 flex items-start space-x-6">
        <div className="w-16 h-16 bg-gradient-to-br from-[#13ead9]/20 to-[#0891b2]/20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg backdrop-blur-sm border border-white/30">
          <DocumentArrowUpIcon className="w-8 h-8 text-[#0891b2]" />
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 font-display tracking-tight">
            Complete Your Profile
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed font-text">
            Upload your CV to get personalized job recommendations and improve
            your chances of being discovered by employers.
          </p>

          {uploading ? (
            <div className="flex items-center py-6">
              <div className="relative">
                <div className="w-6 h-6 border-3 border-[#13ead9]/30 border-t-[#0891b2] rounded-full animate-spin"></div>
              </div>
              <span className="ml-4 text-gray-700 font-medium">
                Uploading your CV...
              </span>
            </div>
          ) : (
            <>
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 mb-6 ${
                  dragOver
                    ? "border-[#0891b2] bg-gradient-to-br from-[#13ead9]/5 to-[#0891b2]/5 scale-[1.01]"
                    : "border-gray-300 hover:border-[#13ead9]/50 hover:bg-gradient-to-br hover:from-[#13ead9]/3 hover:to-[#0891b2]/3"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#13ead9]/20 to-[#0891b2]/20 rounded-2xl flex items-center justify-center">
                    <DocumentArrowUpIcon className="w-8 h-8 text-[#0891b2]" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-2 font-display">
                    Drag and drop your CV here
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    or click to browse your files
                  </p>

                  <label className="group inline-flex items-center px-8 py-3 bg-gradient-to-r from-[#13ead9] to-[#0891b2] text-white rounded-xl hover:from-[#0891b2] hover:to-[#13ead9] transition-all duration-300 cursor-pointer font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    Choose File
                  </label>

                  <p className="text-xs text-gray-400 mt-4 font-text">
                    PDF files only • Maximum 10MB
                  </p>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={onSkip}
                  className="flex-1 px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium font-text active:scale-95"
                >
                  Skip for now
                </button>
                <button
                  onClick={onDismiss}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium font-text active:scale-95"
                >
                  Maybe later
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
