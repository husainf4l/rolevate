import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { ConfigService } from '@nestjs/config';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly isDevelopment: boolean;

  constructor(configService: ConfigService) {
    this.isDevelopment = configService.get('NODE_ENV') !== 'production';
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let stack: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || message;
      }
      stack = exception.stack;
    } else if (exception instanceof Error) {
      message = this.isDevelopment ? exception.message : 'Internal server error';
      stack = exception.stack;
    }

    // Always log the full error server-side
    this.logger.error(
      `HTTP ${status} Error: ${message}`,
      stack,
      `Path: ${(request as any)?.url || request?.raw?.url || 'unknown'}`
    );

    // Prepare response
    const errorResponse: any = {
      statusCode: status,
      message: status === HttpStatus.INTERNAL_SERVER_ERROR && !this.isDevelopment
        ? 'Internal server error'
        : message,
      timestamp: new Date().toISOString(),
      path: (request as any)?.url || request?.raw?.url || 'unknown',
    };

    // Include stack trace only in development
    if (this.isDevelopment && stack) {
      errorResponse.stack = stack;
    }

    // Send response
    if (typeof response.code === 'function') {
      response.code(status).send(errorResponse);
    } else {
      // For GraphQL or other non-HTTP contexts, rethrow the exception
      throw exception;
    }
  }
}