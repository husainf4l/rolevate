import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AppCacheModule } from '../cache/cache.module';
import { ViewTrackingService } from './view-tracking.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, AppCacheModule, NotificationModule],
  controllers: [JobController],
  providers: [JobService, ViewTrackingService],
  exports: [JobService],
})
export class JobModule {}
