export const AUTH_CONSTANTS = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRATION: '24h',
  BCRYPT_ROUNDS: 12,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_RESET_EXPIRATION: 3600000, // 1 hour in milliseconds
  TEMP_PASSWORD_LENGTH: 12,
} as const;

export const RATE_LIMIT = {
  LOGIN: {
    TTL: 300000, // 5 minutes
    LIMIT: 5,
  },
  FORGOT_PASSWORD: {
    TTL: 300000, // 5 minutes
    LIMIT: 3,
  },
  RESET_PASSWORD: {
    TTL: 300000, // 5 minutes
    LIMIT: 5,
  },
} as const;
