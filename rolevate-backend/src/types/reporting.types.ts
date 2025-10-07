/**
 * Comprehensive Reporting System Types and Interfaces
 * 
 * This file contains all TypeScript interfaces and types for the reporting system
 * providing type safety and better development experience.
 */

import { 
  ReportType, 
  ReportCategory, 
  ReportFormat, 
  ReportStatus, 
  ReportScope, 
  ReportPriority,
  SharePermission,
  ScheduleFrequency
} from '@prisma/client';

// =======================================
// BASE INTERFACES
// =======================================

export interface BaseReportEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// =======================================
// REPORT CONFIGURATION INTERFACES
// =======================================

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'notIn' | 'between';
  value: any;
  label?: string;
}

export interface ReportParameter {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object';
  value: any;
  required?: boolean;
  description?: string;
  defaultValue?: any;
}

export interface ReportConfig {
  refreshInterval?: number; // in seconds
  cacheTimeout?: number; // in seconds
  maxRecords?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  groupBy?: string[];
  aggregate?: {
    [field: string]: 'sum' | 'avg' | 'count' | 'min' | 'max';
  };
  visualization?: {
    type: 'table' | 'chart' | 'graph' | 'dashboard';
    chartType?: 'bar' | 'line' | 'pie' | 'scatter' | 'area';
    options?: Record<string, any>;
  };
}

// =======================================
// REPORT INTERFACES
// =======================================

export interface Report extends BaseReportEntity {
  name: string;
  description?: string;
  type: ReportType;
  category: ReportCategory;
  format: ReportFormat;
  status: ReportStatus;
  scope: ReportScope;
  priority: ReportPriority;
  
  // Content and Configuration
  query?: string;
  filters?: ReportFilter[];
  parameters?: ReportParameter[];
  config?: ReportConfig;
  
  // Results and Output
  data?: any;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  
  // Relationships
  templateId?: string;
  companyId?: string;
  userId?: string;
  
  // Audit Trail
  generatedBy?: string;
  generatedAt?: Date;
  
  // Performance Tracking
  executionTime?: number;
  recordCount?: number;
  
  // Metadata
  tags: string[];
  version: string;
  isPublic: boolean;
}

export interface CreateReportDto {
  name: string;
  description?: string;
  type: ReportType;
  category: ReportCategory;
  format?: ReportFormat;
  scope?: ReportScope;
  priority?: ReportPriority;
  templateId?: string;
  companyId?: string;
  query?: string;
  filters?: ReportFilter[];
  parameters?: ReportParameter[];
  config?: ReportConfig;
  tags?: string[];
}

export interface UpdateReportDto extends Partial<CreateReportDto> {
  id: string;
}

// =======================================
// REPORT TEMPLATE INTERFACES
// =======================================

export interface ReportTemplate extends BaseReportEntity {
  name: string;
  description?: string;
  type: ReportType;
  category: ReportCategory;
  format: ReportFormat;
  scope: ReportScope;
  
  // Template Configuration
  queryTemplate: string;
  defaultFilters?: ReportFilter[];
  defaultParameters?: ReportParameter[];
  config?: ReportConfig;
  
  // Template Metadata
  version: string;
  isSystem: boolean;
  isActive: boolean;
  
  // Usage Tracking
  usageCount: number;
  lastUsed?: Date;
  
  // Relationships
  companyId?: string;
  createdBy?: string;
}

export interface CreateReportTemplateDto {
  name: string;
  description?: string;
  type: ReportType;
  category: ReportCategory;
  format?: ReportFormat;
  scope?: ReportScope;
  queryTemplate: string;
  defaultFilters?: ReportFilter[];
  defaultParameters?: ReportParameter[];
  config?: ReportConfig;
  companyId?: string;
}

// =======================================
// REPORT METRICS INTERFACES
// =======================================

export interface ReportMetrics extends BaseReportEntity {
  reportId: string;
  metricName: string;
  metricValue: number;
  metricType: string;
  dimension?: string;
  period?: string;
  metadata?: Record<string, any>;
}

export interface MetricsSummary {
  totalReports: number;
  averageExecutionTime: number;
  averageRecordCount: number;
  topCategories: Array<{
    category: ReportCategory;
    count: number;
  }>;
  performanceMetrics: {
    fastest: number;
    slowest: number;
    averageSize: number;
  };
}

// =======================================
// REPORT SCHEDULING INTERFACES
// =======================================

export interface ReportSchedule extends BaseReportEntity {
  reportId: string;
  frequency: ScheduleFrequency;
  cronExpression?: string;
  
  // Schedule Timing
  startDate: Date;
  endDate?: Date;
  nextRun?: Date;
  lastRun?: Date;
  
  // Schedule Settings
  isActive: boolean;
  timezone: string;
  
  // Recipients
  recipients: string[];
  
  // Delivery Settings
  emailSubject?: string;
  emailBody?: string;
  
  // Error Handling
  retryCount: number;
  maxRetries: number;
  lastError?: string;
}

export interface CreateScheduleDto {
  reportId: string;
  frequency: ScheduleFrequency;
  cronExpression?: string;
  startDate: Date;
  endDate?: Date;
  timezone?: string;
  recipients: string[];
  emailSubject?: string;
  emailBody?: string;
  maxRetries?: number;
}

// =======================================
// REPORT SHARING INTERFACES
// =======================================

export interface ReportShare extends BaseReportEntity {
  reportId: string;
  sharedWith?: string;
  permission: SharePermission;
  
  // Access Control
  accessToken?: string;
  expiresAt?: Date;
  
  // Usage Tracking
  accessCount: number;
  lastAccessed?: Date;
  
  // Sharing Settings
  isPublic: boolean;
  requireLogin: boolean;
  
  // Metadata
  sharedBy: string;
}

export interface ShareReportDto {
  reportId: string;
  sharedWith?: string;
  permission: SharePermission;
  expiresAt?: Date;
  isPublic?: boolean;
  requireLogin?: boolean;
}

// =======================================
// REPORT AUDIT LOG INTERFACES
// =======================================

export interface ReportAuditLog {
  id: string;
  reportId: string;
  action: string;
  details?: Record<string, any>;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  createdAt: Date;
}

// =======================================
// QUERY AND RESPONSE INTERFACES
// =======================================

export interface ReportQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: {
    type?: ReportType[];
    category?: ReportCategory[];
    status?: ReportStatus[];
    scope?: ReportScope[];
    companyId?: string;
    userId?: string;
    tags?: string[];
    dateRange?: {
      from: Date;
      to: Date;
    };
  };
  search?: string;
}

export interface ReportListResponse {
  reports: Report[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReportGenerationOptions {
  async?: boolean;
  cache?: boolean;
  format?: ReportFormat;
  includeMetrics?: boolean;
  webhook?: string; // URL to notify when report is ready
}

export interface ReportGenerationResult {
  reportId: string;
  status: 'started' | 'completed' | 'failed';
  fileUrl?: string;
  error?: string;
  executionTime?: number;
  recordCount?: number;
  metrics?: ReportMetrics[];
}

// =======================================
// PREDEFINED REPORT CONFIGURATIONS
// =======================================

export interface PredefinedReportConfig {
  name: string;
  category: ReportCategory;
  description: string;
  queryTemplate: string;
  defaultFilters: ReportFilter[];
  requiredPermissions: string[];
  supportedFormats: ReportFormat[];
  estimatedExecutionTime: number; // in seconds
  maxRecords: number;
}

// =======================================
// DASHBOARD INTERFACES
// =======================================

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'text';
  title: string;
  reportId?: string;
  query?: string;
  config: Record<string, any>;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  layout: 'grid' | 'flex';
  refreshInterval?: number;
  isPublic: boolean;
  companyId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// =======================================
// SERVICE INTERFACES
// =======================================

export interface IReportService {
  create(dto: CreateReportDto): Promise<Report>;
  findById(id: string): Promise<Report | null>;
  findAll(query: ReportQuery): Promise<ReportListResponse>;
  update(id: string, dto: UpdateReportDto): Promise<Report>;
  delete(id: string): Promise<void>;
  generate(id: string, options?: ReportGenerationOptions): Promise<ReportGenerationResult>;
  schedule(id: string, scheduleDto: CreateScheduleDto): Promise<ReportSchedule>;
  share(shareDto: ShareReportDto): Promise<ReportShare>;
  getMetrics(reportId: string): Promise<ReportMetrics[]>;
}

export interface IReportTemplateService {
  create(dto: CreateReportTemplateDto): Promise<ReportTemplate>;
  findAll(): Promise<ReportTemplate[]>;
  findByCategory(category: ReportCategory): Promise<ReportTemplate[]>;
  createReportFromTemplate(templateId: string, parameters: Record<string, any>): Promise<Report>;
}

// =======================================
// ERROR INTERFACES
// =======================================

export interface ReportError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export class ReportGenerationError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ReportGenerationError';
  }
}

// =======================================
// UTILITY TYPES
// =======================================

export type ReportWithRelations = Report & {
  template?: ReportTemplate;
  metrics?: ReportMetrics[];
  schedule?: ReportSchedule;
  shares?: ReportShare[];
  auditLogs?: ReportAuditLog[];
};

export type ReportTemplateWithUsage = ReportTemplate & {
  reports?: Report[];
  _count?: {
    reports: number;
  };
};

// =======================================
// CONSTANTS
// =======================================

export const REPORT_CONSTANTS = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_RECORDS_PER_REPORT: 100000,
  DEFAULT_CACHE_TIMEOUT: 300, // 5 minutes
  DEFAULT_EXECUTION_TIMEOUT: 600, // 10 minutes
  SUPPORTED_TIMEZONES: [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Dubai',
    'Asia/Riyadh'
  ],
} as const;

export const PREDEFINED_REPORTS: Record<string, PredefinedReportConfig> = {
  RECRUITMENT_SUMMARY: {
    name: 'Recruitment Summary',
    category: 'RECRUITMENT_METRICS' as ReportCategory,
    description: 'Overview of recruitment activities and metrics',
    queryTemplate: `
      SELECT 
        COUNT(*) as total_applications,
        COUNT(DISTINCT candidate_id) as unique_candidates,
        COUNT(DISTINCT job_id) as active_jobs
      FROM applications 
      WHERE created_at >= $1 AND created_at <= $2
    `,
    defaultFilters: [
      {
        field: 'dateRange',
        operator: 'between',
        value: { from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() },
        label: 'Last 30 days'
      }
    ],
    requiredPermissions: ['read:reports', 'read:applications'],
    supportedFormats: ['PDF', 'EXCEL', 'CSV'] as ReportFormat[],
    estimatedExecutionTime: 5,
    maxRecords: 10000
  }
} as const;