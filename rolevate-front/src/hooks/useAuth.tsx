'use client';

import { createContext, useContext } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'COMPANY' | 'CANDIDATE';
  phone?: string;
  company?: any;
  companyId?: string;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };
export type { User, AuthContextType };
