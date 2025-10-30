import { Transform } from 'class-transformer';

/**
 * Sanitization Decorators
 * Common transformations for input sanitization
 */

/**
 * Trims whitespace and converts email to lowercase
 * Use on email fields
 */
export function SanitizeEmail() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim().toLowerCase();
    }
    return value;
  });
}

/**
 * Trims whitespace from string fields
 * Use on text inputs like names, descriptions, etc.
 */
export function TrimString() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  });
}

/**
 * Removes HTML tags and scripts from string
 * Use on user-generated content fields
 */
export function StripHtml() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
        .replace(/<[^>]+>/g, '') // Remove HTML tags
        .trim();
    }
    return value;
  });
}

/**
 * Normalizes phone numbers by removing non-digit characters
 * Use on phone number fields
 */
export function NormalizePhone() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.replace(/\D/g, '');
    }
    return value;
  });
}

/**
 * Converts string to lowercase
 * Use on case-insensitive fields
 */
export function ToLowerCase() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase();
    }
    return value;
  });
}

/**
 * Converts string to uppercase
 * Use on fields that should be uppercase
 */
export function ToUpperCase() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toUpperCase();
    }
    return value;
  });
}
