// Candidates API Service
const API_BASE_URL = 'https://rolevate.com/api';

// Auth token helper
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Availability Status Enum
export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  EMPLOYED = 'EMPLOYED',
  NOT_LOOKING = 'NOT_LOOKING',
  INTERVIEWING = 'INTERVIEWING',
}

// Interfaces
export interface Candidate {
  id: string;
  phoneNumber: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  dateOfBirth?: string;
  nationality?: string;
  currentLocation?: string;
  preferredLocation?: string;
  linkedinProfile?: string;
  githubProfile?: string;
  portfolioUrl?: string;
  skills?: string[];
  experience?: any; // JSON object
  education?: any; // JSON object
  languages?: any; // JSON object
  expectedSalary?: number;
  currentSalary?: number;
  noticePeriod?: number; // in days
  availability?: AvailabilityStatus;
  createdAt: string;
  updatedAt: string;
  applications?: Array<{
    id: string;
    status: string;
    appliedAt: string;
    jobPost: {
      id: string;
      title: string;
      company: {
        name: string;
        displayName?: string;
      };
    };
  }>;
  interviews?: Array<{
    id: string;
    scheduledAt: string;
    status: string;
    jobPost: {
      id: string;
      title: string;
    };
  }>;
}

export interface CreateCandidateDto {
  phoneNumber: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  dateOfBirth?: Date;
  nationality?: string;
  currentLocation?: string;
  preferredLocation?: string;
  linkedinProfile?: string;
  githubProfile?: string;
  portfolioUrl?: string;
  skills?: string[];
  experience?: any;
  education?: any;
  languages?: any;
  expectedSalary?: number;
  currentSalary?: number;
  noticePeriod?: number;
  availability?: AvailabilityStatus;
}

export interface UpdateCandidateDto extends Partial<CreateCandidateDto> {}

export interface CandidateQueryDto {
  search?: string;
  skills?: string[];
  availability?: AvailabilityStatus;
  location?: string;
  experienceLevel?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CandidatesResponse {
  candidates: Candidate[];
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

// Create candidate (authenticated)
export const createCandidate = async (candidateData: CreateCandidateDto): Promise<Candidate> => {
  const response = await fetch(`${API_BASE_URL}/candidates`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(candidateData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create candidate');
  }

  return response.json();
};

// Get all candidates (authenticated)
export const getCandidates = async (query: CandidateQueryDto = {}): Promise<CandidatesResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => queryParams.append(key, item.toString()));
      } else {
        queryParams.append(key, value.toString());
      }
    }
  });

  const response = await fetch(`${API_BASE_URL}/candidates?${queryParams}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch candidates: ${response.status}`);
  }

  const data = await response.json();
  
  if (Array.isArray(data)) {
    return { candidates: data };
  }

  return data;
};

// Find candidate by phone number
export const findCandidateByPhone = async (phoneNumber: string): Promise<Candidate> => {
  const response = await fetch(`${API_BASE_URL}/candidates/phone/${encodeURIComponent(phoneNumber)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Candidate not found: ${response.status}`);
  }

  return response.json();
};

// Get candidate by ID
export const getCandidateById = async (candidateId: string): Promise<Candidate> => {
  const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Candidate not found: ${response.status}`);
  }

  return response.json();
};

// Update candidate
export const updateCandidate = async (
  candidateId: string, 
  updateData: UpdateCandidateDto
): Promise<Candidate> => {
  const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update candidate');
  }

  return response.json();
};

// Delete candidate
export const deleteCandidate = async (candidateId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete candidate');
  }
};

// Get candidate's applications
export const getCandidateApplications = async (candidateId: string): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/applications`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch candidate applications: ${response.status}`);
  }

  return response.json();
};

// Get candidate's interviews
export const getCandidateInterviews = async (candidateId: string): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/interviews`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch candidate interviews: ${response.status}`);
  }

  return response.json();
};

// Get candidates statistics
export const getCandidateStats = async (): Promise<{
  total: number;
  byAvailability: { [key in AvailabilityStatus]: number };
  byLocation: { [key: string]: number };
  recentCount: number;
}> => {
  try {
    const response = await getCandidates({ limit: 1000 });
    const candidates = response.candidates;

    const availabilityCounts = Object.values(AvailabilityStatus).reduce((acc, status) => {
      acc[status] = candidates.filter(candidate => candidate.availability === status).length;
      return acc;
    }, {} as { [key in AvailabilityStatus]: number });

    const locationCounts: { [key: string]: number } = {};
    candidates.forEach(candidate => {
      if (candidate.currentLocation) {
        locationCounts[candidate.currentLocation] = (locationCounts[candidate.currentLocation] || 0) + 1;
      }
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCount = candidates.filter(candidate => 
      new Date(candidate.createdAt) >= thirtyDaysAgo
    ).length;

    return {
      total: candidates.length,
      byAvailability: availabilityCounts,
      byLocation: locationCounts,
      recentCount,
    };
  } catch (error) {
    console.error('Error fetching candidate stats:', error);
    return {
      total: 0,
      byAvailability: Object.values(AvailabilityStatus).reduce((acc, status) => {
        acc[status] = 0;
        return acc;
      }, {} as { [key in AvailabilityStatus]: number }),
      byLocation: {},
      recentCount: 0,
    };
  }
};

// Bulk operations
export const bulkUpdateCandidates = async (
  candidateIds: string[], 
  updateData: UpdateCandidateDto
): Promise<Candidate[]> => {
  const updatePromises = candidateIds.map(id => 
    updateCandidate(id, updateData)
  );

  return Promise.all(updatePromises);
};

// Search candidates with advanced filters
export const searchCandidates = async (searchQuery: {
  query?: string;
  skills?: string[];
  experience?: string;
  location?: string;
  availability?: AvailabilityStatus;
  salaryRange?: { min?: number; max?: number };
}): Promise<Candidate[]> => {
  const queryDto: CandidateQueryDto = {
    search: searchQuery.query,
    skills: searchQuery.skills,
    availability: searchQuery.availability,
    location: searchQuery.location,
  };

  const response = await getCandidates(queryDto);
  let candidates = response.candidates;

  // Client-side filtering for complex queries
  if (searchQuery.salaryRange) {
    candidates = candidates.filter(candidate => {
      if (!candidate.expectedSalary) return true;
      
      if (searchQuery.salaryRange!.min && candidate.expectedSalary < searchQuery.salaryRange!.min) {
        return false;
      }
      
      if (searchQuery.salaryRange!.max && candidate.expectedSalary > searchQuery.salaryRange!.max) {
        return false;
      }
      
      return true;
    });
  }

  return candidates;
};
