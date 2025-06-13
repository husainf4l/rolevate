export interface CVAnalysis {
  id: string;
  applicationId: string;
  jobPostId: string;
  candidateId: string;
  
  // Overall score and summary
  overallScore: number;
  summary?: string;
  
  // Category scores
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  certificationScore?: number;
  languageScore?: number;
  
  // Key insights
  strengths?: string[];
  weaknesses?: string[];
  skills?: string[];
  
  // Raw data as string or parsed JSON
  experience?: string;  // JSON string representation of work experience
  education?: string;   // JSON string representation of education
  certifications?: string[];
  languages?: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  
  // Additional optional fields
  recommendations?: string[];
  jobFitReasons?: string[];
  cultureFitScore?: number;
  potentialRoleMatches?: string[];
}
