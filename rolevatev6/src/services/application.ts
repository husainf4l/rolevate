import { apolloClient } from '@/lib/apollo';
import { gql } from '@apollo/client';

export interface CvAnalysisResults {
  match_score: number;
  skills_matched: string[];
  skills_missing: string[];
  experience_summary: string;
  strengths: string[];
  concerns: string[];
  recommendation: string;
  detailed_feedback: string;
  linkedin: string;
}

export interface Application {
  id: string;
  jobId?: string; // Add for backward compatibility
  job: {
    id: string;
    title: string;
    company?: {
      name: string;
    };
  };
  candidate: {
    id: string;
    name: string;
    email: string;
  };
  status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'INTERVIEWED' | 'OFFERED' | 'HIRED' | 'ANALYZED' | 'REJECTED' | 'WITHDRAWN';
  appliedAt: string;
  coverLetter?: string;
  resumeUrl?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  cvAnalysisScore?: number;
  cvAnalysisResults?: CvAnalysisResults;
  analyzedAt?: string;
  aiCvRecommendations?: string;
  aiInterviewRecommendations?: string;
  aiSecondInterviewRecommendations?: string;
  recommendationsGeneratedAt?: string;
  companyNotes?: string;
  source?: string;
  notes?: string;
  aiAnalysis?: any;
  interviewScheduled: boolean;
  reviewedAt?: string;
  interviewScheduledAt?: string;
  interviewedAt?: string;
  rejectedAt?: string;
  acceptedAt?: string;
  applicationNotes: any[];
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationConnection {
  data: Application[];
  total: number;
  page: number;
  pages: number;
}

export interface CreateApplicationInput {
  jobId: string;
}

export interface ApplicationFilter {
  status?: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'INTERVIEWED' | 'OFFERED' | 'HIRED' | 'ANALYZED' | 'REJECTED' | 'WITHDRAWN';
}

export interface PaginationInput {
  page?: number;
  limit?: number;
}

class ApplicationService {
  private GET_APPLICATIONS_QUERY = gql`
    query GetApplications {
      applications {
        id
        appliedAt
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
        status
        cvAnalysisScore
        cvAnalysisResults
        resumeUrl
        expectedSalary
      }
    }
  `;

  private CREATE_APPLICATION_MUTATION = gql`
    mutation CreateApplication($input: CreateApplicationInput!) {
      createApplication(input: $input) {
        id
        status
        createdAt
        job {
          id
          title
        }
        candidate {
          id
          name
          email
        }
      }
    }
  `;

  async getCompanyApplications(): Promise<Application[]> {
    try {
      const { data } = await apolloClient.query<{ applications: Application[] }>({
        query: this.GET_APPLICATIONS_QUERY,
        fetchPolicy: 'network-only'
      });
      return data?.applications || [];
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to fetch applications');
    }
  }

  async createApplication(input: CreateApplicationInput): Promise<Application> {
    try {
      const { data } = await apolloClient.mutate<{ createApplication: Application }>({
        mutation: this.CREATE_APPLICATION_MUTATION,
        variables: { input }
      });
      return data!.createApplication;
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to create application');
    }
  }
}

export const applicationService = new ApplicationService();

// Additional exports for compatibility
export const getApplicationById = async (id: string): Promise<Application> => {
  const GET_APPLICATION_BY_ID_QUERY = gql`
    query GetApplicationById($id: ID!) {
      application(id: $id) {
        id
        job {
          id
          title
          company {
            name
          }
        }
        candidate {
          id
          name
          email
        }
        status
        appliedAt
        coverLetter
        resumeUrl
        expectedSalary
        noticePeriod
        cvAnalysisScore
        cvAnalysisResults
        analyzedAt
        aiCvRecommendations
        aiInterviewRecommendations
        aiSecondInterviewRecommendations
        recommendationsGeneratedAt
        companyNotes
        source
        notes
        aiAnalysis
        interviewScheduled
        reviewedAt
        interviewScheduledAt
        interviewedAt
        rejectedAt
        acceptedAt
        applicationNotes {
          id
          note
          isPrivate
          createdAt
        }
        createdAt
        updatedAt
      }
    }
  `;

  try {
    const { data } = await apolloClient.query<{ application: Application }>({
      query: GET_APPLICATION_BY_ID_QUERY,
      variables: { id },
      fetchPolicy: 'network-only'
    });
    if (!data?.application) {
      throw new Error('Application not found');
    }
    return data.application;
  } catch (error: any) {
    throw new Error(error?.message || 'Failed to fetch application');
  }
};

export const updateApplicationStatus = async (id: string, status: string): Promise<Application> => {
  const UPDATE_APPLICATION_STATUS_MUTATION = gql`
    mutation UpdateApplicationStatus($id: ID!, $input: UpdateApplicationInput!) {
      updateApplication(id: $id, input: $input) {
        id
        status
        updatedAt
      }
    }
  `;

  try {
    const { data } = await apolloClient.mutate<{ updateApplication: Application }>({
      mutation: UPDATE_APPLICATION_STATUS_MUTATION,
      variables: { 
        id, 
        input: { status }
      }
    });
    if (!data?.updateApplication) {
      throw new Error('Failed to update application status');
    }
    return data.updateApplication;
  } catch (error: any) {
    throw new Error(error?.message || 'Failed to update application status');
  }
};

export interface ApplicationNote {
  id: string;
  note: string;
  isPrivate: boolean;
  createdAt: string;
}

export const getApplicationNotes = async (applicationId: string): Promise<ApplicationNote[]> => {
  // TODO: Implement
  return [];
};

export const createApplicationNote = async (applicationId: string, note: string, isPrivate: boolean): Promise<ApplicationNote> => {
  // TODO: Implement
  return {} as ApplicationNote;
};

export interface CreateNoteData {
  note: string;
  isPrivate: boolean;
}

export const getApplicationsByJob = async (jobId: string): Promise<Application[]> => {
  // TODO: Implement
  return [];
};

export const getCandidateApplicationDetails = async (applicationId: string): Promise<Application> => {
  // TODO: Implement
  return {} as Application;
};

export const getCompanyApplications = () => applicationService.getCompanyApplications();

export const getCandidateApplications = async (): Promise<Application[]> => {
  // For now, return empty array - this would need a different GraphQL query
  // that fetches applications for the authenticated candidate
  return [];
};

export const bulkUpdateApplicationStatus = async (applicationIds: string[], status: string): Promise<Application[]> => {
  // TODO: Implement
  return [];
};
