import { apolloClient } from '@/lib/apollo';
import { gql } from '@apollo/client';

export interface Job {
  id: string;
  title: string;
  description?: string;
  department?: string;
  location?: string;
  salary?: string;
  type?: string;
  deadline?: string;
  shortDescription?: string;
  responsibilities?: string;
  requirements?: string;
  benefits?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  jobLevel?: string;
  workType?: string;
  industry?: string;
  companyDescription?: string;
  status?: string;
  featured?: boolean;
  applicants?: number;
  views?: number;
  cvAnalysisPrompt?: string;
  interviewPrompt?: string;
  aiSecondInterviewPrompt?: string;
  interviewLanguage?: string;
  postedBy?: {
    id: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface JobConnection {
  data: Job[];
  total: number;
  page: number;
  pages: number;
}

export interface CreateJobInput {
  title: string;
  department: string;
  location: string;
  salary: string;
  type: string;
  deadline: string;
  description: string;
  shortDescription: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  skills: string[];
  experience: string;
  education: string;
  jobLevel: string;
  workType: string;
  industry: string;
  companyDescription: string;
  status?: string;
  cvAnalysisPrompt?: string;
  interviewPrompt?: string;
  aiSecondInterviewPrompt?: string;
  interviewLanguage?: string;
  featured?: boolean;
  postedById: string;
}

export interface UpdateJobInput {
  title?: string;
  department?: string;
  location?: string;
  salary?: string;
  type?: string;
  deadline?: string;
  description?: string;
  shortDescription?: string;
  responsibilities?: string;
  requirements?: string;
  benefits?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  jobLevel?: string;
  workType?: string;
  industry?: string;
  companyDescription?: string;
  status?: string;
  cvAnalysisPrompt?: string;
  interviewPrompt?: string;
  aiSecondInterviewPrompt?: string;
  interviewLanguage?: string;
  featured?: boolean;
}

export interface JobFilter {
  status?: 'ACTIVE' | 'PAUSED' | 'CLOSED';
}

export interface PaginationInput {
  take?: number;
  skip?: number;
}

class JobService {
  private GET_COMPANY_JOBS_QUERY = gql`
    query GetCompanyJobs($filter: JobFilterInput) {
      jobs(filter: $filter) {
        id
        title
        description
        department
        location
        salary
        type
        deadline
        shortDescription
        responsibilities
        requirements
        benefits
        skills
        experience
        education
        jobLevel
        workType
        industry
        companyDescription
        status
        featured
        applicants
        views
        postedBy {
          id
        }
        createdAt
        updatedAt
      }
    }
  `;

  private GET_JOBS_QUERY = gql`
    query GetJobs($filter: JobFilterInput, $pagination: PaginationInput) {
      jobs(filter: $filter, pagination: $pagination) {
        id
        title
        description
        department
        location
        salary
        type
        deadline
        shortDescription
        responsibilities
        requirements
        benefits
        skills
        experience
        education
        jobLevel
        workType
        industry
        companyDescription
        status
        featured
        applicants
        views
        postedBy {
          id
        }
        createdAt
        updatedAt
      }
    }
  `;

  private GET_JOB_QUERY = gql`
    query GetJob($id: ID!) {
      job(id: $id) {
        id
        title
        description
        status
        createdAt
        updatedAt
      }
    }
  `;

  private CREATE_JOB_MUTATION = gql`
    mutation CreateJob($input: CreateJobInput!) {
      createJob(input: $input) {
        id
        title
        description
        status
        createdAt
        updatedAt
      }
    }
  `;

  private UPDATE_JOB_MUTATION = gql`
    mutation UpdateJob($id: ID!, $input: UpdateJobInput!) {
      updateJob(id: $id, input: $input) {
        id
        title
        description
        status
        createdAt
        updatedAt
      }
    }
  `;

  private DELETE_JOB_MUTATION = gql`
    mutation DeleteJob($id: ID!) {
      deleteJob(id: $id)
    }
  `;

  async getCompanyJobs(): Promise<Job[]> {
    try {
      // Get current user to filter by company
      const { authService } = await import('@/services/auth');
      const currentUser = await authService.getCurrentUser();

      if (!currentUser?.company?.id) {
        console.warn('No company found for current user, returning empty jobs list');
        return [];
      }

      const { data } = await apolloClient.query<{ jobs: Job[] }>({
        query: this.GET_COMPANY_JOBS_QUERY,
        variables: {
          filter: {
            companyId: currentUser.company.id
          }
        },
        fetchPolicy: 'network-only'
      });
      return data?.jobs || [];
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to fetch jobs');
    }
  }

  async getJob(id: string): Promise<Job> {
    try {
      const { data } = await apolloClient.query<{ job: Job }>({
        query: this.GET_JOB_QUERY,
        variables: { id },
        fetchPolicy: 'network-only'
      });
      if (!data?.job) {
        throw new Error('Job not found');
      }
      return data.job;
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to fetch job');
    }
  }

  async createJob(input: CreateJobInput): Promise<Job> {
    try {
      const { data } = await apolloClient.mutate<{ createJob: Job }>({
        mutation: this.CREATE_JOB_MUTATION,
        variables: { input }
      });
      if (!data?.createJob) {
        throw new Error('Failed to create job');
      }
      return data.createJob;
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to create job');
    }
  }

  async updateJob(id: string, input: UpdateJobInput): Promise<Job> {
    try {
      const { data } = await apolloClient.mutate<{ updateJob: Job }>({
        mutation: this.UPDATE_JOB_MUTATION,
        variables: { id, input }
      });
      if (!data?.updateJob) {
        throw new Error('Failed to update job');
      }
      return data.updateJob;
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to update job');
    }
  }

  async deleteJob(id: string): Promise<boolean> {
    try {
      const { data } = await apolloClient.mutate<{ deleteJob: boolean }>({
        mutation: this.DELETE_JOB_MUTATION,
        variables: { id }
      });
      return data?.deleteJob || false;
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to delete job');
    }
  }

  async activateJob(id: string): Promise<Job> {
    return this.updateJob(id, { status: 'ACTIVE' });
  }

  async pauseJob(id: string): Promise<Job> {
    return this.updateJob(id, { status: 'PAUSED' });
  }
}

export const jobService = new JobService();
