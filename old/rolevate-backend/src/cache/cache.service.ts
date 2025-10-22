import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CACHE_CONSTANTS, PAGINATION_CONSTANTS, TIME_CONSTANTS } from '../common/constants';
import { ValidationUtils } from '../common/validation-utils';

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Retrieves a value from cache by key
   * @param key - Cache key to retrieve
   * @returns Promise resolving to cached value or null if not found
   * @throws Returns null on cache errors (logs error internally)
   */
  async get<T>(key: string): Promise<T | null> {
    ValidationUtils.validateRequired(key, 'cache key');
    ValidationUtils.validateStringLength(key, 'cache key', 1, 500);

    try {
      const result = await this.cacheManager.get<T>(key);
      return result || null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Stores a value in cache with optional TTL
   * @param key - Cache key to store under
   * @param value - Value to cache
   * @param ttl - Time-to-live in seconds (optional, uses cache default if not provided)
   * @throws Logs error internally on cache failures
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    ValidationUtils.validateRequired(key, 'cache key');
    ValidationUtils.validateStringLength(key, 'cache key', 1, 500);
    
    if (ttl !== undefined) {
      ValidationUtils.validateNumericRange(ttl, 'TTL', 1, TIME_CONSTANTS.DAY);
    }

    try {
      if (ttl) {
        await this.cacheManager.set(key, value, ttl);
      } else {
        await this.cacheManager.set(key, value);
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Deletes a value from cache by key
   * @param key - Cache key to delete
   * @throws Logs error internally on cache failures
   */
  async del(key: string): Promise<void> {
    ValidationUtils.validateRequired(key, 'cache key');
    ValidationUtils.validateStringLength(key, 'cache key', 1, 500);

    try {
      await this.cacheManager.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Clears cache using available methods, falling back to manual key deletion
   * Attempts to use cache store's reset method first, then manually clears known patterns
   * @throws Throws error if all clear methods fail
   */
  async clear(): Promise<void> {
    try {
      console.log('🧹 Starting cache clear operation...');
      
      // Try to cast to any to access reset method if it exists
      const cacheStore = this.cacheManager as any;
      
      // If the cache manager supports reset, use it
      if (typeof cacheStore.reset === 'function') {
        await cacheStore.reset();
        console.log('✅ Cache cleared using reset method');
        return;
      }
      
      // Otherwise, manually clear known cache patterns
      const commonKeys = [
        // Job cache patterns
        'job:featured',
        'public:jobs:20:0',
        'public:jobs:10:0',
        'public:count',
        // Add more specific keys as needed
      ];
      
      console.log('🗑️ Clearing known cache keys:', commonKeys);
      
      for (const key of commonKeys) {
        try {
          await this.cacheManager.del(key);
          console.log(`✅ Cleared cache key: ${key}`);
        } catch (error) {
          console.error(`❌ Failed to clear cache key ${key}:`, error);
        }
      }
      
      console.log('✅ Cache clear operation completed');
    } catch (error) {
      console.error('❌ Cache clear error:', error);
      throw error;
    }
  }

  /**
   * Performs complete cache clearing with detailed status reporting
   * Tries multiple clearing strategies and returns operation results
   * @returns Promise resolving to clear operation status with method used and message
   */
  async clearAll(): Promise<{ cleared: boolean; method: string; message: string }> {
    try {
      console.log('🧹 Starting complete cache clear...');
      
      // Try to cast to any to access reset method if it exists
      const cacheStore = this.cacheManager as any;
      
      // Try different methods to clear cache
      if (typeof cacheStore.reset === 'function') {
        await cacheStore.reset();
        return {
          cleared: true,
          method: 'reset',
          message: 'All cache cleared using reset method'
        };
      }
      
      // For stores that don't support reset, we'll clear manually
      // This is a more aggressive approach
      
      let clearedCount = 0;
      
      // Since we can't easily iterate over all keys in most cache stores,
      // we'll just clear the cache and let it rebuild naturally
      await this.clear();
      clearedCount++;
      
      return {
        cleared: true,
        method: 'manual',
        message: `Cache cleared manually. ${clearedCount} operations completed.`
      };
      
    } catch (error) {
      console.error('❌ Cache clearAll error:', error);
      return {
        cleared: false,
        method: 'error',
        message: `Failed to clear cache: ${error.message}`
      };
    }
  }

  // Generate cache keys
  /**
   * Generates a cache key for a specific job
   * @param id - Job ID
   * @returns Formatted cache key string
   */
  generateJobKey(id: string): string {
    ValidationUtils.validateRequired(id, 'job ID');
    ValidationUtils.validateStringLength(id, 'job ID', 1, 100);
    return `job:${id}`;
  }

  /**
   * Generates a cache key for company-specific job listings
   * @param companyId - Company ID
   * @param limit - Number of results to return
   * @param offset - Pagination offset
   * @param search - Optional search query
   * @returns Formatted cache key string
   */
  generateCompanyJobsKey(companyId: string, limit: number, offset: number, search?: string): string {
    ValidationUtils.validateRequired(companyId, 'company ID');
    ValidationUtils.validateStringLength(companyId, 'company ID', 1, 100);
    ValidationUtils.validateNumericRange(limit, 'limit', 1, PAGINATION_CONSTANTS.MAX_LIMIT);
    ValidationUtils.validateNumericRange(offset, 'offset', 0, PAGINATION_CONSTANTS.MAX_OFFSET);
    
    if (search) {
      ValidationUtils.validateStringLength(search, 'search query', 1, 200);
    }

    const searchPart = search ? `:search:${search}` : '';
    return `company:${companyId}:jobs:${limit}:${offset}${searchPart}`;
  }

  /**
   * Generates a cache key for public job listings
   * @param limit - Number of results to return
   * @param offset - Pagination offset
   * @param search - Optional search query
   * @returns Formatted cache key string
   */
  generatePublicJobsKey(limit: number, offset: number, search?: string): string {
    ValidationUtils.validateNumericRange(limit, 'limit', 1, PAGINATION_CONSTANTS.MAX_LIMIT);
    ValidationUtils.validateNumericRange(offset, 'offset', 0, PAGINATION_CONSTANTS.MAX_OFFSET);
    
    if (search) {
      ValidationUtils.validateStringLength(search, 'search query', 1, 200);
    }

    const searchPart = search ? `:search:${search}` : '';
    return `public:jobs:${limit}:${offset}${searchPart}`;
  }

  /**
   * Generates a cache key for job count queries
   * @param companyId - Company ID
   * @param search - Optional search query
   * @returns Formatted cache key string
   */
  generateJobCountKey(companyId: string, search?: string): string {
    ValidationUtils.validateRequired(companyId, 'company ID');
    ValidationUtils.validateStringLength(companyId, 'company ID', 1, 100);
    
    if (search) {
      ValidationUtils.validateStringLength(search, 'search query', 1, 200);
    }

    const searchPart = search ? `:search:${search}` : '';
    return `company:${companyId}:count${searchPart}`;
  }

  /**
   * Generates a cache key for public job count queries
   * @param search - Optional search query
   * @returns Formatted cache key string
   */
  generatePublicJobCountKey(search?: string): string {
    if (search) {
      ValidationUtils.validateStringLength(search, 'search query', 1, 200);
    }

    const searchPart = search ? `:search:${search}` : '';
    return `public:count${searchPart}`;
  }

  // Enhanced cache invalidation with comprehensive patterns
  /**
   * Invalidates all cache entries related to a specific job
   * Clears job-specific cache, company job listings, and public job listings
   * @param jobId - Job ID to invalidate cache for
   * @param companyId - Company ID that owns the job
   */
  async invalidateJobCache(jobId: string, companyId: string): Promise<void> {
    ValidationUtils.validateRequired(jobId, 'job ID');
    ValidationUtils.validateRequired(companyId, 'company ID');
    ValidationUtils.validateStringLength(jobId, 'job ID', 1, 100);
    ValidationUtils.validateStringLength(companyId, 'company ID', 1, 100);

    const patterns = [
      `job:${jobId}`,
      `company:${companyId}:jobs:*`,
      `company:${companyId}:count*`,
      `public:jobs:*`,
      `public:count*`,
      `featured_jobs:*`,
      `job:featured`,
    ];

    // Delete specific keys and patterns
    await Promise.all([
      ...patterns.map(pattern => this.invalidatePattern(pattern)),
      this.del(`job:${jobId}`),
    ]);
  }

  /**
   * Invalidates cache for all jobs belonging to a company
   * @param companyId - Company ID to invalidate job cache for
   */
  async invalidateCompanyJobsCache(companyId: string): Promise<void> {
    ValidationUtils.validateRequired(companyId, 'company ID');
    ValidationUtils.validateStringLength(companyId, 'company ID', 1, 100);

    const patterns = [
      `company:${companyId}:jobs:*`,
      `company:${companyId}:count*`,
      `public:jobs:*`,
      `public:count*`,
    ];

    await Promise.all(patterns.map(pattern => this.invalidatePattern(pattern)));
  }

  /**
   * Invalidates public job listings cache
   * Clears all public job queries and featured jobs cache
   */
  async invalidatePublicJobsCache(): Promise<void> {
    const patterns = [
      `public:jobs:*`,
      `public:count*`,
      `public_jobs_simple:*`,
      `featured_jobs:*`,
      `job:featured`,
    ];

    await Promise.all(patterns.map(pattern => this.invalidatePattern(pattern)));
  }

  /**
   * Invalidates all user profile related cache entries
   * @param userId - User ID to invalidate profile cache for
   */
  async invalidateUserProfile(userId: string): Promise<void> {
    ValidationUtils.validateRequired(userId, 'user ID');
    ValidationUtils.validateStringLength(userId, 'user ID', 1, 100);

    const patterns = [
      `user:${userId}:*`,
      `candidate:${userId}:*`,
      `candidate_profile:${userId}`,
    ];

    await Promise.all([
      ...patterns.map(pattern => this.invalidatePattern(pattern)),
      this.del(`user:${userId}:profile`),
      this.del(`candidate:${userId}:profile`),
      this.del(`candidate:${userId}:cvs`),
    ]);
  }

  /**
   * Invalidates cache for a specific job application
   * @param applicationId - Application ID
   * @param jobId - Job ID the application is for
   * @param candidateId - Candidate ID who submitted the application
   */
  async invalidateApplicationCache(applicationId: string, jobId: string, candidateId: string): Promise<void> {
    ValidationUtils.validateRequired(applicationId, 'application ID');
    ValidationUtils.validateRequired(jobId, 'job ID');
    ValidationUtils.validateRequired(candidateId, 'candidate ID');
    ValidationUtils.validateStringLength(applicationId, 'application ID', 1, 100);
    ValidationUtils.validateStringLength(jobId, 'job ID', 1, 100);
    ValidationUtils.validateStringLength(candidateId, 'candidate ID', 1, 100);

    const patterns = [
      `application:${applicationId}`,
      `job:${jobId}:applications`,
      `candidate:${candidateId}:applications`,
      `applications:job:${jobId}:*`,
      `applications:candidate:${candidateId}:*`,
    ];

    await Promise.all(patterns.map(pattern => this.invalidatePattern(pattern)));
  }

  /**
   * Invalidates all company-related cache entries
   * @param companyId - Company ID to invalidate cache for
   */
  async invalidateCompanyCache(companyId: string): Promise<void> {
    ValidationUtils.validateRequired(companyId, 'company ID');
    ValidationUtils.validateStringLength(companyId, 'company ID', 1, 100);

    const patterns = [
      `company:${companyId}:*`,
      `companies:*`,
    ];

    await Promise.all(patterns.map(pattern => this.invalidatePattern(pattern)));
  }

  // Strategic caching for expensive operations
  /**
   * Gets data from cache or fetches and caches it if not found
   * Implements cache-aside pattern for expensive operations
   * @param key - Cache key to check/store data under
   * @param fetcher - Function to fetch data if not in cache
   * @param ttl - Time-to-live in seconds (optional)
   * @returns Promise resolving to cached or freshly fetched data
   */
  async getOrSet<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    ValidationUtils.validateRequired(key, 'cache key');
    ValidationUtils.validateStringLength(key, 'cache key', 1, 500);
    ValidationUtils.validateRequired(fetcher, 'fetcher function');
    
    if (ttl !== undefined) {
      ValidationUtils.validateNumericRange(ttl, 'TTL', 1, TIME_CONSTANTS.DAY);
    }

    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const data = await fetcher();
    
    // Cache the result
    await this.set(key, data, ttl);
    
    return data;
  }

  /**
   * Gets data from cache with automatic background refresh capability
   * Implements stale-while-revalidate pattern for better performance
   * @param key - Cache key to check/store data under
   * @param fetcher - Function to fetch fresh data
   * @param ttl - Time-to-live in seconds (default: 300)
   * @param staleWhileRevalidate - Whether to refresh cache in background when serving stale data
   * @returns Promise resolving to cached or freshly fetched data
   */
  async getWithFallback<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = CACHE_CONSTANTS.TTL_DYNAMIC,
    staleWhileRevalidate: boolean = false
  ): Promise<T> {
    ValidationUtils.validateRequired(key, 'cache key');
    ValidationUtils.validateStringLength(key, 'cache key', 1, 500);
    ValidationUtils.validateRequired(fetcher, 'fetcher function');
    ValidationUtils.validateNumericRange(ttl, 'TTL', 1, TIME_CONSTANTS.DAY);

    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      // If stale-while-revalidate is enabled, refresh in background
      if (staleWhileRevalidate) {
        fetcher().then(data => this.set(key, data, ttl)).catch(console.error);
      }
      return cached;
    }

    // Fetch fresh data
    const data = await fetcher();
    await this.set(key, data, ttl);
    return data;
  }

  /**
   * Multi-level caching with hierarchical key lookup
   * Checks multiple cache keys in order and caches result in all levels
   * @param keys - Array of cache keys to check in order
   * @param fetcher - Function to fetch data if not found in any cache level
   * @param ttl - Time-to-live in seconds (default: 300)
   * @returns Promise resolving to data from first available cache level or fresh data
   */
  async getHierarchical<T>(
    keys: string[],
    fetcher: () => Promise<T>,
    ttl: number = CACHE_CONSTANTS.TTL_DYNAMIC
  ): Promise<T> {
    ValidationUtils.validateRequired(keys, 'cache keys array');
    if (!Array.isArray(keys) || keys.length === 0) {
      throw new Error('Cache keys array must contain at least one key');
    }
    
    keys.forEach((key, index) => {
      ValidationUtils.validateRequired(key, `cache key at index ${index}`);
      ValidationUtils.validateStringLength(key, `cache key at index ${index}`, 1, 500);
    });
    
    ValidationUtils.validateRequired(fetcher, 'fetcher function');
    ValidationUtils.validateNumericRange(ttl, 'TTL', 1, TIME_CONSTANTS.DAY);

    // Try each cache level
    for (const key of keys) {
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }
    }

    // Fetch fresh data
    const data = await fetcher();
    
    // Cache in all levels
    await Promise.all(keys.map(key => this.set(key, data, ttl)));
    
    return data;
  }

  // Cache invalidation with patterns (for Redis-like stores)
  /**
   * Invalidates cache entries matching a pattern
   * Uses pattern deletion for Redis-like stores, falls back to common variations
   * @param pattern - Pattern to match for invalidation (e.g., "user:*:profile")
   */
  async invalidatePattern(pattern: string): Promise<void> {
    ValidationUtils.validateRequired(pattern, 'pattern');
    ValidationUtils.validateStringLength(pattern, 'pattern', 1, 500);

    try {
      // For stores that support pattern deletion (like Redis)
      const cacheStore = this.cacheManager as any;
      if (typeof cacheStore.delByPattern === 'function') {
        await cacheStore.delByPattern(pattern);
        return;
      }

      // Fallback: try to delete common variations
      const variations = [
        pattern,
        pattern.replace('*', ''),
        pattern.replace('*:*', ''),
      ];

      await Promise.all(variations.map(key => this.del(key)));
    } catch (error) {
      console.error('Pattern invalidation error:', error);
    }
  }

  /**
   * Returns appropriate TTL based on data volatility level
   * @param dataType - Type of data volatility
   * @returns TTL value in seconds
   */
  getSmartTTL(dataType: 'static' | 'dynamic' | 'volatile'): number {
    ValidationUtils.validateRequired(dataType, 'data type');

    switch (dataType) {
      case 'static': return CACHE_CONSTANTS.TTL_STATIC;
      case 'dynamic': return CACHE_CONSTANTS.TTL_DYNAMIC;
      case 'volatile': return CACHE_CONSTANTS.TTL_VOLATILE;
      default: return CACHE_CONSTANTS.TTL_DYNAMIC;
    }
  }

  /**
   * Pre-warms cache with data for improved performance
   * Fetches data and stores it in cache proactively
   * @param key - Cache key to warm
   * @param fetcher - Function to fetch the data
   * @param ttl - Time-to-live in seconds (optional)
   */
  async warmCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<void> {
    ValidationUtils.validateRequired(key, 'cache key');
    ValidationUtils.validateStringLength(key, 'cache key', 1, 500);
    ValidationUtils.validateRequired(fetcher, 'fetcher function');
    
    if (ttl !== undefined) {
      ValidationUtils.validateNumericRange(ttl, 'TTL', 1, TIME_CONSTANTS.DAY);
    }

    try {
      const data = await fetcher();
      await this.set(key, data, ttl);
      console.log(`✅ Cache warmed for key: ${key}`);
    } catch (error) {
      console.error(`❌ Failed to warm cache for key: ${key}`, error);
    }
  }
}
