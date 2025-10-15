import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewService } from './interview.service';
import { InterviewResolver } from './interview.resolver';
import { Interview } from './interview.entity';
import { Transcript } from './transcript.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Interview, Transcript])],
  providers: [InterviewService, InterviewResolver],
  exports: [InterviewService],
})
export class InterviewModule {}