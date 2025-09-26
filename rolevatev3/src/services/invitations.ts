export interface Invitation {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER';
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  invitedBy: {
    name: string;
  };
  invitedAt?: string;
  expiresAt: string;
  token?: string;
  createdAt: string;
}

export interface CreateInvitationRequest {
  email: string;
  role: 'ADMIN' | 'USER';
}

export interface AcceptInvitationRequest {
  token: string;
}

class InvitationsService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005';

  async createInvitation(data: CreateInvitationRequest): Promise<{ success: boolean; invitation?: Invitation; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          invitation: result,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to create invitation',
        };
      }
    } catch (error) {
      console.error('Error creating invitation:', error);
      return {
        success: false,
        message: 'Network error while creating invitation',
      };
    }
  }

  async getInvitations(): Promise<{ success: boolean; invitations?: Invitation[]; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/invitations`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          invitations: Array.isArray(result) ? result : [],
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to fetch invitations',
        };
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
      return {
        success: false,
        message: 'Network error while fetching invitations',
      };
    }
  }

  async cancelInvitation(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/invitations/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        return {
          success: true,
        };
      } else {
        const result = await response.json();
        return {
          success: false,
          message: result.message || result.error || 'Failed to cancel invitation',
        };
      }
    } catch (error) {
      console.error('Error canceling invitation:', error);
      return {
        success: false,
        message: 'Network error while canceling invitation',
      };
    }
  }

  async acceptInvitation(data: AcceptInvitationRequest): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/invitations/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to accept invitation',
        };
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      return {
        success: false,
        message: 'Network error while accepting invitation',
      };
    }
  }

  async validateInvitation(token: string): Promise<{ success: boolean; invitation?: Invitation; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/invitations/validate?token=${encodeURIComponent(token)}`, {
        method: 'GET',
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          invitation: result,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Invalid invitation token',
        };
      }
    } catch (error) {
      console.error('Error validating invitation:', error);
      return {
        success: false,
        message: 'Network error while validating invitation',
      };
    }
  }
}

export const invitationsService = new InvitationsService();