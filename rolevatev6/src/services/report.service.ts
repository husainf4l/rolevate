import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apollo';

// Enums
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

export enum ExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface Report {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  category: ReportCategory;
  format: ReportFormat;
  status: ReportStatus;
  executionStatus: ExecutionStatus;
  data?: any;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
  generatedAt?: string;
  generatedBy?: string;
  executionTime?: number;
  recordCount?: number;
  expiresAt?: string;
  isPublic: boolean;
  isArchived: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ReportFilterInput {
  type?: ReportType;
  category?: ReportCategory;
  status?: ReportStatus;
  format?: ReportFormat;
  isArchived?: boolean;
}

export interface CreateReportInput {
  name: string;
  description?: string;
  type: ReportType;
  category: ReportCategory;
  format?: ReportFormat;
  scope?: string;
  priority?: string;
  query?: string;
  dataSource?: string;
  filters?: string;
  parameters?: string;
  config?: string;
  maxExecutionTime?: number;
  templateId?: string;
  companyId?: string;
  userId?: string;
  expiresAt?: string;
  autoDelete?: boolean;
  isPublic?: boolean;
  tags?: string[];
}

// GraphQL Queries
const GET_REPORTS = gql`
  query GetReports($filter: ReportFilterInput) {
    reports(filter: $filter) {
      data {
        id
        name
        description
        type
        category
        format
        status
        executionStatus
        fileUrl
        fileName
        fileSize
        fileMimeType
        generatedAt
        generatedBy
        executionTime
        recordCount
        expiresAt
        isPublic
        isArchived
        tags
        createdAt
        updatedAt
      }
      meta {
        total
        page
        limit
      }
    }
  }
`;

const GET_COMPANY_REPORTS = gql`
  query GetCompanyReports($companyId: ID!) {
    reportsByCompany(companyId: $companyId) {
      id
      name
      description
      type
      category
      format
      status
      executionStatus
      fileUrl
      fileName
      fileSize
      fileMimeType
      generatedAt
      generatedBy
      executionTime
      recordCount
      expiresAt
      isPublic
      isArchived
      tags
      createdAt
      updatedAt
    }
  }
`;

const GET_REPORT = gql`
  query GetReport($id: ID!) {
    report(id: $id) {
      id
      name
      description
      type
      category
      format
      status
      executionStatus
      data
      fileUrl
      fileName
      fileSize
      fileMimeType
      generatedAt
      generatedBy
      executionTime
      recordCount
      expiresAt
      isPublic
      isArchived
      archivedAt
      tags
      version
      checksum
      createdAt
      updatedAt
    }
  }
`;

const GENERATE_REPORT = gql`
  mutation GenerateReport($id: ID!) {
    generateReport(id: $id) {
      id
      name
      status
      executionStatus
      generatedAt
      fileUrl
    }
  }
`;

const CREATE_REPORT = gql`
  mutation CreateReport($input: CreateReportInput!) {
    createReport(input: $input) {
      id
      name
      description
      type
      category
      format
      status
      createdAt
    }
  }
`;

class ReportService {
  /**
   * Get all reports with optional filters
   */
  async getReports(filter?: ReportFilterInput): Promise<Report[]> {
    try {
      const { data } = await apolloClient.query<{ 
        reports: { 
          data: Report[]; 
          meta: { total: number; page: number; limit: number; }; 
        } 
      }>({
        query: GET_REPORTS,
        variables: filter ? { filter } : undefined,
        fetchPolicy: 'network-only',
      });

      return data?.reports?.data || [];
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  }

  /**
   * Get reports for a specific company
   */
  async getCompanyReports(companyId: string): Promise<Report[]> {
    try {
      const { data } = await apolloClient.query<{ reportsByCompany: Report[] }>({
        query: GET_COMPANY_REPORTS,
        variables: { companyId },
        fetchPolicy: 'network-only',
      });

      return data?.reportsByCompany || [];
    } catch (error) {
      console.error('Error fetching company reports:', error);
      throw error;
    }
  }

  /**
   * Get a single report by ID
   */
  async getReport(id: string): Promise<Report> {
    try {
      const { data } = await apolloClient.query<{ report: Report }>({
        query: GET_REPORT,
        variables: { id },
        fetchPolicy: 'network-only',
      });

      if (!data?.report) {
        throw new Error('Report not found');
      }

      return data.report;
    } catch (error) {
      console.error('Error fetching report:', error);
      throw error;
    }
  }

  /**
   * Generate a report
   */
  async generateReport(id: string): Promise<Report> {
    try {
      const { data } = await apolloClient.mutate<{ generateReport: Report }>({
        mutation: GENERATE_REPORT,
        variables: { id },
      });

      return data!.generateReport;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Create a new report definition
   */
  async createReport(input: CreateReportInput): Promise<Report> {
    try {
      const { data } = await apolloClient.mutate<{ createReport: Report }>({
        mutation: CREATE_REPORT,
        variables: { input },
      });

      return data!.createReport;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  }

  /**
   * Download a report file
   */
  downloadReport(fileUrl: string, fileName: string): void {
    // Handle both full URLs (AWS S3) and relative paths
    let downloadUrl = fileUrl;
    
    // If the URL is relative (starts with /), prepend the API base URL
    if (fileUrl.startsWith('/')) {
      // Remove /api from base URL if present, as reports are served from root
      const baseUrl = apolloClient.link?.toString().includes('192.168.1.210')
        ? 'http://192.168.1.210:4005'
        : window.location.origin;
      downloadUrl = `${baseUrl}${fileUrl}`;
    }
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    link.target = '_blank'; // Open in new tab as fallback
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const reportService = new ReportService();
export default reportService;
