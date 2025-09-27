import { API_CONFIG } from '@/lib/config';

interface RoomStatus {
  id: string;
  status: string;
  participants?: string[];
}

interface ServerStatus {
  status: string;
  uptime?: number;
}

interface TokenResponse {
  token: string;
  expiresAt: string;
}

interface AgentStatus {
  active: boolean;
  roomId?: string;
}

export interface RoomJoinRequest {
  phone: string;
  jobId: string;
  roomName: string;
}

export interface RoomJoinResponse {
  success: boolean;
  token: string;
  roomName: string;
  participantName: string;
  liveKitUrl: string;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  job: {
    id: string;
    title: string;
    company: string;
  };
  application: {
    id: string;
    status: string;
  };
}

export interface RoomInfo {
  roomName: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  participantCount: number;
  createdAt: string;
  scheduledAt?: string;
}

export class RoomService {
  /**
   * Join a room with phone number, job ID, and room name
   * Backend: POST /api/room/join
   */
  static async joinRoom(request: RoomJoinRequest): Promise<RoomJoinResponse> {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/room/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: 'Failed to join room' 
        }));
        throw new Error(error.message || 'Failed to join room');
      }

      return await response.json();
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  }

  /**
   * Leave a room (cleanup when user leaves)
   * Backend: POST /api/room/leave
   */
  static async leaveRoom(roomName: string, candidateId?: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/room/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          roomName,
          candidateId: candidateId || 'unknown'
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: 'Failed to leave room' 
        }));
        throw new Error(error.message || 'Failed to leave room');
      }
    } catch (error) {
      console.error('Error leaving room:', error);
      throw error;
    }
  }

  /**
   * Get room status from database
   * Backend: POST /api/room/status
   */
  static async getRoomStatus(roomName: string): Promise<RoomStatus> {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/room/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomName }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: 'Failed to get room status' 
        }));
        throw new Error(error.message || 'Failed to get room status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting room status:', error);
      throw error;
    }
  }

  /**
   * Get LiveKit server status for a specific room
   * Backend: GET /api/room/livekit-status?roomName=X
   */
  static async getLiveKitRoomStatus(roomName: string): Promise<RoomStatus> {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/room/livekit-status?roomName=${encodeURIComponent(roomName)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: 'Failed to get LiveKit status' 
        }));
        throw new Error(error.message || 'Failed to get LiveKit status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting LiveKit status:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive server and database status
   * Backend: POST /api/room/server-status
   */
  static async getServerStatus(roomName?: string): Promise<ServerStatus> {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/room/server-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomName: roomName || '' }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: 'Failed to get server status' 
        }));
        throw new Error(error.message || 'Failed to get server status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting server status:', error);
      throw error;
    }
  }

  /**
   * Refresh room token (2 hour duration)
   * Backend: POST /api/room/refresh-token
   */
  static async refreshRoomToken(roomName: string, candidateId: string): Promise<TokenResponse> {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/room/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          roomName,
          candidateId 
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: 'Failed to refresh token' 
        }));
        throw new Error(error.message || 'Failed to refresh token');
      }

      return await response.json();
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  /**
   * Backward compatibility - using server-status instead of agent-status
   * Since there's no separate agent-status endpoint, we'll use server-status
   */
  static async getAgentStatus(roomName: string): Promise<AgentStatus> {
    const serverStatus = await this.getServerStatus(roomName);
    return {
      active: serverStatus.status === 'active',
      roomId: roomName
    };
  }

  /**
   * Validate room parameters
   */
  static validateRoomParams(phone: string, jobId: string, roomName: string): string | null {
    if (!phone || phone.trim().length === 0) {
      return 'Phone number is required';
    }
    
    if (!jobId || jobId.trim().length === 0) {
      return 'Job ID is required';
    }
    
    if (!roomName || roomName.trim().length === 0) {
      return 'Room name is required';
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      return 'Invalid phone number format';
    }

    return null; // No validation errors
  }
}
