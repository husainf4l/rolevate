import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // Get the request ID if available
    const requestId = request['requestId'] || 'unknown';
    
    // Determine the status code and error message
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    
    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';
    
    // Log the error with request details
    this.logger.error(
      `[${requestId}] ${request.method} ${request.url} - ${status} ${message}`,
      exception.stack,
    );
    
    // Create a standardized error response
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
      requestId: requestId,
    };
    
    // Add stack trace in development environment
    if (process.env.NODE_ENV === 'development') {
      errorResponse['stack'] = exception.stack;
    }
    
    // Send the error response
    response.status(status).json(errorResponse);
  }
}
