"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

export default function CVUploadSection() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
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
    if (file.type === "application/pdf") {
      setUploadedFile(file);
      setIsAnalyzing(true);
      setUploadError(null);

      // Simulate analysis for demo purposes
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 2000);
    } else {
      setUploadError("Please upload a PDF file");
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <section className="w-full bg-gray-50 py-16">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 md:mb-8 tracking-tight leading-[1.1]">
              Not Sure What{" "}
              <span className="text-primary-600">
                Fits You?
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Upload your CV to match you with the best jobs and career
              enhancement opportunities. Our AI will provide a comprehensive
              analysis and personalized recommendations.
            </p>
          </div>

          {/* Upload Area */}
          <div className="mb-24">
            <div
              className={`relative border-2 border-dashed rounded-lg p-12 md:p-16 text-center transition-all duration-300 backdrop-blur-sm max-w-4xl mx-auto ${
                isDragOver
                  ? "border-primary-600 bg-primary-50"
                  : uploadedFile
                  ? "border-green-400 bg-green-50"
                  : uploadError
                  ? "border-red-400 bg-red-50"
                  : "border-gray-300 hover:border-primary-500 bg-white"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              {isAnalyzing ? (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Analyzing Your CV
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Our AI is reviewing your experience and skills...
                  </p>
                </div>
              ) : uploadError ? (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
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
                  <h3 className="text-2xl font-bold text-red-900 mb-3">
                    Upload Failed
                  </h3>
                  <p className="text-red-600 text-lg mb-6">
                    {uploadError}
                  </p>
                  <button
                    onClick={() => {
                      setUploadError(null);
                      setUploadedFile(null);
                    }}
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                  >
                    Try Again
                  </button>
                </div>
              ) : uploadedFile ? (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    CV Uploaded Successfully!
                  </h3>
                  <p className="text-gray-600 text-lg mb-6">
                    {uploadedFile.name}
                  </p>
                  <p className="text-gray-600 mb-4">
                    Analysis complete! We'll match you with relevant opportunities.
                  </p>
                  <button
                    onClick={() => {
                      setUploadedFile(null);
                      setUploadError(null);
                    }}
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                  >
                    Upload Different CV
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6">
                    <svg
                      className="w-10 h-10 text-primary-600"
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Upload Your CV
                  </h3>
                  <p className="text-gray-600 text-lg mb-8">
                    Drag and drop your CV here or click to browse
                  </p>
                  <Button 
                    onClick={openFileDialog} 
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                    size="lg"
                  >
                    Choose File
                  </Button>
                  <p className="text-sm text-gray-500 mt-6">
                    Support PDF (Max 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Features - 3 Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-50 rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-primary-600"
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
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                Perfect Job Matching
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our AI analyzes your skills, experience, and preferences to
                match you with the most suitable job opportunities in Jordan,
                Qatar, and KSA.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-primary-50 rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-primary-600"
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
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                Comprehensive CV Analysis
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get detailed insights on your CV including strengths, areas for
                improvement, keyword optimization, and formatting suggestions.
              </p>
            </div>

            <div className="text-center md:col-span-2 lg:col-span-1">
              <div className="w-20 h-20 bg-primary-50 rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-primary-600"
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
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                Career Enhancement
              </h3>
              <p className="text-gray-600 leading-relaxed">
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