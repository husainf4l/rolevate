export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  salary?: string;
  postedAt: string;
  description: string;
  tags: string[];
  urgent?: boolean;
  remote?: boolean;
  companyLogo?: string;
  rating?: number;
  experienceLevel?: ExperienceLevel;
  salaryRange?: SalaryRange;
  category?: string;
  requirements?: string[];
  benefits?: string[];
  applicationDeadline?: string;
  companySize?: string;
  industry?: string;
}

export type JobType = 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship' | 'temporary';

export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'executive';

export type SalaryRange = '0-30000' | '30000-50000' | '50000-80000' | '80000-120000' | '120000+';

export interface JobCardProps {
  job: Job;
  locale?: string;
  onSave?: (jobId: string) => void;
  onApply?: (jobId: string) => void;
  isSaved?: boolean;
  className?: string;
}

export interface JobFilters {
  searchQuery?: string;
  location?: string;
  jobType?: JobType;
  experienceLevel?: ExperienceLevel;
  salaryRange?: SalaryRange;
  remote?: boolean;
  urgent?: boolean;
  category?: string;
}

export interface JobSearchParams {
  q?: string;
  location?: string;
  type?: JobType;
  experience?: ExperienceLevel;
  salary?: SalaryRange;
  remote?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'salary' | 'company';
  sortOrder?: 'asc' | 'desc';
}

export interface JobListResponse {
  jobs: Job[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface JobStats {
  totalJobs: number;
  activeJobs: number;
  newJobsThisWeek: number;
  averageSalary: number;
  topCategories: Array<{
    name: string;
    count: number;
  }>;
  topLocations: Array<{
    name: string;
    count: number;
  }>;
}