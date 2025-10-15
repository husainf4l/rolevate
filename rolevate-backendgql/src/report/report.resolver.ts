import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportDto } from './report.dto';
import { CreateReportInput } from './create-report.input';
import { UpdateReportInput } from './update-report.input';
import { ReportFilterInput } from './report-filter.input';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Resolver(() => ReportDto)
export class ReportResolver {
  constructor(private readonly reportService: ReportService) {}

  @Mutation(() => ReportDto)
  @UseGuards(JwtAuthGuard)
  async createReport(
    @Args('input') createReportInput: CreateReportInput,
    @Context() context: any,
  ): Promise<ReportDto> {
    const userId = context.req.user.userId;
    const report = await this.reportService.create(createReportInput, userId);
    return this.mapToDto(report);
  }

  @Query(() => [ReportDto], { name: 'reports' })
  async findAll(
    @Args('filter', { nullable: true }) filter?: ReportFilterInput,
  ): Promise<ReportDto[]> {
    const reports = await this.reportService.findAll(filter);
    return reports.map(report => this.mapToDto(report));
  }

  @Query(() => ReportDto, { name: 'report', nullable: true })
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<ReportDto | null> {
    const report = await this.reportService.findOne(id);
    return report ? this.mapToDto(report) : null;
  }

  @Query(() => [ReportDto], { name: 'reportsByUser' })
  async findByUserId(@Args('userId', { type: () => ID }) userId: string): Promise<ReportDto[]> {
    const reports = await this.reportService.findByUserId(userId);
    return reports.map(report => this.mapToDto(report));
  }

  @Query(() => [ReportDto], { name: 'reportsByCompany' })
  async findByCompanyId(@Args('companyId', { type: () => ID }) companyId: string): Promise<ReportDto[]> {
    const reports = await this.reportService.findByCompanyId(companyId);
    return reports.map(report => this.mapToDto(report));
  }

  @Mutation(() => ReportDto, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async updateReport(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateReportInput: UpdateReportInput,
    @Context() context: any,
  ): Promise<ReportDto | null> {
    const userId = context.req.user.userId;
    const report = await this.reportService.update(id, updateReportInput, userId);
    return report ? this.mapToDto(report) : null;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async removeReport(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.req.user.userId;
    return this.reportService.remove(id, userId);
  }

  @Mutation(() => ReportDto, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async generateReport(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: any,
  ): Promise<ReportDto | null> {
    const userId = context.req.user.userId;
    const report = await this.reportService.generateReport(id, userId);
    return report ? this.mapToDto(report) : null;
  }

  @Mutation(() => ReportDto, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async archiveReport(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: any,
  ): Promise<ReportDto | null> {
    const userId = context.req.user.userId;
    const report = await this.reportService.archiveReport(id, userId);
    return report ? this.mapToDto(report) : null;
  }

  private mapToDto(report: any): ReportDto {
    return {
      id: report.id,
      name: report.name,
      description: report.description,
      type: report.type,
      category: report.category,
      format: report.format,
      status: report.status,
      scope: report.scope,
      priority: report.priority,
      query: report.query,
      dataSource: report.dataSource,
      filters: report.filters,
      parameters: report.parameters,
      config: report.config,
      executionStatus: report.executionStatus,
      maxExecutionTime: report.maxExecutionTime,
      timeoutAt: report.timeoutAt,
      data: report.data,
      fileUrl: report.fileUrl,
      fileName: report.fileName,
      fileSize: report.fileSize,
      fileMimeType: report.fileMimeType,
      metrics: report.metrics?.map((metric: any) => ({
        id: metric.id,
        metricName: metric.metricName,
        metricValue: metric.metricValue,
        metricType: metric.metricType,
        dimension: metric.dimension,
        period: metric.period,
        metadata: metric.metadata,
        createdAt: metric.createdAt,
      })) || [],
      templateId: report.templateId,
      companyId: report.companyId,
      userId: report.userId,
      generatedBy: report.generatedBy,
      generatedAt: report.generatedAt,
      executionTime: report.executionTime,
      recordCount: report.recordCount,
      expiresAt: report.expiresAt,
      autoDelete: report.autoDelete,
      isPublic: report.isPublic,
      isArchived: report.isArchived,
      archivedAt: report.archivedAt,
      tags: report.tags || [],
      version: report.version,
      checksum: report.checksum,
      shares: report.shares?.map((share: any) => ({
        id: share.id,
        sharedWith: share.sharedWith,
        permission: share.permission,
        accessToken: share.accessToken,
        expiresAt: share.expiresAt,
        isRevoked: share.isRevoked,
        revokedAt: share.revokedAt,
        accessCount: share.accessCount,
        maxAccessCount: share.maxAccessCount,
        lastAccessed: share.lastAccessed,
        ipRestrictions: share.ipRestrictions,
        isPublic: share.isPublic,
        requireLogin: share.requireLogin,
        allowDownload: share.allowDownload,
        watermark: share.watermark,
        sharedBy: share.sharedBy,
        shareNote: share.shareNote,
        createdAt: share.createdAt,
        updatedAt: share.updatedAt,
      })) || [],
      auditLogs: report.auditLogs?.map((log: any) => ({
        id: log.id,
        action: log.action,
        success: log.success,
        sessionId: log.sessionId,
        requestId: log.requestId,
        duration: log.duration,
        oldValues: log.oldValues,
        newValues: log.newValues,
        riskLevel: log.riskLevel,
        userId: log.userId,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt,
      })) || [],
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    };
  }
}