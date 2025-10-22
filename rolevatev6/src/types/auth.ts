export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'BUSINESS' | 'CANDIDATE';
  phone?: string;
  avatar?: string;
  company?: {
    id: string;
    name: string;
  };
  companyId?: string;
  candidateProfile?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  userType: 'BUSINESS' | 'CANDIDATE';
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface AuthError {
  message: string;
  field?: string;
}