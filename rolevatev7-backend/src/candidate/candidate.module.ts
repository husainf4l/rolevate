import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateProfileService } from './candidate-profile.service';
import { CandidateProfileResolver } from './candidate-profile.resolver';
import { CandidateProfile } from './candidate-profile.entity';
import { WorkExperience } from './work-experience.entity';
import { Education } from './education.entity';
import { CV } from './cv.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CandidateProfile, WorkExperience, Education, CV]),
    AuthModule,
  ],
  providers: [CandidateProfileService, CandidateProfileResolver],
  exports: [CandidateProfileService],
})
export class CandidateModule {}