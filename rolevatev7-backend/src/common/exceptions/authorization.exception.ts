import { ForbiddenException } from '@nestjs/common';
import { ERROR_CODES } from '../constants/config.constants';

/**
 * Exception for authorization failures
 * Extends ForbiddenException with error code support
 */
export class AuthorizationException extends ForbiddenException {
  constructor(
    message: string = 'You do not have permission to perform this action',
    public readonly errorCode: number = ERROR_CODES.INSUFFICIENT_PERMISSIONS
  ) {
    super({
      statusCode: 403,
      errorCode,
      message,
      error: 'Authorization Error',
    });
  }

  /**
   * Create exception for resource ownership violation
   */
  static resourceOwnership(resourceType: string): AuthorizationException {
    return new AuthorizationException(
      `You do not have permission to access this ${resourceType}`,
      ERROR_CODES.INSUFFICIENT_PERMISSIONS
    );
  }

  /**
   * Create exception for insufficient role permissions
   */
  static insufficientRole(requiredRole: string): AuthorizationException {
    return new AuthorizationException(
      `This action requires ${requiredRole} role`,
      ERROR_CODES.INSUFFICIENT_PERMISSIONS
    );
  }

  /**
   * Create exception for company access violation
   */
  static companyAccess(): AuthorizationException {
    return new AuthorizationException(
      'You can only access resources from your own company',
      ERROR_CODES.INSUFFICIENT_PERMISSIONS
    );
  }
}
