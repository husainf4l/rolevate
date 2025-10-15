import { graphQLService } from './graphql.service';

export interface Application {
  id: string;
  job: {
    id: string;
    title: string;
  };
  candidate: {
    id: string;
    name: string;
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
  private GET_APPLICATIONS_QUERY = `
    query GetApplications {
      applications {
        id
        job {
          id
          title
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

  private CREATE_APPLICATION_MUTATION = `
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
      const response = await graphQLService.request<{ applications: Application[] }>(
        this.GET_APPLICATIONS_QUERY
      );
      return response.applications;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch applications');
    }
  }

  async createApplication(input: CreateApplicationInput): Promise<Application> {
    try {
      const response = await graphQLService.request<{ createApplication: Application }>(
        this.CREATE_APPLICATION_MUTATION,
        { input }
      );
      return response.createApplication;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create application');
    }
  }
}

export const applicationService = new ApplicationService();
