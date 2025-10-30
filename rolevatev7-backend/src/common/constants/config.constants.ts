/**
 * Application Configuration Constants
 * Centralized configuration values to avoid magic numbers throughout the codebase
 */

// File Upload Limits
export const FILE_UPLOAD = {
  MAX_SIZE_BYTES: 50 * 1024 * 1024, // 50MB
  MAX_SIZE_AFTER_BASE64: 37 * 1024 * 1024, // ~37MB original file after base64 encoding
  ALLOWED_MIME_TYPES: {
    CV: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    VIDEO: ['video/mp4', 'video/mpeg', 'video/quicktime'],
  },
} as const;

// Authentication & Security
export const AUTH = {
  BCRYPT_ROUNDS: 12,
  JWT_EXPIRY: '24h',
  REFRESH_TOKEN_EXPIRY: '7d',
  RESET_TOKEN_EXPIRY_MINUTES: 15,
  OTP_EXPIRY_MINUTES: 10,
  MAX_LOGIN_ATTEMPTS: 5,
  ACCOUNT_LOCKOUT_DURATION_MINUTES: 30,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIREMENTS: {
    LOWERCASE: true,
    UPPERCASE: true,
    NUMBER: true,
    SPECIAL: true,
  },
} as const;

// Rate Limiting
export const RATE_LIMIT = {
  DEFAULT: {
    TTL: 60000, // 1 minute
    LIMIT: 100, // 100 requests per minute
  },
  AUTH: {
    TTL: 60000, // 1 minute
    LIMIT: 5, // 5 authentication attempts per minute
  },
  PASSWORD_RESET: {
    TTL: 3600000, // 1 hour
    LIMIT: 3, // 3 reset attempts per hour per email
  },
  OTP: {
    TTL: 3600000, // 1 hour
    LIMIT: 5, // 5 OTP requests per hour per phone
  },
  API: {
    TTL: 60000, // 1 minute
    LIMIT: 60, // 60 requests per minute for API endpoints
  },
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;

// Cache TTL (Time To Live)
export const CACHE_TTL = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 15 * 60, // 15 minutes
  LONG: 30 * 60, // 30 minutes
  VERY_LONG: 60 * 60, // 1 hour
  JOB_LISTINGS: 5 * 60, // 5 minutes
  COMPANY_PROFILE: 30 * 60, // 30 minutes
  USER_PROFILE: 15 * 60, // 15 minutes
  CANDIDATE_PROFILE: 15 * 60, // 15 minutes
} as const;

// Audit Log
export const AUDIT_LOG = {
  RETENTION_DAYS: 90, // Keep audit logs for 90 days
  CLEANUP_HOUR: 2, // Run cleanup at 2 AM
} as const;

// Session Management
export const SESSION = {
  MAX_ACTIVE_SESSIONS: 5, // Maximum concurrent sessions per user
  IDLE_TIMEOUT_MINUTES: 30, // Auto-logout after 30 minutes of inactivity
  ABSOLUTE_TIMEOUT_HOURS: 24, // Force logout after 24 hours
} as const;

// LiveKit (Video Interviews)
export const LIVEKIT = {
  TOKEN_TTL_SECONDS: 3600, // 1 hour
  ROOM_EMPTY_TIMEOUT_MINUTES: 10, // Close empty rooms after 10 minutes
  MAX_PARTICIPANTS: 10,
  RECORDING_RETENTION_DAYS: 30,
} as const;

// Communication
export const COMMUNICATION = {
  EMAIL: {
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 1000,
    TIMEOUT_MS: 30000,
  },
  SMS: {
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 1000,
    TIMEOUT_MS: 10000,
    REQUEST_TIMEOUT_MS: 5000000, // JOSMS API request timeout
    MAX_LENGTH: 160, // Single SMS length
  },
  WHATSAPP: {
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 1000,
    TIMEOUT_MS: 30000,
  },
} as const;

// Background Jobs
export const JOBS = {
  CV_ANALYSIS: {
    TIMEOUT_MS: 300000, // 5 minutes
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 5000,
  },
  EMAIL_SENDING: {
    TIMEOUT_MS: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 2000,
  },
  NOTIFICATION: {
    BATCH_SIZE: 100,
    PROCESSING_INTERVAL_MS: 5000,
  },
} as const;

// Validation
export const VALIDATION = {
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
    DEFAULT_COUNTRY_CODE: '962', // Jordan
  },
  EMAIL: {
    MAX_LENGTH: 255,
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
  BIO: {
    MAX_LENGTH: 1000,
  },
  DESCRIPTION: {
    MAX_LENGTH: 5000,
  },
} as const;

// Application States
export const APPLICATION = {
  STATUS_TRANSITIONS: {
    PENDING: ['REVIEWED', 'ANALYZED', 'REJECTED'],
    REVIEWED: ['ANALYZED', 'SHORTLISTED', 'INTERVIEWED', 'REJECTED'],
    ANALYZED: ['REVIEWED', 'SHORTLISTED', 'INTERVIEWED', 'REJECTED'],
    SHORTLISTED: ['INTERVIEWED', 'REJECTED'],
    INTERVIEWED: ['OFFERED', 'REJECTED'],
    OFFERED: ['HIRED', 'REJECTED'],
    HIRED: [],
    REJECTED: [],
    WITHDRAWN: [],
  },
  DEADLINE_REMINDER_DAYS: [7, 3, 1], // Send reminders 7, 3, and 1 day before deadline
} as const;

// Error Codes
export const ERROR_CODES = {
  // Authentication (1000-1999)
  INVALID_CREDENTIALS: 1000,
  ACCOUNT_LOCKED: 1001,
  TOKEN_EXPIRED: 1002,
  INVALID_TOKEN: 1003,
  INSUFFICIENT_PERMISSIONS: 1004,
  
  // Validation (2000-2999)
  INVALID_INPUT: 2000,
  MISSING_REQUIRED_FIELD: 2001,
  INVALID_EMAIL: 2002,
  INVALID_PHONE: 2003,
  INVALID_DATE_RANGE: 2004,
  
  // Resource (3000-3999)
  RESOURCE_NOT_FOUND: 3000,
  RESOURCE_ALREADY_EXISTS: 3001,
  RESOURCE_IN_USE: 3002,
  
  // Business Logic (4000-4999)
  INVALID_STATE_TRANSITION: 4000,
  DUPLICATE_APPLICATION: 4001,
  APPLICATION_DEADLINE_PASSED: 4002,
  JOB_NOT_ACTIVE: 4003,
  
  // External Services (5000-5999)
  EXTERNAL_SERVICE_ERROR: 5000,
  CV_ANALYSIS_FAILED: 5001,
  EMAIL_SEND_FAILED: 5002,
  SMS_SEND_FAILED: 5003,
  WHATSAPP_SEND_FAILED: 5004,
  
  // System (9000-9999)
  INTERNAL_SERVER_ERROR: 9000,
  DATABASE_ERROR: 9001,
  CONFIGURATION_ERROR: 9002,
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Database
export const DATABASE = {
  CONNECTION_POOL_SIZE: 10,
  CONNECTION_TIMEOUT_MS: 5000,
  QUERY_TIMEOUT_MS: 30000,
  MIGRATION_TABLE_NAME: 'migrations',
} as const;

// Notification
export const NOTIFICATION = {
  MAX_UNREAD: 100, // Archive old notifications after reaching this limit
  RETENTION_DAYS: 30, // Delete read notifications after 30 days
  BATCH_FETCH_SIZE: 20,
} as const;

// Search & Filtering
export const SEARCH = {
  MIN_QUERY_LENGTH: 3,
  MAX_QUERY_LENGTH: 100,
  RESULTS_PER_PAGE: 10,
  MAX_RESULTS: 1000,
} as const;

/**
 * Environment variable names
 * Use these constants to access environment variables consistently
 */
export const ENV_VARS = {
  // Database
  DATABASE_HOST: 'DATABASE_HOST',
  DATABASE_PORT: 'DATABASE_PORT',
  DATABASE_USERNAME: 'DATABASE_USERNAME',
  DATABASE_PASSWORD: 'DATABASE_PASSWORD',
  DATABASE_NAME: 'DATABASE_NAME',
  
  // Authentication
  JWT_SECRET: 'JWT_SECRET',
  BCRYPT_ROUNDS: 'BCRYPT_ROUNDS',
  RESET_TOKEN_EXPIRY_MINUTES: 'RESET_TOKEN_EXPIRY_MINUTES',
  SYSTEM_API_KEY: 'SYSTEM_API_KEY',
  
  // AWS
  AWS_ACCESS_KEY_ID: 'AWS_ACCESS_KEY_ID',
  AWS_SECRET_ACCESS_KEY: 'AWS_SECRET_ACCESS_KEY',
  AWS_REGION: 'AWS_REGION',
  AWS_BUCKET_NAME: 'AWS_BUCKET_NAME',
  EMAIL_FROM: 'EMAIL_FROM',
  
  // External Services
  CV_ANALYSIS_API_URL: 'CV_ANALYSIS_API_URL',
  GRAPHQL_API_URL: 'GRAPHQL_API_URL',
  OPENAI_API_KEY: 'OPENAI_API_KEY',
  LIVEKIT_URL: 'LIVEKIT_URL',
  LIVEKIT_API_KEY: 'LIVEKIT_API_KEY',
  LIVEKIT_API_SECRET: 'LIVEKIT_API_SECRET',
  
  // WhatsApp
  WHATSAPP_VERIFY_TOKEN: 'WHATSAPP_VERIFY_TOKEN',
  WHATSAPP_APP_SECRET: 'WHATSAPP_APP_SECRET',
  WHATSAPP_PHONE_NUMBER_ID: 'WHATSAPP_PHONE_NUMBER_ID',
  WHATSAPP_BUSINESS_ACCOUNT_ID: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
  
  // Application
  NODE_ENV: 'NODE_ENV',
  PORT: 'PORT',
  ALLOWED_ORIGINS: 'ALLOWED_ORIGINS',
  FRONTEND_URL: 'FRONTEND_URL',
  AUDIT_LOG_RETENTION_DAYS: 'AUDIT_LOG_RETENTION_DAYS',
} as const;
