import { API_CONFIG } from '@/lib/config';

export interface JobAnalysisRequest {
  jobTitle: string;
  department: string;
  industry: string;
  employeeType: string;
  jobLevel: string;
  workType: string;
  location: string;
  country: string;
}

export interface JobAnalysisResponse {
  description: string;
  shortDescription: string;
  responsibilities: string;
  requirements: string;
  skills: string[];
  benefits: string;
  suggestedSalary?: string | undefined;
  industryInsights?: string | undefined;
  experienceLevel?: string | undefined;
  educationLevel?: string | undefined;
}

export interface AIConfigRequest {
  jobTitle: string;
  department: string;
  industry: string;
  jobLevel: string;
  description?: string;
  responsibilities?: string;
  requirements?: string;
  skills?: string[];
  interviewQuestions?: string;
}

export interface AIConfigResponse {
  aiCvAnalysisPrompt: string;
  aiFirstInterviewPrompt: string;
  aiSecondInterviewPrompt: string;
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> { }

export interface CreateJobRequest {
  title: string;
  department: string;
  location: string;
  salary: string;
  type: string; // full-time, part-time, contract, internship
  deadline: string;
  description: string;
  shortDescription: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  skills: string[];
  experience: string;
  education: string;
  jobLevel: string; // entry, mid, senior, executive
  workType: string; // onsite, remote, hybrid
  industry: string;
  interviewLanguage: string; // EN, AR
  aiCvAnalysisPrompt: string;
  aiFirstInterviewPrompt: string;
  aiSecondInterviewPrompt: string;
}

export interface CreateJobResponse {
  id: string;
  message: string;
  jobData: any;
}

export interface JobPost {
  id: string;
  title: string;
  department: string;
  location: string;
  salary: string;
  type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "REMOTE";
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "CLOSED" | "EXPIRED" | "DELETED";
  applicants: number;
  views: number;
  postedAt: string;
  deadline: string;
  description: string;
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
  interviewLanguage?: string;
  aiCvAnalysisPrompt?: string;
  aiFirstInterviewPrompt?: string;
  aiSecondInterviewPrompt?: string;
  cvAnalysisPrompt?: string;
  interviewPrompt?: string;
  companyLogo?: string; // Direct company logo URL
  // Add company information
  company?: {
    id: string;
    name: string;
    logo?: string; // Company logo URL in nested company object
    address?: {
      id: string;
      street: string;
      city: string;
      country: string;
    } | null;
  } | null;
  companyId?: string;
}

export interface GetJobsResponse {
  jobs: JobPost[];
  total: number;
  pagination?: {
    page: number;
    limit: number;
    offset: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
}

export class JobService {
  /**
   * Apply to a job (POST /api/applications)
   * @param applicationData { jobId, coverLetter, resumeUrl?, expectedSalary, noticePeriod }
   */
  static async applyToJob(applicationData: {
    jobId: string;
    coverLetter: string;
    resumeUrl?: string;
    expectedSalary: string;
    noticePeriod: string;
  }): Promise<{ message: string; applicationId?: string }> {
    const response = await fetch(`${this.baseUrl}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(applicationData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to apply to job' }));
      throw new Error(error.message || 'Failed to apply to job');
    }

    const data = await response.json();
    return {
      message: data.message || 'Application submitted successfully',
      applicationId: data.id || data.applicationId,
    };
  }
  private static baseUrl = API_CONFIG.API_BASE_URL; // Backend URL

  /**
   * Generate job analysis using AI
   */
  static async generateJobAnalysis(request: JobAnalysisRequest): Promise<JobAnalysisResponse> {
    const response = await fetch(`${this.baseUrl}/aiautocomplete/job-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to generate job analysis' }));
      throw new Error(error.message || 'Failed to generate job analysis');
    }

    const data = await response.json();

    // Helper function to map AI experience level to form values
    const mapExperienceLevel = (aiExperience: string): string => {
      if (!aiExperience) return '';
      const experienceText = aiExperience.toLowerCase();

      // Handle direct matches first
      if (experienceText === '0-1 years' || experienceText === '0-1') return '0-1 years';
      if (experienceText === '1-3 years' || experienceText === '1-3') return '1-3 years';
      if (experienceText === '3-5 years' || experienceText === '3-5') return '3-5 years';
      if (experienceText === '5-7 years' || experienceText === '5-7') return '5-7 years';
      if (experienceText === '7+ years' || experienceText === '7+') return '7+ years';

      // Handle variations and keywords
      if (experienceText.includes('0-1') || experienceText.includes('entry')) return '0-1 years';
      if (experienceText.includes('1-3') || experienceText.includes('2-4')) return '1-3 years';
      if (experienceText.includes('3-5') || experienceText.includes('4-6')) return '3-5 years';
      if (experienceText.includes('5-7') || experienceText.includes('6-8')) return '5-7 years';
      if (experienceText.includes('7+') || experienceText.includes('8+') || experienceText.includes('senior')) return '7+ years';

      return aiExperience; // return original if no match found
    };

    // Helper function to map AI education requirements to form values
    const mapEducationLevel = (aiEducation: string[]): string => {
      if (!aiEducation || aiEducation.length === 0) return '';

      // Join all education requirements and check for keywords
      const educationText = aiEducation.join(' ').toLowerCase();

      // Priority order: highest degree first
      if (educationText.includes('phd') || educationText.includes('doctorate')) return 'PhD';
      if (educationText.includes('master')) return "Master's Degree";
      if (educationText.includes('bachelor')) return "Bachelor's Degree";
      if (educationText.includes('certification') || educationText.includes('certificate')) return 'Professional Certification';
      if (educationText.includes('diploma')) return 'Diploma';
      if (educationText.includes('high school') || educationText.includes('secondary')) return 'High School';

      // Default to Bachelor's for professional roles
      return "Bachelor's Degree";
    };

    // Map the backend response to the expected frontend format
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
        `${data.salaryRange.currency} ${data.salaryRange.min.toLocaleString()} - ${data.salaryRange.max.toLocaleString()}${data.salaryRange.period ? ' (' + data.salaryRange.period + ')' : ''}` :
        undefined,
      industryInsights: data.insights?.length > 0 ? data.insights.join('\n\n') : undefined,
      experienceLevel: mapExperienceLevel(data.experienceLevel || ''),
      educationLevel: mapEducationLevel(data.educationRequirements || []),
    };
  }

  /**
   * Get a single job by its ID
   */
  static async getJobById(jobId: string): Promise<JobPost> {
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `Failed to fetch job with ID ${jobId}` }));
      throw new Error(error.message || `Failed to fetch job with ID ${jobId}`);
    }

    const data = await response.json();
    return data as JobPost;
  }

  /**
   * Update an existing job
   */
  static async updateJob(jobId: string, jobData: UpdateJobRequest): Promise<JobPost> {
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(jobData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update job' }));
      throw new Error(error.message || 'Failed to update job');
    }

    const data = await response.json();
    return data.job as JobPost;
  }

  /**
   * Rewrite job description using AI
   */
  static async rewriteJobDescription(currentDescription: string): Promise<{
    rewrittenDescription: string;
    rewrittenShortDescription: string;
  }> {
    const response = await fetch(`${this.baseUrl}/aiautocomplete/rewrite-job-description`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
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
  }

  /**
   * Rewrite job requirements using AI
   */
  static async rewriteJobRequirements(currentRequirements: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/aiautocomplete/rewrite-requirements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify({ requirements: currentRequirements }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to rewrite job requirements' }));
      throw new Error(error.message || 'Failed to rewrite job requirements');
    }

    const data = await response.json();
    return data.polishedRequirements || data.rewrittenRequirements || data.requirements || currentRequirements;
  }

  /**
   * Rewrite job title using AI
   */
  static async rewriteJobTitle(
    currentTitle: string,
    industry?: string,
    company?: string,
    jobLevel?: string
  ): Promise<{ jobTitle: string; department?: string }> {
    const payload: any = {
      jobTitle: currentTitle,
    };

    // Add optional fields if provided
    if (industry) payload.industry = industry;
    if (company) payload.company = company;
    if (jobLevel) payload.jobLevel = jobLevel;

    const response = await fetch(`${this.baseUrl}/aiautocomplete/rewrite-job-title`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to rewrite job title' }));
      throw new Error(error.message || 'Failed to rewrite job title');
    }

    const data = await response.json();
    return {
      jobTitle: data.jobTitle || currentTitle,
      department: data.department
    };
  }

  /**
   * Rewrite job benefits using AI
   */
  static async rewriteBenefits(
    currentBenefits: string,
    industry?: string,
    jobLevel?: string,
    company?: string
  ): Promise<string> {
    const payload: any = {
      benefits: currentBenefits,
    };

    // Add optional fields if provided
    if (industry) payload.industry = industry;
    if (jobLevel) payload.jobLevel = jobLevel;
    if (company) payload.company = company;

    const response = await fetch(`${this.baseUrl}/aiautocomplete/rewrite-benefits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to rewrite benefits' }));
      throw new Error(error.message || 'Failed to rewrite benefits');
    }

    const data = await response.json();
    return data.polishedBenefits || currentBenefits;
  }

  /**
   * Rewrite job responsibilities using AI
   */
  static async rewriteResponsibilities(
    currentResponsibilities: string,
    industry?: string,
    jobLevel?: string,
    company?: string
  ): Promise<string> {
    const payload: any = {
      responsibilities: currentResponsibilities,
    };

    // Add optional fields if provided
    if (industry) payload.industry = industry;
    if (jobLevel) payload.jobLevel = jobLevel;
    if (company) payload.company = company;

    const response = await fetch(`${this.baseUrl}/aiautocomplete/rewrite-responsibilities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to rewrite responsibilities' }));
      throw new Error(error.message || 'Failed to rewrite responsibilities');
    }

    const data = await response.json();
    return data.polishedResponsibilities || data.rewrittenResponsibilities || data.responsibilities || currentResponsibilities;
  }

  /**
   * Generate AI configuration prompts based on job details
   */
  static async generateAIConfiguration(request: AIConfigRequest): Promise<AIConfigResponse> {
    const response = await fetch(`${this.baseUrl}/aiautocomplete/generate-ai-config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to generate AI configuration' }));
      throw new Error(error.message || 'Failed to generate AI configuration');
    }

    const data = await response.json();
    return {
      aiCvAnalysisPrompt: data.aiCvAnalysisPrompt || '',
      aiFirstInterviewPrompt: data.aiFirstInterviewPrompt || '',
      aiSecondInterviewPrompt: data.aiSecondInterviewPrompt || '',
    };
  }

  /**
   * Create a new job posting
   */
  static async createJob(request: CreateJobRequest): Promise<CreateJobResponse> {
    console.log('JobService.createJob - Sending request to:', `${this.baseUrl}/jobs/create`);
    console.log('JobService.createJob - Request payload:', request);

    const response = await fetch(`${this.baseUrl}/jobs/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(request),
    });

    console.log('JobService.createJob - Response status:', response.status);
    console.log('JobService.createJob - Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create job' }));
      console.error('JobService.createJob - Error response:', error);
      throw new Error(error.message || 'Failed to create job');
    }

    const data = await response.json();
    console.log('JobService.createJob - Success response:', data);

    return {
      id: data.id || data.jobId || '',
      message: data.message || 'Job created successfully',
      jobData: data.job || data,
    };
  }

  /**
   * Fetch all jobs for the company
   */
  static async getCompanyJobs(page: number = 1, limit: number = 100, search?: string): Promise<GetJobsResponse> {
    console.log('JobService.getCompanyJobs - Fetching from:', `${this.baseUrl}/jobs/company/all`);

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search && search.trim()) {
      queryParams.append('search', search.trim());
    }

    const response = await fetch(`${this.baseUrl}/jobs/company/all?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
    });

    console.log('JobService.getCompanyJobs - Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch jobs' }));
      console.error('JobService.getCompanyJobs - Error response:', error);
      throw new Error(error.message || 'Failed to fetch jobs');
    }

    const data = await response.json();
    console.log('JobService.getCompanyJobs - Success response:', data);

    // Transform the backend response to match our frontend interface
    const jobs: JobPost[] = (data.jobs || []).map((job: any) => ({
      id: job.id || job._id || '',
      title: job.title || '',
      department: job.department || '',
      location: job.location || '',
      salary: job.salary || '',
      type: job.type || 'FULL_TIME',
      status: job.status || 'DRAFT',
      applicants: job.applicants || job.applicantCount || 0,
      views: job.views || job.viewCount || 0,
      postedAt: job.postedAt || job.createdAt || '',
      deadline: job.deadline || '',
      description: job.description || '',
      shortDescription: job.shortDescription || '',
      responsibilities: job.responsibilities || '',
      requirements: job.requirements || '',
      benefits: job.benefits || '',
      skills: job.skills || [],
      experience: job.experience || '',
      education: job.education || '',
      jobLevel: job.jobLevel || '',
      workType: job.workType || '',
      industry: job.industry || '',
      aiCvAnalysisPrompt: job.aiCvAnalysisPrompt || '',
      aiFirstInterviewPrompt: job.aiFirstInterviewPrompt || '',
      aiSecondInterviewPrompt: job.aiSecondInterviewPrompt || '',
      // Add company information
      company: job.company ? {
        id: job.company.id || '',
        name: job.company.name || '',
        address: job.company.address || null
      } : null,
      companyId: job.companyId || '',
    }));

    return {
      jobs,
      total: data.total || 0,
      pagination: data.pagination || undefined,
    };
  }

  /**
   * Activate a draft job posting
   */
  static async activateJob(jobId: string): Promise<{ id: string, message: string }> {
    console.log('JobService.activateJob - Activating job:', jobId);

    const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify({ status: 'ACTIVE' }),
    });

    console.log('JobService.activateJob - Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to activate job' }));
      console.error('JobService.activateJob - Error response:', error);
      throw new Error(error.message || 'Failed to activate job');
    }

    const data = await response.json();
    console.log('JobService.activateJob - Success response:', data);

    return {
      id: data.id || jobId,
      message: data.message || 'Job activated successfully',
    };
  }

  /**
   * Pause a job posting (sets status to PAUSED)
   */
  static async pauseJob(jobId: string): Promise<{ id: string, message: string }> {
    console.log('JobService.pauseJob - Pausing job:', jobId);

    const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify({ status: 'PAUSED' }),
    });

    console.log('JobService.pauseJob - Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to pause job' }));
      console.error('JobService.pauseJob - Error response:', error);
      throw new Error(error.message || 'Failed to pause job');
    }

    const data = await response.json();
    console.log('JobService.pauseJob - Success response:', data);

    return {
      id: data.id || jobId,
      message: data.message || 'Job paused successfully',
    };
  }

  /**
   * Delete a job posting (sets status to DELETED)
   */
  static async deleteJob(jobId: string): Promise<{ id: string, message: string }> {
    console.log('JobService.deleteJob - Deleting job:', jobId);

    const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify({ status: 'DELETED' }),
    });

    console.log('JobService.deleteJob - Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete job' }));
      console.error('JobService.deleteJob - Error response:', error);
      throw new Error(error.message || 'Failed to delete job');
    }

    const data = await response.json();
    console.log('JobService.deleteJob - Success response:', data);

    return {
      id: data.id || jobId,
      message: data.message || 'Job deleted successfully',
    };
  }

  /**
   * Fetch featured jobs (public endpoint - no auth required)
   */
  static async getFeaturedJobs(): Promise<JobPost[]> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/public/featured`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to fetch featured jobs' }));
        throw new Error(error.message || 'Failed to fetch featured jobs');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching featured jobs:', error);
      throw error;
    }
  }

  /**
   * Fetch all public jobs with pagination (public endpoint - no auth required)
   */
  static async getAllPublicJobs(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<GetJobsResponse> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search && search.trim()) {
        queryParams.append('search', search.trim());
      }

      const response = await fetch(`${this.baseUrl}/jobs/public/all?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to fetch public jobs' }));
        throw new Error(error.message || 'Failed to fetch public jobs');
      }

      const data = await response.json();

      // Transform the backend response to match our frontend interface
      const jobs: JobPost[] = (data.jobs || []).map((job: any) => ({
        id: job.id || job._id || '',
        title: job.title || '',
        department: job.department || '',
        location: job.location || '',
        salary: job.salary || '',
        type: job.type || 'FULL_TIME',
        status: job.status || 'ACTIVE',
        applicants: job.applicants || job.applicantCount || 0,
        views: job.views || job.viewCount || 0,
        postedAt: job.postedAt || job.createdAt || '',
        deadline: job.deadline || '',
        description: job.description || '',
        shortDescription: job.shortDescription || '',
        responsibilities: job.responsibilities || '',
        requirements: job.requirements || '',
        benefits: job.benefits || '',
        skills: job.skills || [],
        experience: job.experience || '',
        education: job.education || '',
        jobLevel: job.jobLevel || '',
        workType: job.workType || '',
        industry: job.industry || '',
        companyLogo: job.companyLogo || '', // Add direct company logo field
        // Add company information
        company: job.company ? {
          id: job.company.id || '',
          name: job.company.name || '',
          logo: job.company.logo || '', // Add nested company logo field
          address: job.company.address || null
        } : null,
        companyId: job.companyId || '',
      }));

      return {
        jobs,
        total: data.total || 0,
        pagination: data.pagination || undefined,
      };
    } catch (error) {
      console.error('Error fetching public jobs:', error);
      throw error;
    }
  }

  /**
   * Get a single public job by ID (public endpoint - no auth required)
   */
  static async getPublicJobById(jobId: string): Promise<JobPost> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/public/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `Failed to fetch job with ID ${jobId}` }));
        throw new Error(error.message || `Failed to fetch job with ID ${jobId}`);
      }

      const data = await response.json();

      // Transform the backend response to match our frontend interface
      return {
        id: data.id || data._id || '',
        title: data.title || '',
        department: data.department || '',
        location: data.location || '',
        salary: data.salary || '',
        type: data.type || 'FULL_TIME',
        status: data.status || 'ACTIVE',
        applicants: data.applicants || data.applicantCount || 0,
        views: data.views || data.viewCount || 0,
        postedAt: data.postedAt || data.createdAt || '',
        deadline: data.deadline || '',
        description: data.description || '',
        shortDescription: data.shortDescription || '',
        responsibilities: data.responsibilities || '',
        requirements: data.requirements || '',
        benefits: data.benefits || '',
        skills: data.skills || [],
        experience: data.experience || '',
        education: data.education || '',
        jobLevel: data.jobLevel || '',
        workType: data.workType || '',
        industry: data.industry || '',
        companyLogo: data.companyLogo || '', // Add direct company logo field
        // Add company information
        company: data.company ? {
          id: data.company.id || '',
          name: data.company.name || '',
          logo: data.company.logo || '', // Add nested company logo field
          address: data.company.address || null
        } : null,
        companyId: data.companyId || '',
      };
    } catch (error) {
      console.error('Error fetching public job:', error);
      throw error;
    }
  }

}
