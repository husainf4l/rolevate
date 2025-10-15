import { Job, JobFilters, JobsResponse } from '@/types/jobs';
import { apolloClient } from '@/lib/apollo';
import { gql } from '@apollo/client';

interface PaginationInput {
  take?: number;
  skip?: number;
}

interface PaginationInput {
  take?: number;
  skip?: number;
}

class JobsService {
  // GraphQL Queries

  private GET_JOB_BY_ID_QUERY = gql`
    query GetJob($id: String!) {
      job(id: $id) {
        id
        title
        description
        department
        location
        salary
        type
        jobLevel
        skills
        status
        createdAt
        updatedAt
      }
    }
  `;

  private GET_FEATURED_JOBS_QUERY = gql`
    query GetFeaturedJobs {
      jobs {
        id
        title
        company {
          name
        }
        location
        salary
        type
        featured
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

  private GET_ALL_JOBS_QUERY = gql`
    query GetAllJobs {
      jobs {
        id
        title
        description
        department
        location
        salary
        type
        jobLevel
        skills
        status
        createdAt
        updatedAt
      }
    }
  `;

  private GET_COMPANY_JOBS_QUERY = gql`
    query GetCompanyJobs($filter: JobFilterInput, $pagination: PaginationInput) {
      jobs(filter: $filter, pagination: $pagination) {
        id
        title
        department
        location
        salary
        type
        deadline
        shortDescription
        status
        applicants
        views
        postedAt
        createdAt
        updatedAt
      }
    }
  `;

  /**
   * Fetch jobs with optional filters and pagination
   */
  async getJobs(
    page: number = 1,
    limit: number = 10,
    filters?: JobFilters
  ): Promise<JobsResponse> {
    try {
      // Build filter object for GraphQL
      const gqlFilter: any = {};

      if (filters?.search) {
        gqlFilter.search = filters.search;
      }
      if (filters?.location) {
        gqlFilter.location = filters.location;
      }
      if (filters?.type) {
        gqlFilter.type = filters.type;
      }
      if (filters?.level) {
        gqlFilter.level = filters.level;
      }

      const { data } = await apolloClient.query<{ jobs: any[] }>({
        query: this.GET_COMPANY_JOBS_QUERY,
        variables: {
          filter: Object.keys(gqlFilter).length > 0 ? gqlFilter : undefined,
          pagination: { take: limit, skip: (page - 1) * limit }
        },
        fetchPolicy: 'network-only'
      });

      const jobs = data?.jobs || [];

      // Map to our Job interface
      const mappedJobs: Job[] = jobs.map((job: any) => ({
        id: job.id,
        title: job.title,
        description: job.shortDescription || job.description,
        company: job.department, // Using department as company for now
        location: job.location,
        salary: job.salary,
        type: job.type,
        level: job.jobLevel,
        skills: Array.isArray(job.skills) ? job.skills : [],
        postedAt: job.postedAt || job.createdAt,
        updatedAt: job.updatedAt,
        isActive: job.status === 'ACTIVE'
      }));

      return {
        jobs: mappedJobs,
        total: jobs.length, // This should come from the API, but for now using array length
        page,
        limit
      };
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      throw new Error(error?.message || 'Failed to fetch jobs');
    }
  }

  /**
   * Fetch a single job by ID
   */
  async getJobById(id: string): Promise<Job> {
    try {
      const { data } = await apolloClient.query<{ job: any }>({
        query: this.GET_JOB_BY_ID_QUERY,
        variables: { id },
        fetchPolicy: 'network-only'
      });

      const job = data?.job;
      if (!job) {
        throw new Error('Job not found');
      }

      // Map to our Job interface
      return {
        id: job.id,
        title: job.title,
        description: job.description,
        company: job.department, // Using department as company for now
        location: job.location,
        salary: job.salary,
        type: job.type,
        level: job.jobLevel,
        skills: Array.isArray(job.skills) ? job.skills : [],
        postedAt: job.createdAt,
        updatedAt: job.updatedAt,
        isActive: job.status === 'ACTIVE'
      };
    } catch (error: any) {
      console.error('Error fetching job:', error);
      throw new Error(error?.message || 'Failed to fetch job details');
    }
  }

  /**
   * Fetch featured jobs for homepage
   */
  async getFeaturedJobs(limit: number = 6): Promise<Job[]> {
    try {
      const { data } = await apolloClient.query<{ jobs: any[] }>({
        query: this.GET_FEATURED_JOBS_QUERY,
        fetchPolicy: 'network-only'
      });

      // Filter for featured jobs and limit the results
      const featuredJobs = (data?.jobs || [])
        .filter((job: any) => job.featured === true)
        .slice(0, limit);

      // Map to match the expected interface
      const mappedJobs: Job[] = featuredJobs.map((job: any) => ({
        id: job.id,
        title: job.title,
        description: '', // Not fetched for performance
        company: job.company.name,
        location: job.location,
        salary: job.salary,
        type: job.type,
        level: 'ENTRY', // Default, not fetched
        skills: [], // Not fetched
        postedAt: '', // Not fetched
        updatedAt: '', // Not fetched
        isActive: true // Default
      }));

      return mappedJobs;
    } catch (error: any) {
      console.error('Error fetching featured jobs:', error);
      // Return empty array as fallback for homepage
      return [];
    }
  }

  /**
   * Search jobs by keyword
   */
  async searchJobs(
    keyword: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<JobsResponse> {
    return this.getJobs(page, limit, { search: keyword });
  }

  /**
   * Filter jobs by location
   */
  async getJobsByLocation(
    location: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<JobsResponse> {
    return this.getJobs(page, limit, { location });
  }

  /**
   * Filter jobs by company
   */
  async getJobsByCompany(
    company: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<JobsResponse> {
    return this.getJobs(page, limit, { company });
  }

  /**
   * Filter jobs by type (FULL_TIME, PART_TIME, etc.)
   */
  async getJobsByType(
    type: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<JobsResponse> {
    return this.getJobs(page, limit, { type });
  }

  /**
   * Filter jobs by level (ENTRY, MID, SENIOR, etc.)
   */
  async getJobsByLevel(
    level: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<JobsResponse> {
    return this.getJobs(page, limit, { level });
  }

  /**
   * Filter jobs by skills
   */
  async getJobsBySkills(
    skills: string[], 
    page: number = 1, 
    limit: number = 10
  ): Promise<JobsResponse> {
    return this.getJobs(page, limit, { skills });
  }

  /**
   * Get company jobs for dashboard
   */
  async getCompanyJobs(page: number = 1, limit: number = 100, filters?: JobFilters): Promise<any[]> {
    try {
      // Build filter object for GraphQL
      const gqlFilter: any = {};

      if (filters?.search) {
        gqlFilter.search = filters.search;
      }
      if (filters?.location) {
        gqlFilter.location = filters.location;
      }
      if (filters?.type) {
        gqlFilter.type = filters.type;
      }
      if (filters?.level) {
        gqlFilter.level = filters.level;
      }

      const { data } = await apolloClient.query<{ jobs: any[] }>({
        query: this.GET_COMPANY_JOBS_QUERY,
        variables: {
          filter: Object.keys(gqlFilter).length > 0 ? gqlFilter : undefined,
          pagination: { take: limit, skip: (page - 1) * limit }
        },
        fetchPolicy: 'network-only'
      });
      return data?.jobs || [];
    } catch (error: any) {
      console.error('Error fetching company jobs:', error);
      throw new Error(error?.message || 'Failed to fetch company jobs');
    }
  }

  /**
   * Create a new job
   */
  async createJob(input: any): Promise<any> {
    try {
      const { data } = await apolloClient.mutate<{ createJob: any }>({
        mutation: this.CREATE_JOB_MUTATION,
        variables: { input }
      });
      return data?.createJob;
    } catch (error: any) {
      console.error('Error creating job:', error);
      throw new Error(error?.message || 'Failed to create job');
    }
  }

  /**
   * Update a job
   */
  async updateJob(id: string, input: any): Promise<any> {
    try {
      const { data } = await apolloClient.mutate<{ updateJob: any }>({
        mutation: this.UPDATE_JOB_MUTATION,
        variables: { id, input }
      });
      return data?.updateJob;
    } catch (error: any) {
      console.error('Error updating job:', error);
      throw new Error(error?.message || 'Failed to update job');
    }
  }

  /**
   * Delete a job
   */
  async deleteJob(id: string): Promise<boolean> {
    try {
      const { data } = await apolloClient.mutate<{ deleteJob: boolean }>({
        mutation: this.DELETE_JOB_MUTATION,
        variables: { id }
      });
      return data?.deleteJob || false;
    } catch (error: any) {
      console.error('Error deleting job:', error);
      throw new Error(error?.message || 'Failed to delete job');
    }
  }

  /**
   * Activate a job
   */
  async activateJob(id: string): Promise<any> {
    return this.updateJob(id, { status: 'ACTIVE' });
  }

  /**
   * Pause a job
   */
  async pauseJob(id: string): Promise<any> {
    return this.updateJob(id, { status: 'PAUSED' });
  }
}

export const jobsService = new JobsService();