import { registerEnumType } from '@nestjs/graphql';

export enum ReportType {
  ANALYTICS = 'ANALYTICS',
  PERFORMANCE = 'PERFORMANCE',
  COMPLIANCE = 'COMPLIANCE',
  OPERATIONAL = 'OPERATIONAL',
  FINANCIAL = 'FINANCIAL',
  SUMMARY = 'SUMMARY',
  DETAILED = 'DETAILED',
  CUSTOM = 'CUSTOM',
}

export enum ReportCategory {
  RECRUITMENT_METRICS = 'RECRUITMENT_METRICS',
  CANDIDATE_PIPELINE = 'CANDIDATE_PIPELINE',
  INTERVIEW_ANALYTICS = 'INTERVIEW_ANALYTICS',
  HIRING_FUNNEL = 'HIRING_FUNNEL',
  TIME_TO_HIRE = 'TIME_TO_HIRE',
  COST_PER_HIRE = 'COST_PER_HIRE',
  SOURCE_EFFECTIVENESS = 'SOURCE_EFFECTIVENESS',
  COMPANY_OVERVIEW = 'COMPANY_OVERVIEW',
  DEPARTMENT_ANALYTICS = 'DEPARTMENT_ANALYTICS',
  EMPLOYEE_METRICS = 'EMPLOYEE_METRICS',
  SUBSCRIPTION_USAGE = 'SUBSCRIPTION_USAGE',
  JOB_PERFORMANCE = 'JOB_PERFORMANCE',
  APPLICATION_TRENDS = 'APPLICATION_TRENDS',
  JOB_ANALYTICS = 'JOB_ANALYTICS',
  MARKET_ANALYSIS = 'MARKET_ANALYSIS',
  COMMUNICATION_METRICS = 'COMMUNICATION_METRICS',
  ENGAGEMENT_ANALYTICS = 'ENGAGEMENT_ANALYTICS',
  RESPONSE_RATES = 'RESPONSE_RATES',
  USER_ACTIVITY = 'USER_ACTIVITY',
  SYSTEM_PERFORMANCE = 'SYSTEM_PERFORMANCE',
  SECURITY_AUDIT = 'SECURITY_AUDIT',
  ERROR_ANALYTICS = 'ERROR_ANALYTICS',
  BILLING_SUMMARY = 'BILLING_SUMMARY',
  REVENUE_ANALYTICS = 'REVENUE_ANALYTICS',
  COST_ANALYSIS = 'COST_ANALYSIS',
  CUSTOM_ANALYTICS = 'CUSTOM_ANALYTICS',
}

export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
  JSON = 'JSON',
  HTML = 'HTML',
  DASHBOARD = 'DASHBOARD',
}

export enum ReportStatus {
  DRAFT = 'DRAFT',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SCHEDULED = 'SCHEDULED',
  ARCHIVED = 'ARCHIVED',
}

export enum ReportScope {
  GLOBAL = 'GLOBAL',
  COMPANY = 'COMPANY',
  DEPARTMENT = 'DEPARTMENT',
  USER = 'USER',
}

export enum ReportPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum ReportDataSource {
  APPLICATIONS = 'APPLICATIONS',
  CANDIDATES = 'CANDIDATES',
  JOBS = 'JOBS',
  INTERVIEWS = 'INTERVIEWS',
  USERS = 'USERS',
  COMPANIES = 'COMPANIES',
  COMMUNICATIONS = 'COMMUNICATIONS',
  SECURITY_LOGS = 'SECURITY_LOGS',
  CUSTOM_QUERY = 'CUSTOM_QUERY',
  MIXED = 'MIXED',
}

export enum ExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  TIMEOUT = 'TIMEOUT',
}

export enum ReportMetricType {
  COUNT = 'COUNT',
  SUM = 'SUM',
  AVERAGE = 'AVERAGE',
  PERCENTAGE = 'PERCENTAGE',
  TREND = 'TREND',
  COMPARISON = 'COMPARISON',
  DISTRIBUTION = 'DISTRIBUTION',
  CUSTOM = 'CUSTOM',
}

export enum ReportFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM',
}

export enum ScheduleStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum ReportShareType {
  VIEW = 'VIEW',
  EDIT = 'EDIT',
  ADMIN = 'ADMIN',
}

export enum SharePermission {
  VIEW_ONLY = 'VIEW_ONLY',
  EDIT = 'EDIT',
  FULL_ACCESS = 'FULL_ACCESS',
}

export enum AuditAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
  GENERATED = 'GENERATED',
  ACCESSED = 'ACCESSED',
  SHARED = 'SHARED',
  DOWNLOADED = 'DOWNLOADED',
  SCHEDULED = 'SCHEDULED',
  UNSCHEDULED = 'UNSCHEDULED',
  ARCHIVED = 'ARCHIVED',
  RESTORED = 'RESTORED',
  PERMISSIONS_CHANGED = 'PERMISSIONS_CHANGED',
  TEMPLATE_APPLIED = 'TEMPLATE_APPLIED',
  EXECUTION_STARTED = 'EXECUTION_STARTED',
  EXECUTION_COMPLETED = 'EXECUTION_COMPLETED',
  EXECUTION_FAILED = 'EXECUTION_FAILED',
  SHARE_REVOKED = 'SHARE_REVOKED',
}

// Register all enums with GraphQL
registerEnumType(ReportType, { name: 'ReportType' });
registerEnumType(ReportCategory, { name: 'ReportCategory' });
registerEnumType(ReportFormat, { name: 'ReportFormat' });
registerEnumType(ReportStatus, { name: 'ReportStatus' });
registerEnumType(ReportScope, { name: 'ReportScope' });
registerEnumType(ReportPriority, { name: 'ReportPriority' });
registerEnumType(ReportDataSource, { name: 'ReportDataSource' });
registerEnumType(ExecutionStatus, { name: 'ExecutionStatus' });
registerEnumType(ReportMetricType, { name: 'ReportMetricType' });
registerEnumType(ReportFrequency, { name: 'ReportFrequency' });
registerEnumType(ScheduleStatus, { name: 'ScheduleStatus' });
registerEnumType(ReportShareType, { name: 'ReportShareType' });
registerEnumType(SharePermission, { name: 'SharePermission' });
registerEnumType(AuditAction, { name: 'AuditAction' });
