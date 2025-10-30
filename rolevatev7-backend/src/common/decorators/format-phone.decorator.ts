import { Transform } from 'class-transformer';
import { formatPhoneNumber } from '../../utils/phone.utils';

/**
 * Decorator to automatically format phone numbers to E.164 format
 * Handles various input formats: 00962..., 962..., 0796..., +962...
 * Applies before validation, ensuring phone numbers are standardized
 */
export function FormatPhone() {
  return Transform(({ value }) => {
    if (!value || typeof value !== 'string') {
      return value;
    }
    try {
      return formatPhoneNumber(value);
    } catch (error) {
      // If formatting fails, return original value for validation to handle
      return value;
    }
  });
}
