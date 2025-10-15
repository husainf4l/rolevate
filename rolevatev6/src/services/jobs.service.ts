import { Job, JobFilters, JobsResponse } from '@/types/jobs';
import { graphQLService } from './graphql.service';

class JobsService {
  // GraphQL Queries

  private GET_JOB_BY_ID_QUERY = `
    query GetJob($id: String!) {
      job(id: $id) {
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

  private GET_COMPANY_JOBS_QUERY = `
    query GetCompanyJobs($filter: JobFilter, $pagination: PaginationInput) {
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

  private GET_ALL_JOBS_QUERY = `
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

  /**
   * Fetch jobs with optional filters and pagination
   */
  async getJobs(
    page: number = 1, 
    limit: number = 10, 
    filters?: JobFilters
  ): Promise<JobsResponse> {
    try {
      // Since the GraphQL API doesn't support filtering yet, we fetch all and filter client-side
      const response = await graphQLService.request<{ jobs: any[] }>(
        this.GET_ALL_JOBS_QUERY
      );

      let filteredJobs = response.jobs || [];

      // Apply client-side filtering
      if (filters) {
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredJobs = filteredJobs.filter(job => 
            job.title.toLowerCase().includes(searchTerm) ||
            job.description.toLowerCase().includes(searchTerm) ||
            job.shortDescription?.toLowerCase().includes(searchTerm)
          );
        }
        if (filters.location) {
          filteredJobs = filteredJobs.filter(job => 
            job.location.toLowerCase().includes(filters.location!.toLowerCase())
          );
        }
        if (filters.type) {
          filteredJobs = filteredJobs.filter(job => job.type === filters.type);
        }
        if (filters.level) {
          filteredJobs = filteredJobs.filter(job => job.jobLevel === filters.level);
        }
      }

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const paginatedJobs = filteredJobs.slice(startIndex, startIndex + limit);

      // Map to our Job interface
      const mappedJobs: Job[] = paginatedJobs.map(job => ({
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
      }));

      return {
        jobs: mappedJobs,
        total: filteredJobs.length,
        page,
        limit
      };
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw new Error('Failed to fetch jobs');
    }
  }

  /**
   * Fetch a single job by ID
   */
  async getJobById(id: string): Promise<Job> {
    try {
      const response = await graphQLService.request<{ job: any }>(
        this.GET_JOB_BY_ID_QUERY,
        { id }
      );

      const job = response.job;
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
    } catch (error) {
      console.error('Error fetching job:', error);
      throw new Error('Failed to fetch job details');
    }
  }

  private GET_FEATURED_JOBS_QUERY = `
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

  /**
   * Fetch featured jobs for homepage
   */
  async getFeaturedJobs(limit: number = 6): Promise<Job[]> {
    try {
      const response = await graphQLService.request<{ jobs: any[] }>(
        this.GET_FEATURED_JOBS_QUERY
      );

      // Filter for featured jobs and limit the results
      const featuredJobs = (response.jobs || [])
        .filter(job => job.featured === true)
        .slice(0, limit);

      // Map to match the expected interface
      const mappedJobs: Job[] = featuredJobs.map(job => ({
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
    } catch (error) {
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
  async getCompanyJobs(page: number = 1, limit: number = 100): Promise<any> {
    try {
      const response = await graphQLService.request<{ jobs: any }>(
        this.GET_COMPANY_JOBS_QUERY,
        { pagination: { page, limit } }
      );
      return response.jobs;
    } catch (error) {
      console.error('Error fetching company jobs:', error);
      throw new Error('Failed to fetch company jobs');
    }
  }

  /**
   * Create a new job
   */
  async createJob(input: any): Promise<any> {
    try {
      const response = await graphQLService.request<{ createJob: any }>(
        this.CREATE_JOB_MUTATION,
        { input }
      );
      return response.createJob;
    } catch (error) {
      console.error('Error creating job:', error);
      throw new Error('Failed to create job');
    }
  }

  /**
   * Update a job
   */
  async updateJob(id: string, input: any): Promise<any> {
    try {
      const response = await graphQLService.request<{ updateJob: any }>(
        this.UPDATE_JOB_MUTATION,
        { id, input }
      );
      return response.updateJob;
    } catch (error) {
      console.error('Error updating job:', error);
      throw new Error('Failed to update job');
    }
  }

  /**
   * Delete a job
   */
  async deleteJob(id: string): Promise<boolean> {
    try {
      const response = await graphQLService.request<{ deleteJob: boolean }>(
        this.DELETE_JOB_MUTATION,
        { id }
      );
      return response.deleteJob;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw new Error('Failed to delete job');
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