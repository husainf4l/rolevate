# Blog System Backend Implementation Notes

## Overview
This document provides comprehensive notes for implementing a robust blog system backend that supports the frontend interfaces defined in the TypeScript types.

## Database Schema

### Core Tables

#### 1. `blog_posts`
```sql
CREATE TABLE blog_posts (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  excerpt_ar TEXT,
  content LONGTEXT NOT NULL,
  content_ar LONGTEXT,
  author_id VARCHAR(36) NOT NULL,
  category ENUM('RECRUITMENT', 'CAREER_ADVICE', 'HR_INSIGHTS', 'COMPANY_CULTURE', 'JOB_SEARCH', 'INTERVIEW_TIPS', 'WORKPLACE_TRENDS', 'EMPLOYEE_ENGAGEMENT') NOT NULL,
  tags JSON, -- Array of strings
  featured_image VARCHAR(500),
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  reading_time INT DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') DEFAULT 'DRAFT',
  view_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  seo_meta_title VARCHAR(255),
  seo_meta_description TEXT,
  seo_keywords JSON,
  canonical_url VARCHAR(500),

  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_slug (slug),
  INDEX idx_category (category),
  INDEX idx_status (status),
  INDEX idx_featured (featured),
  INDEX idx_published_at (published_at),
  INDEX idx_author (author_id),
  FULLTEXT idx_search (title, content, excerpt)
);
```

#### 2. `blog_categories`
```sql
CREATE TABLE blog_categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100),
  description TEXT,
  description_ar TEXT,
  slug VARCHAR(100) UNIQUE NOT NULL,
  color VARCHAR(7), -- Hex color code
  icon VARCHAR(50),
  post_count INT DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 3. `blog_tags`
```sql
CREATE TABLE blog_tags (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  name_ar VARCHAR(50),
  slug VARCHAR(50) UNIQUE NOT NULL,
  color VARCHAR(7),
  post_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. `blog_post_tags` (Many-to-Many relationship)
```sql
CREATE TABLE blog_post_tags (
  blog_id VARCHAR(36),
  tag_id VARCHAR(36),
  PRIMARY KEY (blog_id, tag_id),
  FOREIGN KEY (blog_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES blog_tags(id) ON DELETE CASCADE
);
```

#### 5. `blog_comments`
```sql
CREATE TABLE blog_comments (
  id VARCHAR(36) PRIMARY KEY,
  blog_id VARCHAR(36) NOT NULL,
  author_id VARCHAR(36) NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  author_avatar VARCHAR(500),
  content TEXT NOT NULL,
  parent_id VARCHAR(36), -- For nested comments
  status ENUM('pending', 'approved', 'rejected', 'spam') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  like_count INT DEFAULT 0,

  FOREIGN KEY (blog_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES blog_comments(id) ON DELETE CASCADE,
  INDEX idx_blog (blog_id),
  INDEX idx_author (author_id),
  INDEX idx_status (status),
  INDEX idx_parent (parent_id)
);
```

#### 6. `blog_analytics`
```sql
CREATE TABLE blog_analytics (
  id VARCHAR(36) PRIMARY KEY,
  blog_id VARCHAR(36) NOT NULL,
  date DATE NOT NULL,
  views INT DEFAULT 0,
  unique_views INT DEFAULT 0,
  average_time_on_page INT DEFAULT 0, -- in seconds
  bounce_rate DECIMAL(5,2) DEFAULT 0.00,
  source ENUM('direct', 'search', 'social', 'referral', 'email') DEFAULT 'direct',
  device_type ENUM('desktop', 'mobile', 'tablet') DEFAULT 'desktop',
  country VARCHAR(2), -- ISO country code
  referrer VARCHAR(500),

  FOREIGN KEY (blog_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  UNIQUE KEY unique_blog_date (blog_id, date),
  INDEX idx_blog (blog_id),
  INDEX idx_date (date),
  INDEX idx_source (source),
  INDEX idx_country (country)
);
```

## API Endpoints

### Public Endpoints

#### GET `/api/blog/posts`
- **Query Params**: `page`, `limit`, `category`, `featured`, `search`, `tags`, `sortBy`, `sortOrder`
- **Response**: `BlogListResponse`
- **Features**:
  - Pagination
  - Filtering by category, featured status, tags
  - Full-text search
  - Sorting options

#### GET `/api/blog/posts/:id`
- **Response**: Single blog post with full content
- **Features**:
  - Increment view count
  - Include author details
  - Include related posts

#### GET `/api/blog/posts/slug/:slug`
- **Response**: Single blog post by slug
- **Use Case**: SEO-friendly URLs

#### GET `/api/blog/categories`
- **Response**: List of all categories with post counts

#### GET `/api/blog/tags`
- **Response**: List of popular tags with post counts

#### GET `/api/blog/search`
- **Query Params**: `query`, `category`, `tags`, `limit`
- **Response**: Search results with relevance scores

#### POST `/api/blog/posts/:id/views`
- **Purpose**: Track blog post views
- **Body**: `{ source?: string, referrer?: string, userAgent?: string }`

### Admin Endpoints (Protected)

#### POST `/api/admin/blog/posts`
- **Body**: `CreateBlogRequest`
- **Response**: Created blog post
- **Validation**: Slug uniqueness, required fields

#### PUT `/api/admin/blog/posts/:id`
- **Body**: `UpdateBlogRequest`
- **Response**: Updated blog post

#### DELETE `/api/admin/blog/posts/:id`
- **Response**: Success confirmation

#### POST `/api/admin/blog/posts/bulk`
- **Body**: `BulkBlogActionRequest`
- **Response**: `BulkBlogActionResponse`
- **Actions**: publish, archive, delete, feature, unfeature

#### GET `/api/admin/blog/stats`
- **Response**: `AdminBlogStatsResponse`
- **Includes**: Post counts, view analytics, category distribution

#### GET `/api/admin/blog/analytics`
- **Query Params**: `blogId`, `dateFrom`, `dateTo`, `groupBy`
- **Response**: `BlogAnalyticsResponse`

### Comment Endpoints

#### GET `/api/blog/posts/:id/comments`
- **Query Params**: `page`, `limit`, `status`
- **Response**: Paginated comments list

#### POST `/api/blog/posts/:id/comments`
- **Body**: `CreateCommentRequest`
- **Response**: Created comment
- **Features**: Auto-moderation, spam detection

#### PUT `/api/admin/comments/:id/moderate`
- **Body**: `{ action: 'approve' | 'reject' | 'spam' }`
- **Response**: Updated comment status

### File Upload Endpoints

#### POST `/api/admin/blog/upload-image`
- **Body**: FormData with image file
- **Response**: `ImageUploadResponse`
- **Features**:
  - Image optimization
  - Multiple format support
  - CDN integration

## Business Logic Implementation

### 1. Slug Generation
```typescript
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

// Ensure uniqueness
async function ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
  let uniqueSlug = slug;
  let counter = 1;

  while (await slugExists(uniqueSlug, excludeId)) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}
```

### 2. Reading Time Calculation
```typescript
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200; // Average reading speed
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}
```

### 3. SEO Meta Generation
```typescript
function generateSEOMeta(blog: BlogPostModel) {
  return {
    metaTitle: blog.seoMetaTitle || blog.title,
    metaDescription: blog.seoMetaDescription || blog.excerpt,
    keywords: blog.seoKeywords || blog.tags,
    canonicalUrl: `${process.env.BASE_URL}/blog/${blog.slug}`,
    ogImage: blog.featuredImage,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": blog.title,
      "description": blog.excerpt,
      "image": blog.featuredImage,
      "author": {
        "@type": "Person",
        "name": blog.author.name
      },
      "publisher": {
        "@type": "Organization",
        "name": "Rolevate"
      },
      "datePublished": blog.publishedAt,
      "dateModified": blog.updatedAt
    }
  };
}
```

### 4. Search Implementation
```typescript
async function searchBlogs(query: string, filters: BlogSearchFilters) {
  // Full-text search with relevance scoring
  const searchQuery = `
    SELECT *,
           MATCH(title, content, excerpt) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance_score
    FROM blog_posts
    WHERE status = 'PUBLISHED'
    AND MATCH(title, content, excerpt) AGAINST(? IN NATURAL LANGUAGE MODE)
    ${filters.category ? 'AND category = ?' : ''}
    ${filters.tags ? 'AND JSON_CONTAINS(tags, ?)' : ''}
    ORDER BY relevance_score DESC
    LIMIT ?
  `;

  // Execute search and return results
}
```

### 5. Analytics Tracking
```typescript
async function trackBlogView(blogId: string, trackingData: ViewTrackingData) {
  const today = new Date().toISOString().split('T')[0];

  // Insert or update daily analytics
  await db.query(`
    INSERT INTO blog_analytics
    (blog_id, date, views, unique_views, source, device_type, country, referrer)
    VALUES (?, ?, 1, 1, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    views = views + 1,
    unique_views = unique_views + 1
  `, [blogId, today, trackingData.source, trackingData.deviceType, trackingData.country, trackingData.referrer]);

  // Update blog post view count
  await db.query(
    'UPDATE blog_posts SET view_count = view_count + 1 WHERE id = ?',
    [blogId]
  );
}
```

## Security Considerations

### 1. Input Validation
- Sanitize HTML content to prevent XSS
- Validate slugs for SQL injection
- Limit file upload sizes and types

### 2. Authentication & Authorization
- JWT tokens for admin operations
- Role-based access control (Admin, Editor, Writer)
- API rate limiting

### 3. Content Moderation
- Comment spam detection
- Profanity filtering
- Manual review queues

## Performance Optimizations

### 1. Database Indexes
- Composite indexes for common queries
- Full-text search indexes
- Foreign key indexes

### 2. Caching Strategy
- Redis for frequently accessed blog posts
- CDN for images and static assets
- Cache invalidation on updates

### 3. Database Optimization
- Read replicas for public queries
- Archive old analytics data
- Optimize large text fields

## Deployment Checklist

- [ ] Database migrations created and tested
- [ ] API endpoints implemented and tested
- [ ] Authentication middleware configured
- [ ] File upload service configured
- [ ] Image optimization pipeline set up
- [ ] Search functionality implemented
- [ ] Analytics tracking configured
- [ ] SEO meta tags generated
- [ ] Admin dashboard created
- [ ] API documentation written
- [ ] Unit and integration tests written
- [ ] Performance benchmarks met
- [ ] Security audit completed

## Monitoring & Maintenance

### Key Metrics to Track
- API response times
- Database query performance
- Cache hit rates
- Error rates by endpoint
- User engagement (views, time on page)
- Content creation velocity

### Regular Maintenance Tasks
- Clean up old analytics data
- Rebuild search indexes
- Update content moderation rules
- Monitor storage usage
- Backup verification

This implementation provides a solid foundation for a scalable, feature-rich blog system that can handle high traffic and complex content management requirements.