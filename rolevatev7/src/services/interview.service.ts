import { apolloClient } from '@/lib/apollo';
import { gql } from '@apollo/client';

export interface InterviewTranscript {
  id: string;
  interviewId: string;
  content: string;
  speaker: string;
  timestamp: string;
  confidence?: number;
  language: string;
  createdAt: string;
  updatedAt: string;
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
      company?: {
        name: string;
      };
    };
  };
  interviewer: {
    id: string;
    name: string;
    email: string;
  };
  scheduledAt: string;
  duration?: number;
  type: string;
  status: string;
  notes?: string;
  feedback?: string;
  rating?: number;
  aiAnalysis?: any;
  recordingUrl?: string;
  roomId?: string;
  transcripts: InterviewTranscript[];
  createdAt: string;
  updatedAt: string;
}

class InterviewService {
  private GET_INTERVIEWS_BY_APPLICATION_QUERY = gql`
    query GetInterviewsByApplication($applicationId: ID!) {
      interviewsByApplication(applicationId: $applicationId) {
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
              name
            }
          }
        }
        interviewer {
          id
          name
          email
        }
        scheduledAt
        duration
        type
        status
        notes
        feedback
        rating
        aiAnalysis
        recordingUrl
        roomId
        transcripts {
          id
          content
          speaker
          timestamp
          confidence
          language
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
      }
    }
  `;

  private GET_ALL_INTERVIEWS_QUERY = gql`
    query GetAllInterviews {
      interviews {
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
              name
            }
          }
        }
        interviewer {
          id
          name
          email
        }
        scheduledAt
        duration
        type
        status
        notes
        feedback
        rating
        aiAnalysis
        recordingUrl
        roomId
        createdAt
        updatedAt
      }
    }
  `;

  async getAllInterviews(): Promise<Interview[]> {
    try {
      const { data } = await apolloClient.query<{ interviews: Interview[] }>({
        query: this.GET_ALL_INTERVIEWS_QUERY,
        fetchPolicy: 'network-only'
      });
      return data?.interviews || [];
    } catch (error: any) {
      console.error('Failed to fetch interviews:', error);
      return [];
    }
  }

  async getInterviewsByApplication(applicationId: string): Promise<Interview[]> {
    try {
      const { data } = await apolloClient.query<{ interviewsByApplication: Interview[] }>({
        query: this.GET_INTERVIEWS_BY_APPLICATION_QUERY,
        variables: { applicationId },
        fetchPolicy: 'network-only'
      });
      return data?.interviewsByApplication || [];
    } catch (error: any) {
      console.error('Failed to fetch interviews:', error);
      // Return empty array instead of throwing to make it non-blocking
      return [];
    }
  }
}

export const interviewService = new InterviewService();

// Export the functions for direct use
export const getAllInterviews = (): Promise<Interview[]> => {
  return interviewService.getAllInterviews();
};

export const getInterviewsByApplication = (applicationId: string): Promise<Interview[]> => {
  return interviewService.getInterviewsByApplication(applicationId);
};