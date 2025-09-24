import {
  Job,
  CreateJobPostDto,
  JobsResponse,
  JobStatus,
  JobType,
  ExperienceLevel,
  EducationLevel,
  JobPriority,
  SalaryType,
  Currency,
  WorkLocation,
  JobCategory
} from '@/types/job';

class JobsService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005';

  async getJobs(): Promise<JobsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();
      console.log('Jobs API raw response:', result); // Debug log

      if (response.ok) {
        // Handle different response formats
        let jobsArray: Job[] = [];

        if (Array.isArray(result)) {
          jobsArray = result;
        } else if (result.jobs && Array.isArray(result.jobs)) {
          jobsArray = result.jobs;
        } else if (result.data && Array.isArray(result.data)) {
          jobsArray = result.data;
        } else {
          console.warn('Unexpected jobs response format:', result);
        }

        return {
          success: true,
          jobs: jobsArray,
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

  async getJobById(id: string): Promise<JobsResponse> {
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
          message: result.message || 'Failed to fetch job',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
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
    } catch (error) {
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
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }
}

export const jobsService = new JobsService();