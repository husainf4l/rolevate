import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await this.cacheManager.get<T>(key);
      return result || null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
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

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

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
  generateJobKey(id: string): string {
    return `job:${id}`;
  }

  generateCompanyJobsKey(companyId: string, limit: number, offset: number, search?: string): string {
    const searchPart = search ? `:search:${search}` : '';
    return `company:${companyId}:jobs:${limit}:${offset}${searchPart}`;
  }

  generatePublicJobsKey(limit: number, offset: number, search?: string): string {
    const searchPart = search ? `:search:${search}` : '';
    return `public:jobs:${limit}:${offset}${searchPart}`;
  }

  generateJobCountKey(companyId: string, search?: string): string {
    const searchPart = search ? `:search:${search}` : '';
    return `company:${companyId}:count${searchPart}`;
  }

  generatePublicJobCountKey(search?: string): string {
    const searchPart = search ? `:search:${search}` : '';
    return `public:count${searchPart}`;
  }

  // Enhanced cache invalidation with comprehensive patterns
  async invalidateJobCache(jobId: string, companyId: string): Promise<void> {
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

  async invalidateCompanyJobsCache(companyId: string): Promise<void> {
    const patterns = [
      `company:${companyId}:jobs:*`,
      `company:${companyId}:count*`,
      `public:jobs:*`,
      `public:count*`,
    ];

    await Promise.all(patterns.map(pattern => this.invalidatePattern(pattern)));
  }

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

  async invalidateUserProfile(userId: string): Promise<void> {
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

  async invalidateApplicationCache(applicationId: string, jobId: string, candidateId: string): Promise<void> {
    const patterns = [
      `application:${applicationId}`,
      `job:${jobId}:applications`,
      `candidate:${candidateId}:applications`,
      `applications:job:${jobId}:*`,
      `applications:candidate:${candidateId}:*`,
    ];

    await Promise.all(patterns.map(pattern => this.invalidatePattern(pattern)));
  }

  async invalidateCompanyCache(companyId: string): Promise<void> {
    const patterns = [
      `company:${companyId}:*`,
      `companies:*`,
    ];

    await Promise.all(patterns.map(pattern => this.invalidatePattern(pattern)));
  }

  // Strategic caching for expensive operations
  async getOrSet<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
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

  // Cache with automatic refresh for frequently changing data
  async getWithFallback<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 300,
    staleWhileRevalidate: boolean = false
  ): Promise<T> {
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

  // Multi-level caching for hierarchical data
  async getHierarchical<T>(
    keys: string[],
    fetcher: () => Promise<T>,
    ttl: number = 300
  ): Promise<T> {
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
  async invalidatePattern(pattern: string): Promise<void> {
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

  // Smart TTL based on data volatility
  getSmartTTL(dataType: 'static' | 'dynamic' | 'volatile'): number {
    switch (dataType) {
      case 'static': return 3600; // 1 hour for rarely changing data
      case 'dynamic': return 600; // 10 minutes for moderately changing data
      case 'volatile': return 60; // 1 minute for frequently changing data
      default: return 300; // 5 minutes default
    }
  }

  // Cache warming for critical data
  async warmCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<void> {
    try {
      const data = await fetcher();
      await this.set(key, data, ttl);
      console.log(`✅ Cache warmed for key: ${key}`);
    } catch (error) {
      console.error(`❌ Failed to warm cache for key: ${key}`, error);
    }
  }
}
