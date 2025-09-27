import {
  Job,
  CreateJobPostDto,
  JobsResponse,
  // JobStatus,
  // JobType,
  // ExperienceLevel,
  // EducationLevel,
  // JobPriority,
  // SalaryType,
  // Currency,
  // WorkLocation,
  // JobCategory
} from '@/types/job';

class JobsService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005';

  // Utility function to generate slug from title
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  async getJobs(page: number = 1, limit: number = 20): Promise<JobsResponse> {
    try {
      const url = new URL(`${this.baseUrl}/jobs`);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', limit.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();
      console.log('Jobs API raw response:', result); // Debug log

      if (response.ok) {
        // Handle different response formats
        let jobsArray: Job[] = [];
        let pagination = {
          total: 0,
          page: page,
          limit: limit,
          totalPages: 1
        };

        if (Array.isArray(result)) {
          jobsArray = result;
          pagination.total = result.length;
        } else if (result.jobs && Array.isArray(result.jobs)) {
          jobsArray = result.jobs;
          pagination = {
            total: result.total || result.jobs.length,
            page: result.page || page,
            limit: result.limit || limit,
            totalPages: result.totalPages || Math.ceil((result.total || result.jobs.length) / limit)
          };
        } else if (result.data && Array.isArray(result.data)) {
          jobsArray = result.data;
          pagination = {
            total: result.total || result.data.length,
            page: result.page || page,
            limit: result.limit || limit,
            totalPages: Math.ceil((result.total || result.data.length) / limit)
          };
        } else {
          console.warn('Unexpected jobs response format:', result);
        }

        return {
          success: true,
          jobs: jobsArray,
          pagination,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to fetch jobs',
        };
      }
    } catch (error) {
      console.error('Network error fetching jobs:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }

  async getJobById(id: string): Promise<{ success: boolean; job?: Job; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${id}`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          job: result.job || result,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Job not found',
        };
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      return {
        success: false,
        message: 'Network error while fetching job',
      };
    }
  }

  async getJobBySlug(slug: string): Promise<{ success: boolean; job?: Job; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/slug/${slug}`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          job: result.job || result,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Job not found',
        };
      }
    } catch (error) {
      console.error('Error fetching job by slug:', error);
      return {
        success: false,
        message: 'Network error while fetching job',
      };
    }
  }

  async createJob(data: CreateJobPostDto): Promise<JobsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message,
          job: result.job,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to create job',
        };
      }
    } catch {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }

  async updateJob(id: string, data: Partial<CreateJobPostDto>): Promise<JobsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message,
          job: result.job,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to update job',
        };
      }
    } catch (error) {
      console.error('Network error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }

  async deleteJob(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to delete job',
        };
      }
    } catch {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }
}

export const jobsService = new JobsService();