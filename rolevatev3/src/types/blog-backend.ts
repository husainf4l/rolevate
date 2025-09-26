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

// export interface BlogSearchResult {
//   blog: BlogPostModel;
//   relevanceScore: number;
//   matchedFields: string[]; // e.g., ['title', 'content', 'tags']
// }

// // Analytics and Reporting
// export interface BlogAnalyticsRequest {
//   blogId?: string; // If not provided, get aggregate stats
//   dateFrom: string;
//   dateTo: string;
//   groupBy?: 'day' | 'week' | 'month'; // For time-series data
// }

// export interface BlogAnalyticsResponse {
//   blogId?: string;
//   totalViews: number;
//   uniqueViews: number;
//   averageTimeOnPage: number;
//   bounceRate: number;
//   topSources: Array<{
//     source: string;
//     views: number;
//     percentage: number;
//   }>;
//   topCountries: Array<{
//     country: string;
//     views: number;
//   }>;
//   timeSeriesData?: Array<{
//     date: string;
//     views: number;
//     uniqueViews: number;
//   }>;
// }

// // Admin Operations
// export interface AdminBlogStatsResponse {
//   totalBlogs: number;
//   publishedBlogs: number;
//   draftBlogs: number;
//   scheduledBlogs: number;
//   archivedBlogs: number;
//   totalViews: number;
//   totalLikes: number;
//   averageReadingTime: number;
//   topCategories: Array<{
//     category: BlogCategory;
//     count: number;
//     percentage: number;
//   }>;
//   recentActivity: Array<{
//     blogId: string;
//     title: string;
//     action: 'created' | 'updated' | 'published' | 'archived';
//     timestamp: Date;
//     authorId: string;
//   }>;
// }

// Bulk Operations
export interface BulkBlogOperationRequest {
  blogIds: string[];
  action: 'publish' | 'archive' | 'delete' | 'feature' | 'unfeature';
  scheduledDate?: string; // For scheduled publishing
}

// export interface BulkBlogActionResponse {
//   success: boolean;
//   processed: number;
//   failed: number;
//   errors?: Array<{
//     blogId: string;
//     error: string;
//   }>;
// }

// // Comments API
// export interface CreateCommentRequest {
//   blogId: string;
//   content: string;
//   parentId?: string; // For replies
// }

// export interface CommentListRequest {
//   blogId: string;
//   page?: number;
//   limit?: number;
//   status?: 'pending' | 'approved' | 'rejected';
//   sortBy?: 'createdAt' | 'likeCount';
//   sortOrder?: 'asc' | 'desc';
// }

// export interface CommentModerationRequest {
//   commentIds: string[];
//   action: 'approve' | 'reject' | 'spam' | 'delete';
// }

// // File Upload for Images
// export interface ImageUploadRequest {
//   file: File;
//   alt?: string;
//   caption?: string;
//   blogId?: string; // Associate with specific blog
// }

// export interface ImageUploadResponse {
//   success: boolean;
//   imageUrl: string;
//   thumbnailUrl?: string;
//   alt?: string;
//   caption?: string;
//   fileSize: number;
//   dimensions: {
//     width: number;
//     height: number;
//   };
// }

// // ==========================================
// // VALIDATION SCHEMAS (for reference)
// // ==========================================

// // These would typically be implemented with a validation library like Joi or Zod
// export const BlogValidationSchemas = {
//   createBlog: {
//     title: { required: true, minLength: 5, maxLength: 200 },
//     content: { required: true, minLength: 100 },
//     excerpt: { required: true, minLength: 50, maxLength: 500 },
//     category: { required: true, enum: Object.values(BlogCategory) },
//     tags: { maxItems: 10, itemMaxLength: 50 },
//     slug: { pattern: /^[a-z0-9-]+$/ },
//   },

//   updateBlog: {
//     title: { minLength: 5, maxLength: 200 },
//     content: { minLength: 100 },
//     excerpt: { minLength: 50, maxLength: 500 },
//   }
// };

// // ==========================================
// // ERROR CODES
// // ==========================================

// export enum BlogErrorCodes {
//   BLOG_NOT_FOUND = 'BLOG_NOT_FOUND',
//   SLUG_ALREADY_EXISTS = 'SLUG_ALREADY_EXISTS',
//   INVALID_CATEGORY = 'INVALID_CATEGORY',
//   UNAUTHORIZED = 'UNAUTHORIZED',
//   VALIDATION_ERROR = 'VALIDATION_ERROR',
//   IMAGE_UPLOAD_FAILED = 'IMAGE_UPLOAD_FAILED',
//   COMMENT_NOT_FOUND = 'COMMENT_NOT_FOUND',
//   COMMENT_ALREADY_MODERATED = 'COMMENT_ALREADY_MODERATED'
// }