import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { JobFitController } from './jobfit.controller';
import { JobFitService } from './jobfit.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [
    PrismaModule,
    UploadsModule, // This provides AwsS3Service and CvParsingService
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [JobFitController],
  providers: [JobFitService],
  exports: [JobFitService],
})
export class JobFitModule {}
