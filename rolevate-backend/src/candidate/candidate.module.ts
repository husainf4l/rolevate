import { Module } from '@nestjs/common';
import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AppCacheModule } from '../cache/cache.module';
import { NotificationModule } from '../notification/notification.module';
import { AwsS3Service } from '../services/aws-s3.service';
import { FileValidationService } from '../services/file-validation.service';
import { CvParsingService } from '../services/cv-parsing.service';

@Module({
  imports: [
    PrismaModule, 
    AppCacheModule,
    NotificationModule,
  ],
  controllers: [CandidateController],
  providers: [CandidateService, AwsS3Service, FileValidationService, CvParsingService],
  exports: [CandidateService],
})
export class CandidateModule {}
