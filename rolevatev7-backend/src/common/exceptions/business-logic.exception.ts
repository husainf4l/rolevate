import { HttpException } from '@nestjs/common';
import { HTTP_STATUS } from '../constants/config.constants';

/**
 * Base exception for business logic errors
 * Includes error code for client-side handling
 */
export class BusinessLogicException extends HttpException {
  constructor(
    message: string,
    public readonly errorCode: number,
    statusCode: number = HTTP_STATUS.BAD_REQUEST
  ) {
    super(
      {
        statusCode,
        errorCode,
        message,
        error: 'Business Logic Error',
      },
      statusCode
    );
  }
}
