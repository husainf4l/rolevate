import React, { useState } from 'react';
import { Button } from '@/components/common/Button';
import AnonymousApplicationService, { AnonymousApplicationResponse } from '@/services/anonymousApplication';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface AnonymousApplicationFormProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  onApplicationSuccess?: (response: AnonymousApplicationResponse) => void;
  onClose?: () => void;
}

export default function AnonymousApplicationForm({
  jobId,
  jobTitle,
  companyName,
  onApplicationSuccess,
  onClose,
}: AnonymousApplicationFormProps) {
  const [formData, setFormData] = useState({
    coverLetter: '',
    expectedSalary: '',
    noticePeriod: '',
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const validation = AnonymousApplicationService.validateCVFile(file);
    
    if (!validation.isValid) {
      setSubmitStatus({
        type: 'error',
        message: validation.error || 'Invalid file',
      });
      return;
    }
    
    setSelectedFile(file);
    setSubmitStatus(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setSubmitStatus({
        type: 'error',
        message: 'Please upload your CV/Resume',
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await AnonymousApplicationService.applyWithCV(
        jobId,
        selectedFile,
        formData.coverLetter || undefined,
        formData.expectedSalary || undefined,
        formData.noticePeriod || undefined
      );

      setSubmitStatus({
        type: 'success',
        message: response.isNewAccount 
          ? `Application submitted successfully! A new account has been created for ${response.email}. Check your email for login credentials.`
          : 'Application submitted successfully!',
      });

      if (onApplicationSuccess) {
        onApplicationSuccess(response);
      }

      // Reset form
      setFormData({
        coverLetter: '',
        expectedSalary: '',
        noticePeriod: '',
      });
      setSelectedFile(null);

    } catch (error: any) {
      setSubmitStatus({
        type: 'error',
        message: error.message || 'Failed to submit application',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Apply for Position</h2>
          <p className="text-gray-600 mt-1">
            {jobTitle} at {companyName}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Status Message */}
      {submitStatus && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            submitStatus.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          {submitStatus.type === 'success' ? (
            <CheckCircleIcon className="w-5 h-5" />
          ) : (
            <ExclamationTriangleIcon className="w-5 h-5" />
          )}
          {submitStatus.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* CV Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CV/Resume *
          </label>
          
          {!selectedFile ? (
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive
                  ? 'border-[#13ead9] bg-[#13ead9]/5'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="cv-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Drop your CV here, or{' '}
                    <span className="text-[#13ead9] hover:text-[#0891b2]">browse</span>
                  </span>
                  <input
                    id="cv-upload"
                    name="cv-upload"
                    type="file"
                    className="sr-only"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileInputChange}
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  PDF, DOC, DOCX up to 5MB
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
              <div className="flex items-center gap-3">
                <DocumentIcon className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {AnonymousApplicationService.formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Cover Letter */}
        <div>
          <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
            Cover Letter
          </label>
          <textarea
            id="coverLetter"
            name="coverLetter"
            rows={4}
            value={formData.coverLetter}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#13ead9] focus:border-transparent resize-none"
            placeholder="Tell us why you're interested in this position..."
          />
        </div>

        {/* Expected Salary */}
        <div>
          <label htmlFor="expectedSalary" className="block text-sm font-medium text-gray-700 mb-2">
            Expected Salary
          </label>
          <input
            type="text"
            id="expectedSalary"
            name="expectedSalary"
            value={formData.expectedSalary}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#13ead9] focus:border-transparent"
            placeholder="e.g., 5000 JOD"
          />
        </div>

        {/* Notice Period */}
        <div>
          <label htmlFor="noticePeriod" className="block text-sm font-medium text-gray-700 mb-2">
            Notice Period
          </label>
          <input
            type="text"
            id="noticePeriod"
            name="noticePeriod"
            value={formData.noticePeriod}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#13ead9] focus:border-transparent"
            placeholder="e.g., 1 month, 2 weeks, Immediate"
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting || !selectedFile}
            className="flex-1"
          >
            {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
          </Button>
          
          {onClose && (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={onClose}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      {/* Info Note */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> If you don't have an account, we'll automatically create one for you 
          and send login credentials to your email address extracted from your CV.
        </p>
      </div>
    </div>
  );
}
