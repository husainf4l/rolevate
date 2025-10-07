import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ErrorMonitoringService, ErrorSeverity, ErrorCategory } from './error-monitoring.service';

describe('ErrorMonitoringService', () => {
  let service: ErrorMonitoringService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ErrorMonitoringService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ErrorMonitoringService>(ErrorMonitoringService);
    configService = module.get(ConfigService);

    // Mock environment
    configService.get.mockReturnValue('test');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('captureError', () => {
    it('should capture and store error details', async () => {
      const error = new Error('Test error');
      const context = { userId: 'user-123', url: '/test' };

      await service.captureError(error, context, ErrorSeverity.HIGH, ErrorCategory.DATABASE);

      const stats = service.getErrorStats(1);
      expect(stats.total).toBe(1);
      expect(stats.bySeverity[ErrorSeverity.HIGH]).toBe(1);
      expect(stats.byCategory[ErrorCategory.DATABASE]).toBe(1);
    });

    it('should handle unknown errors', async () => {
      const error = 'String error';

      await service.captureError(error, {}, ErrorSeverity.MEDIUM, ErrorCategory.UNKNOWN);

      const stats = service.getErrorStats(1);
      expect(stats.total).toBe(1);
    });
  });

  describe('captureHttpError', () => {
    it('should capture HTTP error with request details', async () => {
      const error = new Error('HTTP error');
      const mockRequest = {
        url: '/api/test',
        method: 'GET',
        get: jest.fn().mockReturnValue('Mozilla/5.0'),
        ip: '127.0.0.1',
      };

      await service.captureHttpError(error, mockRequest, 500, 'user-123', 'company-123');

      const stats = service.getErrorStats(1);
      expect(stats.total).toBe(1);
      expect(stats.recentErrors[0].context.userId).toBe('user-123');
      expect(stats.recentErrors[0].context.companyId).toBe('company-123');
      expect(stats.recentErrors[0].context.url).toBe('/api/test');
    });
  });

  describe('captureDatabaseError', () => {
    it('should capture database error with operation details', async () => {
      const error = new Error('Database connection failed');

      await service.captureDatabaseError(error, 'findUnique', 'User', 'user-123');

      const stats = service.getErrorStats(1);
      expect(stats.total).toBe(1);
      expect(stats.byCategory[ErrorCategory.DATABASE]).toBe(1);
      expect(stats.recentErrors[0].metadata!.operation).toBe('findUnique');
      expect(stats.recentErrors[0].metadata!.table).toBe('User');
    });
  });

  describe('captureExternalApiError', () => {
    it('should capture external API error', async () => {
      const error = new Error('API timeout');

      await service.captureExternalApiError(error, 'openai', '/completions', 'POST', 'user-123');

      const stats = service.getErrorStats(1);
      expect(stats.total).toBe(1);
      expect(stats.byCategory[ErrorCategory.EXTERNAL_API]).toBe(1);
      expect(stats.recentErrors[0].metadata!.externalService).toBe('openai');
      expect(stats.recentErrors[0].metadata!.endpoint).toBe('/completions');
    });
  });

  describe('capturePerformanceIssue', () => {
    it('should capture performance issue', async () => {
      await service.capturePerformanceIssue('database_query', 1500, 500, { query: 'SELECT * FROM jobs' }, 'user-123');

      const stats = service.getErrorStats(1);
      expect(stats.total).toBe(1);
      expect(stats.byCategory[ErrorCategory.PERFORMANCE]).toBe(1);
      expect(stats.recentErrors[0].metadata!.operation).toBe('database_query');
      expect(stats.recentErrors[0].metadata!.duration).toBe(1500);
    });
  });

  describe('captureSecurityError', () => {
    it('should capture security error', async () => {
      const error = new Error('Invalid token');

      await service.captureSecurityError(error, 'invalid_token', 'user-123', 'company-123', { token: 'masked' });

      const stats = service.getErrorStats(1);
      expect(stats.total).toBe(1);
      expect(stats.byCategory[ErrorCategory.SECURITY]).toBe(1);
      expect(stats.recentErrors[0].metadata!.securityType).toBe('invalid_token');
    });
  });

  describe('getErrorStats', () => {
    it('should return error statistics for specified time range', async () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');

      await service.captureError(error1, {}, ErrorSeverity.HIGH, ErrorCategory.DATABASE);
      await service.captureError(error2, {}, ErrorSeverity.CRITICAL, ErrorCategory.SECURITY);

      const stats = service.getErrorStats(1);
      expect(stats.total).toBe(2);
      expect(stats.bySeverity[ErrorSeverity.HIGH]).toBe(1);
      expect(stats.bySeverity[ErrorSeverity.CRITICAL]).toBe(1);
      expect(stats.byCategory[ErrorCategory.DATABASE]).toBe(1);
      expect(stats.byCategory[ErrorCategory.SECURITY]).toBe(1);
    });

    it('should limit recent errors to 10', async () => {
      // Create 15 errors
      for (let i = 0; i < 15; i++) {
        await service.captureError(new Error(`Error ${i}`), {}, ErrorSeverity.MEDIUM, ErrorCategory.UNKNOWN);
      }

      const stats = service.getErrorStats(1);
      expect(stats.total).toBe(15);
      expect(stats.recentErrors.length).toBe(10);
    });
  });

  describe('clearOldErrors', () => {
    it('should clear errors older than specified hours', async () => {
      // Mock an old error by directly manipulating the errors array
      const oldError = {
        name: 'Old Error',
        message: 'Old error message',
        context: {
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48 hours ago
          environment: 'test',
          service: 'test-service',
        },
        metadata: {},
        tags: [],
      };

      (service as any).errors.push(oldError);
      await service.captureError(new Error('New error'), {}, ErrorSeverity.MEDIUM, ErrorCategory.UNKNOWN);

      expect((service as any).errors.length).toBe(2);

      service.clearOldErrors(24); // Clear errors older than 24 hours

      expect((service as any).errors.length).toBe(1);
      expect((service as any).errors[0].message).toBe('New error');
    });
  });
});