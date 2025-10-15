export interface User {
  id: number;
  email: string;
  name: string;
  role: 'BUSINESS' | 'CANDIDATE';
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  role: 'BUSINESS' | 'CANDIDATE';
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface AuthError {
  message: string;
  field?: string;
}