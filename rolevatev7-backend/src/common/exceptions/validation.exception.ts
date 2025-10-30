import { HttpException } from '@nestjs/common';
import { HTTP_STATUS } from '../constants/config.constants';

/**
 * Field-level validation error details
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Exception for validation errors with field-level details
 */
export class ValidationException extends HttpException {
  constructor(
    message: string,
    public readonly errors: ValidationError[],
    public readonly errorCode: number = 2000, // Default validation error code
    statusCode: number = HTTP_STATUS.UNPROCESSABLE_ENTITY
  ) {
    super(
      {
        statusCode,
        errorCode,
        message,
        errors,
        error: 'Validation Error',
      },
      statusCode
    );
  }

  /**
   * Create ValidationException from a single field error
   */
  static fromField(field: string, message: string, value?: any): ValidationException {
    return new ValidationException('Validation failed', [{ field, message, value }]);
  }

  /**
   * Create ValidationException from multiple field errors
   */
  static fromFields(errors: ValidationError[]): ValidationException {
    return new ValidationException('Validation failed', errors);
  }
}
