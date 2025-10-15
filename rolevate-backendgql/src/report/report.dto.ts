import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import {
  ReportType,
  ReportCategory,
  ReportFormat,
  ReportStatus,
  ReportScope,
  ReportPriority,
  ReportDataSource,
  ExecutionStatus,
} from './report.enums';

@ObjectType()
export class ReportMetricsDto {
  @Field(() => ID)
  id: string;

  @Field()
  metricName: string;

  @Field()
  metricValue: number;

  @Field()
  metricType: string;

  @Field({ nullable: true })
  dimension?: string;

  @Field({ nullable: true })
  period?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  metadata?: Record<string, any>;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class ReportShareDto {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  sharedWith?: string;

  @Field()
  permission: string;

  @Field({ nullable: true })
  accessToken?: string;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field()
  isRevoked: boolean;

  @Field({ nullable: true })
  revokedAt?: Date;

  @Field()
  accessCount: number;

  @Field({ nullable: true })
  maxAccessCount?: number;

  @Field({ nullable: true })
  lastAccessed?: Date;

  @Field(() => [String])
  ipRestrictions: string[];

  @Field()
  isPublic: boolean;

  @Field()
  requireLogin: boolean;

  @Field()
  allowDownload: boolean;

  @Field({ nullable: true })
  watermark?: string;

  @Field()
  sharedBy: string;

  @Field({ nullable: true })
  shareNote?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class ReportAuditLogDto {
  @Field(() => ID)
  id: string;

  @Field()
  action: string;

  @Field()
  success: boolean;

  @Field({ nullable: true })
  sessionId?: string;

  @Field({ nullable: true })
  requestId?: string;

  @Field({ nullable: true })
  duration?: number;

  @Field(() => GraphQLJSONObject, { nullable: true })
  oldValues?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  newValues?: Record<string, any>;

  @Field()
  riskLevel: string;

  @Field({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  ipAddress?: string;

  @Field({ nullable: true })
  userAgent?: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class ReportDto {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => ReportType)
  type: ReportType;

  @Field(() => ReportCategory)
  category: ReportCategory;

  @Field(() => ReportFormat)
  format: ReportFormat;

  @Field(() => ReportStatus)
  status: ReportStatus;

  @Field(() => ReportScope)
  scope: ReportScope;

  @Field(() => ReportPriority)
  priority: ReportPriority;

  @Field({ nullable: true })
  query?: string;

  @Field(() => ReportDataSource)
  dataSource: ReportDataSource;

  @Field(() => GraphQLJSONObject, { nullable: true })
  filters?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  parameters?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  config?: Record<string, any>;

  @Field(() => ExecutionStatus)
  executionStatus: ExecutionStatus;

  @Field({ nullable: true })
  maxExecutionTime?: number;

  @Field({ nullable: true })
  timeoutAt?: Date;

  @Field(() => GraphQLJSONObject, { nullable: true })
  data?: Record<string, any>;

  @Field({ nullable: true })
  fileUrl?: string;

  @Field({ nullable: true })
  fileName?: string;

  @Field({ nullable: true })
  fileSize?: number;

  @Field({ nullable: true })
  fileMimeType?: string;

  @Field(() => [ReportMetricsDto])
  metrics: ReportMetricsDto[];

  @Field({ nullable: true })
  templateId?: string;

  @Field({ nullable: true })
  companyId?: string;

  @Field({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  generatedBy?: string;

  @Field({ nullable: true })
  generatedAt?: Date;

  @Field({ nullable: true })
  executionTime?: number;

  @Field({ nullable: true })
  recordCount?: number;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field()
  autoDelete: boolean;

  @Field()
  isPublic: boolean;

  @Field()
  isArchived: boolean;

  @Field({ nullable: true })
  archivedAt?: Date;

  @Field(() => [String])
  tags: string[];

  @Field()
  version: string;

  @Field({ nullable: true })
  checksum?: string;

  @Field(() => [ReportShareDto])
  shares: ReportShareDto[];

  @Field(() => [ReportAuditLogDto])
  auditLogs: ReportAuditLogDto[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}