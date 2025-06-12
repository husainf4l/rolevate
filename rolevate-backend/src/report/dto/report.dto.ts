import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ApplicationStatus,
  InterviewStatus,
  UserRole,
  SubscriptionPlan,
  ExperienceLevel,
  WorkType,
  FitRecommendation,
} from '@prisma/client';

export enum ReportType {
  OVERVIEW = 'overview',
  APPLICATIONS = 'applications',
  INTERVIEWS = 'interviews',
  JOBPOSTS = 'jobposts',
  CANDIDATES = 'candidates',
  CV_ANALYSIS = 'cv_analysis',
  RECRUITMENT_FUNNEL = 'recruitment_funnel',
  HIRING_METRICS = 'hiring_metrics',
  PERFORMANCE = 'performance',
  SUBSCRIPTION_USAGE = 'subscription_usage',
}

export enum ReportPeriod {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  THIS_WEEK = 'this_week',
  LAST_WEEK = 'last_week',
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  THIS_QUARTER = 'this_quarter',
  LAST_QUARTER = 'last_quarter',
  THIS_YEAR = 'this_year',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom',
}

export enum ReportFormat {
  JSON = 'json',
  CSV = 'csv',
  PDF = 'pdf',
  EXCEL = 'excel',
}

export class GenerateReportDto {
  @IsEnum(ReportType)
  type: ReportType;

  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod = ReportPeriod.THIS_MONTH;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat = ReportFormat.JSON;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metrics?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  jobPostIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  candidateIds?: string[];

  @IsOptional()
  @IsArray()
  @IsEnum(ApplicationStatus, { each: true })
  applicationStatuses?: ApplicationStatus[];

  @IsOptional()
  @IsArray()
  @IsEnum(InterviewStatus, { each: true })
  interviewStatuses?: InterviewStatus[];

  @IsOptional()
  @IsBoolean()
  includeDetails?: boolean = false;

  @IsOptional()
  @IsBoolean()
  compareWithPrevious?: boolean = false;

  @IsOptional()
  @IsString()
  groupBy?: string; // day, week, month, quarter, year
}

export class ReportQueryDto {
  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class DashboardStatsDto {
  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod = ReportPeriod.THIS_MONTH;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  includeComparison?: boolean = true;
}

export class RecruitmentFunnelDto {
  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod = ReportPeriod.THIS_MONTH;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  jobPostIds?: string[];

  @IsOptional()
  @IsBoolean()
  includeConversionRates?: boolean = true;
}

export class HiringMetricsDto {
  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod = ReportPeriod.THIS_MONTH;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  groupBy?: 'day' | 'week' | 'month' = 'month';

  @IsOptional()
  @IsBoolean()
  includeAverages?: boolean = true;
}

export class PerformanceReportDto {
  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod = ReportPeriod.THIS_MONTH;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles?: UserRole[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  userIds?: string[];
}

export class SubscriptionUsageDto {
  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod = ReportPeriod.THIS_MONTH;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  includeProjections?: boolean = false;
}

// Response DTOs for better type safety
export interface ReportMetadata {
  reportId: string;
  type: ReportType;
  period: ReportPeriod;
  startDate: string;
  endDate: string;
  generatedAt: string;
  generatedBy: string;
  companyId: string;
  totalRecords: number;
  format: ReportFormat;
}

export interface DashboardStats {
  period: string;
  comparison?: {
    period: string;
    percentageChange: number;
  };
  
  applications: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    hired: number;
  };
  
  interviews: {
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
    averageScore: number;
  };
  
  jobPosts: {
    total: number;
    active: number;
    expired: number;
    averageApplicationsPerJob: number;
  };
  
  candidates: {
    total: number;
    new: number;
    active: number;
  };
  
  conversionRates: {
    applicationToInterview: number;
    interviewToHire: number;
    overallConversion: number;
  };
}

export interface RecruitmentFunnel {
  jobViews: number;
  applications: number;
  cvScreening: number;
  interviews: number;
  offers: number;
  hires: number;
  
  conversionRates: {
    viewToApplication: number;
    applicationToScreening: number;
    screeningToInterview: number;
    interviewToOffer: number;
    offerToHire: number;
  };
  
  stages: Array<{
    stage: string;
    count: number;
    percentage: number;
    dropoffRate: number;
  }>;
}

export interface HiringMetrics {
  timeToHire: {
    average: number; // days
    median: number;
    fastest: number;
    slowest: number;
  };
  
  costPerHire: {
    average: number;
    total: number;
  };
  
  sourceEffectiveness: Array<{
    source: string;
    applications: number;
    hires: number;
    conversionRate: number;
    costPerHire: number;
  }>;
  
  qualityOfHire: {
    averageScore: number;
    retentionRate: number;
  };
  
  recruitment: {
    activeJobs: number;
    totalApplications: number;
    totalHires: number;
    averageApplicationsPerJob: number;
  };
}

export interface PerformanceReport {
  recruiters: Array<{
    id: string;
    name: string;
    role: UserRole;
    metrics: {
      jobPostsCreated: number;
      applicationsReviewed: number;
      interviewsConducted: number;
      hiresCompleted: number;
      averageTimeToHire: number;
      conversionRate: number;
    };
  }>;
  
  topPerformers: Array<{
    id: string;
    name: string;
    metric: string;
    value: number;
    rank: number;
  }>;
  
  teamMetrics: {
    totalRecruiters: number;
    averageHiresPerRecruiter: number;
    teamConversionRate: number;
    collaborationScore: number;
  };
}

export interface SubscriptionUsage {
  plan: SubscriptionPlan;
  currentUsage: {
    jobPosts: {
      used: number;
      limit: number;
      percentage: number;
    };
    candidates: {
      used: number;
      limit: number;
      percentage: number;
    };
    interviews: {
      used: number;
      limit: number;
      percentage: number;
    };
  };
  
  projections?: {
    estimatedUsageEndOfMonth: {
      jobPosts: number;
      candidates: number;
      interviews: number;
    };
    recommendedPlan?: SubscriptionPlan;
  };
  
  usage_history: Array<{
    date: string;
    jobPosts: number;
    candidates: number;
    interviews: number;
  }>;
}
