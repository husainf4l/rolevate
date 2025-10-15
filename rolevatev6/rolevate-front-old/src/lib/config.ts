// API Configuration
const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://rolevate.com/api';

export const API_CONFIG = {
  BASE_URL: BASE_API_URL,
  API_BASE_URL: BASE_API_URL,
  UPLOADS_URL: `${BASE_API_URL}/uploads`,
};
