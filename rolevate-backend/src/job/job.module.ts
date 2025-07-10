import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AppCacheModule } from '../cache/cache.module';
import { ViewTrackingService } from './view-tracking.service';

@Module({
  imports: [PrismaModule, AppCacheModule],
  controllers: [JobController],
  providers: [JobService, ViewTrackingService],
  exports: [JobService],
})
export class JobModule {}
