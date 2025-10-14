/**
 * CV Upload Component with Real-time Progress Tracking
 * Integrates file upload with WebSocket progress monitoring
 */

import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import ProgressBar from './ProgressBar';

const CVUpload = ({
  onComplete,
  onError,
  className = '',
  acceptedFormats = ['.pdf', '.docx', '.doc', '.txt'],
  maxFileSize = 10
}) => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    // Check file type
    const fileName = file.name.toLowerCase();
    const isValidFormat = acceptedFormats.some(format => 
      fileName.endsWith(format.toLowerCase())
    );
    
    if (!isValidFormat) {
      return `File must be one of: ${acceptedFormats.join(', ')}`;
    }

    return null;
  };

  const handleFileSelect = useCallback((file) => {
    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      return;
    }

    setUploadError(null);
    const fileObj = {
      file,
      preview: file.name,
      size: formatFileSize(file.size),
      type: file.type || 'application/octet-stream'
    };
    
    setUploadedFile(fileObj);
  }, [maxFileSize, acceptedFormats]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInput = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  }, [handleFileSelect]);

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('cv_file', uploadedFile.file);

      // Upload file and get job ID
      const response = await fetch('/api/cv/process', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(errorData.detail || `Upload failed with status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.job_id) {
        setJobId(result.job_id);
      } else {
        throw new Error('No job ID returned from server');
      }

    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
      setIsUploading(false);
      
      if (onError) {
        onError(error instanceof Error ? error.message : 'Upload failed');
      }
    }
  };

  const handleProgressComplete = useCallback((result) => {
    setIsUploading(false);
    
    if (onComplete) {
      onComplete(result);
    }
  }, [onComplete]);

  const handleProgressError = useCallback((error) => {
    setIsUploading(false);
    setUploadError(error);
    
    if (onError) {
      onError(error);
    }
  }, [onError]);

  const resetUpload = () => {
    setUploadedFile(null);
    setJobId(null);
    setIsUploading(false);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // If we have a job ID, show progress
  if (jobId) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">{uploadedFile?.preview}</p>
              <p className="text-sm text-blue-600">{uploadedFile?.size}</p>
            </div>
          </div>
          <button
            onClick={resetUpload}
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
            title="Upload new file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <ProgressBar
          jobId={jobId}
          onComplete={handleProgressComplete}
          onError={handleProgressError}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : uploadedFile
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedFormats.join(',')}
          onChange={handleFileInput}
        />
        
        {uploadedFile ? (
          <div className="space-y-3">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <div>
              <p className="text-lg font-medium text-green-800">File Ready</p>
              <p className="text-green-600">{uploadedFile.preview}</p>
              <p className="text-sm text-green-500">{uploadedFile.size}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetUpload();
              }}
              className="text-sm text-green-600 hover:text-green-800 underline"
            >
              Choose different file
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                Drop your CV here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports {acceptedFormats.join(', ')} • Max {maxFileSize}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Error */}
      {uploadError && (
        <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800">Upload Error</p>
            <p className="text-sm text-red-600">{uploadError}</p>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {uploadedFile && !jobId && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isUploading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isUploading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </div>
          ) : (
            'Process CV'
          )}
        </button>
      )}

      {/* File Format Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>Supported formats: {acceptedFormats.join(', ')}</p>
        <p>Maximum file size: {maxFileSize}MB</p>
        <p>Your file will be processed securely and deleted after processing.</p>
      </div>
    </div>
  );
};

export default CVUpload;