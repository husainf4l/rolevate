import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Environment
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(4005),

  // Database
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),

  // JWT Authentication
  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .messages({
      'string.min': 'JWT_SECRET must be at least 32 characters long',
      'any.required': 'JWT_SECRET is required for authentication',
    }),

  // CORS Configuration
  ALLOWED_ORIGINS: Joi.string()
    .required()
    .messages({
      'any.required': 'ALLOWED_ORIGINS must be set (comma-separated list of allowed origins)',
    }),

  // Frontend URL
  FRONTEND_URL: Joi.string()
    .uri()
    .required()
    .messages({
      'string.uri': 'FRONTEND_URL must be a valid URL',
      'any.required': 'FRONTEND_URL is required',
    }),

  // AWS Configuration
  AWS_REGION: Joi.string().required(),
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_BUCKET_NAME: Joi.string().required(),

  // OpenAI
  OPENAI_API_KEY: Joi.string().optional(),

  // LiveKit
  LIVEKIT_API_KEY: Joi.string().optional(),
  LIVEKIT_API_SECRET: Joi.string().optional(),
  LIVEKIT_URL: Joi.string().uri().optional(),

  // WhatsApp
  WHATSAPP_ACCESS_TOKEN: Joi.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: Joi.string().optional(),
  WHATSAPP_BUSINESS_ACCOUNT_ID: Joi.string().optional(),
  WHATSAPP_API_VERSION: Joi.string().default('v18.0'),
  WHATSAPP_VERIFY_TOKEN: Joi.string().optional(),

  // Facebook
  FACEBOOK_APP_ID: Joi.string().optional(),
  FACEBOOK_APP_SECRET: Joi.string().optional(),
  FACEBOOK_SYSTEM_USER_ID: Joi.string().optional(),
  FACEBOOK_SYSTEM_USER_TOKEN: Joi.string().optional(),

  // External Services
  CV_ANALYSIS_API_URL: Joi.string().uri().optional(),
  GRAPHQL_API_URL: Joi.string().uri().optional(),
  SYSTEM_API_KEY: Joi.string().optional(),

  // Email Service (Mailgun)
  MAILGUN_API_KEY: Joi.string().optional(),
  MAILGUN_DOMAIN: Joi.string().optional(),

  // SMS Service
  SMS_API_KEY: Joi.string().optional(),
  SMS_API_URL: Joi.string().uri().optional(),
});
