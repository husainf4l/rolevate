// Public Interview API Service for candidate access without authentication

export interface PublicInterviewRoomInfo {
  roomCode: string;
  jobTitle: string;
  companyName: string;
  instructions: string;
  maxDuration: number;
  status: 'SCHEDULED' | 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  interviewType: 'TECHNICAL' | 'BEHAVIORAL' | 'GENERAL';
}

export interface CandidateJoinRequest {
  phoneNumber: string;
  firstName: string;
  lastName: string;
}

export interface InterviewJoinResponse {
  token: string;
  serverUrl: string;
  participantToken: string;
  roomName: string;
  identity: string;
  roomCode: string;
  participantName: string;
  jobTitle: string;
  instructions: string;
  maxDuration: number;
}

export interface InterviewEndRequest {
  sessionId: string;
  candidateId: string;
}

export class PublicInterviewService {
  private static instance: PublicInterviewService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005';
  }

  public static getInstance(): PublicInterviewService {
    if (!PublicInterviewService.instance) {
      PublicInterviewService.instance = new PublicInterviewService();
    }
    return PublicInterviewService.instance;
  }

  /**
   * Get room information by room code
   */
  async getRoomInfo(roomCode: string): Promise<PublicInterviewRoomInfo> {
    try {
      const response = await fetch(`${this.baseUrl}/api/public/interview/room/${roomCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Room not found');
        }
        throw new Error('Failed to get room information');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting room info:', error);
      throw error;
    }
  }

  /**
   * Join an interview room with candidate details
   */
  async joinInterview(roomCode: string, candidateDetails: CandidateJoinRequest): Promise<InterviewJoinResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/public/interview/join/${roomCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidateDetails)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to join interview');
      }

      return await response.json();
    } catch (error) {
      console.error('Error joining interview:', error);
      throw error;
    }
  }

  /**
   * End an interview session
   */
  async endInterview(roomCode: string, endDetails: InterviewEndRequest): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/public/interview/room/${roomCode}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(endDetails)
      });

      if (!response.ok) {
        throw new Error('Failed to end interview');
      }

      return true;
    } catch (error) {
      console.error('Error ending interview:', error);
      throw error;
    }
  }

  /**
   * Validate room code format
   */
  validateRoomCode(roomCode: string): boolean {
    // Assuming room codes are alphanumeric, 6-12 characters
    const roomCodeRegex = /^[A-Za-z0-9]{6,12}$/;
    return roomCodeRegex.test(roomCode);
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phone: string): boolean {
    // Jordan phone validation - must be +962XXXXXXXXX format
    const jordanPhoneRegex = /^\+962[7-9]\d{8}$/;
    return jordanPhoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Format phone number for display
   */
  formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // If it starts with +962, keep it
    if (cleaned.startsWith('+962')) {
      return cleaned;
    }
    
    // If it starts with 962, add +
    if (cleaned.startsWith('962')) {
      return `+${cleaned}`;
    }
    
    // For Jordan mobile numbers starting with 7, 8, or 9, add +962
    if (cleaned.length === 9 && /^[789]/.test(cleaned)) {
      return `+962${cleaned}`;
    }
    
    // If it starts with 0, remove it and add +962 (local format)
    if (cleaned.startsWith('0') && cleaned.length === 10 && /^0[789]/.test(cleaned)) {
      return `+962${cleaned.substring(1)}`;
    }
    
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  }
}

export default PublicInterviewService.getInstance();
