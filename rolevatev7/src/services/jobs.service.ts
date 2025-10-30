import { Job, JobFilters, JobsResponse } from '@/types/jobs';
import { apolloClient } from '@/lib/apollo';
import { gql } from '@apollo/client';

interface PaginationInput {
  page?: number;
  limit?: number;
}

class JobsService {
  // GraphQL Queries

  private GET_JOB_BY_ID_QUERY = gql`
    query GetJobBySlug($slug: String!) {
      jobBySlug(slug: $slug) {
        id
        title
        slug
        description
        company {
          id
          name
          description
          logo
        }
        department
        location
        salary
        type
        jobLevel
        skills
        deadline
        status
        createdAt
        updatedAt
      }
    }
  `;

  private GET_FEATURED_JOBS_QUERY = gql`
    query GetFeaturedJobs($filter: JobFilterInput, $pagination: PaginationInput) {
      jobs(filter: $filter, pagination: $pagination) {
        id
        title
        slug
        description
        shortDescription
        company {
          id
          name
          description
          logo
        }
        department
        location
        salary
        type
        jobLevel
        workType
        industry
        status
        deadline
        skills
        experience
        education
        responsibilities
        requirements
        benefits
        featured
        applicants
        views
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
    mutation UpdateJob($input: UpdateJobInput!) {
      updateJob(input: $input) {
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
    query GetAllJobs($filter: JobFilterInput, $pagination: PaginationInput) {
      jobs(filter: $filter, pagination: $pagination) {
        id
        title
        description
        company {
          id
          name
          description
          logo
        }
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
        slug
        company {
          id
          name
          description
          logo
        }
        department
        location
        salary
        type
        deadline
        shortDescription
        status
        applicants
        views
        createdAt
        updatedAt
      }
    }
  `;

  /**
   * Fetch jobs with optional filters and pagination
   * For public access (no token), only returns ACTIVE jobs
   */
  async getJobs(
    page: number = 1,
    limit: number = 10,
    filters?: JobFilters
  ): Promise<JobsResponse> {
    try {
      // Check if user is authenticated
      const { authService } = await import('@/services/auth');
      let currentUser;
      try {
        currentUser = await authService.getCurrentUser();
      } catch (error) {
        // User is not authenticated
        currentUser = null;
      }

      // Build filter object for GraphQL
      const gqlFilter: any = {};

      // If no authentication token, only show ACTIVE jobs
      if (!currentUser) {
        gqlFilter.status = 'ACTIVE';
      }

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
      if (filters?.department) {
        gqlFilter.department = filters.department;
      }

      const { data } = await apolloClient.query<{ 
        jobs: any[]
      }>({
        query: this.GET_COMPANY_JOBS_QUERY,
        variables: {
          filter: Object.keys(gqlFilter).length > 0 ? gqlFilter : undefined,
          pagination: { page, limit }
        },
        fetchPolicy: 'network-only',
        context: {
          // Don't send auth header for public job listings if no user
          headers: currentUser ? undefined : {}
        }
      });

      const jobs = data?.jobs || [];
      const total = jobs.length;

      // Map to our Job interface
      const mappedJobs: Job[] = jobs.map((job: any) => ({
        id: job.id,
        title: job.title,
        description: job.shortDescription || job.description,
        company: job.company?.name || job.department, // Use company name if available, fallback to department
        companyData: job.company ? {
          id: job.company.id,
          name: job.company.name,
          description: job.company.description,
          logo: job.company.logo
        } : undefined,
        companyLogo: job.company?.logo, // Add company logo directly
        location: job.location,
        salary: job.salary,
        type: job.type,
        level: job.jobLevel,
        skills: Array.isArray(job.skills) ? job.skills : [],
        slug: job.slug,
        deadline: job.deadline, // Add deadline field
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        isActive: job.status === 'ACTIVE'
      }));

      return {
        jobs: mappedJobs,
        total: total,
        page,
        limit
      };
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      throw new Error(error?.message || 'Failed to fetch jobs');
    }
  }

  /**
   * Fetch public jobs (ACTIVE only, no authentication required)
   * Use this for job listings accessible to anonymous users
   */
  async getPublicJobs(
    page: number = 1,
    limit: number = 10,
    filters?: JobFilters
  ): Promise<JobsResponse> {
    try {
      // Build filter object for GraphQL
      const gqlFilter: any = {
        status: 'ACTIVE' // Only show ACTIVE jobs for public
      };

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
      if (filters?.department) {
        gqlFilter.department = filters.department;
      }

      const { data } = await apolloClient.query<{ 
        jobs: any[]
      }>({
        query: this.GET_COMPANY_JOBS_QUERY,
        variables: {
          filter: gqlFilter,
          pagination: { page, limit }
        },
        fetchPolicy: 'network-only',
        context: {
          headers: {} // No auth header for public access
        }
      });

      const jobs = data?.jobs || [];
      const total = jobs.length;

      // Map to our Job interface
      const mappedJobs: Job[] = jobs.map((job: any) => ({
        id: job.id,
        title: job.title,
        description: job.shortDescription || job.description,
        company: job.company?.name || job.department,
        companyData: job.company ? {
          id: job.company.id,
          name: job.company.name,
          description: job.company.description,
          logo: job.company.logo
        } : undefined,
        companyLogo: job.company?.logo, // Add company logo directly
        location: job.location,
        salary: job.salary,
        type: job.type,
        level: job.jobLevel,
        skills: Array.isArray(job.skills) ? job.skills : [],
        slug: job.slug,
        deadline: job.deadline, // Add deadline field
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        isActive: true // All public jobs are active
      }));

      return {
        jobs: mappedJobs,
        total: total,
        page,
        limit
      };
    } catch (error: any) {
      console.error('Error fetching public jobs:', error);
      throw new Error(error?.message || 'Failed to fetch public jobs');
    }
  }

  /**
   * Fetch a single job by slug
   */
  async getJobBySlug(slug: string): Promise<Job> {
    try {
      const { data } = await apolloClient.query<{ jobBySlug: any }>({
        query: this.GET_JOB_BY_ID_QUERY,
        variables: { slug },
        fetchPolicy: 'network-only'
      });

      const job = data?.jobBySlug;
      if (!job) {
        throw new Error('Job not found');
      }

      // Map to our Job interface
      return {
        id: job.id,
        title: job.title,
        description: job.description,
        company: job.company?.name || job.department, // Use company name if available, fallback to department
        companyData: job.company ? {
          id: job.company.id,
          name: job.company.name,
          description: job.company.description,
          logo: job.company.logo
        } : undefined,
        companyLogo: job.company?.logo, // Add company logo directly
        department: job.department, // Add department field
        location: job.location,
        salary: job.salary,
        type: job.type,
        level: job.jobLevel,
        skills: Array.isArray(job.skills) ? job.skills : [],
        slug: job.slug,
        deadline: job.deadline, // Add deadline field
        createdAt: job.createdAt,
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
      const { data } = await apolloClient.query<{ 
        jobs: any[]
      }>({
        query: this.GET_FEATURED_JOBS_QUERY,
        variables: {
          filter: {
            featured: true
          },
          pagination: {
            page: 1,
            limit: limit
          }
        },
        fetchPolicy: 'network-only'
      });

      // Get jobs from response
      const jobs = data?.jobs || [];

      // Map to match the expected interface
      const mappedJobs: Job[] = jobs.map((job: any) => ({
        id: job.id,
        title: job.title,
        description: job.description || '',
        company: job.company?.name || 'Company',
        companyData: job.company ? {
          id: job.company.id,
          name: job.company.name,
          description: job.company.description,
          logo: job.company.logo
        } : undefined,
        companyLogo: job.company?.logo, // Add company logo directly
        location: job.location || '',
        salary: job.salary || '',
        type: job.type || 'FULL_TIME',
        level: job.jobLevel || 'ENTRY',
        skills: job.skills || [],
        slug: job.slug || `${job.id}-${job.title.toLowerCase().replace(/\s+/g, '-')}`,
        deadline: job.deadline || '',
        createdAt: job.createdAt || '',
        updatedAt: job.updatedAt || '',
        isActive: job.status === 'ACTIVE'
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
   * Returns ALL jobs for the authenticated company (including DRAFT, PAUSED, CLOSED)
   * Requires authentication
   */
  async getCompanyJobs(page: number = 1, limit: number = 100, filters?: JobFilters): Promise<any[]> {
    try {
      // Get current user to filter by company
      const { authService } = await import('@/services/auth');
      const currentUser = await authService.getCurrentUser();

      if (!currentUser?.company?.id) {
        console.warn('No company found for current user, returning empty jobs list');
        return [];
      }

      // Build filter object for GraphQL
      const gqlFilter: any = {
        companyId: currentUser.company.id // Always filter by company
        // Note: We don't filter by status here so company can see ALL their jobs
      };

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
      if (filters?.department) {
        gqlFilter.department = filters.department;
      }

      const { data } = await apolloClient.query<{ 
        jobs: any[]
      }>({
        query: this.GET_COMPANY_JOBS_QUERY,
        variables: {
          filter: gqlFilter,
          pagination: { page, limit }
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
        variables: { 
          input: {
            id,
            ...input
          }
        }
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