import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class ViewTrackingService {
  constructor(private cacheService: CacheService) {}

  private generateViewKey(jobId: string, ipAddress: string): string {
    return `view:${jobId}:${ipAddress}`;
  }

  async hasViewed(jobId: string, ipAddress: string): Promise<boolean> {
    const key = this.generateViewKey(jobId, ipAddress);
    const viewed = await this.cacheService.get<boolean>(key);
    return viewed === true;
  }

  async markAsViewed(jobId: string, ipAddress: string): Promise<void> {
    const key = this.generateViewKey(jobId, ipAddress);
    // Cache for 24 hours (86400 seconds) to prevent duplicate views from same IP
    await this.cacheService.set(key, true, 86400);
  }

  async shouldIncrementView(jobId: string, ipAddress: string): Promise<boolean> {
    const hasViewed = await this.hasViewed(jobId, ipAddress);
    if (!hasViewed) {
      await this.markAsViewed(jobId, ipAddress);
      return true;
    }
    return false;
  }
}
