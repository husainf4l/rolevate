// User sub-object from API response
export interface CandidateUser {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  profilePicture?: string | null;
}

// Recent application structure from API
export interface CandidateRecentApplication {
  id: string;
  status: string;
  createdAt: string;
  job: {
    id: string;
    title: string;
    company: {
      name: string;
    };
  };
}

// Upcoming interview structure from API
export interface CandidateUpcomingInterview {
  id: string;
  scheduledAt: string;
  type: string;
  status: string;
  job: {
    title: string;
    company: {
      name: string;
    };
  };
}

// Main candidate interface matching actual API response
export interface Candidate {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  currentLocation: string | null;
  currentJobTitle: string | null;
  currentCompany: string | null;
  experienceLevel: string | null;
  totalExperience: number | null;
  expectedSalary: number | null;
  noticePeriod: string | null;
  highestEducation: string | null;
  fieldOfStudy: string | null;
  university: string | null;
  graduationYear: number | null;
  skills: string[];
  preferredJobTypes: string[];
  preferredWorkType: string | null;
  preferredIndustries: string[];
  preferredLocations: string[];
  savedJobs: string[];
  resumeUrl: string | null;
  portfolioUrl: string | null;
  linkedInUrl: string | null;
  githubUrl: string | null;
  isProfilePublic: boolean;
  isOpenToWork: boolean;
  profileSummary: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    isActive: boolean;
    createdAt: string;
    userType: string;
    profilePicture?: string;
  };
  applications?: Application[];
  interviews?: Interview[];
  // Legacy fields for backwards compatibility
  totalApplications?: number;
  totalInterviews?: number;
  isActive?: boolean;
  recentApplications?: Application[];
  upcomingInterviews?: Interview[];
}

export interface Application {
  id: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED';
  jobId: string;
  candidateId: string;
  coverLetter: string | null;
  resumeUrl: string | null;
  expectedSalary: number | null;
  noticePeriod: string | null;
  cvAnalysisScore: number | null;
  cvAnalysisResults: any;
  analyzedAt: string | null;
  aiCvRecommendations: string | null;
  aiInterviewRecommendations: string | null;
  aiSecondInterviewRecommendations: string | null;
  recommendationsGeneratedAt: string | null;
  companyNotes: string | null;
  appliedAt: string;
  reviewedAt: string | null;
  interviewScheduledAt: string | null;
  interviewedAt: string | null;
  rejectedAt: string | null;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
  job: {
    id: string;
    title: string;
    company: {
      id: string;
      name: string;
    };
  };
  notes: any[];
}

export interface Interview {
  id: string;
  jobId: string;
  candidateId: string;
  companyId: string;
  title: string;
  description: string | null;
  type: 'FIRST_ROUND' | 'SECOND_ROUND' | 'FINAL_ROUND' | 'TECHNICAL' | 'HR';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledAt: string;
  startedAt: string | null;
  endedAt: string | null;
  duration: number | null;
  roomId: string | null;
  videoLink: string | null;
  recordingUrl: string | null;
  aiAnalysis: any;
  aiScore: number | null;
  aiRecommendation: string | null;
  analyzedAt: string | null;
  interviewerNotes: string | null;
  candidateFeedback: string | null;
  overallRating: number | null;
  technicalQuestions: any;
  technicalAnswers: any;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  job: {
    title: string;
    company: {
      name: string;
    };
  };
}

export interface CandidatesResponse {
  candidates: Candidate[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CandidatesFilters {
  page?: number;
  limit?: number;
  search?: string;
  experienceLevel?: string;
  preferredWorkType?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
