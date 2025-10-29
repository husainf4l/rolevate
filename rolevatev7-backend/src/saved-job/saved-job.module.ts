import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedJobService } from './saved-job.service';
import { SavedJobResolver } from './saved-job.resolver';
import { SavedJob } from './saved-job.entity';
import { JobModule } from '../job/job.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SavedJob]),
    JobModule,
  ],
  providers: [SavedJobService, SavedJobResolver],
  exports: [SavedJobService],
})
export class SavedJobModule {}
