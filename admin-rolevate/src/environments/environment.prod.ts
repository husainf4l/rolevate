import { Environment } from './environment.interface';

export const environment: Environment = {
  production: true,
  // Use same-origin API path; Nginx will proxy /api -> https://rolevate.com/api
  apiUrl: '/api',
  appName: 'Rolevate Admin',
  version: '1.0.0',

  // Feature flags
  features: {
    enableAnalytics: true,
    enableDebugMode: false,
    enableMockData: false
  },

  // API Configuration
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3
  },

  // Logging
  logging: {
    level: 'error',
    enableConsoleLogging: false
  }
};
