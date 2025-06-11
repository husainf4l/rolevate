// Jobs API Service
const API_BASE_URL = 'http://localhost:4005/api';

// Default headers for all requests
const defaultHeaders = {
  'Content-Type': 'application/json',
};

export interface JobFilters {
  search?: string;
  companyId?: string;
  experienceLevel?: 'ENTRY_LEVEL' | 'JUNIOR' | 'MID_LEVEL' | 'SENIOR' | 'LEAD' | 'PRINCIPAL' | 'EXECUTIVE';
  workType?: 'ONSITE' | 'REMOTE' | 'HYBRID';
  location?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  responsibilities?: string;
  benefits?: string;
  skills: string[];
  experienceLevel: string;
  location: string;
  workType: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
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
    location: string;
    industry?: string;
  };
  createdBy: {
    id: string;
    name: string;
    username: string;
  };
  technicalQuestions?: string[];
  behavioralQuestions?: string[];
  enableAiInterview?: boolean;
  aiPrompt?: string;
  interviewDuration?: number;
  applications?: Array<{
    id: string;
    status: string;
    appliedAt: string;
    candidate: {
      id: string;
      name: string;
      email: string;
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

export interface JobApplication {
  jobId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  coverLetter?: string;
}

export interface JobApplicationWithFile extends JobApplication {
  cvFile: File;
}

export interface JobApplicationResponse {
  success: boolean;
  message: string;
  applicationId: string;
  candidate: {
    name: string;
    email: string;
  };
  job: {
    title: string;
    company: string;
  };
}

// Get all jobs with filtering and pagination
export const getJobs = async (filters: JobFilters = {}): Promise<JobsResponse> => {
  const queryParams = new URLSearchParams();

  // Add filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_BASE_URL}/jobs?${queryParams}`, {
    method: 'GET',
    headers: defaultHeaders,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch jobs: ${response.status}`);
  }

  return response.json();
};

// Get featured jobs
export const getFeaturedJobs = async (limit = 6): Promise<Job[]> => {
  const response = await fetch(`${API_BASE_URL}/jobs/featured?limit=${limit}`, {
    method: 'GET',
    headers: defaultHeaders,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch featured jobs: ${response.status}`);
  }

  return response.json();
};

// Get job statistics
export const getJobStats = async (): Promise<JobStats> => {
  const response = await fetch(`${API_BASE_URL}/jobs/stats`, {
    method: 'GET',
    headers: defaultHeaders,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch job stats: ${response.status}`);
  }

  return response.json();
};

// Get job details by ID
export const getJobDetails = async (jobId: string): Promise<Job> => {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    method: 'GET',
    headers: defaultHeaders,
  });

  if (!response.ok) {
    throw new Error(`Job not found: ${response.status}`);
  }

  return response.json();
};

// Apply to a job with CV file upload
export const applyToJob = async (jobId: string, applicationData: Omit<JobApplication, 'jobId'>, cvFile: File): Promise<JobApplicationResponse> => {
  const formData = new FormData();
  
  // Add CV file
  formData.append('cv', cvFile);
  
  // Add form data
  formData.append('jobId', jobId);
  formData.append('firstName', applicationData.firstName);
  formData.append('lastName', applicationData.lastName);
  formData.append('email', applicationData.email);
  formData.append('phoneNumber', applicationData.phoneNumber);
  formData.append('coverLetter', applicationData.coverLetter || '');

  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/apply`, {
    method: 'POST',
    body: formData, // No Content-Type header needed for FormData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to submit application');
  }

  return response.json();
};

// Error handling helper
export const handleApiError = (error: any, response?: Response): string => {
  if (response?.status === 404) {
    return 'Job not found';
  } else if (response?.status === 400) {
    return 'Invalid request parameters';
  } else if (response?.status && response.status >= 500) {
    return 'Server error. Please try again later.';
  } else {
    return error.message || 'An unexpected error occurred';
  }
};
