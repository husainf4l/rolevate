import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PerformanceMetric {
  id: string;
  operation: string;
  duration: number;
  timestamp: Date;
  userId?: string;
  companyId?: string;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface PerformanceThreshold {
  operation: string;
  warningThreshold: number; // milliseconds
  criticalThreshold: number; // milliseconds
  enabled: boolean;
}

export interface PerformanceStats {
  operation: string;
  count: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  p95Duration: number;
  p99Duration: number;
  errorRate: number;
  timeRange: {
    start: Date;
    end: Date;
  };
}

@Injectable()
export class PerformanceMonitoringService implements OnModuleInit {
  private readonly logger = new Logger(PerformanceMonitoringService.name);
  private readonly metrics: PerformanceMetric[] = [];
  private readonly maxMetricsStored = 10000;
  private readonly thresholds = new Map<string, PerformanceThreshold>();
  private readonly environment: string;

  // Default thresholds for common operations
  private readonly defaultThresholds: PerformanceThreshold[] = [
    { operation: 'database_query', warningThreshold: 100, criticalThreshold: 500, enabled: true },
    { operation: 'cache_get', warningThreshold: 10, criticalThreshold: 50, enabled: true },
    { operation: 'cache_set', warningThreshold: 20, criticalThreshold: 100, enabled: true },
    { operation: 'external_api_call', warningThreshold: 200, criticalThreshold: 1000, enabled: true },
    { operation: 'file_upload', warningThreshold: 500, criticalThreshold: 2000, enabled: true },
    { operation: 'email_send', warningThreshold: 300, criticalThreshold: 1000, enabled: true },
    { operation: 'auth_login', warningThreshold: 200, criticalThreshold: 800, enabled: true },
    { operation: 'job_search', warningThreshold: 150, criticalThreshold: 600, enabled: true },
  ];

  constructor(private configService: ConfigService) {
    this.environment = this.configService.get('NODE_ENV', 'development');
  }

  onModuleInit() {
    // Initialize default thresholds
    this.defaultThresholds.forEach(threshold => {
      this.thresholds.set(threshold.operation, threshold);
    });

    this.logger.log('Performance monitoring service initialized with default thresholds');
  }

  /**
   * Records a performance metric
   */
  recordMetric(
    operation: string,
    duration: number,
    userId?: string,
    companyId?: string,
    metadata?: Record<string, any>,
    tags?: string[]
  ): void {
    const metric: PerformanceMetric = {
      id: this.generateMetricId(),
      operation,
      duration,
      timestamp: new Date(),
      userId,
      companyId,
      metadata,
      tags: tags || [],
    };

    this.storeMetric(metric);
    this.checkThresholds(metric);
  }

  /**
   * Times an async operation and records the metric
   */
  async timeOperation<T>(
    operation: string,
    fn: () => Promise<T>,
    userId?: string,
    companyId?: string,
    metadata?: Record<string, any>,
    tags?: string[]
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await fn();
      const duration = Date.now() - startTime;

      this.recordMetric(operation, duration, userId, companyId, metadata, tags);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Record the failed operation
      this.recordMetric(operation, duration, userId, companyId, {
        ...metadata,
        error: true,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      }, [...(tags || []), 'error']);

      throw error;
    }
  }

  /**
   * Times a sync operation and records the metric
   */
  timeSyncOperation<T>(
    operation: string,
    fn: () => T,
    userId?: string,
    companyId?: string,
    metadata?: Record<string, any>,
    tags?: string[]
  ): T {
    const startTime = Date.now();

    try {
      const result = fn();
      const duration = Date.now() - startTime;

      this.recordMetric(operation, duration, userId, companyId, metadata, tags);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Record the failed operation
      this.recordMetric(operation, duration, userId, companyId, {
        ...metadata,
        error: true,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      }, [...(tags || []), 'error']);

      throw error;
    }
  }

  /**
   * Sets a custom threshold for an operation
   */
  setThreshold(operation: string, warningThreshold: number, criticalThreshold: number): void {
    this.thresholds.set(operation, {
      operation,
      warningThreshold,
      criticalThreshold,
      enabled: true,
    });

    this.logger.log(`Performance threshold set for ${operation}: warning=${warningThreshold}ms, critical=${criticalThreshold}ms`);
  }

  /**
   * Gets performance statistics for an operation
   */
  getPerformanceStats(operation: string, timeRangeHours: number = 24): PerformanceStats | null {
    const cutoffTime = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000);
    const operationMetrics = this.metrics.filter(
      m => m.operation === operation && m.timestamp >= cutoffTime
    );

    if (operationMetrics.length === 0) {
      return null;
    }

    const durations = operationMetrics.map(m => m.duration).sort((a, b) => a - b);
    const errorCount = operationMetrics.filter(m => m.metadata?.error).length;

    return {
      operation,
      count: operationMetrics.length,
      averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      minDuration: durations[0],
      maxDuration: durations[durations.length - 1],
      p95Duration: this.calculatePercentile(durations, 95),
      p99Duration: this.calculatePercentile(durations, 99),
      errorRate: errorCount / operationMetrics.length,
      timeRange: {
        start: cutoffTime,
        end: new Date(),
      },
    };
  }

  /**
   * Gets performance statistics for all operations
   */
  getAllPerformanceStats(timeRangeHours: number = 24): PerformanceStats[] {
    const operations = [...new Set(this.metrics.map(m => m.operation))];
    const stats: PerformanceStats[] = [];

    for (const operation of operations) {
      const operationStats = this.getPerformanceStats(operation, timeRangeHours);
      if (operationStats) {
        stats.push(operationStats);
      }
    }

    return stats.sort((a, b) => b.averageDuration - a.averageDuration);
  }

  /**
   * Gets current thresholds
   */
  getThresholds(): PerformanceThreshold[] {
    return Array.from(this.thresholds.values());
  }

  /**
   * Clears old metrics to prevent memory issues
   */
  clearOldMetrics(maxAgeHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    const initialLength = this.metrics.length;
    const filteredMetrics = this.metrics.filter(m => m.timestamp >= cutoffTime);

    this.metrics.length = 0;
    this.metrics.push(...filteredMetrics);

    const cleared = initialLength - filteredMetrics.length;
    if (cleared > 0) {
      this.logger.log(`Cleared ${cleared} old performance metrics`);
    }
  }

  /**
   * Gets slow operations that exceeded thresholds
   */
  getSlowOperations(timeRangeHours: number = 1): PerformanceMetric[] {
    const cutoffTime = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000);

    return this.metrics.filter(metric => {
      if (metric.timestamp < cutoffTime) return false;

      const threshold = this.thresholds.get(metric.operation);
      if (!threshold?.enabled) return false;

      return metric.duration >= threshold.warningThreshold;
    }).sort((a, b) => b.duration - a.duration);
  }

  private storeMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Maintain max size
    if (this.metrics.length > this.maxMetricsStored) {
      this.metrics.shift();
    }
  }

  private checkThresholds(metric: PerformanceMetric): void {
    const threshold = this.thresholds.get(metric.operation);
    if (!threshold?.enabled) return;

    if (metric.duration >= threshold.criticalThreshold) {
      this.logger.error(`CRITICAL PERFORMANCE ISSUE: ${metric.operation} took ${metric.duration}ms (threshold: ${threshold.criticalThreshold}ms)`, {
        metric,
        threshold,
      });
      // TODO: Trigger critical alert
    } else if (metric.duration >= threshold.warningThreshold) {
      this.logger.warn(`PERFORMANCE WARNING: ${metric.operation} took ${metric.duration}ms (threshold: ${threshold.warningThreshold}ms)`, {
        metric,
        threshold,
      });
    }
  }

  private calculatePercentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;

    const index = (percentile / 100) * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);

    if (lower === upper) {
      return sortedArray[lower];
    }

    return sortedArray[lower] + (sortedArray[upper] - sortedArray[lower]) * (index - lower);
  }

  private generateMetricId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}