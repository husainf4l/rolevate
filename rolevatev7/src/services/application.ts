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
        aiCvRecommendations
        aiInterviewRecommendations
        aiSecondInterviewRecommendations
        companyNotes
        source
        notes
        aiAnalysis
        interviewScheduled
        applicationNotes {
          id
          note
          isPrivate
        }
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
  const GET_APPLICATION_NOTES_QUERY = gql`
    query GetApplicationNotes($applicationId: ID!) {
      application(id: $applicationId) {
        applicationNotes {
          id
          note
          isPrivate
          createdAt
        }
      }
    }
  `;

  try {
    const { data } = await apolloClient.query<{ application: { applicationNotes: ApplicationNote[] } }>({
      query: GET_APPLICATION_NOTES_QUERY,
      variables: { applicationId },
      fetchPolicy: 'network-only'
    });
    return data?.application?.applicationNotes || [];
  } catch (error: any) {
    console.error('Error fetching application notes:', error);
    throw new Error(error?.message || 'Failed to fetch application notes');
  }
};

export const createApplicationNote = async (applicationId: string, note: string, isPrivate: boolean): Promise<ApplicationNote> => {
  const CREATE_APPLICATION_NOTE_MUTATION = gql`
    mutation CreateApplicationNote($applicationId: ID!, $input: CreateApplicationNoteInput!) {
      createApplicationNote(applicationId: $applicationId, input: $input) {
        id
        note
        isPrivate
        createdAt
      }
    }
  `;

  try {
    const { data } = await apolloClient.mutate<{ createApplicationNote: ApplicationNote }>({
      mutation: CREATE_APPLICATION_NOTE_MUTATION,
      variables: { 
        applicationId, 
        input: { note, isPrivate }
      }
    });
    if (!data?.createApplicationNote) {
      throw new Error('Failed to create application note');
    }
    return data.createApplicationNote;
  } catch (error: any) {
    console.error('Error creating application note:', error);
    throw new Error(error?.message || 'Failed to create application note');
  }
};

export interface CreateNoteData {
  note: string;
  isPrivate: boolean;
}

export const getApplicationsByJob = async (jobId: string): Promise<Application[]> => {
  const GET_APPLICATIONS_BY_JOB_QUERY = gql`
    query GetApplicationsByJob($jobId: String!) {
      applications(filter: { jobId: $jobId }) {
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
        noticePeriod
        aiCvRecommendations
        aiInterviewRecommendations
        aiSecondInterviewRecommendations
        interviewScheduled
      }
    }
  `;

  try {
    const { data } = await apolloClient.query<{ applications: Application[] }>({
      query: GET_APPLICATIONS_BY_JOB_QUERY,
      variables: { jobId },
      fetchPolicy: 'network-only'
    });
    return data?.applications || [];
  } catch (error: any) {
    console.error('Error fetching applications by job:', error);
    throw new Error(error?.message || 'Failed to fetch applications for this job');
  }
};

export const getCandidateApplicationDetails = async (jobId: string): Promise<Application> => {
  const GET_APPLICATION_DETAILS_QUERY = gql`
    query GetApplicationDetails {
      applications {
        id
        appliedAt
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
        coverLetter
        expectedSalary
        resumeUrl
        aiCvRecommendations
        aiInterviewRecommendations
        aiSecondInterviewRecommendations
      }
    }
  `;

  try {
    const { data } = await apolloClient.query<{ applications: Application[] }>({
      query: GET_APPLICATION_DETAILS_QUERY,
      fetchPolicy: 'network-only'
    });
    
    // Find the application with matching jobId
    const application = (data?.applications || []).find(app => app.job.id === jobId);
    
    if (!application) {
      throw new Error('Application not found for this job');
    }
    
    // Add jobId for backward compatibility
    return {
      ...application,
      jobId: application.job.id
    };
  } catch (error: any) {
    console.error('Error fetching application details:', error);
    throw new Error(error?.message || 'Failed to fetch application details');
  }
};

export const getCompanyApplications = () => applicationService.getCompanyApplications();

export const getCandidateApplications = async (): Promise<Application[]> => {
  const GET_CANDIDATE_APPLICATIONS_QUERY = gql`
    query GetCandidateApplications {
      applications {
        id
        appliedAt
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
        coverLetter
        expectedSalary
        resumeUrl
      }
    }
  `;

  try {
    const { data } = await apolloClient.query<{ applications: Application[] }>({
      query: GET_CANDIDATE_APPLICATIONS_QUERY,
      fetchPolicy: 'network-only'
    });
    
    // Add jobId for backward compatibility
    const applications = (data?.applications || []).map(app => ({
      ...app,
      jobId: app.job.id
    }));
    
    return applications;
  } catch (error: any) {
    console.error('Error fetching candidate applications:', error);
    throw new Error(error?.message || 'Failed to fetch applications');
  }
};

export const bulkUpdateApplicationStatus = async (applicationIds: string[], status: string): Promise<Application[]> => {
  const BULK_UPDATE_APPLICATION_STATUS_MUTATION = gql`
    mutation BulkUpdateApplicationStatus($input: BulkUpdateApplicationStatusInput!) {
      bulkUpdateApplicationStatus(input: $input) {
        id
        status
        updatedAt
      }
    }
  `;

  try {
    const { data } = await apolloClient.mutate<{ bulkUpdateApplicationStatus: Application[] }>({
      mutation: BULK_UPDATE_APPLICATION_STATUS_MUTATION,
      variables: { 
        input: { 
          applicationIds, 
          status 
        }
      }
    });
    return data?.bulkUpdateApplicationStatus || [];
  } catch (error: any) {
    console.error('Error bulk updating application status:', error);
    throw new Error(error?.message || 'Failed to bulk update application status');
  }
};
