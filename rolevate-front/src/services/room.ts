import { API_CONFIG } from '@/lib/config';

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
   * Get room information by room name
   */
  static async getRoomInfo(roomName: string): Promise<RoomInfo> {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/room/info/${roomName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: 'Failed to get room info' 
        }));
        throw new Error(error.message || 'Failed to get room info');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting room info:', error);
      throw error;
    }
  }

  /**
   * Leave a room (cleanup when user leaves)
   */
  static async leaveRoom(roomName: string, candidateId?: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/room/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomName, candidateId }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: 'Failed to leave room' 
        }));
        throw new Error(error.message || 'Failed to leave room');
      }
    } catch (error) {
      console.error('Error leaving room:', error);
      // Don't throw error for leave room - it's cleanup
    }
  }

  /**
   * Generate a room URL for a given phone, job ID, and room name
   */
  static generateRoomUrl(phone: string, jobId: string, roomName: string): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://rolevate.com';
    const params = new URLSearchParams({
      phone,
      jobId,
      roomName,
    });
    return `${baseUrl}/room?${params.toString()}`;
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
