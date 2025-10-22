import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ErrorMonitoringService } from './error-monitoring.service';
import { PerformanceMonitoringService } from './performance-monitoring.service';
import { MonitoringController } from './monitoring.controller';

@Module({
  imports: [ConfigModule],
  controllers: [MonitoringController],
  providers: [ErrorMonitoringService, PerformanceMonitoringService],
  exports: [ErrorMonitoringService, PerformanceMonitoringService],
})
export class MonitoringModule {}