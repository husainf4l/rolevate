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
      // Note: cache-manager doesn't have a reset method in newer versions
      // We'll implement pattern-based clearing if needed
      console.log('Cache clear requested - implement pattern-based clearing if needed');
    } catch (error) {
      console.error('Cache clear error:', error);
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
}
