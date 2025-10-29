import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PDFDocument from 'pdfkit';
import { Report } from './report.entity';
import { ExecutionStatus, ReportStatus, ReportType, ReportCategory, ReportFormat } from './report.enums';
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
import { parseJsonSafely } from '../utils/json.utils';
import { PaginationInput, createPaginationMeta, PaginatedResult } from '../common/pagination.dto';
import { AwsS3Service } from '../services/aws-s3.service';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

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
    private awsS3Service: AwsS3Service,
  ) {}

  async create(createReportInput: CreateReportInput, userId?: string): Promise<Report> {
    try {
      this.logger.log(`Creating report: ${createReportInput.name}`);
      
      const reportData = {
        ...createReportInput,
        userId: createReportInput.userId || userId,
        filters: parseJsonSafely(createReportInput.filters, 'filters'),
        parameters: parseJsonSafely(createReportInput.parameters, 'parameters'),
        config: parseJsonSafely(createReportInput.config, 'config'),
      };

      const report = this.reportRepository.create(reportData);
      const savedReport = await this.reportRepository.save(report);

      // Log audit event
      await this.logAuditEvent(savedReport.id, 'CREATED', userId);

      const result = await this.findOne(savedReport.id);
      if (!result) {
        throw new InternalServerErrorException('Failed to create report');
      }
      
      this.logger.log(`Report created successfully: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to create report: ${error.message}`, error.stack);
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create report');
    }
  }

  async findAll(filter?: ReportFilterInput, pagination?: PaginationInput): Promise<PaginatedResult<Report>> {
    try {
      this.logger.log('Finding all reports with filters and pagination');
      
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 20;
      const skip = (page - 1) * limit;

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

      const [data, total] = await queryBuilder
        .skip(skip)
        .take(limit)
        .orderBy('report.createdAt', 'DESC')
        .getManyAndCount();

      const meta = createPaginationMeta(page, limit, total);
      
      this.logger.log(`Found ${total} reports, returning page ${page} of ${meta.totalPages}`);
      
      return { data, meta };
    } catch (error) {
      this.logger.error(`Failed to find reports: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve reports');
    }
  }

  async findOne(id: string): Promise<Report | null> {
    try {
      const report = await this.reportRepository.findOne({
        where: { id },
        relations: ['user', 'company', 'template', 'metrics', 'shares', 'auditLogs', 'schedule'],
      });
      
      if (!report) {
        this.logger.warn(`Report not found: ${id}`);
        return null;
      }
      
      return report;
    } catch (error) {
      this.logger.error(`Failed to find report ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve report');
    }
  }

  async findByUserId(userId: string): Promise<Report[]> {
    try {
      this.logger.log(`Finding reports for user: ${userId}`);
      return await this.reportRepository.find({
        where: { userId },
        relations: ['user', 'company', 'template', 'metrics', 'shares', 'auditLogs'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Failed to find reports for user ${userId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve user reports');
    }
  }

  async findByCompanyId(companyId: string): Promise<Report[]> {
    try {
      this.logger.log(`Finding reports for company: ${companyId}`);
      return await this.reportRepository.find({
        where: { companyId },
        relations: ['user', 'company', 'template', 'metrics', 'shares', 'auditLogs'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Failed to find reports for company ${companyId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve company reports');
    }
  }

  async update(id: string, updateReportInput: UpdateReportInput, userId?: string): Promise<Report | null> {
    try {
      this.logger.log(`Updating report: ${id}`);
      
      const updateData = {
        ...updateReportInput,
        filters: parseJsonSafely(updateReportInput.filters, 'filters'),
        parameters: parseJsonSafely(updateReportInput.parameters, 'parameters'),
        config: parseJsonSafely(updateReportInput.config, 'config'),
      };

      await this.reportRepository.update(id, updateData);

      // Log audit event
      await this.logAuditEvent(id, 'UPDATED', userId);

      this.logger.log(`Report updated successfully: ${id}`);
      return this.findOne(id);
    } catch (error) {
      this.logger.error(`Failed to update report ${id}: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update report');
    }
  }

  async remove(id: string, userId?: string): Promise<boolean> {
    try {
      this.logger.log(`Removing report: ${id}`);
      
      // Log audit event before deletion
      await this.logAuditEvent(id, 'DELETED', userId);

      const result = await this.reportRepository.delete(id);
      const success = (result.affected ?? 0) > 0;
      
      if (success) {
        this.logger.log(`Report removed successfully: ${id}`);
      } else {
        this.logger.warn(`Report not found for deletion: ${id}`);
      }
      
      return success;
    } catch (error) {
      this.logger.error(`Failed to remove report ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to remove report');
    }
  }

  async generateReport(id: string, userId?: string): Promise<Report | null> {
    try {
      this.logger.log(`Starting report generation: ${id}`);
      
      const report = await this.findOne(id);
      if (!report) {
        throw new NotFoundException(`Report with ID ${id} not found`);
      }

      // Update execution status
      await this.reportRepository.update(id, {
        executionStatus: ExecutionStatus.RUNNING,
        generatedAt: new Date(),
        generatedBy: userId,
      });

      try {
        let reportData: any = {};
        const startTime = Date.now();

        // Generate report data based on category
        switch (report.category) {
          case ReportCategory.USER_ACTIVITY:
            reportData = await this.generateUserActivityReport(report);
            break;
          case ReportCategory.APPLICATION_TRENDS:
            reportData = await this.generateApplicationStatsReport(report);
            break;
          case ReportCategory.JOB_ANALYTICS:
          case ReportCategory.JOB_PERFORMANCE:
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
          // Recruitment categories - use application stats report as base
          case ReportCategory.RECRUITMENT_METRICS:
          case ReportCategory.CANDIDATE_PIPELINE:
          case ReportCategory.INTERVIEW_ANALYTICS:
          case ReportCategory.HIRING_FUNNEL:
          case ReportCategory.TIME_TO_HIRE:
          case ReportCategory.COST_PER_HIRE:
          case ReportCategory.SOURCE_EFFECTIVENESS:
            reportData = await this.generateApplicationStatsReport(report);
            break;
          // Company categories
          case ReportCategory.DEPARTMENT_ANALYTICS:
          case ReportCategory.EMPLOYEE_METRICS:
          case ReportCategory.SUBSCRIPTION_USAGE:
            reportData = await this.generateCompanyOverviewReport(report);
            break;
          // Communication categories
          case ReportCategory.COMMUNICATION_METRICS:
          case ReportCategory.ENGAGEMENT_ANALYTICS:
          case ReportCategory.RESPONSE_RATES:
            reportData = await this.generateCustomReport(report);
            break;
          // System categories
          case ReportCategory.SYSTEM_PERFORMANCE:
          case ReportCategory.ERROR_ANALYTICS:
            reportData = await this.generateAuditReport(report);
            break;
          // Financial categories
          case ReportCategory.BILLING_SUMMARY:
          case ReportCategory.REVENUE_ANALYTICS:
          case ReportCategory.COST_ANALYSIS:
            reportData = await this.generateCustomReport(report);
            break;
          // Market analysis
          case ReportCategory.MARKET_ANALYSIS:
            reportData = await this.generateJobAnalyticsReport(report);
            break;
          default:
            throw new BadRequestException(`Unsupported report category: ${report.category}`);
        }

        const executionTime = Date.now() - startTime;

        // Generate file and upload to S3
        const fileUrl = await this.generateAndUploadReportFile(id, report.category, report.format, reportData);

        // Update report with generated data
        await this.reportRepository.update(id, {
          executionStatus: ExecutionStatus.SUCCESS,
          status: ReportStatus.COMPLETED,
          data: reportData,
          fileUrl,
          fileName: `${report.name.replace(/[^a-z0-9]/gi, '-')}-${id}.${report.format.toLowerCase()}`,
          fileMimeType: this.getMimeType(report.format),
          executionTime,
        });

        // Log audit event
        await this.logAuditEvent(id, 'EXECUTION_COMPLETED', userId);

        this.logger.log(`Report generated successfully: ${id} in ${executionTime}ms`);
        return this.findOne(id);
      } catch (error) {
        // Update status to failed
        await this.reportRepository.update(id, {
          executionStatus: ExecutionStatus.FAILED,
          status: ReportStatus.FAILED,
        });

        // Log audit event with correct enum value
        await this.logAuditEvent(id, 'EXECUTION_FAILED', userId);

        this.logger.error(`Report generation failed: ${id} - ${error.message}`, error.stack);
        throw error;
      }
    } catch (error) {
      this.logger.error(`Failed to generate report ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to generate report');
    }
  }

  async archiveReport(id: string, userId?: string): Promise<Report | null> {
    try {
      this.logger.log(`Archiving report: ${id}`);
      
      await this.reportRepository.update(id, {
        isArchived: true,
        archivedAt: new Date(),
      });

      // Log audit event
      await this.logAuditEvent(id, 'ARCHIVED', userId);

      this.logger.log(`Report archived successfully: ${id}`);
      return this.findOne(id);
    } catch (error) {
      this.logger.error(`Failed to archive report ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to archive report');
    }
  }

  /**
   * Generate report file content and upload to AWS S3
   */
  private async generateAndUploadReportFile(
    reportId: string,
    category: ReportCategory,
    format: ReportFormat,
    reportData: any,
  ): Promise<string> {
    try {
      this.logger.log(`Generating ${format} file for report: ${reportId}`);

      let fileBuffer: Buffer;
      let fileName: string;

      // Generate file based on format
      switch (format) {
        case ReportFormat.JSON:
          fileBuffer = Buffer.from(JSON.stringify(reportData, null, 2), 'utf-8');
          fileName = `${reportId}-${category.toLowerCase()}.json`;
          break;

        case ReportFormat.CSV:
          const csvContent = this.convertToCSV(reportData);
          fileBuffer = Buffer.from(csvContent, 'utf-8');
          fileName = `${reportId}-${category.toLowerCase()}.csv`;
          break;

        case ReportFormat.HTML:
          const htmlContent = this.generateHTMLReport(reportData, category);
          fileBuffer = Buffer.from(htmlContent, 'utf-8');
          fileName = `${reportId}-${category.toLowerCase()}.html`;
          break;

        case ReportFormat.PDF:
          fileBuffer = await this.generatePDFReport(reportData, category);
          fileName = `${reportId}-${category.toLowerCase()}.pdf`;
          break;

        case ReportFormat.EXCEL:
          // For Excel, store JSON for now (can be enhanced later with actual generation)
          fileBuffer = Buffer.from(JSON.stringify(reportData, null, 2), 'utf-8');
          fileName = `${reportId}-${category.toLowerCase()}.json`;
          this.logger.warn(`Excel generation not yet implemented, storing as JSON`);
          break;

        default:
          // Default to JSON
          fileBuffer = Buffer.from(JSON.stringify(reportData, null, 2), 'utf-8');
          fileName = `${reportId}-${category.toLowerCase()}.json`;
      }

      // Upload to S3
      const s3Url = await this.awsS3Service.uploadFile(fileBuffer, fileName, 'reports');
      
      this.logger.log(`Report file uploaded to S3: ${s3Url}`);
      return s3Url;
    } catch (error) {
      this.logger.error(`Failed to generate and upload report file: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to generate report file');
    }
  }

  /**
   * Convert report data to CSV format
   */
  private convertToCSV(data: any): string {
    if (Array.isArray(data)) {
      if (data.length === 0) return '';
      
      const headers = Object.keys(data[0]);
      const rows = data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      );
      
      return [headers.join(','), ...rows].join('\n');
    } else {
      // Convert object to key-value CSV
      const entries = Object.entries(data);
      return ['Key,Value', ...entries.map(([k, v]) => `${k},${v}`)].join('\n');
    }
  }

  /**
   * Generate HTML report
   */
  private generateHTMLReport(data: any, category: ReportCategory): string {
    const timestamp = new Date().toISOString();
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${category} Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
    .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
    .metadata { background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0; }
    .data { margin-top: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6; }
    th { background-color: #007bff; color: white; }
    tr:hover { background-color: #f8f9fa; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${category.replace(/_/g, ' ')} Report</h1>
    
    <div class="metadata">
      <strong>Generated:</strong> ${timestamp}<br>
      <strong>Category:</strong> ${category}
    </div>
    
    <div class="data">
      <h2>Report Data</h2>
      <pre>${JSON.stringify(data, null, 2)}</pre>
    </div>
    
    <div class="footer">
      <p>Generated by Rolevate ATS Platform</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate a well-designed PDF report
   */
  private async generatePDFReport(data: any, category: ReportCategory): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
          bufferPages: true,
          info: {
            Title: `${category.replace(/_/g, ' ')} Report`,
            Author: 'Rolevate ATS Platform',
            Subject: 'System Generated Report',
            CreationDate: new Date()
          }
        });

        const chunks: Buffer[] = [];
        
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Define colors
        const primaryColor = '#2563eb';
        const secondaryColor = '#64748b';
        const lightGray = '#f1f5f9';
        const darkGray = '#334155';

        // Header with company branding
        doc.save();
        doc.rect(0, 0, doc.page.width, 120)
           .fill(primaryColor);
        doc.restore();
        
        doc.fillColor('#ffffff')
           .fontSize(28)
           .text('ROLEVATE', 50, 35);
        
        doc.fillColor('#e0e7ff')
           .fontSize(12)
           .text('Applicant Tracking System', 50, 70);

        // Report title
        const reportTitle = category.replace(/_/g, ' ').toUpperCase();
        doc.fillColor('#ffffff')
           .fontSize(20)
           .text(reportTitle, 50, 90);

        // Reset position after header
        let yPosition = 150;

        // Metadata section
        doc.fillColor(secondaryColor)
           .fontSize(10)
           .text(`Generated: ${new Date().toLocaleString()}`, 50, yPosition);
        
        yPosition += 15;
        doc.text(`Report Category: ${category.replace(/_/g, ' ')}`, 50, yPosition);
        
        yPosition += 30;

        // Draw separator line
        doc.save();
        doc.moveTo(50, yPosition)
           .lineTo(doc.page.width - 50, yPosition)
           .strokeColor(lightGray)
           .lineWidth(2)
           .stroke();
        doc.restore();

        yPosition += 30;

        // Report content section
        doc.fillColor(darkGray)
           .fontSize(16)
           .text('Report Summary', 50, yPosition);

        yPosition += 30;

        // Render data based on structure
        if (Array.isArray(data)) {
          this.renderArrayDataToPDF(doc, data, yPosition);
        } else if (typeof data === 'object' && data !== null) {
          this.renderObjectDataToPDF(doc, data, yPosition);
        } else {
          doc.fillColor(darkGray)
             .fontSize(11)
             .text(String(data), 50, yPosition);
        }

        // Add footer to all pages
        const range = doc.bufferedPageRange();
        for (let i = 0; i < range.count; i++) {
          doc.switchToPage(i);
          
          // Footer line
          doc.save();
          doc.moveTo(50, doc.page.height - 70)
             .lineTo(doc.page.width - 50, doc.page.height - 70)
             .strokeColor(lightGray)
             .lineWidth(1)
             .stroke();
          doc.restore();

          // Footer text
          doc.fillColor(secondaryColor)
             .fontSize(9)
             .text(
               'Generated by Rolevate ATS Platform | Confidential',
               50,
               doc.page.height - 50,
               { align: 'center', width: doc.page.width - 100 }
             );

          doc.text(
            `Page ${i + 1} of ${range.count}`,
            50,
            doc.page.height - 35,
            { align: 'center', width: doc.page.width - 100 }
          );
        }

        doc.end();
      } catch (error) {
        this.logger.error(`PDF generation error: ${error.message}`, error.stack);
        reject(error);
      }
    });
  }

  /**
   * Render array data to PDF with table layout
   */
  private renderArrayDataToPDF(doc: PDFKit.PDFDocument, data: any[], startY: number): void {
    if (data.length === 0) {
      doc.fillColor('#64748b')
         .fontSize(11)
         .text('No data available', 50, startY);
      return;
    }

    let yPosition = startY;
    const primaryColor = '#2563eb';
    const lightGray = '#f1f5f9';
    const darkGray = '#334155';

    // Get all unique keys from the array
    const keys = Array.from(new Set(data.flatMap(item => Object.keys(item))));
    const maxItemsPerPage = 15;
    const itemsToShow = data.slice(0, maxItemsPerPage);

    // Render as cards
    itemsToShow.forEach((item, index) => {
      // Check if we need a new page
      if (yPosition > doc.page.height - 150) {
        doc.addPage();
        yPosition = 50;
      }

      // Card background
      doc.save();
      doc.roundedRect(50, yPosition, doc.page.width - 100, 80, 5)
         .fillAndStroke(lightGray, '#e2e8f0');
      doc.restore();

      // Item number badge
      doc.save();
      doc.circle(70, yPosition + 20, 15)
         .fill(primaryColor);
      doc.restore();
      
      doc.fillColor('#ffffff')
         .fontSize(10)
         .text(String(index + 1), 64, yPosition + 15);

      // Item content
      let contentY = yPosition + 15;
      const contentX = 100;
      
      keys.slice(0, 4).forEach((key) => {
        const value = item[key];
        if (value !== undefined && value !== null) {
          const displayValue = String(value).substring(0, 50);
          
          doc.fillColor('#64748b')
             .fontSize(9)
             .text(`${key}: `, contentX, contentY, { continued: true })
             .fillColor(darkGray)
             .text(displayValue, { width: 380 });
          
          contentY += 14;
        }
      });

      yPosition += 90;
    });

    // Show count if truncated
    if (data.length > maxItemsPerPage) {
      yPosition += 10;
      doc.fillColor('#64748b')
         .fontSize(10)
         .text(
           `Showing ${maxItemsPerPage} of ${data.length} items`,
           50,
           yPosition
         );
    }
  }

  /**
   * Render object data to PDF with key-value layout
   */
  private renderObjectDataToPDF(doc: PDFKit.PDFDocument, data: Record<string, any>, startY: number): void {
    let yPosition = startY;
    const primaryColor = '#2563eb';
    const darkGray = '#334155';
    const lightGray = '#f1f5f9';

    const entries = Object.entries(data);

    entries.forEach(([key, value], index) => {
      // Check if we need a new page
      if (yPosition > doc.page.height - 100) {
        doc.addPage();
        yPosition = 50;
      }

      // Key-value row background
      doc.save();
      doc.rect(50, yPosition, doc.page.width - 100, 35)
         .fill(index % 2 === 0 ? lightGray : '#ffffff');
      doc.restore();

      // Key
      doc.fillColor(primaryColor)
         .fontSize(10)
         .text(
           key.replace(/_/g, ' ').toUpperCase(),
           60,
           yPosition + 10,
           { width: 200 }
         );

      // Value
      let displayValue = value;
      if (typeof value === 'object' && value !== null) {
        displayValue = JSON.stringify(value, null, 2).substring(0, 100);
      }

      doc.fillColor(darkGray)
         .fontSize(10)
         .text(
           String(displayValue),
           270,
           yPosition + 10,
           { width: 280 }
         );

      yPosition += 40;
    });
  }

  /**
   * Get MIME type for report format
   */
  private getMimeType(format: ReportFormat): string {
    switch (format) {
      case ReportFormat.PDF:
        return 'application/pdf';
      case ReportFormat.EXCEL:
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case ReportFormat.CSV:
        return 'text/csv';
      case ReportFormat.JSON:
        return 'application/json';
      case ReportFormat.HTML:
        return 'text/html';
      default:
        return 'application/octet-stream';
    }
  }

  private async generateUserActivityReport(report: Report): Promise<Record<string, any>> {
    try {
      this.logger.log('Generating user activity report');
      
      // Aggregate user activity data
      const userCount = await this.userRepository.count();
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const activeUsers = await this.userRepository.count({
        where: { updatedAt: thirtyDaysAgo },
      });

      return {
        totalUsers: userCount,
        activeUsers,
        activityRate: userCount > 0 ? (activeUsers / userCount) * 100 : 0,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to generate user activity report: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to generate user activity report');
    }
  }

  private async generateApplicationStatsReport(report: Report): Promise<Record<string, any>> {
    try {
      this.logger.log('Generating application stats report');
      
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
    } catch (error) {
      this.logger.error(`Failed to generate application stats report: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to generate application stats report');
    }
  }

  private async generateJobAnalyticsReport(report: Report): Promise<Record<string, any>> {
    try {
      this.logger.log('Generating job analytics report');
      
      // Aggregate job analytics
      const totalJobs = await this.jobRepository.count();
      const activeJobs = await this.jobRepository.count({ where: { status: JobStatus.ACTIVE } });

      return {
        totalJobs,
        activeJobs,
        inactiveJobs: totalJobs - activeJobs,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to generate job analytics report: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to generate job analytics report');
    }
  }

  private async generateCompanyOverviewReport(report: Report): Promise<Record<string, any>> {
    try {
      this.logger.log('Generating company overview report');
      
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
    } catch (error) {
      this.logger.error(`Failed to generate company overview report: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to generate company overview report');
    }
  }

  private async generateAuditReport(report: Report): Promise<Record<string, any>> {
    try {
      this.logger.log('Generating audit report');
      
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
    } catch (error) {
      this.logger.error(`Failed to generate audit report: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to generate audit report');
    }
  }

  private async generateCustomReport(report: Report): Promise<Record<string, any>> {
    try {
      this.logger.log('Generating custom report');
      
      // Custom report - use the query field or parameters
      return {
        customReport: true,
        query: report.query,
        parameters: report.parameters,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to generate custom report: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to generate custom report');
    }
  }

  private async logAuditEvent(reportId: string, action: string, userId?: string): Promise<void> {
    try {
      const auditLog = this.reportAuditLogRepository.create({
        reportId,
        action: action as AuditAction,
        userId,
        success: true,
      });
      await this.reportAuditLogRepository.save(auditLog);
    } catch (error) {
      // Log but don't throw - audit logging should not break main operations
      this.logger.error(`Failed to log audit event: ${error.message}`, error.stack);
    }
  }
}