import { IsOptional, IsString, IsEnum, IsBoolean, IsNumber, IsDateString } from 'class-validator';

// User Management DTOs
export class UpdateUserStatusDto {
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UserFilterDto {
  @IsOptional()
  @IsEnum(['SYSTEM', 'COMPANY', 'CANDIDATE', 'ADMIN'])
  userType?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 10;
}

// Subscription Management DTOs
export class UpdateSubscriptionDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

// Analytics DTOs
export class AnalyticsFilterDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  groupBy?: string;
}

// Security DTOs
export class SecurityLogFilterDto {
  @IsOptional()
  @IsEnum(['AUTH_FAILURE', 'AUTH_SUCCESS', 'UNAUTHORIZED_ACCESS', 'DATA_BREACH_ATTEMPT', 'SUSPICIOUS_ACTIVITY'])
  type?: string;

  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  severity?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 50;
}

// Notification DTOs
export class BroadcastNotificationDto {
  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsEnum(['INFO', 'SUCCESS', 'WARNING', 'ERROR'])
  type?: string;

  @IsOptional()
  @IsEnum(['SYSTEM', 'APPLICATION', 'SECURITY', 'COMMUNICATION', 'CANDIDATE', 'COMPANY'])
  category?: string;

  @IsOptional()
  @IsEnum(['SYSTEM', 'COMPANY', 'CANDIDATE', 'ADMIN'])
  targetUserType?: string;
}

// Response DTOs
export interface AdminDashboardStatsDto {
  totalUsers: number;
  activeUsers: number;
  totalCandidates: number;
  totalCompanies: number;
  totalApplications: number;
  totalJobs: number;
  recentSignups: number;
  securityAlerts: number;
}

export interface UserSummaryDto {
  id: string;
  email: string;
  name: string;
  userType: string;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface SecuritySummaryDto {
  id: string;
  type: string;
  severity: string;
  userId?: string;
  userEmail?: string;
  createdAt: Date;
  details: any;
}
