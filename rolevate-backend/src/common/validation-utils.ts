/**
 * Reusable validation utilities for common validation patterns
 * Provides centralized validation logic that can be used across services
 */

import { BadRequestException } from '@nestjs/common';
import { ERROR_MESSAGES } from './constants';

export class ValidationUtils {
  /**
   * Validates that a required field is not empty or null
   * @param value - Value to check
   * @param fieldName - Name of the field for error messages
   * @throws BadRequestException if value is empty/null
   */
  static validateRequired(value: any, fieldName: string): void {
    if (value === null || value === undefined || value === '') {
      throw new BadRequestException(ERROR_MESSAGES.REQUIRED_FIELD(fieldName));
    }
  }

  /**
   * Validates string length constraints
   * @param value - String value to validate
   * @param fieldName - Name of the field for error messages
   * @param minLength - Minimum allowed length (optional)
   * @param maxLength - Maximum allowed length (optional)
   * @throws BadRequestException if length constraints are violated
   */
  static validateStringLength(
    value: string,
    fieldName: string,
    minLength?: number,
    maxLength?: number
  ): void {
    if (minLength !== undefined && value.length < minLength) {
      throw new BadRequestException(ERROR_MESSAGES.VALUE_TOO_SHORT(fieldName, minLength));
    }

    if (maxLength !== undefined && value.length > maxLength) {
      throw new BadRequestException(ERROR_MESSAGES.VALUE_TOO_LONG(fieldName, maxLength));
    }
  }

  /**
   * Validates email format using basic regex
   * @param email - Email string to validate
   * @throws BadRequestException if email format is invalid
   */
  static validateEmailFormat(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_FORMAT('email'));
    }
  }

  /**
   * Validates phone number format (accepts international or local formats)
   * @param phone - Phone number string to validate
   * @throws BadRequestException if phone format is invalid
   */
  static validatePhoneFormat(phone: string): void {
    // Remove all non-digit characters except +
    const cleanPhone = phone.replace(/[^\d+]/g, '');

    // Check for international format: starts with + and at least 10 digits after +
    if (cleanPhone.startsWith('+') && cleanPhone.length >= 11) {
      return;
    }

    // Check for local format: starts with 0 and has exactly 10 digits
    if (cleanPhone.startsWith('0') && cleanPhone.length === 10 && /^\d+$/.test(cleanPhone)) {
      return;
    }

    throw new BadRequestException(ERROR_MESSAGES.INVALID_FORMAT('phone number'));
  }

  /**
   * Validates URL format
   * @param url - URL string to validate
   * @throws BadRequestException if URL format is invalid
   */
  static validateUrlFormat(url: string): void {
    try {
      new URL(url);
    } catch {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_FORMAT('URL'));
    }
  }

  /**
   * Validates that a value is within a numeric range
   * @param value - Number to validate
   * @param fieldName - Name of the field for error messages
   * @param min - Minimum allowed value (optional)
   * @param max - Maximum allowed value (optional)
   * @throws BadRequestException if value is outside the allowed range
   */
  static validateNumericRange(
    value: number,
    fieldName: string,
    min?: number,
    max?: number
  ): void {
    if (min !== undefined && value < min) {
      throw new BadRequestException(`${fieldName} must be at least ${min}`);
    }

    if (max !== undefined && value > max) {
      throw new BadRequestException(`${fieldName} must be at most ${max}`);
    }
  }

  /**
   * Validates enum values
   * @param value - Value to check against enum
   * @param enumObject - Enum object to validate against
   * @param fieldName - Name of the field for error messages
   * @throws BadRequestException if value is not in the enum
   */
  static validateEnumValue(value: any, enumObject: any, fieldName: string): void {
    const enumValues = Object.values(enumObject);
    if (!enumValues.includes(value)) {
      throw new BadRequestException(`Invalid ${fieldName} value`);
    }
  }

  /**
   * Sanitizes and validates pagination parameters
   * @param limit - Requested limit
   * @param offset - Requested offset
   * @returns Sanitized pagination parameters
   */
  static sanitizePagination(limit?: number, offset?: number): { limit: number; offset: number } {
    const sanitizedLimit = Math.min(
      Math.max(1, limit ?? 20),
      100 // Max limit
    );

    const sanitizedOffset = Math.max(0, offset ?? 0);

    return {
      limit: sanitizedLimit,
      offset: sanitizedOffset,
    };
  }

  /**
   * Validates business rules for job postings
   * @param jobData - Job data to validate
   * @throws BadRequestException if business rules are violated
   */
  static validateJobPostingRules(jobData: any): void {
    // Validate deadline is in the future
    if (new Date(jobData.deadline) <= new Date()) {
      throw new BadRequestException('Job deadline must be in the future');
    }

    // Validate salary format (basic check)
    if (jobData.salary && !/^[$\d\s\-+,()A-Za-z]+$/.test(jobData.salary)) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_FORMAT('salary'));
    }

    // Validate required fields for active jobs
    if (jobData.status === 'ACTIVE') {
      this.validateRequired(jobData.title, 'title');
      this.validateRequired(jobData.description, 'description');
      this.validateRequired(jobData.location, 'location');
    }
  }

  /**
   * Validates business rules for user registration
   * @param userData - User data to validate
   * @throws BadRequestException if business rules are violated
   */
  static validateUserRegistrationRules(userData: any): void {
    // Validate user type is allowed
    if (userData.userType === 'ADMIN') {
      throw new BadRequestException('Admin registration is not allowed through public signup');
    }

    // Validate email format
    this.validateEmailFormat(userData.email);

    // Validate name length
    this.validateStringLength(userData.name, 'name', 2, 100);

    // Validate phone format if provided
    if (userData.phone) {
      this.validatePhoneFormat(userData.phone);
    }
  }
}