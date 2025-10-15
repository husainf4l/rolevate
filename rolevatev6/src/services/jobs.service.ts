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

  /**
   * Fetch jobs with optional filters and pagination
   */
  async getJobs(
    page: number = 1, 
    limit: number = 10, 
    filters?: JobFilters
  ): Promise<JobsResponse> {
    try {
      // Since the GraphQL API doesn't support filtering, we fetch all and filter client-side
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
            job.shortDescription.toLowerCase().includes(searchTerm)
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

  /**
   * Fetch featured jobs for homepage
   */
  async getFeaturedJobs(limit: number = 6): Promise<Job[]> {
    try {
      const response = await graphQLService.request<{ jobs: any[] }>(
        this.GET_ALL_JOBS_QUERY
      );

      // Filter for featured jobs and limit the results
      const featuredJobs = (response.jobs || [])
        .filter(job => job.featured === true)
        .slice(0, limit);

      // Map to our Job interface
      const mappedJobs: Job[] = featuredJobs.map(job => ({
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


}

export const jobsService = new JobsService();