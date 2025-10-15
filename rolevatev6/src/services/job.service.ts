import { graphQLService } from './graphql.service';

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
  page?: number;
  limit?: number;
}

class JobService {
  private GET_COMPANY_JOBS_QUERY = `
    query GetCompanyJobs {
      jobs {
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

  private GET_JOBS_QUERY = `
    query GetJobs($filter: JobFilter, $pagination: PaginationInput) {
      jobs(filter: $filter, pagination: $pagination) {
        data {
          id
          title
          description
          status
          createdAt
          updatedAt
        }
        total
        page
        pages
      }
    }
  `;

  private GET_JOB_QUERY = `
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

  private CREATE_JOB_MUTATION = `
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

  private UPDATE_JOB_MUTATION = `
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

  private DELETE_JOB_MUTATION = `
    mutation DeleteJob($id: ID!) {
      deleteJob(id: $id)
    }
  `;

  async getCompanyJobs(): Promise<Job[]> {
    try {
      const response = await graphQLService.request<{ jobs: Job[] }>(
        this.GET_COMPANY_JOBS_QUERY
      );
      return response.jobs;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch jobs');
    }
  }

  async getJob(id: string): Promise<Job> {
    try {
      const response = await graphQLService.request<{ job: Job }>(
        this.GET_JOB_QUERY,
        { id }
      );
      return response.job;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch job');
    }
  }

  async createJob(input: CreateJobInput): Promise<Job> {
    try {
      const response = await graphQLService.request<{ createJob: Job }>(
        this.CREATE_JOB_MUTATION,
        { input }
      );
      return response.createJob;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create job');
    }
  }

  async updateJob(id: string, input: UpdateJobInput): Promise<Job> {
    try {
      const response = await graphQLService.request<{ updateJob: Job }>(
        this.UPDATE_JOB_MUTATION,
        { id, input }
      );
      return response.updateJob;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update job');
    }
  }

  async deleteJob(id: string): Promise<boolean> {
    try {
      const response = await graphQLService.request<{ deleteJob: boolean }>(
        this.DELETE_JOB_MUTATION,
        { id }
      );
      return response.deleteJob;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete job');
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
