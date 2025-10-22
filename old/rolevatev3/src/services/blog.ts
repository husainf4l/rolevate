import { BlogCategory, BlogResponse } from '@/types/blog';
import {
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
  BlogSearchRequest,
  BulkBlogOperationRequest,
  APIResponse
} from '@/types/blog-backend';

/* eslint-disable @typescript-eslint/no-explicit-any */

class BlogService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005';

  // Remove demo data - now using backend API

  // Helper method for making API requests
  private async apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseUrl}/blogs${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Create a new blog post
  async createBlog(data: CreateBlogPostRequest): Promise<BlogResponse> {
    try {
      const result = await this.apiRequest<unknown>('', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return {
        success: result.success,
        blog: result.data as any,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create blog',
      };
    }
  }

  // Update an existing blog post
  async updateBlog(id: string, data: UpdateBlogPostRequest): Promise<BlogResponse> {
    try {
      const result = await this.apiRequest<unknown>(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      return {
        success: result.success,
        blog: result.data as any,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update blog',
      };
    }
  }

  // Delete a blog post
  async deleteBlog(id: string): Promise<BlogResponse> {
    try {
      await this.apiRequest(`/${id}`, {
        method: 'DELETE',
      });

      return {
        success: true,
        message: 'Blog deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete blog',
      };
    }
  }

  // Get blogs with filtering and pagination
  async getBlogs(
    page: number = 1,
    limit: number = 10,
    category?: BlogCategory,
    featured?: boolean,
    search?: string,
    authorId?: string
  ): Promise<BlogResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (category) params.append('category', category);
      if (featured !== undefined) params.append('featured', featured.toString());
      if (search) params.append('search', search);
      if (authorId) params.append('authorId', authorId);

      const result = await this.apiRequest<unknown>(`?${params.toString()}`);

      return {
        success: result.success,
        blogs: (result.data as any)?.blogs || (result.data as any),
        total: (result.data as any)?.total || (result.meta as any)?.total,
        page: (result.data as any)?.page || (result.meta as any)?.page,
        limit: (result.data as any)?.limit || (result.meta as any)?.limit,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch blogs',
      };
    }
  }

  // Get a single blog post by ID or slug
  async getBlogById(id: string): Promise<BlogResponse> {
    try {
      const result = await this.apiRequest<unknown>(`/${id}`);

      return {
        success: result.success,
        blog: result.data as any,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch blog',
      };
    }
  }

  // Get a blog post by slug
  async getBlogBySlug(slug: string): Promise<BlogResponse> {
    try {
      const result = await this.apiRequest<unknown>(`/${slug}`);

      return {
        success: result.success,
        blog: result.data as any,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch blog',
      };
    }
  }

  // Get featured blogs
  async getFeaturedBlogs(limit: number = 2): Promise<BlogResponse> {
    try {
      const params = new URLSearchParams({
        featured: 'true',
        limit: limit.toString(),
      });

      const result = await this.apiRequest<unknown>(`/featured/list?${params.toString()}`);

      return {
        success: result.success,
        blogs: (result.data as any)?.blogs || (result.data as any),
        total: (result.data as any)?.total || (result.meta as any)?.total,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch featured blogs',
      };
    }
  }

  // Get blogs by category
  async getBlogsByCategory(category: BlogCategory, page: number = 1, limit: number = 10): Promise<BlogResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const result = await this.apiRequest<unknown>(`/category/${category}?${params.toString()}`);

      return {
        success: result.success,
        blogs: (result.data as any)?.blogs || (result.data as any),
        total: (result.data as any)?.total || (result.meta as any)?.total,
        page: (result.data as any)?.page || (result.meta as any)?.page,
        limit: (result.data as any)?.limit || (result.meta as any)?.limit,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch blogs by category',
      };
    }
  }

  // Search blogs
  async searchBlogs(query: BlogSearchRequest): Promise<BlogResponse> {
    try {
      const params = new URLSearchParams({
        query: query.query,
      });

      if (query.category) params.append('category', query.category);
      if (query.tags) params.append('tags', query.tags.join(','));
      if (query.limit) params.append('limit', query.limit.toString());

      const result = await this.apiRequest<unknown>(`/search?${params.toString()}`);

      return {
        success: result.success,
        blogs: result.data as any,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to search blogs',
      };
    }
  }

  // Bulk operations
  async bulkBlogAction(action: BulkBlogOperationRequest): Promise<BlogResponse> {
    try {
      const result = await this.apiRequest<unknown>('/bulk-action', {
        method: 'POST',
        body: JSON.stringify(action),
      });

      return result as BlogResponse;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Bulk operation failed',
      };
    }
  }

  // Get blog statistics (admin)
  async getBlogStats(): Promise<BlogResponse> {
    try {
      const result = await this.apiRequest<unknown>('/admin/stats');

      return {
        success: result.success,
        ...(result.data as any),
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch blog statistics',
      };
    }
  }

  // Track blog view (analytics)
  async trackBlogView(blogId: string, trackingData?: {
    source?: string;
    referrer?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      await this.apiRequest(`/${blogId}/views`, {
        method: 'POST',
        body: JSON.stringify(trackingData || {}),
      });
    } catch (error) {
      // Silently fail for analytics tracking
      console.warn('Failed to track blog view:', error);
    }
  }
}

export const blogService = new BlogService();