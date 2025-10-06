import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  stack?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let message = 'An unexpected error occurred';

    // Handle different types of exceptions
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      error = exception.name;
      message = exception.message;
    } else if (exception instanceof PrismaClientKnownRequestError) {
      // Handle Prisma-specific errors
      statusCode = this.mapPrismaErrorToStatus(exception);
      error = 'Database Error';
      message = this.mapPrismaErrorToMessage(exception);
    } else if (exception instanceof Error && exception.name === 'ValidationError') {
      // Handle class-validator errors
      statusCode = HttpStatus.BAD_REQUEST;
      error = 'Validation Error';
      message = exception.message;
    } else if (exception instanceof Error) {
      // Handle generic errors
      error = exception.name;
      message = exception.message;
    }

    // Log the error with appropriate level
    this.logError(exception, statusCode, request);

    // Create standardized error response
    const errorResponse: ErrorResponse = {
      success: false,
      error,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    };

    response.status(statusCode).json(errorResponse);
  }

  private mapPrismaErrorToStatus(error: PrismaClientKnownRequestError): number {
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        return HttpStatus.CONFLICT;
      case 'P2025': // Record not found
        return HttpStatus.NOT_FOUND;
      case 'P2003': // Foreign key constraint violation
        return HttpStatus.BAD_REQUEST;
      case 'P2014': // Invalid data
        return HttpStatus.BAD_REQUEST;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  private mapPrismaErrorToMessage(error: PrismaClientKnownRequestError): string {
    switch (error.code) {
      case 'P2002':
        return 'A record with this information already exists';
      case 'P2025':
        return 'The requested record was not found';
      case 'P2003':
        return 'Invalid reference or relationship';
      case 'P2014':
        return 'Invalid data provided';
      default:
        return 'A database error occurred';
    }
  }

  private logError(exception: unknown, statusCode: number, request: Request): void {
    const logData = {
      method: request.method,
      url: request.url,
      userAgent: request.get('User-Agent'),
      ip: request.ip,
      statusCode,
      error: exception instanceof Error ? exception.message : 'Unknown error',
    };

    if (statusCode >= 500) {
      // Log server errors as errors
      this.logger.error('Unhandled Exception', {
        exception,
        request: logData,
      });
    } else if (statusCode >= 400) {
      // Log client errors as warnings
      this.logger.warn('Client Error', logData);
    } else {
      // Log other errors as debug
      this.logger.debug('Exception handled', logData);
    }
  }
}