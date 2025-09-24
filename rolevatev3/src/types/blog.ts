export interface BlogPost {
  id: string;
  title: string;
  titleAr?: string;
  slug: string;
  excerpt: string;
  excerptAr?: string;
  content: string;
  contentAr?: string;
  author: {
    name: string;
    nameAr?: string;
    avatar?: string;
    role?: string;
    roleAr?: string;
  };
  category: BlogCategory;
  tags: string[];
  featuredImage: string;
  publishedAt: string;
  updatedAt?: string;
  readingTime: number; // in minutes
  featured: boolean;
  status: BlogStatus;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

export enum BlogCategory {
  RECRUITMENT = 'RECRUITMENT',
  CAREER_ADVICE = 'CAREER_ADVICE',
  HR_INSIGHTS = 'HR_INSIGHTS',
  COMPANY_CULTURE = 'COMPANY_CULTURE',
  JOB_SEARCH = 'JOB_SEARCH',
  INTERVIEW_TIPS = 'INTERVIEW_TIPS',
  WORKPLACE_TRENDS = 'WORKPLACE_TRENDS',
  EMPLOYEE_ENGAGEMENT = 'EMPLOYEE_ENGAGEMENT',
}

export enum BlogStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface BlogResponse {
  success: boolean;
  message?: string;
  blogs?: BlogPost[];
  blog?: BlogPost;
  total?: number;
  page?: number;
  limit?: number;
}