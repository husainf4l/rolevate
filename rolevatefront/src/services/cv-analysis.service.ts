// CV Analysis API Service
const API_BASE_URL = 'http://localhost:4005/api';

// Auth token helper
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Interfaces
export interface CVAnalysis {
  id: string;
  cvUrl?: string;
  extractedText?: string;
  candidateName?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  jobId?: string;
  status?: string;
  whatsappLink?: string;
  overallScore?: number;
  skillsScore?: number;
  experienceScore?: number;
  educationScore?: number;
  languageScore?: number;
  certificationScore?: number;
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  suggestedImprovements?: string[];
  skills?: string[];
  experience?: string;
  education?: string;
  certifications?: string[];
  languages?: string;
  aiModel?: string;
  processingTime?: number;
  analyzedAt?: string;
  applicationId?: string;
  candidateId?: string;
  candidate?: {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    profileImage?: string;
  };
}

export interface CreateCvAnalysisDto {
  applicationId: string;
  overallScore?: number;
  skillsScore?: number;
  experienceScore?: number;
  educationScore?: number;
  languageScore?: number;
  strengths?: string[];
  weaknesses?: string[];
  suggestedImprovements?: string[];
  summary?: string;
  skills?: string[];
  recommendation?: string;
}

export interface UpdateCvAnalysisDto extends Partial<CreateCvAnalysisDto> {
}

export interface CvAnalysisQueryDto {
  applicationId?: string;
  candidateId?: string;
  jobPostId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CvAnalysisResponse {
  cvAnalyses: CVAnalysis[];
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

// Create CV analysis
export const createCvAnalysis = async (analysisData: CreateCvAnalysisDto): Promise<CVAnalysis> => {
  const response = await fetch(`${API_BASE_URL}/cv-analysis`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(analysisData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create CV analysis');
  }

  return response.json();
};

// Get all CV analyses (authenticated - HR/Admin)
export const getCvAnalyses = async (query: CvAnalysisQueryDto = {}): Promise<CvAnalysisResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_BASE_URL}/cv-analysis?${queryParams}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch CV analyses: ${response.status}`);
  }

  const data = await response.json();
  
  if (Array.isArray(data)) {
    return { cvAnalyses: data };
  }

  return data;
};

// Get company CV analyses (authenticated)
export const getMyCompanyCvAnalyses = async (query: CvAnalysisQueryDto = {}): Promise<CvAnalysisResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_BASE_URL}/cv-analysis/my-company?${queryParams}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch company CV analyses: ${response.status}`);
  }

  const data = await response.json();
  
  if (Array.isArray(data)) {
    return { cvAnalyses: data };
  }

  return data;
};

// Get CV analyses by candidate ID
export const getCvAnalysesByCandidate = async (candidateId: string): Promise<CVAnalysis[]> => {
  const response = await fetch(`${API_BASE_URL}/cv-analysis/candidate/${candidateId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch candidate CV analyses: ${response.status}`);
  }

  return response.json();
};

// Get CV analyses by application ID
export const getCvAnalysesByApplication = async (applicationId: string): Promise<CVAnalysis[]> => {
  const response = await fetch(`${API_BASE_URL}/cv-analysis/application/${applicationId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch application CV analyses: ${response.status}`);
  }

  const data = await response.json();
  
  // Handle array response directly
  if (Array.isArray(data)) {
    return data;
  }
  
  // Handle object response with data property
  if (data.data && Array.isArray(data.data)) {
    return data.data;
  }
  
  // Fallback: return empty array if no valid data
  return [];
};

// Get CV analysis by ID
export const getCvAnalysisById = async (analysisId: string): Promise<CVAnalysis> => {
  const response = await fetch(`${API_BASE_URL}/cv-analysis/${analysisId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`CV analysis not found: ${response.status}`);
  }

  return response.json();
};

// Update CV analysis
export const updateCvAnalysis = async (
  analysisId: string, 
  updateData: UpdateCvAnalysisDto
): Promise<CVAnalysis> => {
  const response = await fetch(`${API_BASE_URL}/cv-analysis/${analysisId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update CV analysis');
  }

  return response.json();
};

// Delete CV analysis
export const deleteCvAnalysis = async (analysisId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/cv-analysis/${analysisId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete CV analysis');
  }
};

// Generate new CV analysis for an application
export const generateCvAnalysis = async (applicationId: string): Promise<CVAnalysis> => {
  // This is a wrapper function that would trigger the AI analysis of a CV
  // In a real implementation, this might call a different endpoint or service
  
  // Generate random scores between 70-100
  const overallScore = Math.floor(Math.random() * 30) + 70;
  const skillsScore = Math.floor(Math.random() * 30) + 70;
  const experienceScore = Math.floor(Math.random() * 30) + 70;
  const educationScore = Math.floor(Math.random() * 30) + 70;
  const languageScore = Math.floor(Math.random() * 30) + 70;

  // Sample strengths and weaknesses
  const strengths = [
    "Strong technical background",
    "Relevant industry experience",
    "Good communication skills"
  ];
  
  const weaknesses = [
    "Limited leadership experience", 
    "No specific certifications mentioned"
  ];
  
  const suggestedImprovements = [
    "Consider obtaining relevant certifications",
    "Add more detail about team leadership experience"
  ];
  
  // Sample skills
  const skills = ["JavaScript", "React", "TypeScript", "Node.js", "Team Leadership"];
  
  // Sample summary
  const summary = "This candidate has extensive experience in web development with a strong focus on modern JavaScript frameworks. Their background aligns well with the position requirements.";
  
  // For now, return a mock response that matches the new interface structure
  return {
    id: "mock-analysis-" + applicationId,
    applicationId,
    candidateId: "mock-candidate-id",
    overallScore,
    skillsScore,
    experienceScore,
    educationScore,
    languageScore,
    strengths,
    weaknesses,
    suggestedImprovements,
    summary,
    skills,
    analyzedAt: new Date().toISOString()
  };
};
