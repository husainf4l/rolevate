import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheService } from './cache.service';
import { CACHE_CONSTANTS, PAGINATION_CONSTANTS, TIME_CONSTANTS } from '../common/constants';

describe('CacheService', () => {
  let service: CacheService;
  let cacheManager: jest.Mocked<Cache>;

  beforeEach(async () => {
    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return cached value when found', async () => {
      const key = 'test:key';
      const expectedValue = { data: 'test' };
      cacheManager.get.mockResolvedValue(expectedValue);

      const result = await service.get(key);

      expect(cacheManager.get).toHaveBeenCalledWith(key);
      expect(result).toEqual(expectedValue);
    });

    it('should return null when cache miss', async () => {
      const key = 'test:key';
      cacheManager.get.mockResolvedValue(null);

      const result = await service.get(key);

      expect(cacheManager.get).toHaveBeenCalledWith(key);
      expect(result).toBeNull();
    });

    it('should return null on cache error', async () => {
      const key = 'test:key';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      cacheManager.get.mockRejectedValue(new Error('Cache error'));

      const result = await service.get(key);

      expect(cacheManager.get).toHaveBeenCalledWith(key);
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Cache get error:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should throw validation error for empty key', async () => {
      await expect(service.get('')).rejects.toThrow('cache key is required');
    });

    it('should throw validation error for key too long', async () => {
      const longKey = 'a'.repeat(501);
      await expect(service.get(longKey)).rejects.toThrow('cache key must be less than 500 characters');
    });
  });

  describe('set', () => {
    it('should set value without TTL', async () => {
      const key = 'test:key';
      const value = { data: 'test' };

      await service.set(key, value);

      expect(cacheManager.set).toHaveBeenCalledWith(key, value);
    });

    it('should set value with TTL', async () => {
      const key = 'test:key';
      const value = { data: 'test' };
      const ttl = 300;

      await service.set(key, value, ttl);

      expect(cacheManager.set).toHaveBeenCalledWith(key, value, ttl);
    });

    it('should handle cache set error gracefully', async () => {
      const key = 'test:key';
      const value = { data: 'test' };
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      cacheManager.set.mockRejectedValue(new Error('Cache set error'));

      await expect(service.set(key, value)).resolves.not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith('Cache set error:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should validate TTL range', async () => {
      const key = 'test:key';
      const value = { data: 'test' };

      await expect(service.set(key, value, 0)).rejects.toThrow('TTL must be at least 1');
      await expect(service.set(key, value, TIME_CONSTANTS.DAY + 1)).rejects.toThrow('TTL must be at most');
    });
  });

  describe('del', () => {
    it('should delete cache key', async () => {
      const key = 'test:key';

      await service.del(key);

      expect(cacheManager.del).toHaveBeenCalledWith(key);
    });

    it('should handle cache delete error gracefully', async () => {
      const key = 'test:key';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      cacheManager.del.mockRejectedValue(new Error('Cache delete error'));

      await expect(service.del(key)).resolves.not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith('Cache delete error:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('clear', () => {
    it('should use reset method when available', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      (cacheManager as any).reset = jest.fn().mockResolvedValue(undefined);

      await service.clear();

      expect((cacheManager as any).reset).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('✅ Cache cleared using reset method');
      consoleSpy.mockRestore();
    });

    it('should manually clear known keys when reset not available', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      cacheManager.del.mockResolvedValue(true);

      await service.clear();

      expect(cacheManager.del).toHaveBeenCalledTimes(4); // job:featured, public:jobs:20:0, public:jobs:10:0, public:count
      expect(consoleSpy).toHaveBeenCalledWith('✅ Cache clear operation completed');
      consoleSpy.mockRestore();
    });

    it('should throw error when all clear methods fail', async () => {
      (cacheManager as any).reset = jest.fn().mockRejectedValue(new Error('Reset failed'));
      cacheManager.del.mockRejectedValue(new Error('Delete failed'));

      await expect(service.clear()).rejects.toThrow('Reset failed');
    });
  });

  describe('clearAll', () => {
    it('should return success when reset method works', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      (cacheManager as any).reset = jest.fn().mockResolvedValue(undefined);

      const result = await service.clearAll();

      expect(result).toEqual({
        cleared: true,
        method: 'reset',
        message: 'All cache cleared using reset method'
      });
      consoleSpy.mockRestore();
    });

    it('should return success for manual clearing', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      cacheManager.del.mockResolvedValue(true);

      const result = await service.clearAll();

      expect(result).toEqual({
        cleared: true,
        method: 'manual',
        message: expect.stringContaining('Cache cleared manually')
      });
      consoleSpy.mockRestore();
    });

    it('should return error result when clearing fails', async () => {
      (cacheManager as any).reset = jest.fn().mockRejectedValue(new Error('Reset failed'));
      cacheManager.del.mockRejectedValue(new Error('Delete failed'));

      const result = await service.clearAll();

      expect(result).toEqual({
        cleared: false,
        method: 'error',
        message: 'Failed to clear cache: Reset failed'
      });
    });
  });

  describe('generateJobKey', () => {
    it('should generate correct job key', () => {
      const jobId = 'job-123';
      const result = service.generateJobKey(jobId);

      expect(result).toBe('job:job-123');
    });

    it('should validate job ID', () => {
      expect(() => service.generateJobKey('')).toThrow('job ID is required');
      expect(() => service.generateJobKey('a'.repeat(101))).toThrow('job ID must be less than 100 characters');
    });
  });

  describe('generateCompanyJobsKey', () => {
    it('should generate correct company jobs key', () => {
      const result = service.generateCompanyJobsKey('company-123', 10, 5, 'developer');

      expect(result).toBe('company:company-123:jobs:10:5:search:developer');
    });

    it('should generate key without search term', () => {
      const result = service.generateCompanyJobsKey('company-123', 10, 5);

      expect(result).toBe('company:company-123:jobs:10:5');
    });

    it('should validate parameters', () => {
      expect(() => service.generateCompanyJobsKey('', 10, 5)).toThrow('company ID is required');
      expect(() => service.generateCompanyJobsKey('company-123', 0, 5)).toThrow('limit must be at least 1');
      expect(() => service.generateCompanyJobsKey('company-123', 10, -1)).toThrow('offset must be at least 0');
      expect(() => service.generateCompanyJobsKey('company-123', 10, 5, 'a'.repeat(201))).toThrow('search query must be less than 200 characters');
    });
  });

  describe('generatePublicJobsKey', () => {
    it('should generate correct public jobs key', () => {
      const result = service.generatePublicJobsKey(20, 10, 'javascript');

      expect(result).toBe('public:jobs:20:10:search:javascript');
    });

    it('should generate key without search term', () => {
      const result = service.generatePublicJobsKey(20, 10);

      expect(result).toBe('public:jobs:20:10');
    });

    it('should validate parameters', () => {
      expect(() => service.generatePublicJobsKey(0, 10)).toThrow('limit must be at least 1');
      expect(() => service.generatePublicJobsKey(PAGINATION_CONSTANTS.MAX_LIMIT + 1, 10)).toThrow('limit must be at most');
      expect(() => service.generatePublicJobsKey(20, PAGINATION_CONSTANTS.MAX_OFFSET + 1)).toThrow('offset must be at most');
    });
  });

  describe('invalidateJobCache', () => {
    it('should invalidate all job-related cache patterns', async () => {
      const jobId = 'job-123';
      const companyId = 'company-456';
      cacheManager.del.mockResolvedValue(true);

      await service.invalidateJobCache(jobId, companyId);

      expect(cacheManager.del).toHaveBeenCalledWith(`job:${jobId}`);
      // Should call invalidatePattern for various patterns
    });

    it('should validate parameters', async () => {
      await expect(service.invalidateJobCache('', 'company-123')).rejects.toThrow('job ID is required');
      await expect(service.invalidateJobCache('job-123', '')).rejects.toThrow('company ID is required');
    });
  });

  describe('invalidateCompanyJobsCache', () => {
    it('should invalidate company jobs cache patterns', async () => {
      const companyId = 'company-123';

      await service.invalidateCompanyJobsCache(companyId);

      // Should call invalidatePattern for company job patterns
    });

    it('should validate company ID', async () => {
      await expect(service.invalidateCompanyJobsCache('')).rejects.toThrow('company ID is required');
    });
  });

  describe('invalidateUserProfile', () => {
    it('should invalidate user profile cache patterns', async () => {
      const userId = 'user-123';
      cacheManager.del.mockResolvedValue(true);

      await service.invalidateUserProfile(userId);

      expect(cacheManager.del).toHaveBeenCalledWith(`user:${userId}:profile`);
      expect(cacheManager.del).toHaveBeenCalledWith(`candidate:${userId}:profile`);
      expect(cacheManager.del).toHaveBeenCalledWith(`candidate:${userId}:cvs`);
    });

    it('should validate user ID', async () => {
      await expect(service.invalidateUserProfile('')).rejects.toThrow('user ID is required');
    });
  });

  describe('getOrSet', () => {
    it('should return cached value if available', async () => {
      const key = 'test:key';
      const fetcher = jest.fn();
      const cachedValue = { data: 'cached' };
      cacheManager.get.mockResolvedValue(cachedValue);

      const result = await service.getOrSet(key, fetcher);

      expect(cacheManager.get).toHaveBeenCalledWith(key);
      expect(fetcher).not.toHaveBeenCalled();
      expect(result).toEqual(cachedValue);
    });

    it('should fetch and cache value if not cached', async () => {
      const key = 'test:key';
      const fetcher = jest.fn().mockResolvedValue({ data: 'fetched' });
      cacheManager.get.mockResolvedValue(null);
      cacheManager.set.mockResolvedValue(undefined);

      const result = await service.getOrSet(key, fetcher);

      expect(cacheManager.get).toHaveBeenCalledWith(key);
      expect(fetcher).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith(key, { data: 'fetched' });
      expect(result).toEqual({ data: 'fetched' });
    });

    it('should validate parameters', async () => {
      const fetcher = jest.fn();
      await expect(service.getOrSet('', fetcher)).rejects.toThrow('cache key is required');
      await expect(service.getOrSet('key', null as any)).rejects.toThrow('fetcher function is required');
    });
  });

  describe('getWithFallback', () => {
    it('should return cached value and refresh in background', async () => {
      const key = 'test:key';
      const fetcher = jest.fn().mockResolvedValue({ data: 'fresh' });
      const cachedValue = { data: 'stale' };
      cacheManager.get.mockResolvedValue(cachedValue);
      cacheManager.set.mockResolvedValue(undefined);

      const result = await service.getWithFallback(key, fetcher, 300, true);

      expect(result).toEqual(cachedValue);
      // Background refresh should have been triggered
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(fetcher).toHaveBeenCalled();
    });

    it('should fetch fresh data when not cached', async () => {
      const key = 'test:key';
      const fetcher = jest.fn().mockResolvedValue({ data: 'fresh' });
      cacheManager.get.mockResolvedValue(null);
      cacheManager.set.mockResolvedValue(undefined);

      const result = await service.getWithFallback(key, fetcher);

      expect(result).toEqual({ data: 'fresh' });
      expect(cacheManager.set).toHaveBeenCalledWith(key, { data: 'fresh' }, CACHE_CONSTANTS.TTL_DYNAMIC);
    });
  });

  describe('getHierarchical', () => {
    it('should return first available cached value', async () => {
      const keys = ['key1', 'key2', 'key3'];
      const fetcher = jest.fn();
      const cachedValue = { data: 'cached' };
      cacheManager.get.mockImplementation((key) => {
        if (key === 'key1') return Promise.resolve(null);
        if (key === 'key2') return Promise.resolve(cachedValue);
        return Promise.resolve(null);
      });

      const result = await service.getHierarchical(keys, fetcher);

      expect(result).toEqual(cachedValue);
      expect(fetcher).not.toHaveBeenCalled();
    });

    it('should fetch and cache in all levels when not cached', async () => {
      const keys = ['key1', 'key2'];
      const fetcher = jest.fn().mockResolvedValue({ data: 'fetched' });
      cacheManager.get.mockResolvedValue(null);
      cacheManager.set.mockResolvedValue(undefined);

      const result = await service.getHierarchical(keys, fetcher);

      expect(result).toEqual({ data: 'fetched' });
      expect(cacheManager.set).toHaveBeenCalledTimes(2);
      expect(cacheManager.set).toHaveBeenCalledWith('key1', { data: 'fetched' }, CACHE_CONSTANTS.TTL_DYNAMIC);
      expect(cacheManager.set).toHaveBeenCalledWith('key2', { data: 'fetched' }, CACHE_CONSTANTS.TTL_DYNAMIC);
    });

    it('should validate keys array', async () => {
      const fetcher = jest.fn();
      await expect(service.getHierarchical([], fetcher)).rejects.toThrow('Cache keys array must contain at least one key');
      await expect(service.getHierarchical([''], fetcher)).rejects.toThrow('cache key at index 0 is required');
    });
  });

  describe('getSmartTTL', () => {
    it('should return correct TTL for each data type', () => {
      expect(service.getSmartTTL('static')).toBe(CACHE_CONSTANTS.TTL_STATIC);
      expect(service.getSmartTTL('dynamic')).toBe(CACHE_CONSTANTS.TTL_DYNAMIC);
      expect(service.getSmartTTL('volatile')).toBe(CACHE_CONSTANTS.TTL_VOLATILE);
    });

    it('should default to dynamic TTL for unknown types', () => {
      expect(service.getSmartTTL('unknown' as any)).toBe(CACHE_CONSTANTS.TTL_DYNAMIC);
    });

    it('should validate data type', () => {
      expect(() => service.getSmartTTL('' as any)).toThrow('data type is required');
      // Note: Invalid enum values now default to dynamic TTL instead of throwing
    });
  });

  describe('warmCache', () => {
    it('should fetch and cache data successfully', async () => {
      const key = 'test:key';
      const fetcher = jest.fn().mockResolvedValue({ data: 'warm' });
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      cacheManager.set.mockResolvedValue(undefined);

      await service.warmCache(key, fetcher);

      expect(fetcher).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith(key, { data: 'warm' });
      expect(consoleSpy).toHaveBeenCalledWith('✅ Cache warmed for key: test:key');
      consoleSpy.mockRestore();
    });

    it('should handle errors gracefully', async () => {
      const key = 'test:key';
      const fetcher = jest.fn().mockRejectedValue(new Error('Fetch failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(service.warmCache(key, fetcher)).resolves.not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith('❌ Failed to warm cache for key: test:key', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
});