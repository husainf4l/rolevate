export interface LogoProps {
  className?: string;
  asText?: boolean;
}

export interface ApiKey {
  id: string;
  name: string;
  key?: string;
  createdAt: string;
  expiresAt?: string;
  permissions?: string[];
  status?: 'active' | 'inactive';
  lastUsed?: string;
}