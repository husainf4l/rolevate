// API Configuration - Development URL (using Next.js proxy to avoid CORS)
const BASE_API_URL = '/api';

export const API_CONFIG = {
  BASE_URL: BASE_API_URL,
  API_BASE_URL: BASE_API_URL,
  UPLOADS_URL: 'http://localhost:4005/api/uploads', // Direct for uploads
};
