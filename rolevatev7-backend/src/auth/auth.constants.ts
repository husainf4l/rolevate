/**
 * Authentication-related constants
 */
export const AUTH_CONSTANTS = {
  // Password Reset
  RESET_TOKEN_EXPIRY_MINUTES: 15,
  RESET_TOKEN_LENGTH: 6,
  RESET_TOKEN_MIN: 100000,
  RESET_TOKEN_MAX: 900000,
  
  // Password Requirements
  MIN_PASSWORD_LENGTH: 12,
  PASSWORD_CHARSET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&',
  
  // Security
  BCRYPT_ROUNDS: 12,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
} as const;
