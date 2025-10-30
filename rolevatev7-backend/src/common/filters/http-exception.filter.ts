import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { GqlArgumentsHost, GqlContextType } from '@nestjs/graphql';
import { AuditService } from '../../audit.service';
import { ERROR_CODES, HTTP_STATUS } from '../constants/config.constants';

/**
 * Global exception filter for consistent error responses
 * Handles both REST and GraphQL requests
 * Logs errors to AuditService for tracking
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly auditService: AuditService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    // Determine if this is a GraphQL or HTTP request
    const gqlHost = GqlArgumentsHost.create(host);
    const contextType = host.getType<GqlContextType>();

    // Extract user context if available
    let userId: string | undefined;

    if (contextType === 'graphql') {
      const ctx = gqlHost.getContext();
      userId = ctx.req?.user?.userId;
    } else {
      const ctx = host.switchToHttp();
      const request = ctx.getRequest();
      userId = request.user?.userId;
    }

    // Extract error details
    const errorResponse = this.buildErrorResponse(exception);

    // Log error to console
    this.logger.error(
      `Error ${errorResponse.errorCode}: ${errorResponse.message}`,
      exception instanceof Error ? exception.stack : undefined
    );

    // Log security-related errors to audit service
    if (this.isSecurityError(errorResponse.statusCode)) {
      this.logSecurityError(errorResponse, userId).catch((err) => {
        this.logger.error('Failed to log security error to audit service', err);
      });
    }

    // For GraphQL, throw the error (Apollo will handle it)
    if (contextType === 'graphql') {
      throw new HttpException(errorResponse, errorResponse.statusCode);
    }

    // For HTTP, send the response
    const response = host.switchToHttp().getResponse();
    response.status(errorResponse.statusCode).json(errorResponse);
  }

  /**
   * Build standardized error response
   */
  private buildErrorResponse(exception: unknown): {
    statusCode: number;
    errorCode: number;
    message: string;
    error?: string;
    timestamp: string;
    path?: string;
    errors?: any[];
  } {
    const timestamp = new Date().toISOString();

    // Handle HttpException (most NestJS exceptions)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      // If response is already structured with errorCode
      if (typeof response === 'object' && 'errorCode' in response) {
        return {
          ...(response as any),
          timestamp,
        };
      }

      // If response is a string
      if (typeof response === 'string') {
        return {
          statusCode: status,
          errorCode: this.getDefaultErrorCode(status),
          message: response,
          error: exception.name,
          timestamp,
        };
      }

      // If response is an object without errorCode
      return {
        statusCode: status,
        errorCode: this.getDefaultErrorCode(status),
        message: (response as any).message || exception.message,
        error: (response as any).error || exception.name,
        timestamp,
        errors: (response as any).errors,
      };
    }

    // Handle non-HTTP exceptions (database errors, etc.)
    if (exception instanceof Error) {
      return {
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: exception.message || 'Internal server error',
        error: exception.name,
        timestamp,
      };
    }

    // Handle unknown exceptions
    return {
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      error: 'UnknownError',
      timestamp,
    };
  }

  /**
   * Get default error code based on HTTP status
   */
  private getDefaultErrorCode(statusCode: number): number {
    switch (statusCode) {
      case HTTP_STATUS.BAD_REQUEST:
        return ERROR_CODES.INVALID_INPUT;
      case HTTP_STATUS.UNAUTHORIZED:
        return ERROR_CODES.INVALID_CREDENTIALS;
      case HTTP_STATUS.FORBIDDEN:
        return ERROR_CODES.INSUFFICIENT_PERMISSIONS;
      case HTTP_STATUS.NOT_FOUND:
        return ERROR_CODES.RESOURCE_NOT_FOUND;
      case HTTP_STATUS.CONFLICT:
        return ERROR_CODES.RESOURCE_ALREADY_EXISTS;
      case HTTP_STATUS.UNPROCESSABLE_ENTITY:
        return ERROR_CODES.INVALID_INPUT;
      case HTTP_STATUS.TOO_MANY_REQUESTS:
        return ERROR_CODES.INVALID_INPUT; // Could add a specific rate limit error code
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      default:
        return ERROR_CODES.INTERNAL_SERVER_ERROR;
    }
  }

  /**
   * Check if error is security-related and should be audited
   */
  private isSecurityError(statusCode: number): boolean {
    return (
      statusCode === HTTP_STATUS.UNAUTHORIZED ||
      statusCode === HTTP_STATUS.FORBIDDEN ||
      statusCode === HTTP_STATUS.TOO_MANY_REQUESTS
    );
  }

  /**
   * Log security errors to audit service
   */
  private async logSecurityError(
    errorResponse: any,
    userId?: string,
  ): Promise<void> {
    if (!userId) {
      // For unauthenticated errors, we don't have a userId
      // Could log to a separate table or use a system user ID
      return;
    }

    // Log unauthorized access attempt
    await this.auditService.logUnauthorizedAccess(
      userId,
      errorResponse.path || 'unknown',
      errorResponse.message
    );
  }
}
