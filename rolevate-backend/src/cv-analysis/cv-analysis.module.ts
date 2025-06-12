import { Module } from '@nestjs/common';
import { CvAnalysisService } from './cv-analysis.service';
import { CvAnalysisController } from './cv-analysis.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CvAnalysisController],
  providers: [CvAnalysisService],
  exports: [CvAnalysisService],
})
export class CvAnalysisModule {}
