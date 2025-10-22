const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005';

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

class PermissionsService {
  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Request failed');
    }

    return response.json();
  }

  // Permission CRUD operations
  async getAllPermissions(): Promise<Permission[]> {
    return this.fetchWithAuth('/permissions');
  }

  async getSystemPermissions(): Promise<{ id: string; name: string }[]> {
    return this.fetchWithAuth('/permissions/system');
  }

  async getPermission(id: string): Promise<Permission> {
    return this.fetchWithAuth(`/permissions/${id}`);
  }

  async createPermission(data: CreatePermissionDto): Promise<Permission> {
    return this.fetchWithAuth('/permissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePermission(id: string, data: UpdatePermissionDto): Promise<Permission> {
    return this.fetchWithAuth(`/permissions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePermission(id: string): Promise<void> {
    return this.fetchWithAuth(`/permissions/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin permission assignment (requires admin:permissions permission)
  async adminAssignPermissionToUser(userId: string, permissionId: string): Promise<void> {
    return this.fetchWithAuth(`/permissions/admin/assign/user/${userId}/permission/${permissionId}`, {
      method: 'POST',
    });
  }

  async adminRemovePermissionFromUser(userId: string, permissionId: string): Promise<void> {
    return this.fetchWithAuth(`/permissions/admin/assign/user/${userId}/permission/${permissionId}`, {
      method: 'DELETE',
    });
  }

  // Legacy methods for backward compatibility
  async assignPermissionToUser(userId: string, permissionId: string): Promise<void> {
    return this.adminAssignPermissionToUser(userId, permissionId);
  }

  async removePermissionFromUser(userId: string, permissionId: string): Promise<void> {
    return this.adminRemovePermissionFromUser(userId, permissionId);
  }

  // Group permission assignment
  async assignPermissionToGroup(groupId: string, permissionId: string): Promise<void> {
    return this.fetchWithAuth(`/permissions/${permissionId}/assign/group/${groupId}`, {
      method: 'POST',
    });
  }

  async removePermissionFromGroup(groupId: string, permissionId: string): Promise<void> {
    return this.fetchWithAuth(`/permissions/${permissionId}/assign/group/${groupId}`, {
      method: 'DELETE',
    });
  }

  // Get users and groups (you may need separate endpoints for these)
  async getAllUsers(): Promise<User[]> {
    return this.fetchWithAuth('/users');
  }

  async getAllGroups(): Promise<Group[]> {
    return this.fetchWithAuth('/groups');
  }

  // Get permissions for a specific user
  async getUserPermissions(userId: string): Promise<Permission[]> {
    return this.fetchWithAuth(`/users/${userId}/permissions`);
  }

  // Get permissions for a specific group
  async getGroupPermissions(groupId: string): Promise<Permission[]> {
    return this.fetchWithAuth(`/groups/${groupId}/permissions`);
  }

  // Get users with a specific permission
  async getUsersWithPermission(permissionId: string): Promise<User[]> {
    return this.fetchWithAuth(`/permissions/${permissionId}/users`);
  }

  // Get groups with a specific permission
  async getGroupsWithPermission(permissionId: string): Promise<Group[]> {
    return this.fetchWithAuth(`/permissions/${permissionId}/groups`);
  }
}

export const permissionsService = new PermissionsService();