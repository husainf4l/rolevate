import { NotFoundException } from '@nestjs/common';
import { ERROR_CODES } from '../constants/config.constants';

/**
 * Exception for resource not found errors
 * Extends NotFoundException with error code support
 */
export class ResourceNotFoundException extends NotFoundException {
  constructor(
    resourceType: string,
    resourceId?: string,
    public readonly errorCode: number = ERROR_CODES.RESOURCE_NOT_FOUND
  ) {
    const message = resourceId
      ? `${resourceType} with ID '${resourceId}' not found`
      : `${resourceType} not found`;

    super({
      statusCode: 404,
      errorCode,
      message,
      error: 'Resource Not Found',
    });
  }

  /**
   * Create exception for application not found
   */
  static application(applicationId: string): ResourceNotFoundException {
    return new ResourceNotFoundException('Application', applicationId);
  }

  /**
   * Create exception for job not found
   */
  static job(jobId: string): ResourceNotFoundException {
    return new ResourceNotFoundException('Job', jobId);
  }

  /**
   * Create exception for user not found
   */
  static user(userId: string): ResourceNotFoundException {
    return new ResourceNotFoundException('User', userId);
  }

  /**
   * Create exception for company not found
   */
  static company(companyId: string): ResourceNotFoundException {
    return new ResourceNotFoundException('Company', companyId);
  }

  /**
   * Create exception for candidate profile not found
   */
  static candidateProfile(profileId: string): ResourceNotFoundException {
    return new ResourceNotFoundException('Candidate Profile', profileId);
  }

  /**
   * Create exception for application note not found
   */
  static applicationNote(noteId: string): ResourceNotFoundException {
    return new ResourceNotFoundException('Application Note', noteId);
  }
}
