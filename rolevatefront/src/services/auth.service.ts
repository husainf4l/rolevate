import { API_URL } from "@/utils/env";

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
    const data = await fetchWithAuth<AuthResponse>(`${API_URL}/auth/login`, {
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
 */
export async function logout(): Promise<void> {
  try {
    await fetchWithAuth<Record<string, never>>(`${API_URL}/auth/logout`, {
      method: 'POST',
    });
    
    // Clear auth cache on logout
    authCache = { isAuthenticated: false, timestamp: Date.now() };
  } catch (error: unknown) { // Added type annotation
    console.error('Logout error:', error instanceof Error ? error.message : error); // Log appropriately
    if (error instanceof AuthError) { // Type check
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Logout failed due to an unexpected error.';
    throw new AuthError(message, 500);
  }
}

/**
 * Check if the user is currently authenticated
 * Uses cached value if available and not expired
 */
export async function isAuthenticated(): Promise<boolean> {
  const now = Date.now();
  console.log(`[AuthService] isAuthenticated called at ${new Date(now).toISOString()}. Cache:`, JSON.stringify(authCache));

  if (
    authCache.isAuthenticated !== undefined && 
    authCache.timestamp && 
    (now - authCache.timestamp < AUTH_CACHE_TTL)
  ) {
    console.log(`[AuthService] Using cached auth status: ${authCache.isAuthenticated}. Cache timestamp: ${new Date(authCache.timestamp).toISOString()}`);
    return authCache.isAuthenticated;
  }

  if (authCache.isAuthenticated !== undefined && authCache.timestamp) {
    console.log(`[AuthService] Cache expired. Age: ${now - authCache.timestamp}ms, TTL: ${AUTH_CACHE_TTL}ms.`);
  } else {
    console.log('[AuthService] Cache miss or no timestamp.');
  }
  
  console.log('[AuthService] Fetching /users/me to verify authentication.');
  try {
    await fetchWithAuth<User>(`${API_URL}/users/me`, {
      method: 'GET',
    });
    
    console.log('[AuthService] /users/me call successful. User is authenticated.');
    authCache = { isAuthenticated: true, timestamp: Date.now() };
    console.log('[AuthService] Updated authCache:', JSON.stringify(authCache));
    return true;
  } catch (error: unknown) { // Added type annotation
    console.error('[AuthService] /users/me call failed or resulted in auth error:', error);
    if (error instanceof AuthError && (error.status === 401 || error.status === 403)) {
      console.log(`[AuthService] AuthError status ${error.status}. User is not authenticated.`);
      authCache = { isAuthenticated: false, timestamp: Date.now() };
    } else {
      console.log('[AuthService] Non-AuthError or other status. Defaulting to not authenticated for safety.');
      authCache = { isAuthenticated: false, timestamp: Date.now() }; 
    }
    console.log('[AuthService] Updated authCache due to error:', JSON.stringify(authCache));
    return false;
  }
}

/**
 * Get the current user profile (if authenticated)
 */
export async function getCurrentUser(): Promise<User | null> {
  console.log(`[AuthService] getCurrentUser called at ${new Date().toISOString()}.`);
  try {
    // Use fetchWithAuth for consistency and robust error handling
    const user = await fetchWithAuth<User>(`${API_URL}/users/me`, {
      method: 'GET',
    });
    // If fetchWithAuth is successful, user is authenticated. Update cache.
    authCache = { isAuthenticated: true, timestamp: Date.now() };
    console.log('[AuthService] getCurrentUser: success. Updated authCache:', JSON.stringify(authCache));
    return user;
  } catch (error: unknown) { // Added type annotation
    console.error('[AuthService] getCurrentUser: error.', error);
    if (error instanceof AuthError && (error.status === 401 || error.status === 403)) {
      authCache = { isAuthenticated: false, timestamp: Date.now() };
    } else {
      // For other errors, we might not want to aggressively set isAuthenticated to false
      // if the cache was previously true and this is a transient network issue.
      // However, if /users/me fails, we can't confirm user identity.
      console.error('Error fetching current user:', error instanceof Error ? error.message : error);
    }
    console.log('[AuthService] getCurrentUser: error. Updated authCache (if applicable):', JSON.stringify(authCache));
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
  return fetchWithAuth<Generate2FAResponse>(`${API_URL}/auth/2fa/generate`, {
    method: 'POST',
  });
}

export interface Verify2FAResponse {
  message: string; // Or a more specific response type if your backend provides one
}

export async function verify2FA(code: string): Promise<Verify2FAResponse> {
  return fetchWithAuth<Verify2FAResponse>(`${API_URL}/auth/2fa/verify`, {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}
