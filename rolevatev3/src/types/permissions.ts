export interface Permission {
  id: string;
  name: string;
  description?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  userCount: number;
}

export interface CreatePermissionDto {
  name: string;
}

export interface UpdatePermissionDto {
  name: string;
}