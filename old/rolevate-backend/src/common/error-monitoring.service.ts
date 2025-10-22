import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ErrorContext {
  userId?: string;
  companyId?: string;
  requestId?: string;
  sessionId?: string;
  userAgent?: string;
  ip?: string;
  url?: string;
  method?: string;
  timestamp: Date;
  environment: string;
  service: string;
  version?: string;
}

export interface ErrorDetails {
  name: string;
  message: string;
  stack?: string;
  code?: string;
  statusCode?: number;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context: ErrorContext;
  metadata?: Record<string, any>;
  tags?: string[];
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  DATABASE = 'database',
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  BUSINESS_LOGIC = 'business_logic',
  EXTERNAL_API = 'external_api',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  UNKNOWN = 'unknown',
}

@Injectable()
export class ErrorMonitoringService implements OnModuleInit {
  private readonly logger = new Logger(ErrorMonitoringService.name);
  private readonly errors: ErrorDetails[] = [];
  private readonly maxErrorsStored = 1000;
  private readonly environment: string;
  private readonly serviceName: string;

  constructor(private configService: ConfigService) {
    this.environment = this.configService.get('NODE_ENV', 'development');
    this.serviceName = 'rolevate-backend';
  }

  onModuleInit() {
    this.logger.log('Error monitoring service initialized');
  }

  /**
   * Captures and processes an error with full context
   */
  async captureError(
    error: Error | unknown,
    context: Partial<ErrorContext>,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    metadata?: Record<string, any>,
    tags?: string[]
  ): Promise<void> {
    const errorDetails = this.buildErrorDetails(error, context, severity, category, metadata, tags);

    // Store error for aggregation
    this.storeError(errorDetails);

    // Log error with appropriate level
    this.logError(errorDetails, severity);

    // Send to external monitoring service if configured
    await this.sendToExternalService(errorDetails);

    // Trigger alerts for critical errors
    if (severity === ErrorSeverity.CRITICAL) {
      await this.triggerCriticalAlert(errorDetails);
    }
  }

  /**
   * Captures HTTP request errors
   */
  async captureHttpError(
    error: Error | unknown,
    request: any,
    statusCode?: number,
    userId?: string,
    companyId?: string
  ): Promise<void> {
    const context: Partial<ErrorContext> = {
      userId,
      companyId,
      url: request?.url,
      method: request?.method,
      userAgent: request?.get?.('User-Agent'),
      ip: request?.ip || request?.connection?.remoteAddress,
    };

    const category = this.categorizeHttpError(error, statusCode);
    const severity = this.determineSeverity(statusCode);

    await this.captureError(error, context, severity, category, {
      statusCode,
      headers: request?.headers,
      query: request?.query,
      body: this.sanitizeRequestBody(request?.body),
    });
  }

  /**
   * Captures database errors
   */
  async captureDatabaseError(
    error: Error | unknown,
    operation: string,
    table?: string,
    userId?: string,
    companyId?: string
  ): Promise<void> {
    const context: Partial<ErrorContext> = {
      userId,
      companyId,
    };

    await this.captureError(
      error,
      context,
      ErrorSeverity.HIGH,
      ErrorCategory.DATABASE,
      {
        operation,
        table,
        prismaCode: (error as any)?.code,
      },
      ['database', operation]
    );
  }

  /**
   * Captures external API errors
   */
  async captureExternalApiError(
    error: Error | unknown,
    service: string,
    endpoint: string,
    method: string,
    userId?: string,
    companyId?: string
  ): Promise<void> {
    const context: Partial<ErrorContext> = {
      userId,
      companyId,
    };

    await this.captureError(
      error,
      context,
      ErrorSeverity.MEDIUM,
      ErrorCategory.EXTERNAL_API,
      {
        externalService: service,
        endpoint,
        method,
      },
      ['external-api', service]
    );
  }

  /**
   * Captures performance issues
   */
  async capturePerformanceIssue(
    operation: string,
    duration: number,
    threshold: number,
    metadata?: Record<string, any>,
    userId?: string,
    companyId?: string
  ): Promise<void> {
    const context: Partial<ErrorContext> = {
      userId,
      companyId,
    };

    const error = new Error(`Performance threshold exceeded: ${operation} took ${duration}ms (threshold: ${threshold}ms)`);

    await this.captureError(
      error,
      context,
      ErrorSeverity.MEDIUM,
      ErrorCategory.PERFORMANCE,
      {
        operation,
        duration,
        threshold,
        ...metadata,
      },
      ['performance', operation]
    );
  }

  /**
   * Captures security-related errors
   */
  async captureSecurityError(
    error: Error | unknown,
    type: string,
    userId?: string,
    companyId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const context: Partial<ErrorContext> = {
      userId,
      companyId,
    };

    await this.captureError(
      error,
      context,
      ErrorSeverity.HIGH,
      ErrorCategory.SECURITY,
      {
        securityType: type,
        ...metadata,
      },
      ['security', type]
    );
  }

  /**
   * Gets error statistics for monitoring dashboard
   */
  getErrorStats(timeRangeHours: number = 24): {
    total: number;
    bySeverity: Record<ErrorSeverity, number>;
    byCategory: Record<ErrorCategory, number>;
    recentErrors: ErrorDetails[];
  } {
    const cutoffTime = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000);
    const recentErrors = this.errors.filter(e => e.context.timestamp >= cutoffTime);

    const bySeverity = Object.values(ErrorSeverity).reduce((acc, severity) => {
      acc[severity] = recentErrors.filter(e => this.getSeverityFromError(e) === severity).length;
      return acc;
    }, {} as Record<ErrorSeverity, number>);

    const byCategory = Object.values(ErrorCategory).reduce((acc, category) => {
      acc[category] = recentErrors.filter(e => this.getCategoryFromError(e) === category).length;
      return acc;
    }, {} as Record<ErrorCategory, number>);

    return {
      total: recentErrors.length,
      bySeverity,
      byCategory,
      recentErrors: recentErrors.slice(-10), // Last 10 errors
    };
  }

  /**
   * Clears old errors to prevent memory issues
   */
  clearOldErrors(maxAgeHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    const initialLength = this.errors.length;
    const filteredErrors = this.errors.filter(e => e.context.timestamp >= cutoffTime);

    this.errors.length = 0;
    this.errors.push(...filteredErrors);

    const cleared = initialLength - filteredErrors.length;
    if (cleared > 0) {
      this.logger.log(`Cleared ${cleared} old errors from monitoring`);
    }
  }

  private buildErrorDetails(
    error: Error | unknown,
    context: Partial<ErrorContext>,
    severity: ErrorSeverity,
    category: ErrorCategory,
    metadata?: Record<string, any>,
    tags?: string[]
  ): ErrorDetails {
    const errorObj = error instanceof Error ? error : new Error(String(error));

    return {
      name: errorObj.name,
      message: errorObj.message,
      stack: errorObj.stack,
      code: (error as any)?.code,
      severity,
      category,
      context: {
        timestamp: new Date(),
        environment: this.environment,
        service: this.serviceName,
        ...context,
      },
      metadata,
      tags: tags || [],
    };
  }

  private storeError(errorDetails: ErrorDetails): void {
    this.errors.push(errorDetails);

    // Maintain max size
    if (this.errors.length > this.maxErrorsStored) {
      this.errors.shift();
    }
  }

  private logError(errorDetails: ErrorDetails, severity: ErrorSeverity): void {
    const logData = {
      name: errorDetails.name,
      message: errorDetails.message,
      category: this.getCategoryFromError(errorDetails),
      severity,
      context: errorDetails.context,
      metadata: errorDetails.metadata,
      tags: errorDetails.tags,
    };

    switch (severity) {
      case ErrorSeverity.CRITICAL:
        this.logger.error('CRITICAL ERROR', logData);
        break;
      case ErrorSeverity.HIGH:
        this.logger.error('HIGH PRIORITY ERROR', logData);
        break;
      case ErrorSeverity.MEDIUM:
        this.logger.warn('MEDIUM PRIORITY ERROR', logData);
        break;
      case ErrorSeverity.LOW:
        this.logger.log('LOW PRIORITY ERROR', logData);
        break;
    }
  }

  private async sendToExternalService(_errorDetails: ErrorDetails): Promise<void> {
    // TODO: Integrate with external monitoring services like Sentry, DataDog, etc.
    // For now, just log that we would send to external service
    if (this.environment === 'production') {
      // Placeholder for external service integration
      // await this.sentryService.captureException(errorDetails);
      // await this.datadogService.captureError(errorDetails);
    }
  }

  private async triggerCriticalAlert(errorDetails: ErrorDetails): Promise<void> {
    // TODO: Implement alerting mechanisms (email, Slack, SMS, etc.)
    this.logger.error('CRITICAL ERROR ALERT TRIGGERED', {
      error: errorDetails.name,
      message: errorDetails.message,
      context: errorDetails.context,
    });

    // Placeholder for alert implementation
    // await this.alertService.sendCriticalAlert(errorDetails);
  }

  private categorizeHttpError(error: Error | unknown, statusCode?: number): ErrorCategory {
    if (statusCode) {
      if (statusCode === 401 || statusCode === 403) {
        return statusCode === 401 ? ErrorCategory.AUTHENTICATION : ErrorCategory.AUTHORIZATION;
      }
      if (statusCode === 400 || statusCode === 422) {
        return ErrorCategory.VALIDATION;
      }
      if (statusCode >= 500) {
        return ErrorCategory.DATABASE; // Most 5xx errors are DB or server issues
      }
    }

    // Check error type
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
    if (errorMessage.includes('prisma') || errorMessage.includes('database')) {
      return ErrorCategory.DATABASE;
    }
    if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
      return ErrorCategory.NETWORK;
    }

    return ErrorCategory.UNKNOWN;
  }

  private determineSeverity(statusCode?: number): ErrorSeverity {
    if (!statusCode) return ErrorSeverity.MEDIUM;

    if (statusCode >= 500) return ErrorSeverity.HIGH;
    if (statusCode === 401 || statusCode === 403) return ErrorSeverity.MEDIUM;
    if (statusCode >= 400) return ErrorSeverity.LOW;

    return ErrorSeverity.LOW;
  }

  private sanitizeRequestBody(body: any): any {
    if (!body) return body;

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private getSeverityFromError(error: ErrorDetails): ErrorSeverity {
    return error.severity;
  }

  private getCategoryFromError(error: ErrorDetails): ErrorCategory {
    return error.category;
  }
}