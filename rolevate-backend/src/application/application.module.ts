import { Module } from '@nestjs/common';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppCacheModule } from '../cache/cache.module';
import { OpenaiCvAnalysisService } from '../services/openai-cv-analysis.service';
import { CvParsingService } from '../services/cv-parsing.service';
import { NotificationModule } from '../notification/notification.module';
import { LiveKitModule } from '../livekit/livekit.module';
import { CommunicationModule } from '../communication/communication.module';

@Module({
  imports: [AppCacheModule, NotificationModule, LiveKitModule, CommunicationModule],
  controllers: [ApplicationController],
  providers: [ApplicationService, PrismaService, OpenaiCvAnalysisService, CvParsingService],
  exports: [ApplicationService],
})
export class ApplicationModule {}
