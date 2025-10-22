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

  // AI-powered job generation methods
  async generateJobAnalysis(request: JobAnalysisRequest): Promise<JobAnalysisResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/aiautocomplete/job-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to generate job analysis' }));
        throw new Error(error.message || 'Failed to generate job analysis');
      }

      const data = await response.json();
      return {
        description: data.jobRequirements?.description || '',
        shortDescription: data.jobRequirements?.shortDescription || '',
        responsibilities: data.jobRequirements?.keyResponsibilities || '',
        requirements: data.jobRequirements?.qualifications?.length > 0 ?
          '• ' + data.jobRequirements.qualifications.join('\n• ') : '',
        skills: data.jobRequirements?.requiredSkills || [],
        benefits: data.jobRequirements?.benefitsAndPerks?.length > 0 ?
          '• ' + data.jobRequirements.benefitsAndPerks.join('\n• ') : '',
        suggestedSalary: data.salaryRange ?
          `${data.salaryRange.currency} ${data.salaryRange.min.toLocaleString()} - ${data.salaryRange.max.toLocaleString()}` :
          undefined,
        industryInsights: data.insights?.length > 0 ? data.insights.join('\n\n') : undefined,
        experienceLevel: data.experienceLevel || '',
        educationLevel: data.educationRequirements?.[0] || '',
      };
    } catch (error) {
      console.error('Error generating job analysis:', error);
      throw error;
    }
  }

  async rewriteJobDescription(currentDescription: string): Promise<{
    rewrittenDescription: string;
    rewrittenShortDescription: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/aiautocomplete/rewrite-job-description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ description: currentDescription }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to rewrite job description' }));
        throw new Error(error.message || 'Failed to rewrite job description');
      }

      const data = await response.json();
      return {
        rewrittenDescription: data.rewrittenDescription || currentDescription,
        rewrittenShortDescription: data.rewrittenShortDescription || ''
      };
    } catch (error) {
      console.error('Error rewriting job description:', error);
      throw error;
    }
  }

  async rewriteJobRequirements(currentRequirements: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/aiautocomplete/rewrite-requirements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ requirements: currentRequirements }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to rewrite job requirements' }));
        throw new Error(error.message || 'Failed to rewrite job requirements');
      }

      const data = await response.json();
      return data.polishedRequirements || data.rewrittenRequirements || currentRequirements;
    } catch (error) {
      console.error('Error rewriting job requirements:', error);
      throw error;
    }
  }

  async generateAIPrompts(request: AIConfigRequest): Promise<AIConfigResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/aiautocomplete/generate-ai-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to generate AI prompts' }));
        throw new Error(error.message || 'Failed to generate AI prompts');
      }

      const data = await response.json();
      return {
        aiCvAnalysisPrompt: data.aiCvAnalysisPrompt || '',
        aiFirstInterviewPrompt: data.aiFirstInterviewPrompt || '',
        aiSecondInterviewPrompt: data.aiSecondInterviewPrompt || '',
      };
    } catch (error) {
      console.error('Error generating AI prompts:', error);
      throw error;
    }
  }

  async getPublicFeaturedJobs(): Promise<JobsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/public/featured`, {
        method: 'GET',
      });

      const result = await response.json();
      console.log('Public featured jobs API response:', result);

      if (response.ok) {
        let jobsArray: Job[] = [];
        let pagination = {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1
        };

        if (Array.isArray(result)) {
          jobsArray = result;
          pagination.total = result.length;
        } else if (result.jobs && Array.isArray(result.jobs)) {
          jobsArray = result.jobs;
          pagination = {
            total: result.total || result.jobs.length,
            page: result.page || 1,
            limit: result.limit || 10,
            totalPages: result.totalPages || Math.ceil((result.total || result.jobs.length) / 10)
          };
        } else if (result.data && Array.isArray(result.data)) {
          jobsArray = result.data;
          pagination = {
            total: result.total || result.data.length,
            page: result.page || 1,
            limit: result.limit || 10,
            totalPages: Math.ceil((result.total || result.data.length) / 10)
          };
        }

        return {
          success: true,
          jobs: jobsArray,
          pagination,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to fetch featured jobs',
        };
      }
    } catch (error) {
      console.error('Network error fetching featured jobs:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }

  async getPublicJobs(params: {
    limit?: string;
    offset?: string;
    page?: string;
    search?: string;
  } = {}): Promise<JobsResponse> {
    try {
      const url = new URL(`${this.baseUrl}/jobs/public/all`);

      if (params.limit) url.searchParams.append('limit', params.limit);
      if (params.offset) url.searchParams.append('offset', params.offset);
      if (params.page) url.searchParams.append('page', params.page);
      if (params.search) url.searchParams.append('search', params.search);

      const response = await fetch(url.toString(), {
        method: 'GET',
      });

      const result = await response.json();
      console.log('Public jobs API response:', result);

      if (response.ok) {
        let jobsArray: Job[] = [];
        let pagination = {
          total: 0,
          page: parseInt(params.page || '1'),
          limit: parseInt(params.limit || '20'),
          totalPages: 1
        };

        if (Array.isArray(result)) {
          jobsArray = result;
          pagination.total = result.length;
        } else if (result.jobs && Array.isArray(result.jobs)) {
          jobsArray = result.jobs;
          pagination = {
            total: result.total || result.jobs.length,
            page: result.page || parseInt(params.page || '1'),
            limit: result.limit || parseInt(params.limit || '20'),
            totalPages: result.totalPages || Math.ceil((result.total || result.jobs.length) / parseInt(params.limit || '20'))
          };
        } else if (result.data && Array.isArray(result.data)) {
          jobsArray = result.data;
          pagination = {
            total: result.total || result.data.length,
            page: result.page || parseInt(params.page || '1'),
            limit: result.limit || parseInt(params.limit || '20'),
            totalPages: Math.ceil((result.total || result.data.length) / parseInt(params.limit || '20'))
          };
        }

        return {
          success: true,
          jobs: jobsArray,
          pagination,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to fetch public jobs',
        };
      }
    } catch (error) {
      console.error('Network error fetching public jobs:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }
}

export const jobsService = new JobsService();