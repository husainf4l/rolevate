import { HttpException, HttpStatus, Logger } from '@nestjs/common';

/**
 * Handle errors consistently across the application
 * @param error The error to handle
 * @param logger The logger instance
 * @param errorMessage A custom error message
 * @throws HttpException with appropriate status and message
 */
export function handleError(
  error: any,
  logger: Logger,
  errorMessage: string = 'An error occurred',
): never {
  // Log the error
  logger.error(`${errorMessage}: ${error.message}`, error.stack);
  
  // If the error is already an HttpException, rethrow it
  if (error instanceof HttpException) {
    throw error;
  }
  
  // Handle different types of errors
  if (error.code === 'ECONNREFUSED') {
    throw new HttpException(
      'Unable to connect to external service',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
  
  if (error.code === 'ETIMEDOUT') {
    throw new HttpException(
      'Connection to external service timed out',
      HttpStatus.GATEWAY_TIMEOUT,
    );
  }
  
  if (error.response && error.response.status) {
    // Handle errors from external APIs
    throw new HttpException(
      `External API error: ${error.response.data?.message || error.message}`,
      error.response.status,
    );
  }
  
  // Default error handler
  throw new HttpException(
    errorMessage,
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}

/**
 * Create a standardized error response object
 * @param message The error message
 * @param statusCode The HTTP status code
 * @param details Additional error details
 * @returns A standardized error response object
 */
export function createErrorResponse(
  message: string,
  statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
  details?: any,
): any {
  return {
    error: {
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      details,
    },
  };
}
