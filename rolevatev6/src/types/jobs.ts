export interface Job {
  id: number;
  title: string;
  description: string;
  company: string;
  location: string;
  salary?: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE';
  level: 'ENTRY' | 'MID' | 'SENIOR' | 'EXECUTIVE';
  skills: string[];
  postedAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface JobFilters {
  type?: string;
  level?: string;
  location?: string;
  company?: string;
  skills?: string[];
  search?: string;
}

export interface JobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
}