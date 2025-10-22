'use client';

import React, { useState, useEffect } from 'react';
import {
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  DocumentIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { reportService, ReportStatus, ReportCategory, ReportFormat, ReportType } from '@/services/report.service';
import type { Report, ReportFilterInput } from '@/services/report.service';
import Link from 'next/link';

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingReportId, setGeneratingReportId] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<ReportStatus | ''>('');
  const [filterCategory, setFilterCategory] = useState<ReportCategory | ''>('');
  const [filterType, setFilterType] = useState<ReportType | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.getReports();
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (reportId: string) => {
    try {
      setGeneratingReportId(reportId);
      await reportService.generateReport(reportId);
      await loadReports(); // Reload to get updated status
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setGeneratingReportId(null);
    }
  };

  const handleDownload = (report: Report) => {
    if (report.fileUrl && report.fileName) {
      reportService.downloadReport(report.fileUrl, report.fileName);
    }
  };

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.COMPLETED:
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case ReportStatus.GENERATING:
        return <ArrowPathIcon className="w-5 h-5 text-blue-600 animate-spin" />;
      case ReportStatus.FAILED:
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case ReportStatus.SCHEDULED:
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      default:
        return <DocumentIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case ReportStatus.GENERATING:
        return 'bg-blue-100 text-blue-800';
      case ReportStatus.FAILED:
        return 'bg-red-100 text-red-800';
      case ReportStatus.SCHEDULED:
        return 'bg-yellow-100 text-yellow-800';
      case ReportStatus.DRAFT:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCategoryLabel = (category: ReportCategory) => {
    return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatTypeLabel = (type: ReportType) => {
    return type.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = !searchTerm || 
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || report.status === filterStatus;
    const matchesCategory = !filterCategory || report.category === filterCategory;
    const matchesType = !filterType || report.type === filterType;

    return matchesSearch && matchesStatus && matchesCategory && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ArrowPathIcon className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <DocumentChartBarIcon className="w-8 h-8 text-primary-600" />
                <h1 className="text-3xl font-bold text-gray-900">Business Reports</h1>
              </div>
              <p className="text-gray-600">
                View, generate, and download comprehensive business analytics reports
              </p>
            </div>
            <Link
              href="/dashboard/reports/settings"
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Cog6ToothIcon className="w-5 h-5" />
              <span>Report Settings</span>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <XCircleIcon className="w-5 h-5 text-red-600" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
            <button
              onClick={loadReports}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Filters</span>
              {(filterStatus || filterCategory || filterType) && (
                <span className="ml-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                  Active
                </span>
              )}
            </button>

            {/* Refresh Button */}
            <button
              onClick={loadReports}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as ReportStatus | '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Statuses</option>
                  {Object.values(ReportStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as ReportCategory | '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Categories</option>
                  {Object.values(ReportCategory).map(category => (
                    <option key={category} value={category}>
                      {formatCategoryLabel(category)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as ReportType | '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Types</option>
                  {Object.values(ReportType).map(type => (
                    <option key={type} value={type}>
                      {formatTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <DocumentChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus || filterCategory || filterType
                ? 'Try adjusting your filters'
                : 'Reports will appear here once they are generated'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(report.status)}
                      <h3 className="text-lg font-semibold text-gray-900">
                        {report.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>

                    {report.description && (
                      <p className="text-gray-600 mb-3">{report.description}</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Category:</span>
                        <p className="font-medium text-gray-900">
                          {formatCategoryLabel(report.category)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <p className="font-medium text-gray-900">
                          {formatTypeLabel(report.type)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Format:</span>
                        <p className="font-medium text-gray-900">{report.format}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">File Size:</span>
                        <p className="font-medium text-gray-900">
                          {formatBytes(report.fileSize)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Generated:</span>
                        <p className="font-medium text-gray-900">
                          {formatDate(report.generatedAt)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Records:</span>
                        <p className="font-medium text-gray-900">
                          {report.recordCount?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Execution Time:</span>
                        <p className="font-medium text-gray-900">
                          {report.executionTime ? `${report.executionTime.toFixed(2)}s` : 'N/A'}
                        </p>
                      </div>
                      {report.tags && report.tags.length > 0 && (
                        <div className="col-span-2 md:col-span-1">
                          <span className="text-gray-500">Tags:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {report.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {report.status === ReportStatus.COMPLETED && report.fileUrl && (
                      <button
                        onClick={() => handleDownload(report)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        <span>Download</span>
                      </button>
                    )}

                    {(report.status === ReportStatus.DRAFT || report.status === ReportStatus.FAILED) && (
                      <button
                        onClick={() => handleGenerateReport(report.id)}
                        disabled={generatingReportId === report.id}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generatingReportId === report.id ? (
                          <>
                            <ArrowPathIcon className="w-5 h-5 animate-spin" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <DocumentChartBarIcon className="w-5 h-5" />
                            <span>Generate</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
