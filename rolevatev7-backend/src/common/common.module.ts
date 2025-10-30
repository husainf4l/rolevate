import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceOwnershipService } from './services/resource-ownership.service';
import { ValidationService } from './services/validation.service';
import { OwnershipGuard } from './guards/ownership.guard';
import { Application } from '../application/application.entity';
import { ApplicationNote } from '../application/application-note.entity';
import { Job } from '../job/job.entity';
import { User } from '../user/user.entity';
import { CandidateProfile } from '../candidate/candidate-profile.entity';
import { AuditLog } from './entities/audit-log.entity';

/**
 * Global module that provides shared services, guards, and entities
 * Available to all modules without explicit import
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      ApplicationNote,
      Job,
      User,
      CandidateProfile,
      AuditLog,
    ]),
  ],
  providers: [
    ResourceOwnershipService,
    ValidationService,
    OwnershipGuard,
  ],
  exports: [
    ResourceOwnershipService,
    ValidationService,
    OwnershipGuard,
    TypeOrmModule,
  ],
})
export class CommonModule {}
