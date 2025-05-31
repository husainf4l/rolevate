/**
 * Debug utilities for authentication issues
 * This helps diagnose HTTP-only cookie and authentication problems
 */

import { API_URL } from './env';

export interface AuthDebugInfo {
  currentUrl: string;
  documentCookies: string;
  userAgent: string;
  apiUrl: string;
  timestamp: string;
  origin: string;
}

export function getAuthDebugInfo(): AuthDebugInfo {
  return {
    currentUrl: typeof window !== 'undefined' ? window.location.href : 'N/A',
    documentCookies: typeof document !== 'undefined' ? document.cookie : 'N/A',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    apiUrl: API_URL,
    timestamp: new Date().toISOString(),
    origin: typeof window !== 'undefined' ? window.location.origin : 'N/A',
  };
}

export async function debugAuthRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const debugInfo = getAuthDebugInfo();
  
  console.log('[AuthDebug] Making request to:', `${API_URL}${endpoint}`);
  console.log('[AuthDebug] Debug info:', debugInfo);
  console.log('[AuthDebug] Request options:', {
    ...options,
    headers: options.headers || {},
  });
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Origin': debugInfo.origin,
      'Accept': 'application/json',
      ...options.headers,
    },
  });
  
  console.log('[AuthDebug] Response status:', response.status);
  console.log('[AuthDebug] Response headers:', Object.fromEntries(response.headers.entries()));
  
  // Try to read response body for debugging
  const responseClone = response.clone();
  try {
    const responseText = await responseClone.text();
    console.log('[AuthDebug] Response body:', responseText);
  } catch (error) {
    console.log('[AuthDebug] Could not read response body:', error);
  }
  
  return response;
}

export async function testAuthEndpoints(): Promise<void> {
  console.log('[AuthDebug] Testing authentication endpoints...');
  
  const debugInfo = getAuthDebugInfo();
  console.log('[AuthDebug] Current auth state:', debugInfo);
  
  // Test current user endpoint
  try {
    console.log('[AuthDebug] Testing /users/me endpoint...');
    const userResponse = await debugAuthRequest('/users/me', { method: 'GET' });
    console.log('[AuthDebug] /users/me result:', userResponse.status);
  } catch (error) {
    console.log('[AuthDebug] /users/me error:', error);
  }
  
  // Test logout endpoint
  try {
    console.log('[AuthDebug] Testing /auth/logout endpoint...');
    const logoutResponse = await debugAuthRequest('/auth/logout', { method: 'POST' });
    console.log('[AuthDebug] /auth/logout result:', logoutResponse.status);
  } catch (error) {
    console.log('[AuthDebug] /auth/logout error:', error);
  }
}

// Add to window for manual testing in browser console
if (typeof window !== 'undefined') {
  (window as any).debugAuth = {
    getInfo: getAuthDebugInfo,
    testEndpoints: testAuthEndpoints,
    debugRequest: debugAuthRequest,
  };
}
