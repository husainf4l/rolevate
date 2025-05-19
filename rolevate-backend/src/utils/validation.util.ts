import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Validate that a string is not empty
 * @param value The value to validate
 * @param name The name of the value (for error messages)
 * @throws HttpException if the value is empty
 */
export function validateNotEmpty(value: string, name: string): void {
  if (!value || value.trim() === '') {
    throw new HttpException(
      `${name} cannot be empty`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Validate that a value is a valid UUID
 * @param value The value to validate
 * @param name The name of the value (for error messages)
 * @throws HttpException if the value is not a valid UUID
 */
export function validateUuid(value: string, name: string): void {
  const uuidRegex = 
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!value || !uuidRegex.test(value)) {
    throw new HttpException(
      `${name} must be a valid UUID`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Validate that a value is a valid URL
 * @param value The value to validate
 * @param name The name of the value (for error messages)
 * @throws HttpException if the value is not a valid URL
 */
export function validateUrl(value: string, name: string): void {
  try {
    new URL(value);
  } catch (error) {
    throw new HttpException(
      `${name} must be a valid URL`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Validate that a value is a positive number
 * @param value The value to validate
 * @param name The name of the value (for error messages)
 * @throws HttpException if the value is not a positive number
 */
export function validatePositiveNumber(value: number, name: string): void {
  if (typeof value !== 'number' || isNaN(value) || value <= 0) {
    throw new HttpException(
      `${name} must be a positive number`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Sanitize a string by removing any potentially dangerous characters
 * @param value The string to sanitize
 * @returns The sanitized string
 */
export function sanitizeString(value: string): string {
  if (!value) return '';
  
  // Remove any HTML tags
  return value
    .replace(/<[^>]*>?/gm, '')
    // Remove any script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Replace multiple spaces with a single space
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate a random room name
 * @param prefix Optional prefix for the room name
 * @returns A random room name
 */
export function generateRoomName(prefix: string = 'interview'): string {
  const randomChars = Math.random().toString(36).substring(2, 10);
  const timestamp = Date.now().toString(36);
  return `${prefix}-${randomChars}-${timestamp}`;
}
