export const TIME_CONSTANTS = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  WHATSAPP_TOKEN_CACHE_TIME: 50 * 60 * 1000, // 50 minutes
  WHATSAPP_TOKEN_DURATION: 50 * 60 * 1000, // 50 minutes
  MINUTE: 60 * 1000, // 1 minute in milliseconds
  ONE_MINUTE_MS: 60 * 1000,
  ONE_HOUR_MS: 60 * 60 * 1000,
  ONE_DAY_MS: 24 * 60 * 60 * 1000,
  ONE_WEEK_MS: 7 * 24 * 60 * 60 * 1000,
} as const;

export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const PHONE_NUMBER_CONSTANTS = {
  DEFAULT_COUNTRY_CODE: '962', // Jordan
  MIN_LENGTH: 10,
  MAX_LENGTH: 15,
} as const;

export const FILE_UPLOAD_CONSTANTS = {
  MAX_SIZE_MB: 50,
  MAX_SIZE_BYTES: 50 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'] as const,
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] as const,
} as const;

export const CACHE_TTL = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 30 * 60, // 30 minutes
  LONG: 60 * 60, // 1 hour
  VERY_LONG: 24 * 60 * 60, // 24 hours
} as const;
