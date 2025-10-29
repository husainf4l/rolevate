export interface Company {
  id: string;
  name: string;
  description?: string;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  company: string; // Keep as string for backward compatibility, but we can enhance this later
  companyData?: Company; // Add optional company object
  department?: string; // Add department field
  location: string;
  salary?: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE';
  level: 'ENTRY' | 'MID' | 'SENIOR' | 'EXECUTIVE';
  skills: string[];
  slug: string;
  deadline?: string; // Add deadline field
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface JobFilters {
  type?: string;
  level?: string;
  location?: string;
  company?: string;
  department?: string; // Add department filter
  skills?: string[];
  search?: string;
}

export interface JobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
}