// Applications API Service
const API_BASE_URL = 'http://localhost:4005/api';

// Auth token helper
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Application Status Enum
export enum ApplicationStatus {
  PENDING = 'PENDING',
  SCREENING = 'SCREENING',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEWED = 'INTERVIEWED',
  SHORTLISTED = 'SHORTLISTED',
  REJECTED = 'REJECTED',
  HIRED = 'HIRED',
}

// Interview interface
export interface Interview {
  id: string;
  type: 'AI_SCREENING' | 'HUMAN' | string;
  language: 'ENGLISH' | 'ARABIC' | 'FRENCH' | 'SPANISH' | string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | string;
  scheduledAt: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  expectedDuration: number;
  roomName?: string;
  roomCode?: string;
  roomId?: string;
  accessToken?: string;
  participantToken?: string;
  recordingEnabled?: boolean;
  recordingUrl?: string;
  candidateName?: string;
  candidatePhone?: string;
  instructions?: string;
  applicationId?: string;
  candidateId?: string;
  application?: {
    id: string;
    status: ApplicationStatus;
  };
}

// Interfaces
export interface Application {
  id: string;
  status: ApplicationStatus;
  cvUrl?: string;
  cvFileName?: string;
  coverLetter?: string;
  appliedAt: string;
  updatedAt: string;
  jobPost: {
    id: string;
    title: string;
    company: {
      id: string;
      name: string;
      displayName?: string;
    };
  };
  candidate: {
    id: string;
    phoneNumber: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
  };
  interviews?: Interview[];
  cvAnalysis?: any;
}

export interface CreateApplicationDto {
  jobPostId: string;
  candidateId: string;
  cvUrl?: string;
  cvFileName?: string;
  coverLetter?: string;
}

export interface UpdateApplicationDto {
  status?: ApplicationStatus;
  coverLetter?: string;
}

export interface ApplicationQueryDto {
  status?: ApplicationStatus;
  jobPostId?: string;
  candidateId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApplicationsResponse {
  applications: Application[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API Functions

// Create application (public)
export const createApplication = async (applicationData: CreateApplicationDto): Promise<Application> => {
  const response = await fetch(`${API_BASE_URL}/apply`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(applicationData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create application');
  }

  return response.json();
};

// Get all applications (authenticated - HR/Admin)
export const getApplications = async (query: ApplicationQueryDto = {}): Promise<ApplicationsResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_BASE_URL}/applications?${queryParams}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch applications: ${response.status}`);
  }

  const data = await response.json();
  
  // Handle different response formats
  if (Array.isArray(data)) {
    return { applications: data };
  }

  // Handle { data: [...], meta: {...} } format
  if (data.data && Array.isArray(data.data)) {
    return {
      applications: data.data,
      pagination: data.meta ? {
        total: data.meta.total,
        page: data.meta.page,
        limit: data.meta.limit,
        totalPages: data.meta.totalPages,
        hasNext: data.meta.hasNext,
        hasPrev: data.meta.hasPrev,
      } : undefined
    };
  }

  // Handle { applications: [...], pagination: {...} } format
  if (data.applications) {
    return data;
  }

  // Fallback: treat as applications array
  return { applications: Array.isArray(data) ? data : [] };
};

// Get company applications (authenticated)
export const getMyCompanyApplications = async (query: ApplicationQueryDto = {}): Promise<ApplicationsResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_BASE_URL}/applications/my-company?${queryParams}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch company applications: ${response.status}`);
  }

  const data = await response.json();
  
  // Handle different response formats
  if (Array.isArray(data)) {
    return { applications: data };
  }

  // Handle { data: [...], meta: {...} } format
  if (data.data && Array.isArray(data.data)) {
    return {
      applications: data.data,
      pagination: data.meta ? {
        total: data.meta.total,
        page: data.meta.page,
        limit: data.meta.limit,
        totalPages: data.meta.totalPages,
        hasNext: data.meta.hasNext,
        hasPrev: data.meta.hasPrev,
      } : undefined
    };
  }

  // Handle { applications: [...], pagination: {...} } format
  if (data.applications) {
    return data;
  }

  // Fallback: treat as applications array
  return { applications: Array.isArray(data) ? data : [] };
};

// Get applications by candidate ID
export const getApplicationsByCandidate = async (candidateId: string): Promise<Application[]> => {
  const response = await fetch(`${API_BASE_URL}/applications/candidate/${candidateId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch candidate applications: ${response.status}`);
  }

  return response.json();
};

// Get applications by job post ID
export const getApplicationsByJobPost = async (jobPostId: string): Promise<Application[]> => {
  const response = await fetch(`${API_BASE_URL}/applications/jobpost/${jobPostId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch job post applications: ${response.status}`);
  }

  return response.json();
};

// Get application by ID
export const getApplicationById = async (applicationId: string): Promise<Application> => {
  const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Application not found: ${response.status}`);
  }

  return response.json();
};

// Update application
export const updateApplication = async (
  applicationId: string, 
  updateData: UpdateApplicationDto
): Promise<Application> => {
  const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update application');
  }

  return response.json();
};

// Delete application
export const deleteApplication = async (applicationId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete application');
  }
};

// Bulk update applications status
export const bulkUpdateApplicationsStatus = async (
  applicationIds: string[], 
  status: ApplicationStatus
): Promise<Application[]> => {
  const updatePromises = applicationIds.map(id => 
    updateApplication(id, { status })
  );

  return Promise.all(updatePromises);
};

// Get application statistics
export const getApplicationStats = async (): Promise<{
  total: number;
  byStatus: { [key in ApplicationStatus]: number };
  recentCount: number;
}> => {
  try {
    const response = await getMyCompanyApplications({ limit: 1000 });
    const applications = response.applications;

    const statusCounts = Object.values(ApplicationStatus).reduce((acc, status) => {
      acc[status] = applications.filter(app => app.status === status).length;
      return acc;
    }, {} as { [key in ApplicationStatus]: number });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCount = applications.filter(app => 
      new Date(app.appliedAt) >= thirtyDaysAgo
    ).length;

    return {
      total: applications.length,
      byStatus: statusCounts,
      recentCount,
    };
  } catch (error) {
    console.error('Error fetching application stats:', error);
    return {
      total: 0,
      byStatus: Object.values(ApplicationStatus).reduce((acc, status) => {
        acc[status] = 0;
        return acc;
      }, {} as { [key in ApplicationStatus]: number }),
      recentCount: 0,
    };
  }
};
