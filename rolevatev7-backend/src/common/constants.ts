export const TIME_CONSTANTS = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  WHATSAPP_TOKEN_CACHE_TIME: 50 * 60 * 1000, // 50 minutes
  WHATSAPP_TOKEN_DURATION: 50 * 60 * 1000, // 50 minutes
  MINUTE: 60 * 1000, // 1 minute in milliseconds
} as const;
