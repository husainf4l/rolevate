import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PerformanceMonitoringService } from './performance-monitoring.service';

describe('PerformanceMonitoringService', () => {
  let service: PerformanceMonitoringService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerformanceMonitoringService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PerformanceMonitoringService>(PerformanceMonitoringService);
    configService = module.get(ConfigService);

    // Mock environment
    configService.get.mockReturnValue('test');

    // Initialize default thresholds (normally done in onModuleInit)
    (service as any).onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordMetric', () => {
    it('should record a performance metric', () => {
      service.recordMetric('test_operation', 150, 'user-123', 'company-123', { query: 'SELECT *' }, ['database']);

      const stats = service.getPerformanceStats('test_operation', 1);
      expect(stats).toBeDefined();
      expect(stats!.count).toBe(1);
      expect(stats!.averageDuration).toBe(150);
      expect(stats!.minDuration).toBe(150);
      expect(stats!.maxDuration).toBe(150);
    });
  });

  describe('timeOperation', () => {
    it('should time an async operation and record the metric', async () => {
      const mockFn = jest.fn().mockResolvedValue('result');

      const result = await service.timeOperation(
        'async_test',
        mockFn,
        'user-123',
        'company-123',
        { param: 'value' },
        ['test']
      );

      expect(result).toBe('result');
      expect(mockFn).toHaveBeenCalledTimes(1);

      const stats = service.getPerformanceStats('async_test', 1);
      expect(stats).toBeDefined();
      expect(stats!.count).toBe(1);
    });

    it('should record failed operations', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Test error'));

      await expect(service.timeOperation('failed_test', mockFn)).rejects.toThrow('Test error');

      const stats = service.getPerformanceStats('failed_test', 1);
      expect(stats).toBeDefined();
      expect(stats!.count).toBe(1);
      expect(stats!.errorRate).toBe(1);
    });
  });

  describe('timeSyncOperation', () => {
    it('should time a sync operation and record the metric', () => {
      const mockFn = jest.fn().mockReturnValue('result');

      const result = service.timeSyncOperation(
        'sync_test',
        mockFn,
        'user-123',
        'company-123',
        { param: 'value' },
        ['test']
      );

      expect(result).toBe('result');
      expect(mockFn).toHaveBeenCalledTimes(1);

      const stats = service.getPerformanceStats('sync_test', 1);
      expect(stats).toBeDefined();
      expect(stats!.count).toBe(1);
    });

    it('should record failed sync operations', () => {
      const mockFn = jest.fn().mockImplementation(() => {
        throw new Error('Sync test error');
      });

      expect(() => service.timeSyncOperation('failed_sync_test', mockFn)).toThrow('Sync test error');

      const stats = service.getPerformanceStats('failed_sync_test', 1);
      expect(stats).toBeDefined();
      expect(stats!.count).toBe(1);
      expect(stats!.errorRate).toBe(1);
    });
  });

  describe('setThreshold', () => {
    it('should set custom performance thresholds', () => {
      service.setThreshold('custom_operation', 200, 800);

      const thresholds = service.getThresholds();
      const threshold = thresholds.find(t => t.operation === 'custom_operation');
      expect(threshold).toBeDefined();
      expect(threshold!.warningThreshold).toBe(200);
      expect(threshold!.criticalThreshold).toBe(800);
      expect(threshold!.enabled).toBe(true);
    });
  });

  describe('getPerformanceStats', () => {
    it('should return performance statistics for an operation', () => {
      // Record multiple metrics
      service.recordMetric('stats_test', 100);
      service.recordMetric('stats_test', 200);
      service.recordMetric('stats_test', 150);

      const stats = service.getPerformanceStats('stats_test', 1);
      expect(stats).toBeDefined();
      expect(stats!.count).toBe(3);
      expect(stats!.averageDuration).toBe(150);
      expect(stats!.minDuration).toBe(100);
      expect(stats!.maxDuration).toBe(200);
    });

    it('should return null for operations with no metrics', () => {
      const stats = service.getPerformanceStats('nonexistent_operation', 1);
      expect(stats).toBeNull();
    });

    it('should calculate percentiles correctly', () => {
      // Record metrics in order: 100, 200, 300, 400, 500
      [100, 200, 300, 400, 500].forEach(duration => {
        service.recordMetric('percentile_test', duration);
      });

      const stats = service.getPerformanceStats('percentile_test', 1);
      expect(stats).toBeDefined();
      expect(stats!.p95Duration).toBe(480); // 95th percentile approximation
      expect(stats!.p99Duration).toBe(496); // 99th percentile approximation
    });
  });

  describe('getAllPerformanceStats', () => {
    it('should return statistics for all operations', () => {
      service.recordMetric('operation1', 100);
      service.recordMetric('operation2', 200);
      service.recordMetric('operation1', 150);

      const allStats = service.getAllPerformanceStats(1);
      expect(allStats.length).toBe(2);

      const operation1Stats = allStats.find(s => s.operation === 'operation1');
      const operation2Stats = allStats.find(s => s.operation === 'operation2');

      expect(operation1Stats).toBeDefined();
      expect(operation2Stats).toBeDefined();
      expect(operation1Stats!.count).toBe(2);
      expect(operation2Stats!.count).toBe(1);
    });

    it('should sort operations by average duration descending', () => {
      service.recordMetric('slow_operation', 500);
      service.recordMetric('fast_operation', 50);

      const allStats = service.getAllPerformanceStats(1);
      expect(allStats[0].operation).toBe('slow_operation');
      expect(allStats[1].operation).toBe('fast_operation');
    });
  });

  describe('getSlowOperations', () => {
    it('should return operations that exceeded warning thresholds', () => {
      service.recordMetric('database_query', 600); // Above default warning threshold of 100
      service.recordMetric('cache_get', 50); // At critical threshold of 50

      const slowOperations = service.getSlowOperations(1);
      expect(slowOperations.length).toBe(2);

      // Should be sorted by duration descending
      expect(slowOperations[0].operation).toBe('database_query');
      expect(slowOperations[0].duration).toBe(600);
      expect(slowOperations[1].operation).toBe('cache_get');
      expect(slowOperations[1].duration).toBe(50);
    });

    it('should respect custom thresholds', () => {
      service.setThreshold('custom_slow', 50, 200);
      service.recordMetric('custom_slow', 100); // Above custom warning threshold

      const slowOperations = service.getSlowOperations(1);
      expect(slowOperations.length).toBe(1);
      expect(slowOperations[0].operation).toBe('custom_slow');
    });
  });

  describe('clearOldMetrics', () => {
    it('should clear metrics older than specified hours', () => {
      // Add a metric and then manipulate its timestamp to be old
      service.recordMetric('old_metric', 100);
      const metrics = (service as any).metrics;
      if (metrics.length > 0) {
        metrics[0].timestamp = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours ago
      }

      service.recordMetric('new_metric', 200);

      expect(metrics.length).toBe(2);

      service.clearOldMetrics(24); // Clear metrics older than 24 hours

      expect(metrics.length).toBe(1);
      expect(metrics[0].operation).toBe('new_metric');
    });
  });
});