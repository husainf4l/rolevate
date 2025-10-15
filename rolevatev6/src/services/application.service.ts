import { apolloClient } from '@/lib/apollo';
import { gql } from '@apollo/client';

export interface Application {
  id: string;
  job: {
    id: string;
    title: string;
  };
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'INTERVIEWED' | 'OFFERED' | 'HIRED' | 'REJECTED' | 'WITHDRAWN';
  appliedAt: string;
  coverLetter?: string;
  resumeUrl?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  cvAnalysisScore?: number;
  cvAnalysisResults?: any;
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
  status?: 'PENDING' | 'REVIEWED' | 'OFFERED' | 'REJECTED';
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
          firstName
          lastName
          email
        }
        job {
          id
          title
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
          firstName
          lastName
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
      if (!data?.createApplication) {
        throw new Error('Failed to create application');
      }
      return data.createApplication;
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to create application');
    }
  }

  // Add missing function for candidate applications
  async getCandidateApplications(): Promise<Application[]> {
    // For now, return empty array - this would need a different GraphQL query
    // that fetches applications for the authenticated candidate
    return [];
  }
}

export const applicationService = new ApplicationService();

// Export functions for backward compatibility
export const getCompanyApplications = () => applicationService.getCompanyApplications();
export const createApplication = (input: CreateApplicationInput) => applicationService.createApplication(input);
export const getCandidateApplications = applicationService.getCandidateApplications.bind(applicationService);
