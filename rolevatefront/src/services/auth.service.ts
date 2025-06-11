import { getAuthDebugInfo } from "../utils/debug-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005';
const REQUEST_TIMEOUT = 10000; // 10 seconds timeout

// Authentication response types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  message?: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  username: string;
  isTwoFactorEnabled: boolean;
}

// Authentication error type
export class AuthError extends Error {
  status: number;
  
  constructor(message: string, status: number = 400) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

/**
 * Helper function to make authenticated API requests with proper error handling
 */
async function fetchWithAuth<T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    clearTimeout(timeoutId);
    
    const data = response.status !== 204 ? await response.json() : {};
    
    if (!response.ok) {
      throw new AuthError(
        data.message || `Request failed with status ${response.status}`,
        response.status
      );
    }
    
    return data as T;
  } catch (error: unknown) { // Added type annotation
    clearTimeout(timeoutId);
    
    if (error instanceof AuthError) {
      throw error;
    }
    
    if (error instanceof Error && error.name === 'AbortError') { // Check if error is an instance of Error
      throw new AuthError('Request timeout exceeded', 408);
    }
    
    // Handle other error types or provide a generic message
    const message = error instanceof Error ? error.message : 'An unknown network error occurred';
    throw new AuthError(message);
  }
}

// Authentication cache to avoid repeated requests
let authCache: { isAuthenticated?: boolean; timestamp?: number } = {};
const AUTH_CACHE_TTL = 30000; // 30 seconds

/**
 * Log in a user with username and password
 * @returns User object on successful login
 */
export async function login(credentials: LoginCredentials): Promise<User> {
  try {
    const data = await fetchWithAuth<AuthResponse>(`${API_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Reset auth cache on successful login
    authCache = { isAuthenticated: true, timestamp: Date.now() };
    return data.user;
  } catch (error: unknown) { // Added type annotation
    // Clear auth cache on login error
    authCache = {};
    if (error instanceof AuthError) { // Type check
      throw error;
    }
    // Fallback for other error types
    const message = error instanceof Error ? error.message : 'Login failed due to an unexpected error.';
    throw new AuthError(message, 500); // Assuming 500 for unexpected server/network issues
  }
}

/**
 * Log out the current user
 * For HTTP-only authentication, this must send credentials to authenticate the logout request
 */
export async function logout(): Promise<void> {
  try {
    const debugInfo = getAuthDebugInfo();
    console.log('[AuthService] Starting logout process...');
    console.log('[AuthService] Debug info:', debugInfo);
    
    // First attempt: Try with standard logout request
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Critical: ensure HTTP-only cookies are sent
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Accept': 'application/json',
        // Add explicit origin header for CORS
        'Origin': debugInfo.origin,
      },
    });
    
    console.log('[AuthService] Logout response status:', response.status);
    console.log('[AuthService] Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Handle different response codes
    if (response.status === 204 || response.status === 200) {
      console.log('[AuthService] Logout successful - server confirmed');
    } else if (response.status === 401) {
      console.log('[AuthService] Got 401 on logout - treating as success (user was already logged out)');
      // 401 on logout means user was already logged out - this is OK
    } else if (response.status === 403) {
      console.log('[AuthService] Got 403 on logout - treating as success (permission issue but logout intent clear)');
      // 403 might mean the logout endpoint doesn't accept the current auth state - still OK to proceed
    } else {
      // For other error codes, log but don't fail the logout process
      console.warn('[AuthService] Logout returned unexpected status:', response.status);
      try {
        const errorText = await response.text();
        console.warn('[AuthService] Error response body:', errorText);
      } catch {
        console.warn('[AuthService] Could not read error response body');
      }
      // Continue with logout process even if server reports an error
      console.log('[AuthService] Continuing with logout despite server error (security best practice)');
    }
    
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.warn('[AuthService] Network error during logout:', error.message);
    } else {
      console.warn('[AuthService] Unknown error during logout:', String(error));
    }
    // Network errors shouldn't prevent logout for security reasons
    console.log('[AuthService] Continuing with logout despite network error (security best practice)');
  }
  
  // ALWAYS clear auth cache and client state, regardless of server response
  // This is critical for security - even if server fails, client should log out
  authCache = { isAuthenticated: false, timestamp: Date.now() };
  console.log('[AuthService] Auth cache cleared - client logout complete');
  
  // Additional client-side cleanup for HTTP-only cookies
  // Try to clear any visible cookies (though HTTP-only ones can't be cleared from JS)
  try {
    // Clear any non-HTTP-only auth-related cookies
    const cookiesToClear = ['token', 'auth', 'session', 'access_token', 'refresh_token'];
    cookiesToClear.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    console.log('[AuthService] Attempted to clear visible auth cookies');
  } catch (error) {
    console.log('[AuthService] Cookie clearing had no effect (expected for HTTP-only cookies)');
  }
}

/**
 * Check if the user is currently authenticated
 * Uses cached value if available and not expired
 */
export async function isAuthenticated(): Promise<boolean> {
  const now = Date.now();
  
  if (
    authCache.isAuthenticated !== undefined && 
    authCache.timestamp && 
    (now - authCache.timestamp < AUTH_CACHE_TTL)
  ) {
    return authCache.isAuthenticated;
  }
  
  try {
    await fetchWithAuth<User>(`${API_URL}/api/auth/users/me`, {
      method: 'GET',
    });
    
    authCache = { isAuthenticated: true, timestamp: Date.now() };
    return true;
  } catch (error: unknown) {
    if (error instanceof AuthError && (error.status === 401 || error.status === 403)) {
      authCache = { isAuthenticated: false, timestamp: Date.now() };
    } else {
      authCache = { isAuthenticated: false, timestamp: Date.now() }; 
    }
    return false;
  }
}

/**
 * Get the current user profile (if authenticated)
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const user = await fetchWithAuth<User>(`${API_URL}/api/auth/users/me`, {
      method: 'GET',
    });
    authCache = { isAuthenticated: true, timestamp: Date.now() };
    return user;
  } catch (error: unknown) {
    if (error instanceof AuthError && (error.status === 401 || error.status === 403)) {
      authCache = { isAuthenticated: false, timestamp: Date.now() };
    } else {
      if (error instanceof Error) {
        console.error('Error fetching current user:', error.message);
      } else {
        console.error('Error fetching current user:', String(error));
      }
    }
    return null;
  }
}

// 2FA Functions
export interface Generate2FAResponse {
  secret: string;
  otpauthUrl: string;
  qrCodeDataURL: string;
}

export async function generate2FA(): Promise<Generate2FAResponse> {
  return fetchWithAuth<Generate2FAResponse>(`${API_URL}/api/auth/2fa/generate`, {
    method: 'POST',
  });
}

export interface Verify2FAResponse {
  message: string; // Or a more specific response type if your backend provides one
}

export async function verify2FA(code: string): Promise<Verify2FAResponse> {
  return fetchWithAuth<Verify2FAResponse>(`${API_URL}/api/auth/2fa/verify`, {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}
