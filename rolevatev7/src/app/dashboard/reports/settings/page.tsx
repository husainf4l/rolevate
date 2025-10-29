'use client';

import React, { useState } from 'react';
import {
  PlusIcon,
  DocumentChartBarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { reportService, ReportType, ReportCategory, ReportFormat } from '@/services/report.service';
import type { CreateReportInput } from '@/services/report.service';
import { useRouter } from 'next/navigation';

export default function ReportSettingsPage() {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateReportInput>({
    name: '',
    description: '',
    type: ReportType.ANALYTICS,
    category: ReportCategory.RECRUITMENT_METRICS,
    format: ReportFormat.PDF,
    tags: [],
    isPublic: false,
    autoDelete: false,
  });

  const [tagInput, setTagInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      const created = await reportService.createReport(formData);
      setSuccess(`Report "${created.name}" created successfully!`);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        type: ReportType.ANALYTICS,
        category: ReportCategory.RECRUITMENT_METRICS,
        format: ReportFormat.PDF,
        tags: [],
        isPublic: false,
        autoDelete: false,
      });
      setTagInput('');
      
      // Hide form after 2 seconds and redirect
      setTimeout(() => {
        setShowCreateForm(false);
        setSuccess(null);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create report');
    } finally {
      setCreating(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(tag => tag !== tagToRemove) || [],
    });
  };

  const formatCategoryLabel = (category: string) => {
    return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatTypeLabel = (type: string) => {
    return type.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const quickTemplates = [
    {
      name: 'Monthly Recruitment Overview',
      description: 'Comprehensive overview of recruitment activities, applications received, and hiring success rates for the current month.',
      type: ReportType.ANALYTICS,
      category: ReportCategory.RECRUITMENT_METRICS,
      format: ReportFormat.PDF,
      tags: ['recruitment', 'monthly', 'overview'],
    },
    {
      name: 'Quarterly Hiring Performance',
      description: 'Detailed analysis of hiring performance metrics including time-to-hire, cost-per-hire, and quality-of-hire for the quarter.',
      type: ReportType.PERFORMANCE,
      category: ReportCategory.RECRUITMENT_METRICS,
      format: ReportFormat.EXCEL,
      tags: ['performance', 'quarterly', 'hiring'],
    },
    {
      name: 'Active Candidate Pipeline',
      description: 'Real-time snapshot of candidates in various stages of the recruitment pipeline with conversion rates.',
      type: ReportType.SUMMARY,
      category: ReportCategory.CANDIDATE_PIPELINE,
      format: ReportFormat.DASHBOARD,
      tags: ['pipeline', 'candidates', 'real-time'],
    },
    {
      name: 'Interview Effectiveness Report',
      description: 'Analysis of interview performance, success rates, and interviewer feedback scores.',
      type: ReportType.ANALYTICS,
      category: ReportCategory.INTERVIEW_ANALYTICS,
      format: ReportFormat.EXCEL,
      tags: ['interviews', 'effectiveness', 'analytics'],
    },
    {
      name: 'Job Posting Performance',
      description: 'Performance metrics for active job postings including views, applications, and conversion rates.',
      type: ReportType.PERFORMANCE,
      category: ReportCategory.JOB_PERFORMANCE,
      format: ReportFormat.DASHBOARD,
      tags: ['jobs', 'performance', 'metrics'],
    },
  ];

  const applyTemplate = (template: typeof quickTemplates[0]) => {
    setFormData({
      name: template.name,
      description: template.description,
      type: template.type,
      category: template.category,
      format: template.format,
      tags: template.tags,
      isPublic: false,
      autoDelete: false,
    });
    setShowCreateForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <DocumentChartBarIcon className="w-8 h-8 text-primary-600" />
                <h1 className="text-3xl font-bold text-gray-900">Report Settings</h1>
              </div>
              <p className="text-gray-600">
                Create and configure new report definitions
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard/reports')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Reports
            </button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">{success}</p>
          </div>
        )}

        {/* Quick Templates */}
        {!showCreateForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Start Templates</h2>
            <p className="text-gray-600 mb-6">
              Choose a pre-configured template to get started quickly
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => applyTemplate(template)}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {formatTypeLabel(template.type)}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                      {template.format}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Create Button */}
        {!showCreateForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <DocumentChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Create Custom Report</h3>
            <p className="text-gray-600 mb-6">
              Build a custom report definition from scratch
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Create New Report</span>
            </button>
          </div>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Create New Report</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Monthly Recruitment Overview"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Describe what this report will analyze..."
                />
              </div>

              {/* Type, Category, Format */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ReportType })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {Object.values(ReportType).map(type => (
                      <option key={type} value={type}>{formatTypeLabel(type)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ReportCategory })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {Object.values(ReportCategory).map(category => (
                      <option key={category} value={category}>
                        {formatCategoryLabel(category)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format
                  </label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value as ReportFormat })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {Object.values(ReportFormat).map(format => (
                      <option key={format} value={format}>{format}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Add a tag and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-primary-900"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPublic || false}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Make this report public</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.autoDelete || false}
                    onChange={(e) => setFormData({ ...formData, autoDelete: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Auto-delete after expiration</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create Report'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
