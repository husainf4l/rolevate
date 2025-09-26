import { ReactNode } from 'react';

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN', 
  USER = 'USER',
  CANDIDATE = 'CANDIDATE',
}

export interface RegisterCandidateRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  invitationToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface BusinessSignupFormProps {
  locale: string;
}

export interface FormData {
  // Company info
  companyName: string;
  companyNameAr: string;
  description: string;
  industry: string;
  companySize: string;
  website: string;
  logo: File | null;

  // Admin account
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}






export interface OrganizationSetupFormProps {
  locale: string;
  onComplete: (data: Record<string, unknown>) => void;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: Role;
  organizationId?: string;
  organization?: Organization;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  website?: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginResponse {
  user: UserData;
  tokens: AuthTokens;
  message: string;
}

export interface RegisterResponse {
  user: UserData;
  tokens: AuthTokens;
  message: string;
}

export interface RegisterCompanyResponse {
  user: UserData;
  organization: Organization;
  tokens: AuthTokens;
  message: string;
}