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

// Blog API Request/Response Interfaces for Backend

// Create/Update Blog Post Request
export interface CreateBlogPostRequest {
  title: string;
  titleAr?: string;
  slug: string;
  excerpt: string;
  excerptAr?: string;
  content: string;
  contentAr?: string;
  authorId: string; // Reference to user who created the post
  category: BlogCategory;
  tags: string[];
  featuredImage: string;
  featured: boolean;
  status: BlogStatus;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

export interface UpdateBlogPostRequest extends Partial<CreateBlogPostRequest> {
  id: string;
}

// Blog List Query Parameters
export interface BlogQueryParams {
  page?: number;
  limit?: number;
  category?: BlogCategory;
  featured?: boolean;
  status?: BlogStatus;
  authorId?: string;
  search?: string; // For title/content search
  tags?: string[]; // Filter by tags
  sortBy?: 'publishedAt' | 'createdAt' | 'title' | 'readingTime';
  sortOrder?: 'asc' | 'desc';
}

// Blog Search Request
export interface BlogSearchRequest {
  query: string;
  category?: BlogCategory;
  tags?: string[];
  limit?: number;
}

// Blog Statistics Response
export interface BlogStatsResponse {
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  featuredBlogs: number;
  blogsByCategory: Record<BlogCategory, number>;
  totalViews: number;
  averageReadingTime: number;
}

// Blog Analytics (for tracking views, engagement)
export interface BlogAnalytics {
  blogId: string;
  views: number;
  uniqueViews: number;
  averageTimeOnPage: number; // in seconds
  bounceRate: number;
  socialShares: {
    facebook: number;
    twitter: number;
    linkedin: number;
    total: number;
  };
  dateRange: {
    start: string;
    end: string;
  };
}

// Admin Blog Management
export interface AdminBlogListResponse extends BlogResponse {
  drafts: BlogPost[];
  scheduled: BlogPost[];
  archived: BlogPost[];
}

// Bulk Operations
export interface BulkBlogOperationRequest {
  blogIds: string[];
  operation: 'publish' | 'archive' | 'delete' | 'feature' | 'unfeature';
}

export interface BulkBlogOperationResponse {
  success: boolean;
  message: string;
  affectedCount: number;
  failedIds?: string[];
}

// Blog Comments (if implementing comments feature)
export interface BlogComment {
  id: string;
  blogId: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  updatedAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  parentId?: string; // For nested comments
  replies?: BlogComment[];
}

export interface CreateBlogCommentRequest {
  blogId: string;
  content: string;
  parentId?: string;
}

// Blog Categories Management
export interface BlogCategoryInfo {
  id: BlogCategory;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  postCount: number;
  featured: boolean;
}

// SEO and Meta Information
export interface BlogSEOMeta {
  blogId: string;
  canonicalUrl: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  structuredData?: object; // JSON-LD schema
  lastModified: string;
}

// Blog Import/Export
export interface BlogExportRequest {
  blogIds?: string[];
  format: 'json' | 'markdown' | 'html';
  includeContent: boolean;
  includeComments?: boolean;
}

export interface BlogImportRequest {
  data: BlogPost[];
  updateExisting: boolean; // Whether to update existing posts or skip
}