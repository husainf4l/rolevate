import { Module } from '@nestjs/common';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AiautocompleteModule } from '../aiautocomplete/aiautocomplete.module';

@Module({
  imports: [PrismaModule, AiautocompleteModule],
  controllers: [InterviewController],
  providers: [InterviewService],
  exports: [InterviewService],
})
export class InterviewModule {}
