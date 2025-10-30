// API Configuration - Using Next.js API proxy to avoid CORS issues
// The proxy routes requests to the actual backend
const getApiHost = () => {
  // Always use the Next.js API proxy route (client and server)
  // This proxies to the actual backend: http://192.168.1.210:4005
  return typeof window === 'undefined' 
    ? process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000'
    : '';
};

const API_HOST = getApiHost();
const BASE_API_URL = API_HOST ? `${API_HOST}/api` : '/api';

export const API_CONFIG = {
  BASE_URL: BASE_API_URL,
  API_BASE_URL: BASE_API_URL,
  UPLOADS_URL: `${API_HOST}/api/uploads`,
  GRAPHQL_URL: `${BASE_API_URL}/graphql`,
};
