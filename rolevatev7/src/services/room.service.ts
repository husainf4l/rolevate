import { apolloClient } from '@/lib/apollo';
import { gql } from '@apollo/client';

// GraphQL Mutations
const CREATE_INTERVIEW_MUTATION = gql`
  mutation CreateInterview($input: CreateInterviewInput!) {
    createInterview(input: $input) {
      id
      application {
        id
        candidate {
          id
          name
          email
        }
        job {
          id
          title
          company {
            id
            name
          }
        }
      }
      scheduledAt
      duration
      type
      status
      notes
      roomId
      token
      createdAt
    }
  }
`;

// TypeScript Interfaces
export interface CreateInterviewInput {
  applicationId: string;
  scheduledAt: string; // ISO date string
  duration?: number;
  type?: InterviewType;
  status?: InterviewStatus;
  notes?: string;
  feedback?: string;
  rating?: number;
  aiAnalysis?: any;
  recordingUrl?: string;
  roomId?: string;
}

export enum InterviewType {
  TECHNICAL = 'TECHNICAL',
  BEHAVIORAL = 'BEHAVIORAL',
  SYSTEM_DESIGN = 'SYSTEM_DESIGN',
  CASE_STUDY = 'CASE_STUDY',
  PANEL = 'PANEL'
}

export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export interface Interview {
  id: string;
  application: {
    id: string;
    candidate: {
      id: string;
      name: string;
      email: string;
    };
    job: {
      id: string;
      title: string;
      company: {
        id: string;
        name: string;
      };
    };
  };
  scheduledAt: string;
  duration?: number;
  type: InterviewType;
  status: InterviewStatus;
  notes?: string;
  roomId?: string;
  token?: string; // LiveKit token for the room
  createdAt: string;
}

class RoomService {
  /**
   * Create a new interview with LiveKit room
   * @param input - Interview creation input (applicationId, etc.)
   * @returns Interview object with roomId for LiveKit
   */
  async createInterviewRoom(input: CreateInterviewInput): Promise<Interview> {
    try {
      const { data } = await apolloClient.mutate<{ createInterview: Interview }>({
        mutation: CREATE_INTERVIEW_MUTATION,
        variables: { input },
      });

      if (!data?.createInterview) {
        throw new Error('Failed to create interview');
      }

      return data.createInterview;
    } catch (error) {
      console.error('Error creating interview room:', error);
      throw error;
    }
  }

  /**
   * Get the status of a room
   * @param roomName - The name of the room
   * @returns Room status information
   */
  async getRoomStatus(roomId: string): Promise<{ exists: boolean; interview?: Interview }> {
    try {
      const { data } = await apolloClient.query<{ interview: Interview }>({
        query: gql`
          query GetInterviewByRoomId($roomId: String!) {
            interview(roomId: $roomId) {
              id
              roomId
              status
              application {
                candidate { name }
                job { title company { name } }
              }
              scheduledAt
            }
          }
        `,
        variables: { roomId },
      });

      return {
        exists: !!data?.interview,
        interview: data?.interview,
      };
    } catch (error) {
      console.error('Error getting room status:', error);
      return { exists: false };
    }
  }

  /**
   * Generate a room name for an interview
   * @param applicationId - Application ID
   * @returns Generated room name
   */
  generateRoomName(applicationId: string): string {
    return `interview_${applicationId}_${Date.now()}`;
  }
}

export const roomService = new RoomService();
