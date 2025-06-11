import { Module } from '@nestjs/common';
import { PublicInterviewController } from './public-interview-fixed.controller';
import { LiveKitModule } from '../livekit/livekit.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [LiveKitModule, PrismaModule],
  controllers: [PublicInterviewController],
  exports: [],
})
export class PublicInterviewModule {}
