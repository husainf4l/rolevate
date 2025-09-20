// User Types
export type UserType = 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';

// Authentication Types
export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleLoginRequest {
  token: string; // Google OAuth token
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  userType: UserType;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// Profile Types (extended user information)
export interface UserProfile extends User {
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  experience?: number;
  resume?: string; // URL to resume file
  linkedin?: string;
  github?: string;
  portfolio?: string;
  // Company info for employers
  companyName?: string;
  companySize?: string;
  industry?: string;
  website?: string;
}