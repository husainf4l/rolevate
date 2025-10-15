import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { ExecutionStatus, ReportStatus, ReportType, ReportCategory } from './report.enums';
import { ReportTemplate } from './report-template.entity';
import { ReportMetrics } from './report-metrics.entity';
import { ReportSchedule } from './report-schedule.entity';
import { ReportShare } from './report-share.entity';
import { ReportAuditLog } from './report-audit-log.entity';
import { AuditAction } from './report.enums';
import { User } from '../user/user.entity';
import { Company } from '../company/company.entity';
import { CreateReportInput } from './create-report.input';
import { UpdateReportInput } from './update-report.input';
import { ReportFilterInput } from './report-filter.input';
import { Application } from '../application/application.entity';
import { Job, JobStatus } from '../job/job.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(ReportTemplate)
    private reportTemplateRepository: Repository<ReportTemplate>,
    @InjectRepository(ReportMetrics)
    private reportMetricsRepository: Repository<ReportMetrics>,
    @InjectRepository(ReportSchedule)
    private reportScheduleRepository: Repository<ReportSchedule>,
    @InjectRepository(ReportShare)
    private reportShareRepository: Repository<ReportShare>,
    @InjectRepository(ReportAuditLog)
    private reportAuditLogRepository: Repository<ReportAuditLog>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
  ) {}

  async create(createReportInput: CreateReportInput, userId?: string): Promise<Report> {
    const reportData = {
      ...createReportInput,
      userId: createReportInput.userId || userId,
      filters: createReportInput.filters ? JSON.parse(createReportInput.filters) : undefined,
      parameters: createReportInput.parameters ? JSON.parse(createReportInput.parameters) : undefined,
      config: createReportInput.config ? JSON.parse(createReportInput.config) : undefined,
    };

    const report = this.reportRepository.create(reportData);
    const savedReport = await this.reportRepository.save(report);

    // Log audit event
    await this.logAuditEvent(savedReport.id, 'CREATED', userId);

    const result = await this.findOne(savedReport.id);
    if (!result) throw new Error('Failed to create report');
    return result;
  }

  async findAll(filter?: ReportFilterInput): Promise<Report[]> {
    const queryBuilder = this.reportRepository.createQueryBuilder('report')
      .leftJoinAndSelect('report.user', 'user')
      .leftJoinAndSelect('report.company', 'company')
      .leftJoinAndSelect('report.template', 'template')
      .leftJoinAndSelect('report.metrics', 'metrics')
      .leftJoinAndSelect('report.shares', 'shares')
      .leftJoinAndSelect('report.auditLogs', 'auditLogs');

    if (filter) {
      if (filter.type) {
        queryBuilder.andWhere('report.type = :type', { type: filter.type });
      }
      if (filter.category) {
        queryBuilder.andWhere('report.category = :category', { category: filter.category });
      }
      if (filter.status) {
        queryBuilder.andWhere('report.status = :status', { status: filter.status });
      }
      if (filter.scope) {
        queryBuilder.andWhere('report.scope = :scope', { scope: filter.scope });
      }
      if (filter.userId) {
        queryBuilder.andWhere('report.userId = :userId', { userId: filter.userId });
      }
      if (filter.companyId) {
        queryBuilder.andWhere('report.companyId = :companyId', { companyId: filter.companyId });
      }
      if (filter.isPublic !== undefined) {
        queryBuilder.andWhere('report.isPublic = :isPublic', { isPublic: filter.isPublic });
      }
      if (filter.isArchived !== undefined) {
        queryBuilder.andWhere('report.isArchived = :isArchived', { isArchived: filter.isArchived });
      }
      if (filter.search) {
        queryBuilder.andWhere(
          '(report.name ILIKE :search OR report.description ILIKE :search)',
          { search: `%${filter.search}%` }
        );
      }
      if (filter.tags && filter.tags.length > 0) {
        queryBuilder.andWhere('report.tags && :tags', { tags: filter.tags });
      }
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Report | null> {
    return this.reportRepository.findOne({
      where: { id },
      relations: ['user', 'company', 'template', 'metrics', 'shares', 'auditLogs', 'schedule'],
    });
  }

  async findByUserId(userId: string): Promise<Report[]> {
    return this.reportRepository.find({
      where: { userId },
      relations: ['user', 'company', 'template', 'metrics', 'shares', 'auditLogs'],
    });
  }

  async findByCompanyId(companyId: string): Promise<Report[]> {
    return this.reportRepository.find({
      where: { companyId },
      relations: ['user', 'company', 'template', 'metrics', 'shares', 'auditLogs'],
    });
  }

  async update(id: string, updateReportInput: UpdateReportInput, userId?: string): Promise<Report | null> {
    const updateData = {
      ...updateReportInput,
      filters: updateReportInput.filters ? JSON.parse(updateReportInput.filters) : undefined,
      parameters: updateReportInput.parameters ? JSON.parse(updateReportInput.parameters) : undefined,
      config: updateReportInput.config ? JSON.parse(updateReportInput.config) : undefined,
    };

    await this.reportRepository.update(id, updateData);

    // Log audit event
    await this.logAuditEvent(id, 'UPDATED', userId);

    return this.findOne(id);
  }

  async remove(id: string, userId?: string): Promise<boolean> {
    // Log audit event before deletion
    await this.logAuditEvent(id, 'DELETED', userId);

    const result = await this.reportRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async generateReport(id: string, userId?: string): Promise<Report | null> {
    const report = await this.findOne(id);
    if (!report) return null;

    // Update execution status
    await this.reportRepository.update(id, {
      executionStatus: ExecutionStatus.RUNNING,
      generatedAt: new Date(),
      generatedBy: userId,
    });

    try {
      let reportData: any = {};

      // Generate report data based on category
      switch (report.category) {
        case ReportCategory.USER_ACTIVITY:
          reportData = await this.generateUserActivityReport(report);
          break;
        case ReportCategory.APPLICATION_TRENDS:
          reportData = await this.generateApplicationStatsReport(report);
          break;
        case ReportCategory.JOB_ANALYTICS:
          reportData = await this.generateJobAnalyticsReport(report);
          break;
        case ReportCategory.COMPANY_OVERVIEW:
          reportData = await this.generateCompanyOverviewReport(report);
          break;
        case ReportCategory.SECURITY_AUDIT:
          reportData = await this.generateAuditReport(report);
          break;
        case ReportCategory.CUSTOM_ANALYTICS:
          reportData = await this.generateCustomReport(report);
          break;
        default:
          throw new Error(`Unsupported report category: ${report.category}`);
      }

      // Update report with generated data
      await this.reportRepository.update(id, {
        executionStatus: ExecutionStatus.SUCCESS,
        status: ReportStatus.COMPLETED,
        data: reportData,
        fileUrl: this.generateFileUrl(id, report.category),
      });

      // Log audit event
      await this.logAuditEvent(id, 'EXECUTED', userId);

      return this.findOne(id);
    } catch (error) {
      // Update status to failed
      await this.reportRepository.update(id, {
        executionStatus: ExecutionStatus.FAILED,
        status: ReportStatus.FAILED,
      });

      // Log audit event
      await this.logAuditEvent(id, 'EXECUTED_FAILED', userId);

      throw error;
    }
  }

  async archiveReport(id: string, userId?: string): Promise<Report | null> {
    await this.reportRepository.update(id, {
      isArchived: true,
      archivedAt: new Date(),
    });

    // Log audit event
    await this.logAuditEvent(id, 'ARCHIVED', userId);

    return this.findOne(id);
  }

  private generateFileUrl(reportId: string, category: ReportCategory): string {
    // Placeholder for actual file generation and URL creation
    // In a real implementation, this would generate a file and return its URL
    return `/reports/${reportId}/${category.toLowerCase()}.pdf`;
  }

  private async generateUserActivityReport(report: Report): Promise<Record<string, any>> {
    // Aggregate user activity data
    const userCount = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({
      where: { updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
    });

    return {
      totalUsers: userCount,
      activeUsers,
      activityRate: userCount > 0 ? (activeUsers / userCount) * 100 : 0,
      generatedAt: new Date().toISOString(),
    };
  }

  private async generateApplicationStatsReport(report: Report): Promise<Record<string, any>> {
    // Aggregate application statistics
    const totalApplications = await this.applicationRepository.count();
    const applicationsByStatus = await this.applicationRepository
      .createQueryBuilder('application')
      .select('application.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('application.status')
      .getRawMany();

    return {
      totalApplications,
      applicationsByStatus,
      generatedAt: new Date().toISOString(),
    };
  }

  private async generateJobAnalyticsReport(report: Report): Promise<Record<string, any>> {
    // Aggregate job analytics
    const totalJobs = await this.jobRepository.count();
    const activeJobs = await this.jobRepository.count({ where: { status: JobStatus.ACTIVE } });

    return {
      totalJobs,
      activeJobs,
      inactiveJobs: totalJobs - activeJobs,
      generatedAt: new Date().toISOString(),
    };
  }

  private async generateCompanyOverviewReport(report: Report): Promise<Record<string, any>> {
    // Aggregate company overview
    const totalCompanies = await this.companyRepository.count();
    const companiesWithUsers = await this.companyRepository
      .createQueryBuilder('company')
      .leftJoin('company.users', 'users')
      .groupBy('company.id')
      .having('COUNT(users.id) > 0')
      .getCount();

    return {
      totalCompanies,
      companiesWithUsers,
      companiesWithoutUsers: totalCompanies - companiesWithUsers,
      generatedAt: new Date().toISOString(),
    };
  }

  private async generateAuditReport(report: Report): Promise<Record<string, any>> {
    // Aggregate audit data from report audit logs
    const totalAuditLogs = await this.reportAuditLogRepository.count();
    const auditLogsByAction = await this.reportAuditLogRepository
      .createQueryBuilder('audit')
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.action')
      .getRawMany();

    return {
      totalAuditLogs,
      auditLogsByAction,
      generatedAt: new Date().toISOString(),
    };
  }

  private async generateCustomReport(report: Report): Promise<Record<string, any>> {
    // Custom report - use the query field or parameters
    // For now, return a placeholder
    return {
      customReport: true,
      query: report.query,
      parameters: report.parameters,
      generatedAt: new Date().toISOString(),
    };
  }

  private async logAuditEvent(reportId: string, action: string, userId?: string): Promise<void> {
    const auditLog = this.reportAuditLogRepository.create({
      reportId,
      action: action as AuditAction,
      userId,
      success: true,
    });
    await this.reportAuditLogRepository.save(auditLog);
  }
}