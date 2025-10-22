// API Configuration
const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://rolevate.com/api';

export const API_CONFIG = {
  BASE_URL: BASE_API_URL,
  API_BASE_URL: BASE_API_URL,
  UPLOADS_URL: `${BASE_API_URL}/uploads`,
  FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  
  // LiveKit Configuration
  LIVEKIT: {
    SERVER_URL: process.env.NEXT_PUBLIC_LIVEKIT_SERVER_URL || 'ws://localhost:7880',
    API_KEY: process.env.LIVEKIT_API_KEY,
    API_SECRET: process.env.LIVEKIT_API_SECRET,
  },
  
  // Interview Settings
  INTERVIEW: {
    DEFAULT_DURATION: 30 * 60, // 30 minutes in seconds
    MAX_DURATION: 60 * 60, // 1 hour in seconds
    RECONNECT_ATTEMPTS: 3,
    RECONNECT_DELAY: 2000, // 2 seconds
  },
  
  // API Endpoints
  ENDPOINTS: {
    JOBS: '/api/jobs',
    APPLICATIONS: '/api/applications',
    AUTH: '/api/auth',
    INTERVIEWS: '/api/interviews',
    ROOMS: '/api/rooms',
  },
  
  // Feature Flags
  FEATURES: {
    DISABLE_API_CALLS: process.env.NEXT_PUBLIC_DISABLE_API_CALLS === 'true',
    ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    ENABLE_DEBUG: process.env.NODE_ENV === 'development',
  }
};

export default API_CONFIG;