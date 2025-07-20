"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/common/Button";

export default function CVUploadSection() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (file.type === "application/pdf" || file.type.includes("document")) {
      setUploadedFile(file);
      setIsAnalyzing(true);
      setUploadError(null);

      try {
        const formData = new FormData();
        formData.append("cv", file);

        const response = await fetch(
          "http://localhost:4005/api/jobfit/upload-cv",
          {
            method: "POST",
            body: formData,
          }
        );

        if (response.ok) {
          const result = await response.json();
          console.log("CV upload successful:", result);
          setAnalysisResult(result);
        } else {
          const errorText = await response.text();
          setUploadError(`Upload failed: ${response.statusText}`);
          console.error("CV upload failed:", errorText);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setUploadError(`Error uploading CV: ${errorMessage}`);
        console.error("Error uploading CV:", error);
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      setUploadError("Please upload a PDF, DOC, or DOCX file");
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <section className="w-full  bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 md:mb-20">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 md:mb-8 tracking-tight leading-[1.1]">
              Not Sure What{" "}
              <span
                className="bg-gradient-to-r from-[#13ead9] to-[#0891b2] bg-clip-text text-transparent"
                style={{
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Fits You?
              </span>
            </h2>
            <p className="font-text text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Upload your CV to match you with the best jobs and career
              enhancement opportunities. Our AI will provide a comprehensive
              analysis and personalized recommendations.
            </p>
          </div>

          {/* Upload Area - Full Width */}
          <div className="mb-20">
            <div
              className={`relative border-2 border-dashed rounded-3xl p-12 md:p-16 text-center transition-all duration-300 backdrop-blur-sm max-w-4xl mx-auto ${
                isDragOver
                  ? "border-[#0891b2] bg-gradient-to-br from-[#13ead9]/10 to-[#0891b2]/10"
                  : uploadedFile
                  ? "border-green-400 bg-gradient-to-br from-green-50 to-green-100/50"
                  : uploadError
                  ? "border-red-400 bg-gradient-to-br from-red-50 to-red-100/50"
                  : "border-gray-300 hover:border-[#0891b2]/50 bg-white/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />

              {isAnalyzing ? (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 border-4 border-[#0891b2] border-t-transparent rounded-full animate-spin mb-6"></div>
                  <h3 className="font-display text-2xl font-bold text-gray-900 mb-3">
                    Analyzing Your CV
                  </h3>
                  <p className="font-text text-gray-600 text-lg">
                    Our AI is reviewing your experience and skills...
                  </p>
                </div>
              ) : uploadError ? (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-6 shadow-corporate">
                    <svg
                      className="w-10 h-10 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-red-900 mb-3">
                    Upload Failed
                  </h3>
                  <p className="font-text text-red-600 text-lg mb-6">
                    {uploadError}
                  </p>
                  <button
                    onClick={() => {
                      setUploadError(null);
                      setUploadedFile(null);
                    }}
                    className="text-[#0891b2] hover:text-[#0c7594] font-text font-semibold transition-colors duration-200"
                  >
                    Try Again
                  </button>
                </div>
              ) : uploadedFile && analysisResult ? (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-6 shadow-corporate">
                    <svg
                      className="w-10 h-10 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-green-900 mb-3">
                    Thank You
                    {analysisResult.firstName
                      ? `, ${analysisResult.firstName}`
                      : ""}
                    !
                  </h3>
                  <p className="font-text text-gray-600 text-lg mb-6 max-w-md text-center leading-relaxed">
                    Your CV has been successfully analyzed. We'll keep you
                    updated with personalized job matches and opportunities
                    {analysisResult.phone && ` on ${analysisResult.phone}`}
                    {analysisResult.email &&
                      ` or via email at ${analysisResult.email}`}
                    .
                  </p>
                  <div className="bg-gradient-to-r from-[#13ead9]/10 to-[#0891b2]/10 rounded-2xl p-6 mb-6 max-w-md">
                    <h4 className="font-display text-lg font-semibold text-gray-900 mb-3">
                      Your Profile Summary
                    </h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      {analysisResult.currentJobTitle && (
                        <p>
                          <span className="font-medium">Current Role:</span>{" "}
                          {analysisResult.currentJobTitle}
                        </p>
                      )}
                      {analysisResult.totalExperience && (
                        <p>
                          <span className="font-medium">Experience:</span>{" "}
                          {analysisResult.totalExperience} years
                        </p>
                      )}
                      {analysisResult.skills &&
                        analysisResult.skills.length > 0 && (
                          <p>
                            <span className="font-medium">Key Skills:</span>{" "}
                            {analysisResult.skills.slice(0, 3).join(", ")}
                          </p>
                        )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setUploadedFile(null);
                      setUploadError(null);
                      setAnalysisResult(null);
                    }}
                    className="text-[#0891b2] hover:text-[#0c7594] font-text font-semibold transition-colors duration-200"
                  >
                    Upload Different CV
                  </button>
                </div>
              ) : uploadedFile ? (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-6 shadow-corporate">
                    <svg
                      className="w-10 h-10 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-gray-900 mb-3">
                    CV Uploaded Successfully
                  </h3>
                  <p className="font-text text-gray-600 text-lg mb-6">
                    {uploadedFile.name}
                  </p>
                  <button
                    onClick={() => {
                      setUploadedFile(null);
                      setUploadError(null);
                      setAnalysisResult(null);
                    }}
                    className="text-[#0891b2] hover:text-[#0c7594] font-text font-semibold transition-colors duration-200"
                  >
                    Upload Different CV
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#13ead9]/10 to-[#0891b2]/10 rounded-full flex items-center justify-center mb-6 shadow-corporate">
                    <svg
                      className="w-10 h-10 text-[#0891b2]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-gray-900 mb-3">
                    Upload Your CV
                  </h3>
                  <p className="font-text text-gray-600 text-lg mb-8">
                    Drag and drop your CV here or click to browse
                  </p>
                  <Button onClick={openFileDialog} variant="primary" size="lg">
                    Choose File
                  </Button>
                  <p className="font-text text-sm text-gray-500 mt-6">
                    Supports PDF, DOC, DOCX (Max 10MB)
                  </p>
                </div>
              )}
            </div>

            {uploadedFile && !isAnalyzing && !analysisResult && (
              <div className="mt-8 max-w-md mx-auto">
                <Button
                  variant="primary"
                  size="xl"
                  fullWidth
                  className="font-bold"
                >
                  Get AI Analysis & Job Matches
                </Button>
              </div>
            )}
          </div>

          {/* Features - 3 Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#13ead9]/10 to-[#0891b2]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-corporate">
                <svg
                  className="w-10 h-10 text-[#0891b2]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-display text-xl md:text-2xl font-bold text-gray-900 mb-4">
                Perfect Job Matching
              </h3>
              <p className="font-text text-gray-600 leading-relaxed">
                Our AI analyzes your skills, experience, and preferences to
                match you with the most suitable job opportunities in Jordan,
                Qatar, and KSA.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#13ead9]/10 to-[#0891b2]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-corporate">
                <svg
                  className="w-10 h-10 text-[#0891b2]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="font-display text-xl md:text-2xl font-bold text-gray-900 mb-4">
                Comprehensive CV Analysis
              </h3>
              <p className="font-text text-gray-600 leading-relaxed">
                Get detailed insights on your CV including strengths, areas for
                improvement, keyword optimization, and formatting suggestions.
              </p>
            </div>

            <div className="text-center md:col-span-2 lg:col-span-1">
              <div className="w-20 h-20 bg-gradient-to-br from-[#13ead9]/10 to-[#0891b2]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-corporate">
                <svg
                  className="w-10 h-10 text-[#0891b2]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="font-display text-xl md:text-2xl font-bold text-gray-900 mb-4">
                Career Enhancement
              </h3>
              <p className="font-text text-gray-600 leading-relaxed">
                Receive personalized recommendations for skill development,
                certifications, and career progression paths tailored to the
                Middle East job market.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
