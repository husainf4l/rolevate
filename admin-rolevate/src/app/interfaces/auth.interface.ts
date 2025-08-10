export interface User {
  id: string;
  userType: string;
  email: string;
  name: string;
  avatar?: string;
  isActive: boolean;
  companyId?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  company?: {
    id: string;
    name: string;
    description?: string;
    email?: string;
    phone?: string;
    website?: string;
    logo?: string;
    industry?: string;
    numberOfEmployees?: number;
    subscription?: string;
    createdAt: string;
    updatedAt: string;
    address?: any;
  };
  hasActiveSubscription?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}
