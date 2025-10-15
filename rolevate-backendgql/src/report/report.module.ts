import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportService } from './report.service';
import { ReportResolver } from './report.resolver';
import { Report } from './report.entity';
import { ReportTemplate } from './report-template.entity';
import { ReportMetrics } from './report-metrics.entity';
import { ReportSchedule } from './report-schedule.entity';
import { ReportShare } from './report-share.entity';
import { ReportAuditLog } from './report-audit-log.entity';
import { User } from '../user/user.entity';
import { Company } from '../company/company.entity';
import { Application } from '../application/application.entity';
import { Job } from '../job/job.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Report,
      ReportTemplate,
      ReportMetrics,
      ReportSchedule,
      ReportShare,
      ReportAuditLog,
      User,
      Company,
      Application,
      Job,
    ]),
    AuthModule,
  ],
  providers: [ReportService, ReportResolver],
  exports: [ReportService],
})
export class ReportModule {}