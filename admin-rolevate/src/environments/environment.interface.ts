export interface Environment {
  production: boolean;
  apiUrl: string;
  appName: string;
  version: string;
  
  features: {
    enableAnalytics: boolean;
    enableDebugMode: boolean;
    enableMockData: boolean;
  };
  
  api: {
    timeout: number;
    retryAttempts: number;
  };
  
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableConsoleLogging: boolean;
  };
}
