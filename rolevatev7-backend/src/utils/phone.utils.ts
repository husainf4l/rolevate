/**
 * Format phone number to E.164 international format
 * Handles various input formats and standardizes them
 * 
 * Examples:
 * - 00962796026659 -> +962796026659
 * - 962796026659 -> +962796026659
 * - 0796026659 -> +962796026659
 * - +962796026659 -> +962796026659
 * 
 * @param phone - Phone number in various formats
 * @param defaultCountryCode - Default country code (default: 962 for Jordan)
 * @returns Formatted phone number in E.164 format
 */
export function formatPhoneNumber(phone: string, defaultCountryCode: string = '962'): string {
  if (!phone) {
    return phone;
  }

  // Remove all non-digit characters
  let cleanPhone = phone.replace(/\D/g, '');

  // Handle 00962... format
  if (cleanPhone.startsWith('00')) {
    cleanPhone = cleanPhone.substring(2);
  }
  // Handle 962... format (already has country code)
  else if (cleanPhone.startsWith(defaultCountryCode)) {
    // Keep as is
  }
  // Handle 07... format (local format)
  else if (cleanPhone.startsWith('0')) {
    cleanPhone = defaultCountryCode + cleanPhone.substring(1);
  }
  // Handle 7... format (local without leading 0)
  else if (!cleanPhone.startsWith('+')) {
    cleanPhone = defaultCountryCode + cleanPhone;
  }

  return `+${cleanPhone}`;
}

/**
 * Validate if phone number is in E.164 format
 * E.164 format: +[country code][subscriber number]
 * Example: +962796026659
 * 
 * @param phone - Phone number to validate
 * @returns true if valid E.164 format
 */
export function isValidE164PhoneNumber(phone: string): boolean {
  if (!phone) {
    return false;
  }

  // E.164 format: + followed by 1-3 digit country code and 7-14 digit subscriber number
  const e164Regex = /^\+[1-9]\d{7,14}$/;
  return e164Regex.test(phone);
}
