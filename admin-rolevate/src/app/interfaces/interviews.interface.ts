export interface InterviewDetails {
  id: string;
  title: string;
  description: string | null;
  type: 'FIRST_ROUND' | 'SECOND_ROUND' | 'TECHNICAL' | 'FINAL';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  scheduledAt: string;
  startedAt: string | null;
  endedAt: string | null;
  duration: number | null;
  roomId: string | null;
  videoLink: string | null;
  recordingUrl: string | null;
  aiAnalysis: string | null;
  aiScore: number | null;
  aiRecommendation: 'REJECT' | 'SECOND_INTERVIEW' | 'HIRE' | 'PENDING' | null;
  analyzedAt: string | null;
  interviewerNotes: string | null;
  candidateFeedback: string | null;
  overallRating: number | null;
  technicalQuestions: any | null;
  technicalAnswers: any | null;
  metadata: any | null;
  job?: {
    id: string;
    title: string;
    department: string;
    description?: string;
    requirements?: string;
    salary: string;
    location?: string;
    workType?: string;
    company?: {
      id: string;
      name: string;
      industry: string;
      website?: string;
      description?: string;
    };
  };
  candidate?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    currentJobTitle: string;
    currentCompany?: string;
    experienceLevel: string | null;
    totalExperience?: number;
    skills?: string[];
    resumeUrl?: string;
    linkedInUrl?: string | null;
    user?: {
      profilePicture?: string;
    };
  };
  company?: {
    id: string;
    name: string;
    industry: string;
    website?: string;
    description?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InterviewsResponse {
  interviews: InterviewDetails[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface InterviewsFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface InterviewStatistics {
  totalInterviews: number;
  scheduledInterviews: number;
  completedInterviews: number;
  cancelledInterviews: number;
  todayInterviews: number;
  upcomingInterviews: number;
  averageScore: number;
}
