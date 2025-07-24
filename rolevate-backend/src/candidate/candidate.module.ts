import { Module } from '@nestjs/common';
import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AppCacheModule } from '../cache/cache.module';
import { NotificationModule } from '../notification/notification.module';
import { AwsS3Service } from '../services/aws-s3.service';

@Module({
  imports: [
    PrismaModule, 
    AppCacheModule,
    NotificationModule,
  ],
  controllers: [CandidateController],
  providers: [CandidateService, AwsS3Service],
  exports: [CandidateService],
})
export class CandidateModule {}
