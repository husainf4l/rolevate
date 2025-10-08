"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { DocumentArrowUpIcon, XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

// Zod validation schema for CV upload
const cvUploadSchema = z.object({
  file: z.any()
    .refine((files) => files?.length === 1, "Please select a file")
    .refine((files) => files?.[0]?.size <= 5000000, "File size must be less than 5MB")
    .refine((files) => files?.[0]?.type === "application/pdf", "Please select a PDF file"),
});

type CVUploadFormData = z.infer<typeof cvUploadSchema>;

interface EnhancedCVUploadProps {
  onUpload: (file: File) => void;
  onSkip: () => void;
  onDismiss: () => void;
}

export default function EnhancedCVUpload({
  onUpload,
  onSkip,
  onDismiss,
}: EnhancedCVUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CVUploadFormData>({
    resolver: zodResolver(cvUploadSchema),
  });

  const handleFileSelect = (file: File) => {
    if (file) {
      setSelectedFile(file);
      setValue("file", [file]); // react-hook-form expects FileList-like structure
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const onSubmit = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // Simulate upload delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      onUpload(selectedFile);
      toast.success("CV uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload CV. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-sm shadow-2xl max-w-lg w-full p-8 relative">
        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-[#13ead9]/20 to-[#0891b2]/20 rounded-full flex items-center justify-center mb-4">
            <DocumentArrowUpIcon className="h-8 w-8 text-[#0891b2]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your CV</h2>
          <p className="text-gray-600">
            Upload your CV to get personalized job recommendations and better matching with opportunities.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              dragOver
                ? "border-[#0891b2] bg-[#0891b2]/5"
                : errors.file
                ? "border-red-300 bg-red-50"
                : selectedFile
                ? "border-green-300 bg-green-50"
                : "border-gray-300 hover:border-[#0891b2] hover:bg-[#0891b2]/5"
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
          >
            {selectedFile ? (
              <div className="space-y-3">
                <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto" />
                <div>
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setValue("file", null);
                  }}
                  className="text-sm text-[#0891b2] hover:text-[#13ead9] font-medium"
                >
                  Choose different file
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop your CV here or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF format, max 5MB
                  </p>
                </div>
                <input
                  type="file"
                  {...register("file")}
                  onChange={handleFileInput}
                  accept=".pdf"
                  className="hidden"
                  id="cv-file-input"
                />
                <label
                  htmlFor="cv-file-input"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                >
                  Browse Files
                </label>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errors.file && (
            <p className="text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠</span>
              {errors.file.message as string}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onSkip}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="flex-1 bg-gradient-to-r from-[#13ead9] to-[#0891b2] text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {uploading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Uploading...
                </div>
              ) : (
                "Upload CV"
              )}
            </button>
          </div>

          {/* Benefits */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-medium text-gray-900 mb-2">Why upload your CV?</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-[#0891b2] rounded-full mr-2"></span>
                Get personalized job recommendations
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-[#0891b2] rounded-full mr-2"></span>
                Improve matching accuracy with employers
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-[#0891b2] rounded-full mr-2"></span>
                Auto-fill application forms
              </li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
}


