import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || message;
      }
    } else {
      // Log unknown errors but don't expose details
      this.logger.error(`Unhandled exception: ${exception}`, exception instanceof Error ? exception.stack : '');
    }

    // Don't expose stack traces or sensitive information
    if (typeof response.code === 'function') {
      response.code(status).send({
        statusCode: status,
        message: status === HttpStatus.INTERNAL_SERVER_ERROR ? 'Internal server error' : message,
        timestamp: new Date().toISOString(),
        path: (request as any)?.url || request?.raw?.url || 'unknown',
      });
    } else {
      // For GraphQL or other non-HTTP contexts, rethrow the exception
      throw exception;
    }
  }
}