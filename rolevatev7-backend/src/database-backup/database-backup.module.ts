import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseBackupService } from './database-backup.service';
import { DatabaseBackupResolver } from './database-backup.resolver';
import { DatabaseBackup } from './database-backup.entity';
import { ServicesModule } from '../services/services.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DatabaseBackup]),
    ScheduleModule.forRoot(),
    ServicesModule, // For AwsS3Service
    AuthModule, // For JwtAuthGuard, JwtService, and UserService
  ],
  providers: [DatabaseBackupService, DatabaseBackupResolver],
  exports: [DatabaseBackupService],
})
export class DatabaseBackupModule {}
