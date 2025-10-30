import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * Cache Service
 * Wrapper around cache-manager for easier usage
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = await this.cacheManager.get<T>(key);
      if (value) {
        this.logger.debug(`Cache HIT: ${key}`);
      } else {
        this.logger.debug(`Cache MISS: ${key}`);
      }
      return value;
    } catch (error) {
      this.logger.error(`Cache GET error for key ${key}: ${error instanceof Error ? error.message : String(error)}`);
      return undefined;
    }
  }

  /**
   * Set value in cache with optional TTL
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
      this.logger.debug(`Cache SET: ${key} (TTL: ${ttl || 'default'})`);
    } catch (error) {
      this.logger.error(`Cache SET error for key ${key}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache DEL: ${key}`);
    } catch (error) {
      this.logger.error(`Cache DEL error for key ${key}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Delete multiple keys matching a pattern
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      // Note: This requires the cache store to support pattern deletion
      this.logger.debug(`Cache DEL pattern: ${pattern}`);
      // Implementation depends on cache-manager-ioredis-yet capabilities
      // For now, just log the intent
      this.logger.warn('Pattern deletion not yet implemented');
    } catch (error) {
      this.logger.error(`Cache DEL pattern error for ${pattern}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get or set pattern - fetch from cache or compute and cache
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Cache keys generator helpers
   */
  keys = {
    job: (id: string) => `job:${id}`,
    jobs: (page: number, limit: number, filters?: string) => 
      `jobs:page:${page}:limit:${limit}${filters ? `:filters:${filters}` : ''}`,
    company: (id: string) => `company:${id}`,
    user: (id: string) => `user:${id}`,
    userProfile: (id: string) => `user:${id}:profile`,
    application: (id: string) => `application:${id}`,
    candidateProfile: (id: string) => `candidate:${id}:profile`,
  };
}
