import { Module } from '@nestjs/common';
import { JobPostService } from './jobpost.service';
import { JobPostController } from './jobpost.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AiJobPostService } from './ai-jobpost.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [JobPostController],
  providers: [JobPostService, AiJobPostService],
  exports: [JobPostService, AiJobPostService],
})
export class JobPostModule {}
