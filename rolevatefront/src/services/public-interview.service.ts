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

export interface CreateAndJoinRequest {
  jobPostId: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
}

export interface InterviewJoinResponse {
  token: string;
  wsUrl: string; // Updated to match backend documentation
  participantToken?: string; // Keep for backward compatibility
  serverUrl?: string; // Keep for backward compatibility 
  roomName: string;
  identity: string;
  roomCode: string;
  participantName: string;
  jobTitle: string;
  companyName: string;
  instructions?: string;
  maxDuration: number;
  interviewId: string;
  candidateId: string;
  applicationId: string;
  jobPostId: string;
  status: string;
}

export interface InterviewEndRequest {
  sessionId: string;
  candidateId: string;
}

export class PublicInterviewService {
  private static instance: PublicInterviewService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://rolevate.com/api';
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
   * Create and join a room with a single API call
   */
  async createAndJoinRoom(request: CreateAndJoinRequest): Promise<InterviewJoinResponse> {
    try {
      console.log("=== API REQUEST DEBUG ===");
      console.log("Request URL:", `${this.baseUrl}/interview/create`);
      console.log("Request method: POST");
      console.log("Request headers:", { 'Content-Type': 'application/json' });
      console.log("Request payload:", request);
      console.log("Request payload stringified:", JSON.stringify(request));
      console.log("jobPostId value:", request.jobPostId);
      console.log("phoneNumber value:", request.phoneNumber);
      console.log("========================");

      const response = await fetch(`${this.baseUrl}/interview/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      console.log("=== API RESPONSE DEBUG ===");
      console.log("Response status:", response.status);
      console.log("Response statusText:", response.statusText);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));
      console.log("==========================");

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error response:", errorData);
        throw new Error(errorData.message || `Failed to create and join room: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log("=== API SUCCESS RESPONSE ===");
      console.log("Response data:", responseData);
      console.log("============================");

      return responseData;
    } catch (error) {
      console.error('Error creating and joining room:', error);
      throw error;
    }
  }

  /**
   * End an interview session
   */
  async endInterview(jobId: string, endDetails: InterviewEndRequest): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/public/interview/job/${jobId}/end`, {
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
