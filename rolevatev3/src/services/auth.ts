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
          firstName: data.firstName,
          lastName: data.lastName,
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    try {
      await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Include cookies in requests
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear any stored user data (but not token since it's HTTP-only)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_data');
      localStorage.removeItem('organization_data');
      localStorage.removeItem('user_type');
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
      const response = await fetch(`${this.baseUrl}/auth/verify`, {
        method: 'GET',
        credentials: 'include', // Include cookies in requests
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.user;
      } else {
        return null;
      }
    } catch (error) {
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
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }
}

export const authService = new AuthService();