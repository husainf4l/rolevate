import { Room, RoomEvent, DataPacket_Kind, RemoteParticipant } from 'livekit-client';

export interface LiveKitToken {
  token: string;
  roomName: string;
}

export interface InterviewSession {
  sessionId: string;
  roomName: string;
}

export class LiveKitService {
  private static instance: LiveKitService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4003';
  }

  public static getInstance(): LiveKitService {
    if (!LiveKitService.instance) {
      LiveKitService.instance = new LiveKitService();
    }
    return LiveKitService.instance;
  }

  async createRoom(roomName: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/livekit/room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: roomName,
          emptyTimeout: 10,
          maxParticipants: 2
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create room');
      }

      return true;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  async getToken(roomName: string, identity: string, name?: string): Promise<LiveKitToken> {
    try {
      let url = `${this.baseUrl}/livekit/token?identity=${identity}&room=${roomName}`;
      if (name) {
        url += `&name=${encodeURIComponent(name)}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch token');
      }

      const data = await response.json();
      return {
        token: data.token,
        roomName,
      };
    } catch (error) {
      console.error('Error getting token:', error);
      throw error;
    }
  }

  async getTokenPost(roomName: string, identity: string, name?: string): Promise<LiveKitToken> {
    try {
      const requestBody: any = {
        identity,
        roomName,
      };
      
      if (name) {
        requestBody.name = name;
      }
      
      const response = await fetch(`${this.baseUrl}/livekit/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch token');
      }

      const data = await response.json();
      return {
        token: data.token,
        roomName,
      };
    } catch (error) {
      console.error('Error getting token using POST:', error);
      throw error;
    }
  }

  setupMessageHandlers(room: Room, onMessageReceived: (message: any) => void): void {
    room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: RemoteParticipant) => {
      try {
        const message = JSON.parse(new TextDecoder().decode(payload));
        onMessageReceived(message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });
  }

  sendMessage(room: Room, message: any): void {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(message));
      room.localParticipant.publishData(data, { reliable: true });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  async createInterviewSession(roomName: string, candidateId: string, jobDescription: string): Promise<InterviewSession> {
    try {
      const response = await fetch(`${this.baseUrl}/interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName,
          candidateId,
          jobDescription
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create interview session');
      }

      const data = await response.json();
      return {
        sessionId: data.sessionId,
        roomName,
      };
    } catch (error) {
      console.error('Error creating interview session:', error);
      throw error;
    }
  }

  async startInterview(sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/interview/${sessionId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to start interview');
      }

      return true;
    } catch (error) {
      console.error('Error starting interview:', error);
      throw error;
    }
  }

  async sendCandidateResponse(sessionId: string, response: string): Promise<boolean> {
    try {
      const apiResponse = await fetch(`${this.baseUrl}/interview/${sessionId}/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          response
        }),
      });

      if (!apiResponse.ok) {
        throw new Error('Failed to send candidate response');
      }

      return true;
    } catch (error) {
      console.error('Error sending candidate response:', error);
      throw error;
    }
  }

  async endInterview(sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/interview/${sessionId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
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

  async getInterviewSummary(sessionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/interview/${sessionId}/summary`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get interview summary');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting interview summary:', error);
      throw error;
    }
  }

  async getInterviewTranscript(sessionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/interview/${sessionId}/transcript`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get interview transcript');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting interview transcript:', error);
      throw error;
    }
  }
}

export default LiveKitService.getInstance();
