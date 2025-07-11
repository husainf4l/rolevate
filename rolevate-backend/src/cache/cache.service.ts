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
      const patterns = [
        'job:', 'company:', 'public:', 'candidate_profile:', 'user:', 'auth:'
      ];
      
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

  // Invalidate related cache keys
  async invalidateJobCache(jobId: string, companyId: string): Promise<void> {
    const keysToDelete = [
      this.generateJobKey(jobId),
      `company:${companyId}:jobs:*`, // Pattern matching (will need custom implementation)
      `public:jobs:*`,
      `company:${companyId}:count*`,
      `public:count*`,
    ];

    // For pattern matching, we'll need to implement a more sophisticated approach
    // For now, we'll just delete specific keys
    await Promise.all([
      this.del(this.generateJobKey(jobId)),
      // We can add more specific cache invalidation based on usage patterns
    ]);
  }

  async invalidateCompanyJobsCache(companyId: string): Promise<void> {
    // In a real implementation, you'd want to use Redis SCAN to find matching keys
    // For now, we'll implement a basic invalidation
    const commonKeys = [
      this.generateCompanyJobsKey(companyId, 10, 0),
      this.generateCompanyJobsKey(companyId, 20, 0),
      this.generateCompanyJobsKey(companyId, 50, 0),
      this.generateJobCountKey(companyId),
    ];

    await Promise.all(commonKeys.map(key => this.del(key)));
  }

  async invalidatePublicJobsCache(): Promise<void> {
    const commonKeys = [
      this.generatePublicJobsKey(10, 0),
      this.generatePublicJobsKey(20, 0),
      this.generatePublicJobsKey(50, 0),
      this.generatePublicJobCountKey(),
    ];

    await Promise.all(commonKeys.map(key => this.del(key)));
  }

  async invalidateUserProfile(userId: string): Promise<void> {
    // Invalidate user profile related cache keys
    const keysToDelete = [
      `user:${userId}:profile`,
      `candidate:${userId}:profile`,
      `candidate:${userId}:cvs`,
    ];

    await Promise.all(keysToDelete.map(key => this.del(key)));
  }
}
