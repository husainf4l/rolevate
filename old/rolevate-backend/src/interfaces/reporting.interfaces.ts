/**
 * Reporting Service Implementation Interfaces
 * 
 * This file contains service interfaces and DTOs for implementing
 * the reporting system with proper separation of concerns.
 */

// =======================================
// REPORT SERVICE INTERFACES
// =======================================

export interface ReportServiceInterface {
  // Core Report Operations
  createReport(data: CreateReportRequest): Promise<ReportResponse>;
  getReport(id: string, options?: GetReportOptions): Promise<ReportResponse>;
  updateReport(id: string, data: UpdateReportRequest): Promise<ReportResponse>;
  deleteReport(id: string): Promise<void>;
  listReports(query: ListReportsQuery): Promise<ListReportsResponse>;
  
  // Report Generation
  generateReport(id: string, options?: GenerateReportOptions): Promise<GenerationResponse>;
  regenerateReport(id: string): Promise<GenerationResponse>;
  cancelGeneration(id: string): Promise<void>;
  
  // Report Data
  getReportData(id: string, format?: string): Promise<ReportDataResponse>;
  exportReport(id: string, format: string): Promise<ExportResponse>;
  
  // Report Templates
  createTemplate(data: CreateTemplateRequest): Promise<TemplateResponse>;
  getTemplates(query?: TemplateQuery): Promise<TemplateListResponse>;
  createReportFromTemplate(templateId: string, data: TemplateInstanceRequest): Promise<ReportResponse>;
}

// =======================================
// SCHEDULING SERVICE INTERFACES
// =======================================

export interface SchedulingServiceInterface {
  createSchedule(data: CreateScheduleRequest): Promise<ScheduleResponse>;
  updateSchedule(id: string, data: UpdateScheduleRequest): Promise<ScheduleResponse>;
  deleteSchedule(id: string): Promise<void>;
  pauseSchedule(id: string): Promise<void>;
  resumeSchedule(id: string): Promise<void>;
  getSchedule(id: string): Promise<ScheduleResponse>;
  listSchedules(query?: ScheduleQuery): Promise<ScheduleListResponse>;
  
  // Execution
  executeScheduledReports(): Promise<ExecutionSummary>;
  getNextExecutions(limit?: number): Promise<NextExecutionResponse[]>;
}

// =======================================
// SHARING SERVICE INTERFACES
// =======================================

export interface SharingServiceInterface {
  shareReport(data: ShareReportRequest): Promise<ShareResponse>;
  updateShareSettings(shareId: string, data: UpdateShareRequest): Promise<ShareResponse>;
  revokeShare(shareId: string): Promise<void>;
  getSharedReports(userId: string): Promise<SharedReportListResponse>;
  getReportShares(reportId: string): Promise<ShareListResponse>;
  
  // Public Access
  getPublicReport(token: string): Promise<PublicReportResponse>;
  validateShareAccess(token: string): Promise<ShareValidationResponse>;
}

// =======================================
// ANALYTICS SERVICE INTERFACES
// =======================================

export interface AnalyticsServiceInterface {
  getReportMetrics(reportId: string): Promise<ReportMetricsResponse>;
  getUsageStatistics(companyId?: string): Promise<UsageStatisticsResponse>;
  getPerformanceMetrics(): Promise<PerformanceMetricsResponse>;
  getPopularReports(companyId?: string, limit?: number): Promise<PopularReportsResponse>;
  
  // Insights
  getReportInsights(reportId: string): Promise<ReportInsightsResponse>;
  getCompanyInsights(companyId: string): Promise<CompanyInsightsResponse>;
}

// =======================================
// REQUEST/RESPONSE TYPES
// =======================================

export interface CreateReportRequest {
  name: string;
  description?: string;
  type: string;
  category: string;
  format?: string;
  scope?: string;
  priority?: string;
  templateId?: string;
  companyId?: string;
  query?: string;
  filters?: ReportFilterDto[];
  parameters?: ReportParameterDto[];
  config?: ReportConfigDto;
  tags?: string[];
}

export interface UpdateReportRequest extends Partial<CreateReportRequest> {}

export interface ReportResponse {
  id: string;
  name: string;
  description?: string;
  type: string;
  category: string;
  format: string;
  status: string;
  scope: string;
  priority: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  executionTime?: number;
  recordCount?: number;
  tags: string[];
  version: string;
  isPublic: boolean;
  generatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  template?: TemplateResponse;
  metrics?: ReportMetricDto[];
  schedule?: ScheduleResponse;
  shares?: ShareDto[];
}

export interface GetReportOptions {
  includeData?: boolean;
  includeMetrics?: boolean;
  includeSchedule?: boolean;
  includeShares?: boolean;
}

export interface ListReportsQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  type?: string[];
  category?: string[];
  status?: string[];
  scope?: string[];
  companyId?: string;
  userId?: string;
  tags?: string[];
  search?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface ListReportsResponse {
  reports: ReportResponse[];
  pagination: PaginationResponse;
}

// =======================================
// GENERATION TYPES
// =======================================

export interface GenerateReportOptions {
  async?: boolean;
  cache?: boolean;
  format?: string;
  includeMetrics?: boolean;
  webhook?: string;
  priority?: string;
}

export interface GenerationResponse {
  reportId: string;
  jobId?: string;
  status: 'started' | 'queued' | 'completed' | 'failed';
  estimatedDuration?: number;
  progress?: number;
  fileUrl?: string;
  error?: ErrorResponse;
  startedAt: Date;
  completedAt?: Date;
}

export interface ReportDataResponse {
  reportId: string;
  data: any;
  metadata: {
    recordCount: number;
    columns: ColumnMetadata[];
    generatedAt: Date;
    executionTime: number;
  };
}

export interface ColumnMetadata {
  name: string;
  type: string;
  label?: string;
  description?: string;
  format?: string;
}

export interface ExportResponse {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  format: string;
  expiresAt: Date;
}

// =======================================
// TEMPLATE TYPES
// =======================================

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  type: string;
  category: string;
  format?: string;
  scope?: string;
  queryTemplate: string;
  defaultFilters?: ReportFilterDto[];
  defaultParameters?: ReportParameterDto[];
  config?: ReportConfigDto;
  companyId?: string;
}

export interface TemplateResponse {
  id: string;
  name: string;
  description?: string;
  type: string;
  category: string;
  format: string;
  scope: string;
  queryTemplate: string;
  defaultFilters?: ReportFilterDto[];
  defaultParameters?: ReportParameterDto[];
  config?: ReportConfigDto;
  version: string;
  isSystem: boolean;
  isActive: boolean;
  usageCount: number;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateQuery {
  category?: string[];
  type?: string[];
  isSystem?: boolean;
  isActive?: boolean;
  companyId?: string;
}

export interface TemplateListResponse {
  templates: TemplateResponse[];
  pagination: PaginationResponse;
}

export interface TemplateInstanceRequest {
  name: string;
  description?: string;
  parameters?: Record<string, any>;
  filters?: ReportFilterDto[];
  config?: ReportConfigDto;
  tags?: string[];
}

// =======================================
// SCHEDULING TYPES
// =======================================

export interface CreateScheduleRequest {
  reportId: string;
  frequency: string;
  cronExpression?: string;
  startDate: Date;
  endDate?: Date;
  timezone?: string;
  recipients: string[];
  emailSubject?: string;
  emailBody?: string;
  maxRetries?: number;
}

export interface UpdateScheduleRequest extends Partial<CreateScheduleRequest> {}

export interface ScheduleResponse {
  id: string;
  reportId: string;
  frequency: string;
  cronExpression?: string;
  startDate: Date;
  endDate?: Date;
  nextRun?: Date;
  lastRun?: Date;
  isActive: boolean;
  timezone: string;
  recipients: string[];
  emailSubject?: string;
  emailBody?: string;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleQuery {
  isActive?: boolean;
  frequency?: string[];
  reportId?: string;
  companyId?: string;
}

export interface ScheduleListResponse {
  schedules: ScheduleResponse[];
  pagination: PaginationResponse;
}

export interface ExecutionSummary {
  totalExecuted: number;
  successful: number;
  failed: number;
  duration: number;
  errors?: ErrorResponse[];
}

export interface NextExecutionResponse {
  scheduleId: string;
  reportId: string;
  reportName: string;
  nextRun: Date;
  frequency: string;
}

// =======================================
// SHARING TYPES
// =======================================

export interface ShareReportRequest {
  reportId: string;
  sharedWith?: string;
  permission: string;
  expiresAt?: Date;
  isPublic?: boolean;
  requireLogin?: boolean;
}

export interface UpdateShareRequest extends Partial<ShareReportRequest> {}

export interface ShareResponse {
  id: string;
  reportId: string;
  sharedWith?: string;
  permission: string;
  accessToken?: string;
  expiresAt?: Date;
  accessCount: number;
  lastAccessed?: Date;
  isPublic: boolean;
  requireLogin: boolean;
  sharedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SharedReportListResponse {
  reports: Array<{
    report: ReportResponse;
    share: ShareResponse;
  }>;
  pagination: PaginationResponse;
}

export interface ShareListResponse {
  shares: ShareResponse[];
  pagination: PaginationResponse;
}

export interface PublicReportResponse {
  report: ReportResponse;
  data?: any;
  restrictions?: {
    canDownload: boolean;
    canViewData: boolean;
    watermark?: string;
  };
}

export interface ShareValidationResponse {
  valid: boolean;
  share?: ShareResponse;
  report?: ReportResponse;
  error?: string;
}

// =======================================
// ANALYTICS TYPES
// =======================================

export interface ReportMetricsResponse {
  reportId: string;
  metrics: ReportMetricDto[];
  summary: {
    totalExecutions: number;
    averageExecutionTime: number;
    successRate: number;
    lastExecution?: Date;
  };
}

export interface ReportMetricDto {
  metricName: string;
  metricValue: number;
  metricType: string;
  dimension?: string;
  period?: string;
  timestamp: Date;
}

export interface UsageStatisticsResponse {
  period: {
    from: Date;
    to: Date;
  };
  totals: {
    reports: number;
    executions: number;
    users: number;
    dataExported: number; // in bytes
  };
  trends: {
    reportsByDay: Array<{ date: Date; count: number }>;
    executionsByDay: Array<{ date: Date; count: number; duration: number }>;
    topCategories: Array<{ category: string; count: number }>;
    topUsers: Array<{ userId: string; userName: string; count: number }>;
  };
}

export interface PerformanceMetricsResponse {
  averageExecutionTime: number;
  medianExecutionTime: number;
  slowestReports: Array<{
    reportId: string;
    reportName: string;
    averageTime: number;
  }>;
  fastestReports: Array<{
    reportId: string;
    reportName: string;
    averageTime: number;
  }>;
  errorRate: number;
  commonErrors: Array<{
    error: string;
    count: number;
  }>;
}

export interface PopularReportsResponse {
  reports: Array<{
    report: ReportResponse;
    executionCount: number;
    uniqueUsers: number;
    lastExecuted: Date;
  }>;
}

export interface ReportInsightsResponse {
  reportId: string;
  insights: {
    usage: {
      totalExecutions: number;
      uniqueUsers: number;
      averageFrequency: string;
    };
    performance: {
      averageExecutionTime: number;
      trend: 'improving' | 'stable' | 'degrading';
      recommendations?: string[];
    };
    data: {
      averageRecordCount: number;
      dataGrowthRate: number;
      sizeOptimization?: string[];
    };
  };
}

export interface CompanyInsightsResponse {
  companyId: string;
  insights: {
    adoption: {
      totalUsers: number;
      activeUsers: number;
      adoptionRate: number;
    };
    usage: {
      totalReports: number;
      executionsThisMonth: number;
      growthRate: number;
    };
    efficiency: {
      averageTimeToInsight: number;
      automationRate: number;
      recommendations?: string[];
    };
  };
}

// =======================================
// COMMON TYPES
// =======================================

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface ReportFilterDto {
  field: string;
  operator: string;
  value: any;
  label?: string;
}

export interface ReportParameterDto {
  name: string;
  type: string;
  value: any;
  required?: boolean;
  description?: string;
}

export interface ReportConfigDto {
  refreshInterval?: number;
  cacheTimeout?: number;
  maxRecords?: number;
  sortBy?: string;
  sortOrder?: string;
  groupBy?: string[];
  aggregate?: Record<string, string>;
  visualization?: {
    type: string;
    chartType?: string;
    options?: Record<string, any>;
  };
}

export interface ShareDto {
  id: string;
  sharedWith?: string;
  permission: string;
  isPublic: boolean;
  createdAt: Date;
}