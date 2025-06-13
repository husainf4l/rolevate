// Jobs API Service
const API_BASE_URL = 'http://localhost:4005/api';

// Auth token helper
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Enums matching backend
export enum ExperienceLevel {
  ENTRY = 'ENTRY',
  JUNIOR = 'JUNIOR',
  MID = 'MID',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
  EXECUTIVE = 'EXECUTIVE',
}

export enum WorkType {
  REMOTE = 'REMOTE',
  ONSITE = 'ONSITE',
  HYBRID = 'HYBRID',
}

export enum InterviewLanguage {
  ENGLISH = 'ENGLISH',
  ARABIC = 'ARABIC',
  FRENCH = 'FRENCH',
  SPANISH = 'SPANISH',
}

export interface JobPostQueryDto {
  search?: string;
  companyId?: string;
  experienceLevel?: ExperienceLevel;
  workType?: WorkType;
  location?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Keep old interface for backward compatibility
export interface JobFilters extends JobPostQueryDto {}

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  responsibilities?: string;
  benefits?: string;
  skills: string[];
  experienceLevel: ExperienceLevel;
  location?: string;
  workType?: WorkType;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  enableAiInterview?: boolean;
  interviewLanguages?: InterviewLanguage[];
  interviewDuration?: number;
  aiPrompt?: string;
  aiInstructions?: string;
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  publishedAt?: string;
  company: {
    id: string;
    name: string;
    displayName?: string;
    logo?: string;
    location?: string;
    industry?: string;
    website?: string;
    description?: string;
  };
  createdBy?: {
    id: string;
    name?: string;
    username: string;
    email: string;
  };
  applications?: Array<{
    id: string;
    status: string;
    appliedAt: string;
    candidate: {
      id: string;
      phoneNumber: string;
      firstName?: string;
      lastName?: string;
      fullName?: string;
      email?: string;
    };
  }>;
}

export interface JobsResponse {
  jobs: Job[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface JobStats {
  totalJobs: number;
  activeJobs: number;
  featuredJobs: number;
  totalApplications: number;
  recentJobs: number;
  distribution: {
    byExperience: Array<{
      level: string;
      count: number;
    }>;
    byWorkType: Array<{
      type: string;
      count: number;
    }>;
  };
}

// Create Job Post DTO
export interface CreateJobPostDto {
  title: string;
  description: string;
  requirements: string;
  responsibilities?: string;
  benefits?: string;
  skills: string[];
  experienceLevel: ExperienceLevel;
  location?: string;
  workType?: WorkType;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  enableAiInterview?: boolean;
  interviewLanguages?: InterviewLanguage[];
  interviewDuration?: number;
  aiPrompt?: string;
  aiInstructions?: string;
}

// Update Job Post DTO - matches backend expectations
export interface UpdateJobPostDto {
  title?: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  skills?: string[];
  experienceLevel?: ExperienceLevel;
  location?: string;
  workType?: WorkType;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  expiresAt?: string;
  enableAiInterview?: boolean;
  interviewLanguages?: InterviewLanguage[];
  interviewDuration?: number;
  aiPrompt?: string;
  aiInstructions?: string;
}

// Application DTOs
export interface JobApplication {
  jobId: string;
  phoneNumber: string;
  coverLetter?: string;
}

export interface CreateApplicationDto {
  jobPostId: string;
  candidateId: string;
  cvUrl?: string;
  cvFileName?: string;
  coverLetter?: string;
}

export interface JobApplicationResponse {
  success: boolean;
  message: string;
  applicationId: string;
  candidate: {
    phoneNumber: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
  };
  job: {
    title: string;
    company: string;
  };
}

// API Functions

// Get all jobs (public)
export const getJobs = async (filters: JobFilters = {}): Promise<JobsResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_BASE_URL}/jobposts?${queryParams}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch jobs: ${response.status}`);
  }

  const data = await response.json();
  
  // Handle both paginated and non-paginated responses
  if (Array.isArray(data)) {
    return {
      jobs: data,
      pagination: {
        total: data.length,
        page: 1,
        limit: data.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  // Handle API response with { data, meta }
  if (Array.isArray(data.data) && data.meta) {
    return {
      jobs: data.data,
      pagination: {
        total: data.meta.total,
        page: data.meta.page,
        limit: data.meta.limit,
        totalPages: data.meta.totalPages,
        hasNext: data.meta.hasNext,
        hasPrev: data.meta.hasPrev,
      },
    };
  }

  // Handle legacy { jobs, pagination }
  if (Array.isArray(data.jobs) && data.pagination) {
    return data;
  }

  // Fallback: return empty
  return {
    jobs: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };
};

// Get company jobs (authenticated)
export const getMyCompanyJobs = async (filters: JobFilters = {}): Promise<JobsResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_BASE_URL}/jobposts/my-company?${queryParams}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch company jobs: ${response.status}`);
  }

  const data = await response.json();
  
  // Handle both paginated and non-paginated responses
  if (Array.isArray(data)) {
    return {
      jobs: data,
      pagination: {
        total: data.length,
        page: 1,
        limit: data.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  // Handle API response with { data, meta }
  if (Array.isArray(data.data) && data.meta) {
    return {
      jobs: data.data,
      pagination: {
        total: data.meta.total,
        page: data.meta.page,
        limit: data.meta.limit,
        totalPages: data.meta.totalPages,
        hasNext: data.meta.hasNext,
        hasPrev: data.meta.hasPrev,
      },
    };
  }

  // Handle legacy { jobs, pagination }
  if (Array.isArray(data.jobs) && data.pagination) {
    return data;
  }

  // Fallback: return empty
  return {
    jobs: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };
};

// Get job details by ID (public)
export const getJobDetails = async (jobId: string): Promise<Job> => {
  const response = await fetch(`${API_BASE_URL}/jobposts/${jobId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Job not found: ${response.status}`);
  }

  return response.json();
};

// Create new job post (authenticated, requires subscription)
export const createJobPost = async (jobData: CreateJobPostDto): Promise<Job> => {
  const response = await fetch(`${API_BASE_URL}/jobposts`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(jobData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create job post');
  }

  return response.json();
};

// Update job post (authenticated)
export const updateJobPost = async (jobId: string, jobData: UpdateJobPostDto): Promise<Job> => {
  // Transform salary numbers to strings for backend decimal validation
  const transformedData = {
    ...jobData,
    // Only include salary fields if they exist and convert to string for @IsDecimal
    ...(jobData.salaryMin !== undefined && { salaryMin: jobData.salaryMin }),
    ...(jobData.salaryMax !== undefined && { salaryMax: jobData.salaryMax }),
  };

  console.log('Sending update data:', transformedData);

  const response = await fetch(`${API_BASE_URL}/jobposts/${jobId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(transformedData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Update job post error:', errorText);
    
    try {
      const error = JSON.parse(errorText);
      throw new Error(error.message || 'Failed to update job post');
    } catch {
      throw new Error(`Failed to update job post: ${response.status} ${response.statusText}`);
    }
  }

  return response.json();
};

// Delete job post (authenticated)
export const deleteJobPost = async (jobId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/jobposts/${jobId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete job post');
  }
};

// Get job applications (authenticated)
export const getJobApplications = async (jobId: string): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/jobposts/${jobId}/applications`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch applications: ${response.status}`);
  }

  return response.json();
};

// Apply to job (public) - simplified for candidates
export const applyToJob = async (
  jobId: string, 
  applicationData: Omit<JobApplication, 'jobId'>, 
  cvFile?: File
): Promise<JobApplicationResponse> => {
  const formData = new FormData();
  
  // Create application data
  const appData: CreateApplicationDto = {
    jobPostId: jobId,
    candidateId: '', // Will be created/found by backend using phone number
    coverLetter: applicationData.coverLetter || '',
  };

  // Add top-level fields as required by backend
  formData.append('jobPostId', jobId);
  formData.append('phoneNumber', applicationData.phoneNumber);
  if (cvFile) {
    formData.append('cv', cvFile);
  }
  if (applicationData.coverLetter) {
    formData.append('coverLetter', applicationData.coverLetter);
  }

  const response = await fetch(`${API_BASE_URL}/apply`, {
    method: 'POST',
    // Don't set Content-Type for FormData - browser will set it with boundary
    headers: {
      ...(localStorage.getItem('access_token') && {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      }),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to submit application');
  }

  return response.json();
};

// Get job statistics (mock for now - to be updated based on backend)
export const getJobStats = async (): Promise<JobStats> => {
  try {
    const response = await getMyCompanyJobs({ limit: 100 }); // Get company-specific jobs to calculate stats
    const jobs = response.jobs;

    // If jobs is not an array, return default stats
    if (!Array.isArray(jobs)) {
      return {
        totalJobs: 0,
        activeJobs: 0,
        featuredJobs: 0,
        totalApplications: 0,
        recentJobs: 0,
        distribution: {
          byExperience: [],
          byWorkType: [],
        },
      };
    }

    // Calculate experience level distribution
    const experienceCounts: { [key: string]: number } = {};
    const workTypeCounts: { [key: string]: number } = {};

    jobs.forEach(job => {
      // Count experience levels
      const experience = job.experienceLevel || ExperienceLevel.JUNIOR;
      experienceCounts[experience] = (experienceCounts[experience] || 0) + 1;

      // Count work types
      const workType = job.workType || WorkType.ONSITE;
      workTypeCounts[workType] = (workTypeCounts[workType] || 0) + 1;
    });

    const activeJobs = jobs.filter(job => job.isActive).length;
    const featuredJobs = jobs.filter(job => job.isFeatured).length;
    const totalApplications = jobs.reduce((sum, job) => sum + (job.applicationCount || 0), 0);

    return {
      totalJobs: jobs.length,
      activeJobs,
      featuredJobs,
      totalApplications,
      recentJobs: jobs.filter(job => {
        const createdDate = new Date(job.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return createdDate >= thirtyDaysAgo;
      }).length,
      distribution: {
        byExperience: Object.entries(experienceCounts).map(([level, count]) => ({
          level,
          count,
        })),
        byWorkType: Object.entries(workTypeCounts).map(([type, count]) => ({
          type,
          count,
        })),
      },
    };
  } catch (error) {
    console.error('Error fetching job stats:', error);
    // Return default stats
    return {
      totalJobs: 0,
      activeJobs: 0,
      featuredJobs: 0,
      totalApplications: 0,
      recentJobs: 0,
      distribution: {
        byExperience: [],
        byWorkType: [],
      },
    };
  }
};

// Get featured jobs
export const getFeaturedJobs = async (limit: number = 6): Promise<Job[]> => {
  const response = await getMyCompanyJobs({
    isFeatured: true,
    isActive: true,
    limit,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  return response.jobs;
};

// Legacy support - keeping old function names for backward compatibility
export interface CreateJobData extends CreateJobPostDto {
  department?: string; // Legacy field
}

export interface CreateJobResponse {
  success: boolean;
  message: string;
  job: Job;
}

export const createJob = async (jobData: CreateJobData): Promise<CreateJobResponse> => {
  try {
    const job = await createJobPost(jobData);
    return {
      success: true,
      message: 'Job created successfully',
      job,
    };
  } catch (error) {
    throw error;
  }
};
