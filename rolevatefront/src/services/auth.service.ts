import { getAuthDebugInfo } from "../utils/debug-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005';
const REQUEST_TIMEOUT = 10000; // 10 seconds timeout

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Authentication response types
export interface LoginCredentials {
  emailOrUsername: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
  name: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'RECRUITER' | 'HR_MANAGER' | 'ADMIN';
  createCompany?: boolean;
  companyId?: string;
  companyData?: CompanyData;
}

export interface CompanyData {
  name: string;
  displayName: string;
  industry: string;
  description: string;
  website: string;
  location: string;
  country: string;
  city: string;
  size: 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE';
  subscriptionPlan: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  companyId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  company?: Company;
}

export interface Company {
  id: string;
  name: string;
  displayName: string;
  industry: string;
  subscription: {
    plan: string;
    status: string;
    endDate: string;
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface SubscriptionStatus {
  plan: string;
  status: string;
  endDate: string;
  features: string[];
}

export interface SubscriptionLimits {
  jobPosts: {
    used: number;
    limit: number;
  };
  interviews: {
    used: number;
    limit: number;
  };
  users: {
    used: number;
    limit: number;
  };
}

// Token management functions
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
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
    const token = getAccessToken();
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });
    
    clearTimeout(timeoutId);
    
    const data = response.status !== 204 ? await response.json() : {};
    
    if (!response.ok) {
      // Handle 401 errors by clearing tokens
      if (response.status === 401) {
        clearTokens();
        authCache = { isAuthenticated: false, user: null, timestamp: Date.now() };
      }
      
      throw new AuthError(
        data.message || `Request failed with status ${response.status}`,
        response.status
      );
    }
    
    return data as T;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    
    if (error instanceof AuthError) {
      throw error;
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AuthError('Request timeout exceeded', 408);
    }
    
    const message = error instanceof Error ? error.message : 'An unknown network error occurred';
    throw new AuthError(message);
  }
}

// Authentication cache to avoid repeated requests
let authCache: { 
  isAuthenticated?: boolean; 
  user?: User | null;
  timestamp?: number;
} = {};
const AUTH_CACHE_TTL = 30000; // 30 seconds

// Track pending requests to prevent duplicate API calls
let pendingUserRequest: Promise<User | null> | null = null;

/**
 * Log in a user with email/username and password
 * @returns User object on successful login
 */
export async function login(credentials: LoginCredentials): Promise<User> {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AuthError(
        errorData.message || `Login failed with status ${response.status}`,
        response.status
      );
    }
    
    const data: AuthResponse = await response.json();
    
    // Store tokens
    setTokens(data.access_token);
    
    // Reset auth cache on successful login
    authCache = { isAuthenticated: true, user: data.user, timestamp: Date.now() };
    return data.user;
  } catch (error: unknown) {
    // Clear auth cache on login error
    authCache = { isAuthenticated: false, user: null, timestamp: Date.now() };
    clearTokens();
    
    if (error instanceof AuthError) {
      throw error;
    }
    
    const message = error instanceof Error ? error.message : 'Login failed due to an unexpected error.';
    throw new AuthError(message, 500);
  }
}

/**
 * Register a new user
 * @returns User object on successful registration
 */
export async function register(credentials: RegisterCredentials): Promise<User> {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AuthError(
        errorData.message || `Registration failed with status ${response.status}`,
        response.status
      );
    }
    
    const data: AuthResponse = await response.json();
    
    // Store tokens for automatic login after registration
    setTokens(data.access_token);
    
    // Reset auth cache on successful registration
    authCache = { isAuthenticated: true, user: data.user, timestamp: Date.now() };
    return data.user;
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      throw error;
    }
    
    const message = error instanceof Error ? error.message : 'Registration failed due to an unexpected error.';
    throw new AuthError(message, 500);
  }
}

/**
 * Log out the current user
 */
export async function logout(): Promise<void> {
  try {
    console.log('[AuthService] Starting logout process...');
    
    // Optional: Notify backend about logout (if you have a logout endpoint)
    const token = getAccessToken();
    if (token) {
      try {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        console.log('[AuthService] Backend logout successful');
      } catch (error) {
        console.log('[AuthService] Backend logout failed, continuing with client logout:', error);
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.warn('[AuthService] Network error during logout:', error.message);
    } else {
      console.warn('[AuthService] Unknown error during logout:', String(error));
    }
  }
  
  // ALWAYS clear tokens and client state
  clearTokens();
  authCache = { isAuthenticated: false, user: null, timestamp: Date.now() };
  console.log('[AuthService] Client logout complete');
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
  
  // Check if we have a token
  const token = getAccessToken();
  if (!token) {
    authCache = { isAuthenticated: false, user: null, timestamp: Date.now() };
    return false;
  }
  
  // Use getCurrentUser to check authentication and cache the user
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Get the current user profile (if authenticated)
 */
export async function getCurrentUser(): Promise<User | null> {
  const now = Date.now();
  
  // Return cached user if available and not expired
  if (
    authCache.user !== undefined && 
    authCache.timestamp && 
    (now - authCache.timestamp < AUTH_CACHE_TTL)
  ) {
    return authCache.user;
  }
  
  // If there's already a pending request, wait for it
  if (pendingUserRequest) {
    return await pendingUserRequest;
  }
  
  const token = getAccessToken();
  if (!token) {
    authCache = { isAuthenticated: false, user: null, timestamp: Date.now() };
    return null;
  }
  
  // Create a new pending request
  pendingUserRequest = (async (): Promise<User | null> => {
    try {
      const user = await fetchWithAuth<User>(`${API_URL}/api/auth/profile`, {
        method: 'GET',
      });
      authCache = { isAuthenticated: true, user, timestamp: Date.now() };
      return user;
    } catch (error: unknown) {
      if (error instanceof AuthError && (error.status === 401 || error.status === 403)) {
        authCache = { isAuthenticated: false, user: null, timestamp: Date.now() };
        clearTokens();
      } else {
        if (error instanceof Error) {
          console.error('Error fetching current user:', error.message);
        } else {
          console.error('Error fetching current user:', String(error));
        }
      }
      return null;
    } finally {
      pendingUserRequest = null; // Clear the pending request
    }
  })();
  
  return await pendingUserRequest;
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

/**
 * Refresh the access token
 */
export async function refreshAccessToken(): Promise<string | null> {
  const token = getAccessToken();
  if (!token) {
    console.log('[AuthService] No access token available');
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.log('[AuthService] Token refresh failed');
      clearTokens();
      return null;
    }

    const data = await response.json();
    setTokens(data.access_token);
    console.log('[AuthService] Token refreshed successfully');
    return data.access_token;
  } catch (error) {
    console.error('[AuthService] Error refreshing token:', error);
    clearTokens();
    return null;
  }
}

/**
 * Enhanced fetchWithAuth that handles token refresh automatically
 */
async function fetchWithAutoRefresh<T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  try {
    return await fetchWithAuth<T>(url, options);
  } catch (error) {
    if (error instanceof AuthError && error.status === 401) {
      console.log('[AuthService] Access token expired, attempting refresh...');
      
      const newToken = await refreshAccessToken();
      if (newToken) {
        // Retry the request with the new token
        return await fetchWithAuth<T>(url, options);
      }
    }
    throw error;
  }
}

/**
 * Change user password
 */
export async function changePassword(passwordData: ChangePasswordRequest): Promise<{ message: string }> {
  return fetchWithAuth<{ message: string }>(`${API_URL}/api/auth/change-password`, {
    method: 'PATCH',
    body: JSON.stringify(passwordData),
  });
}

/**
 * Get company information
 */
export async function getCompany(): Promise<Company> {
  return fetchWithAuth<Company>(`${API_URL}/api/auth/company`, {
    method: 'GET',
  });
}

/**
 * Get subscription status
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  return fetchWithAuth<SubscriptionStatus>(`${API_URL}/api/auth/subscription/status`, {
    method: 'GET',
  });
}

/**
 * Get subscription limits
 */
export async function getSubscriptionLimits(): Promise<SubscriptionLimits> {
  return fetchWithAuth<SubscriptionLimits>(`${API_URL}/api/auth/subscription/limits`, {
    method: 'GET',
  });
}

/**
 * Upgrade subscription plan
 */
export async function upgradeSubscription(plan: string): Promise<{ message: string }> {
  return fetchWithAuth<{ message: string }>(`${API_URL}/api/auth/subscription/upgrade`, {
    method: 'POST',
    body: JSON.stringify({ plan }),
  });
}

/**
 * Create a company for the current user
 */
export async function createCompany(companyData: CompanyData): Promise<Company> {
  return fetchWithAuth<Company>(`${API_URL}/api/auth/create-company`, {
    method: 'POST',
    body: JSON.stringify(companyData),
  });
}

// Legacy compatibility - keep signup function for backward compatibility
export const signup = register;
