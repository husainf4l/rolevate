import { Environment } from './environment.interface';

export const environment: Environment = {
  production: false,
  apiUrl: 'http://localhost:4005/api',
  appName: 'Rolevate Admin',
  version: '1.0.0',
  
  // Feature flags
  features: {
    enableAnalytics: false,
    enableDebugMode: true,
    enableMockData: false
  },
  
  // API Configuration
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3
  },
  
  // Logging
  logging: {
    level: 'debug',
    enableConsoleLogging: true
  }
};
