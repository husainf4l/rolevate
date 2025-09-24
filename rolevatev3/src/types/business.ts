export interface JobPost {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  location?: string;
  locationAr?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  jobType: string;
  experienceLevel: string;
  industry?: string;
  industryAr?: string;
  skills: string[];
  status: string;
  views: number;
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobsManagementProps {
  locale: string;
  searchParams: { [key: string]: string | string[] | undefined };
}