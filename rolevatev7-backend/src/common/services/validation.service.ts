import { Injectable, BadRequestException } from '@nestjs/common';
import { VALIDATION, AUTH, FILE_UPLOAD } from '../constants/config.constants';

/**
 * Centralized validation service
 * Provides reusable validation methods using configuration constants
 */
@Injectable()
export class ValidationService {
  /**
   * Validate email format and length
   * @param email - Email address to validate
   * @param fieldName - Field name for error messages (default: 'Email')
   * @returns true if valid
   * @throws BadRequestException if invalid
   */
  validateEmail(email: string, fieldName: string = 'Email'): boolean {
    if (!email || typeof email !== 'string') {
      throw new BadRequestException(`${fieldName} is required`);
    }

    const trimmedEmail = email.trim();

    if (trimmedEmail.length > VALIDATION.EMAIL.MAX_LENGTH) {
      throw new BadRequestException(
        `${fieldName} must not exceed ${VALIDATION.EMAIL.MAX_LENGTH} characters`
      );
    }

    if (!VALIDATION.EMAIL.REGEX.test(trimmedEmail)) {
      throw new BadRequestException(`${fieldName} format is invalid`);
    }

    return true;
  }

  /**
   * Validate phone number format and length
   * @param phone - Phone number to validate
   * @param fieldName - Field name for error messages (default: 'Phone')
   * @returns true if valid
   * @throws BadRequestException if invalid
   */
  validatePhone(phone: string, fieldName: string = 'Phone'): boolean {
    if (!phone || typeof phone !== 'string') {
      throw new BadRequestException(`${fieldName} is required`);
    }

    // Remove common formatting characters
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

    if (cleanPhone.length < VALIDATION.PHONE.MIN_LENGTH) {
      throw new BadRequestException(
        `${fieldName} must be at least ${VALIDATION.PHONE.MIN_LENGTH} digits`
      );
    }

    if (cleanPhone.length > VALIDATION.PHONE.MAX_LENGTH) {
      throw new BadRequestException(
        `${fieldName} must not exceed ${VALIDATION.PHONE.MAX_LENGTH} digits`
      );
    }

    // Basic international phone number format: optional +, then digits
    const phoneRegex = /^[\+]?[1-9][\d]{0,}$/;
    if (!phoneRegex.test(cleanPhone)) {
      throw new BadRequestException(
        `${fieldName} format is invalid. Must start with + or a digit, followed by numbers`
      );
    }

    return true;
  }

  /**
   * Validate password meets security requirements
   * @param password - Password to validate
   * @param fieldName - Field name for error messages (default: 'Password')
   * @returns true if valid
   * @throws BadRequestException if invalid
   */
  validatePassword(password: string, fieldName: string = 'Password'): boolean {
    if (!password || typeof password !== 'string') {
      throw new BadRequestException(`${fieldName} is required`);
    }

    if (password.length < AUTH.PASSWORD_MIN_LENGTH) {
      throw new BadRequestException(
        `${fieldName} must be at least ${AUTH.PASSWORD_MIN_LENGTH} characters long`
      );
    }

    const errors: string[] = [];

    if (AUTH.PASSWORD_REQUIREMENTS.LOWERCASE && !/[a-z]/.test(password)) {
      errors.push('at least one lowercase letter');
    }

    if (AUTH.PASSWORD_REQUIREMENTS.UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('at least one uppercase letter');
    }

    if (AUTH.PASSWORD_REQUIREMENTS.NUMBER && !/\d/.test(password)) {
      errors.push('at least one number');
    }

    if (AUTH.PASSWORD_REQUIREMENTS.SPECIAL && !/[@$!%*?&]/.test(password)) {
      errors.push('at least one special character (@$!%*?&)');
    }

    if (errors.length > 0) {
      throw new BadRequestException(
        `${fieldName} must contain ${errors.join(', ')}`
      );
    }

    return true;
  }

  /**
   * Validate file size
   * @param sizeInBytes - File size in bytes
   * @param maxSize - Maximum allowed size in bytes (default: from FILE_UPLOAD.MAX_SIZE_BYTES)
   * @param fieldName - Field name for error messages (default: 'File')
   * @returns true if valid
   * @throws BadRequestException if invalid
   */
  validateFileSize(
    sizeInBytes: number,
    maxSize: number = FILE_UPLOAD.MAX_SIZE_BYTES,
    fieldName: string = 'File'
  ): boolean {
    if (sizeInBytes > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      throw new BadRequestException(
        `${fieldName} size exceeds maximum allowed size of ${maxSizeMB}MB`
      );
    }

    return true;
  }

  /**
   * Validate MIME type against allowed types
   * @param mimeType - MIME type to validate
   * @param allowedTypes - Array of allowed MIME types
   * @param fieldName - Field name for error messages (default: 'File')
   * @returns true if valid
   * @throws BadRequestException if invalid
   */
  validateMimeType(
    mimeType: string,
    allowedTypes: readonly string[],
    fieldName: string = 'File'
  ): boolean {
    if (!allowedTypes.includes(mimeType)) {
      throw new BadRequestException(
        `${fieldName} type is not allowed. Allowed types: ${allowedTypes.join(', ')}`
      );
    }

    return true;
  }

  /**
   * Validate date range (start date must be before end date)
   * @param startDate - Start date
   * @param endDate - End date
   * @param startFieldName - Start field name for error messages
   * @param endFieldName - End field name for error messages
   * @returns true if valid
   * @throws BadRequestException if invalid
   */
  validateDateRange(
    startDate: Date,
    endDate: Date,
    startFieldName: string = 'Start date',
    endFieldName: string = 'End date'
  ): boolean {
    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
      throw new BadRequestException(`${startFieldName} is invalid`);
    }

    if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
      throw new BadRequestException(`${endFieldName} is invalid`);
    }

    if (startDate >= endDate) {
      throw new BadRequestException(
        `${startFieldName} must be before ${endFieldName}`
      );
    }

    return true;
  }

  /**
   * Validate string length
   * @param value - String to validate
   * @param minLength - Minimum length
   * @param maxLength - Maximum length
   * @param fieldName - Field name for error messages
   * @returns true if valid
   * @throws BadRequestException if invalid
   */
  validateStringLength(
    value: string,
    minLength: number,
    maxLength: number,
    fieldName: string
  ): boolean {
    if (!value || typeof value !== 'string') {
      throw new BadRequestException(`${fieldName} is required`);
    }

    const trimmedValue = value.trim();

    if (trimmedValue.length < minLength) {
      throw new BadRequestException(
        `${fieldName} must be at least ${minLength} characters long`
      );
    }

    if (trimmedValue.length > maxLength) {
      throw new BadRequestException(
        `${fieldName} must not exceed ${maxLength} characters`
      );
    }

    return true;
  }

  /**
   * Validate name (using VALIDATION.NAME constants)
   * @param name - Name to validate
   * @param fieldName - Field name for error messages
   * @returns true if valid
   * @throws BadRequestException if invalid
   */
  validateName(name: string, fieldName: string = 'Name'): boolean {
    return this.validateStringLength(
      name,
      VALIDATION.NAME.MIN_LENGTH,
      VALIDATION.NAME.MAX_LENGTH,
      fieldName
    );
  }

  /**
   * Validate bio (using VALIDATION.BIO constants)
   * @param bio - Bio to validate
   * @param fieldName - Field name for error messages
   * @returns true if valid
   * @throws BadRequestException if invalid
   */
  validateBio(bio: string, fieldName: string = 'Bio'): boolean {
    if (!bio || typeof bio !== 'string') {
      // Bio is typically optional, so we just return true if not provided
      return true;
    }

    const trimmedBio = bio.trim();
    if (trimmedBio.length === 0) {
      return true; // Empty bio is valid
    }

    if (trimmedBio.length > VALIDATION.BIO.MAX_LENGTH) {
      throw new BadRequestException(
        `${fieldName} must not exceed ${VALIDATION.BIO.MAX_LENGTH} characters`
      );
    }

    return true;
  }

  /**
   * Validate description (using VALIDATION.DESCRIPTION constants)
   * @param description - Description to validate
   * @param fieldName - Field name for error messages
   * @returns true if valid
   * @throws BadRequestException if invalid
   */
  validateDescription(description: string, fieldName: string = 'Description'): boolean {
    if (!description || typeof description !== 'string') {
      // Description is typically optional, so we just return true if not provided
      return true;
    }

    const trimmedDescription = description.trim();
    if (trimmedDescription.length === 0) {
      return true; // Empty description is valid
    }

    if (trimmedDescription.length > VALIDATION.DESCRIPTION.MAX_LENGTH) {
      throw new BadRequestException(
        `${fieldName} must not exceed ${VALIDATION.DESCRIPTION.MAX_LENGTH} characters`
      );
    }

    return true;
  }

  /**
   * Validate CV file (MIME type and size)
   * @param mimeType - MIME type of the CV file
   * @param sizeInBytes - Size of the CV file in bytes
   * @returns true if valid
   * @throws BadRequestException if invalid
   */
  validateCVFile(mimeType: string, sizeInBytes: number): boolean {
    this.validateMimeType(mimeType, FILE_UPLOAD.ALLOWED_MIME_TYPES.CV, 'CV');
    this.validateFileSize(sizeInBytes, FILE_UPLOAD.MAX_SIZE_BYTES, 'CV');
    return true;
  }

  /**
   * Validate image file (MIME type and size)
   * @param mimeType - MIME type of the image file
   * @param sizeInBytes - Size of the image file in bytes
   * @returns true if valid
   * @throws BadRequestException if invalid
   */
  validateImageFile(mimeType: string, sizeInBytes: number): boolean {
    this.validateMimeType(mimeType, FILE_UPLOAD.ALLOWED_MIME_TYPES.IMAGE, 'Image');
    this.validateFileSize(sizeInBytes, FILE_UPLOAD.MAX_SIZE_BYTES, 'Image');
    return true;
  }

  /**
   * Validate video file (MIME type and size)
   * @param mimeType - MIME type of the video file
   * @param sizeInBytes - Size of the video file in bytes
   * @returns true if valid
   * @throws BadRequestException if invalid
   */
  validateVideoFile(mimeType: string, sizeInBytes: number): boolean {
    this.validateMimeType(mimeType, FILE_UPLOAD.ALLOWED_MIME_TYPES.VIDEO, 'Video');
    this.validateFileSize(sizeInBytes, FILE_UPLOAD.MAX_SIZE_BYTES, 'Video');
    return true;
  }
}
