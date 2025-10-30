// API Configuration - Development URL (using Next.js proxy to avoid CORS)
// Base API URL Configuration
// In Docker, use host.docker.internal to access host machine for SSR
// But in browser, always use localhost:4005 since browser runs on host machine
const getApiHost = () => {
  // Server-side (Node.js in Docker)
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:4005';
  }
  // Client-side (Browser) - always use localhost since browser runs on host
  return 'http://localhost:4005';
};

const API_HOST = getApiHost();
const BASE_API_URL = `${API_HOST}/api`;

export const API_CONFIG = {
  BASE_URL: BASE_API_URL,
  API_BASE_URL: BASE_API_URL,
  UPLOADS_URL: `${API_HOST}/api/uploads`,
  GRAPHQL_URL: `${BASE_API_URL}/graphql`,
};
