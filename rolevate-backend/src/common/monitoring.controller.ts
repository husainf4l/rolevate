import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ErrorMonitoringService } from '../common/error-monitoring.service';
import { PerformanceMonitoringService } from '../common/performance-monitoring.service';

@ApiTags('Monitoring')
@Controller('monitoring')
export class MonitoringController {
  constructor(
    private readonly errorMonitoringService: ErrorMonitoringService,
    private readonly performanceMonitoringService: PerformanceMonitoringService,
  ) {}

  @Get('errors/stats')
  @ApiOperation({ summary: 'Get error statistics' })
  @ApiResponse({ status: 200, description: 'Error statistics retrieved successfully' })
  getErrorStats(@Query('hours') hours?: string) {
    const timeRangeHours = hours ? parseInt(hours, 10) : 24;
    return this.errorMonitoringService.getErrorStats(timeRangeHours);
  }

  @Get('performance/stats')
  @ApiOperation({ summary: 'Get performance statistics for all operations' })
  @ApiResponse({ status: 200, description: 'Performance statistics retrieved successfully' })
  getAllPerformanceStats(@Query('hours') hours?: string) {
    const timeRangeHours = hours ? parseInt(hours, 10) : 24;
    return this.performanceMonitoringService.getAllPerformanceStats(timeRangeHours);
  }

  @Get('performance/stats/:operation')
  @ApiOperation({ summary: 'Get performance statistics for a specific operation' })
  @ApiResponse({ status: 200, description: 'Performance statistics retrieved successfully' })
  getPerformanceStats(
    @Query('operation') operation: string,
    @Query('hours') hours?: string
  ) {
    const timeRangeHours = hours ? parseInt(hours, 10) : 24;
    return this.performanceMonitoringService.getPerformanceStats(operation, timeRangeHours);
  }

  @Get('performance/thresholds')
  @ApiOperation({ summary: 'Get current performance thresholds' })
  @ApiResponse({ status: 200, description: 'Performance thresholds retrieved successfully' })
  getThresholds() {
    return this.performanceMonitoringService.getThresholds();
  }

  @Get('performance/slow-operations')
  @ApiOperation({ summary: 'Get slow operations that exceeded thresholds' })
  @ApiResponse({ status: 200, description: 'Slow operations retrieved successfully' })
  getSlowOperations(@Query('hours') hours?: string) {
    const timeRangeHours = hours ? parseInt(hours, 10) : 1;
    return this.performanceMonitoringService.getSlowOperations(timeRangeHours);
  }

  @Get('health')
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({ status: 200, description: 'System health status retrieved successfully' })
  getHealthStatus() {
    const errorStats = this.errorMonitoringService.getErrorStats(1); // Last hour
    const performanceStats = this.performanceMonitoringService.getAllPerformanceStats(1);

    // Calculate health score based on error rate and performance
    const errorRate = errorStats.total > 0 ? errorStats.bySeverity.critical + errorStats.bySeverity.high : 0;
    const avgResponseTime = performanceStats.length > 0
      ? performanceStats.reduce((sum, stat) => sum + stat.averageDuration, 0) / performanceStats.length
      : 0;

    let healthStatus = 'healthy';
    let healthScore = 100;

    if (errorRate > 10 || avgResponseTime > 1000) {
      healthStatus = 'critical';
      healthScore = 20;
    } else if (errorRate > 5 || avgResponseTime > 500) {
      healthStatus = 'warning';
      healthScore = 60;
    } else if (errorRate > 1 || avgResponseTime > 200) {
      healthStatus = 'degraded';
      healthScore = 80;
    }

    return {
      status: healthStatus,
      score: healthScore,
      timestamp: new Date().toISOString(),
      metrics: {
        errorsLastHour: errorStats.total,
        criticalErrorsLastHour: errorStats.bySeverity.critical || 0,
        highErrorsLastHour: errorStats.bySeverity.high || 0,
        averageResponseTime: Math.round(avgResponseTime),
        monitoredOperations: performanceStats.length,
      },
    };
  }
}