// // Backend Database Models and API Contracts for Blog System
// // These interfaces define the database schema and API contracts for your backend

import { BlogCategory, BlogStatus } from './blog';

// // ==========================================
// // DATABASE MODELS
// // ==========================================

// Blog Post Database Model
export interface BlogPostModel {
  id: string;
  title: string;
  titleAr?: string;
  slug: string; // Unique URL slug
  excerpt: string;
  excerptAr?: string;
  content: string; // Full markdown/HTML content
  contentAr?: string;
  authorId: string; // Foreign key to User
  category: BlogCategory;
  tags: string[];
  featuredImage: string; // Image URL/path
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  readingTime: number; // Calculated in minutes
  featured: boolean;
  status: BlogStatus;
  viewCount: number; // Track views
  likeCount: number; // Track likes
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  seoKeywords?: string[];
  canonicalUrl?: string;
}

// // Blog Author/User Model (if extending user model)
// export interface BlogAuthor {
//   id: string;
//   name: string;
//   nameAr?: string;
//   email: string;
//   avatar?: string;
//   bio?: string;
//   bioAr?: string;
//   role: string; // e.g., 'Editor', 'Writer', 'Admin'
//   roleAr?: string;
//   socialLinks?: {
//     linkedin?: string;
//     twitter?: string;
//     website?: string;
//   };
//   postCount: number;
//   createdAt: Date;
// }

// // Blog Category Model
// export interface BlogCategoryModel {
//   id: BlogCategory;
//   name: string;
//   nameAr: string;
//   description?: string;
//   descriptionAr?: string;
//   slug: string;
//   color?: string; // For UI theming
//   icon?: string; // Icon identifier
//   postCount: number;
//   featured: boolean;
//   displayOrder: number;
//   createdAt: Date;
//   updatedAt: Date;
// }

// // Blog Tag Model
// export interface BlogTagModel {
//   id: string;
//   name: string;
//   nameAr?: string;
//   slug: string;
//   color?: string;
//   postCount: number;
//   createdAt: Date;
// }

// // Blog Comment Model
// export interface BlogCommentModel {
//   id: string;
//   blogId: string;
//   authorId: string; // User who commented
//   authorName: string; // Denormalized for performance
//   authorAvatar?: string;
//   content: string;
//   parentId?: string; // For nested comments
//   status: 'pending' | 'approved' | 'rejected' | 'spam';
//   createdAt: Date;
//   updatedAt: Date;
//   likeCount: number;
// }

// // Blog Analytics Model
// export interface BlogAnalyticsModel {
//   id: string;
//   blogId: string;
//   date: Date;
//   views: number;
//   uniqueViews: number;
//   averageTimeOnPage: number; // in seconds
//   bounceRate: number;
//   source: 'direct' | 'search' | 'social' | 'referral' | 'email';
//   deviceType: 'desktop' | 'mobile' | 'tablet';
//   country?: string;
//   referrer?: string;
// }

// // ==========================================
// // API REQUEST/RESPONSE CONTRACTS
// // ==========================================

// Standard API Response Wrapper
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Blog CRUD Operations
export interface CreateBlogPostRequest {
  title: string;
  titleAr?: string;
  content: string;
  contentAr?: string;
  excerpt: string;
  excerptAr?: string;
  category: BlogCategory;
  tags: string[];
  featuredImage: string;
  featured: boolean;
  status: BlogStatus;
  publishedAt?: string; // ISO date string
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

export interface UpdateBlogPostRequest extends Partial<CreateBlogPostRequest> {
  id: string;
}

// // Blog List with Filtering
// export interface BlogListRequest {
//   page?: number;
//   limit?: number;
//   category?: BlogCategory;
//   status?: BlogStatus;
//   featured?: boolean;
//   authorId?: string;
//   search?: string;
//   tags?: string[];
//   dateFrom?: string; // ISO date
//   dateTo?: string; // ISO date
//   sortBy?: 'publishedAt' | 'createdAt' | 'title' | 'viewCount' | 'readingTime';
//   sortOrder?: 'asc' | 'desc';
// }

export interface BlogListResponse {
  blogs: BlogPostModel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Search and Discovery
export interface BlogSearchRequest {
  query: string;
  category?: BlogCategory;
  tags?: string[];
  limit?: number;
  fuzzy?: boolean; // Enable fuzzy search
}

export interface BulkBlogOperationRequest {
  blogIds: string[];
  action: 'publish' | 'archive' | 'delete' | 'feature' | 'unfeature';
  scheduledDate?: string; // For scheduled publishing
}
