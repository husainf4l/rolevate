import { Role, UserData, RegisterCandidateRequest, LoginRequest } from '@/types/auth';

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: UserData;
  userType?: 'candidate' | 'business';
}

export interface LegacyAuthResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    emailVerified: string | null;
    name: string;
    nameAr: string | null;
    image: string | null;
    cvLink: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface RegisterBusinessRequest {
  companyName: string;
  nameAr?: string;
  companyDescription?: string;
  website?: string;
  adminEmail: string;
  adminPassword: string;
  adminName: string;
  logo?: File;
}

export interface BusinessRegistrationResponse {
  success: boolean;
  message?: string;
  user?: UserData;
  organization?: {
    id: string;
    name: string;
  };
}

class AuthService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005';

  async registerCandidate(data: RegisterCandidateRequest): Promise<LegacyAuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in requests
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: `${data.firstName} ${data.lastName}`.trim(),
          role: Role.CANDIDATE,
          invitationToken: data.invitationToken,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message,
          user: result.user,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Registration failed',
        };
      }
    } catch {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }

  // Unified login method that handles both candidates and business users
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in requests
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        // Determine user type based on response structure
        const userType = this.determineUserType(result.user);
        
        return {
          success: true,
          message: result.message,
          user: result.user,
          userType,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Login failed',
        };
      }
    } catch {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }

  // Legacy method for backward compatibility
  async loginCandidate(data: LoginRequest): Promise<LegacyAuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login/candidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in requests
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message,
          user: result.user,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Login failed',
        };
      }
    } catch {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }

  private determineUserType(user: UserData | Record<string, unknown>): 'candidate' | 'business' {
    // Check role first
    if (user.role) {
      return user.role === Role.CANDIDATE ? 'candidate' : 'business';
    }
    // Fallback to old logic
    const userAny = user as Record<string, unknown>;
    // Check for business user properties
    if (userAny.organizationId || userAny.organization || userAny.permissions || userAny.roles || userAny.isSuperAdmin !== undefined) {
      return 'business';
    }
    // Check for candidate user properties
    if (userAny.cvLink !== undefined || userAny.type === 'candidate') {
      return 'candidate';
    }
    // Default fallback based on type field
    return (userAny.type as string) === 'user' ? 'business' : 'candidate';
  }

  // Get navigation path based on user type
  getRedirectPath(userType: 'candidate' | 'business'): string {
    return userType === 'business' ? '/business' : '/dashboard';
  }

  async logout(): Promise<void> {
    console.log('Starting logout process...');
    
    try {
      // Call server logout endpoint with proper error handling
      console.log('Calling server logout endpoint:', `${this.baseUrl}/auth/logout`);
      
      const response = await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Include cookies in requests
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      console.log('Logout response status:', response.status);
      console.log('Logout response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('Server logout successful:', data);
      } else {
        const errorText = await response.text();
        console.warn('Server logout failed:', response.status, response.statusText, errorText);
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with cleanup even if server fails
    }

    // WORKAROUND: Backend has cookie path bug - it sets cookies on "/" but clears them on "/auth/"
    console.log('Clearing local auth data...');
    this.clearAllAuthData();
    
    // AGGRESSIVE WORKAROUND: Try to force logout by making multiple requests with different cookie paths
    try {
      console.log('Attempting aggressive session clearing...');
      
      // Try logout with different potential cookie configurations
      const logoutAttempts = [
        // Try with different path headers to trigger proper cookie clearing
        fetch(`${this.baseUrl}/auth/logout`, {
          method: 'POST',
          credentials: 'include',
          headers: { 
            'Content-Type': 'application/json',
            'Cookie-Path': '/'  // Try to hint at correct path
          },
          body: JSON.stringify({})
        }),
        
        // Make verify request to see if still authenticated
        fetch(`${this.baseUrl}/auth/verify`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Cache-Control': 'no-cache' }
        })
      ];
      
      const results = await Promise.allSettled(logoutAttempts);
      console.log('Aggressive logout results:', results);
      
    } catch (e) {
      console.log('Aggressive logout failed, continuing with local cleanup:', e);
    }
    
    console.log('Logout process completed - session should be cleared');
  }

  private clearAllAuthData(): void {
    if (typeof window !== 'undefined') {
      // Clear localStorage items
      const localStorageKeys = [
        'user_data', 
        'organization_data', 
        'user_type', 
        'access_token',
        'refresh_token',
        'authToken',
        'token'
      ];
      
      localStorageKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      // Clear any sessionStorage items that might contain auth data
      const sessionStorageKeys = [
        'user_data', 
        'organization_data', 
        'user_type',
        'access_token',
        'refresh_token',
        'authToken',
        'token'
      ];
      
      sessionStorageKeys.forEach(key => {
        sessionStorage.removeItem(key);
      });

      // Clear ALL cookies more comprehensively
      this.clearAllCookies();
    }
  }

  private clearAllCookies(): void {
    if (typeof window !== 'undefined') {
      console.log('Starting cookie cleanup...');
      console.log('Cookies before cleanup:', document.cookie);
      
      // CRITICAL: Backend has a bug - it sets cookies on path="/" but tries to clear them on path="/auth/"
      // This causes the logout to fail because cookie paths must match exactly
      
      // Common auth-related cookie names
      const authCookieNames = [
        'accessToken',
        'access_token', 
        'refreshToken',
        'refresh_token',
        'authToken',
        'auth_token',
        'token',
        'session',
        'sessionId',
        'connect.sid',
        'JSESSIONID'
      ];

      // Get all existing cookies (only non-HttpOnly ones are visible)
      const allCookies = document.cookie.split(";");
      const existingCookieNames = allCookies.map(c => {
        const eqPos = c.indexOf("=");
        return eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim();
      }).filter(name => name.length > 0);

      console.log('Visible cookies found:', existingCookieNames);

      // Combine existing cookies with known auth cookie names
      const cookiesToClear = [...new Set([...existingCookieNames, ...authCookieNames])];

      // WORKAROUND: Clear cookies from ALL possible paths to fix backend cookie path bug
      cookiesToClear.forEach(name => {
        if (name) {
          // Comprehensive path list including the problematic "/auth/" path
          const paths = [
            '/',           // Root path (where cookies are actually set)
            '/auth',       // Auth path
            '/auth/',      // Auth path with trailing slash (backend tries to clear here!)
            '/api',        // API path
            '/login',      // Login path
            '/dashboard'   // Dashboard path
          ];
          
          const domains = [
            '',                           // No domain specified
            'localhost',                  // Localhost
            '.localhost',                 // Localhost with dot
            window.location.hostname,     // Current hostname
            `.${window.location.hostname}` // Current hostname with dot
          ];

          console.log(`Clearing cookie: ${name} from all paths/domains`);

          // Clear for each combination of domain and path
          domains.forEach(domain => {
            paths.forEach(path => {
              // Try multiple combinations to ensure we catch the cookie
              const cookieSettings = [
                `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}`,
                `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};domain=${domain}`,
                `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};secure`,
                `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};samesite=strict`,
                `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};samesite=lax`,
                `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};domain=${domain};secure`,
                `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};domain=${domain};samesite=strict`
              ];

              cookieSettings.forEach(setting => {
                if (setting.includes('domain=;') || setting.includes('domain=.;')) {
                  // Skip invalid domain settings
                  return;
                }
                document.cookie = setting;
              });
            });
          });
        }
      });

      console.log('Attempted to clear cookies:', cookiesToClear);
      console.log('Cookies after cleanup:', document.cookie);
      console.log('⚠️  Note: HttpOnly cookies (like access_token) are not visible here but should be cleared by server');
    }
  }

  storeUserData(user: UserData, userType: 'candidate' | 'business'): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(user));
      localStorage.setItem('user_type', userType);
      
      // Store organization data for business users
      if (userType === 'business' && user.organizationId) {
        // Since user has organizationId, we can store it, but organization data might be separate
      }
    }
  }

  getUserType(): 'candidate' | 'business' | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_type') as 'candidate' | 'business' | null;
    }
    return null;
  }

  // Remove token storage methods since tokens are HTTP-only
  getStoredUser(): UserData | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  async verifyAuth(): Promise<UserData | null> {
    try {
      // Add cache busting to prevent cached responses after logout
      const cacheBuster = Date.now();
      const response = await fetch(`${this.baseUrl}/auth/verify?_cb=${cacheBuster}`, {
        method: 'GET',
        credentials: 'include', // Include cookies for session-based auth
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user && data.authenticated) {
          // Convert the user data to our UserData format
          const userData: UserData = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            image: data.user.image || undefined,
            role: data.user.role as Role,
            organizationId: data.user.organizationId,
            organization: data.user.organization ? {
              id: data.user.organizationId,
              name: data.user.organization.name,
              nameAr: data.user.organization.nameAr,
              description: data.user.organization.description,
              website: data.user.organization.website,
              logo: data.user.organization.logo,
              createdAt: new Date(data.user.organization.createdAt),
              updatedAt: new Date(data.user.organization.updatedAt),
            } : undefined,
            createdAt: new Date(data.user.createdAt),
            updatedAt: new Date(data.user.updatedAt),
          };
          return userData;
        }
      }
      
      // If verification fails or user is not authenticated, clear any stale local data
      this.clearAllAuthData();
      return null;
    } catch (error) {
      console.error('Auth verification failed:', error);
      // Clear local data on verification error
      this.clearAllAuthData();
      return null;
    }
  }

  async registerBusiness(data: RegisterBusinessRequest): Promise<BusinessRegistrationResponse> {
    try {
      const formData = new FormData();
      
      // Organization details
      formData.append('companyName', data.companyName);
      if (data.nameAr) {
        formData.append('nameAr', data.nameAr);
      }
      if (data.companyDescription) {
        formData.append('companyDescription', data.companyDescription);
      }
      if (data.website) {
        formData.append('website', data.website);
      }
      
      // Admin user details
      formData.append('adminEmail', data.adminEmail);
      formData.append('adminPassword', data.adminPassword);
      formData.append('adminName', data.adminName);
      
      // Optional logo
      if (data.logo) {
        formData.append('logo', data.logo);
      }

      const response = await fetch(`${this.baseUrl}/auth/register-company`, {
        method: 'POST',
        credentials: 'include', // Include cookies in requests
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message,
          user: result.user,
          organization: result.organization,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Registration failed',
        };
      }
    } catch {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }
}

export const authService = new AuthService();