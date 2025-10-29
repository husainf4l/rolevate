import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DatabaseBackupService } from './database-backup.service';
import { DatabaseBackup, BackupStatus, BackupType } from './database-backup.entity';
import { BackupOperationResponse, RestoreOperationResponse, BackupStatsResponse } from './database-backup-response.dto';
import { CreateBackupInput, RestoreBackupInput } from './database-backup.input';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Resolver(() => DatabaseBackup)
@UseGuards(JwtAuthGuard)
export class DatabaseBackupResolver {
  constructor(private readonly backupService: DatabaseBackupService) {}

  /**
   * Create a manual database backup
   */
  @Mutation(() => BackupOperationResponse)
  async createDatabaseBackup(
    @Args('input', { nullable: true }) input: CreateBackupInput,
    @Context() context: any,
  ): Promise<BackupOperationResponse> {
    try {
      const userId = context.req.user.id;
      const backup = await this.backupService.createBackup(userId, input?.description);
      return {
        success: true,
        message: 'Database backup initiated successfully. It will run in the background.',
        backup,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create backup: ${error.message}`,
      };
    }
  }

  /**
   * List all database backups
   */
  @Query(() => [DatabaseBackup])
  async listDatabaseBackups(
    @Args('status', { type: () => BackupStatus, nullable: true }) status?: BackupStatus,
    @Args('type', { type: () => BackupType, nullable: true }) type?: BackupType,
  ): Promise<DatabaseBackup[]> {
    return this.backupService.listBackups(status, type);
  }

  /**
   * Get a specific backup by ID
   */
  @Query(() => DatabaseBackup)
  async getDatabaseBackup(@Args('id', { type: () => ID }) id: string): Promise<DatabaseBackup> {
    return this.backupService.getBackupById(id);
  }

  /**
   * Get backup statistics
   */
  @Query(() => BackupStatsResponse)
  async getDatabaseBackupStats(): Promise<BackupStatsResponse> {
    return this.backupService.getBackupStats();
  }

  /**
   * Restore database from a backup
   * WARNING: This will replace all existing data!
   */
  @Mutation(() => RestoreOperationResponse)
  async restoreDatabaseFromBackup(
    @Args('input') input: RestoreBackupInput,
  ): Promise<RestoreOperationResponse> {
    try {
      const backup = await this.backupService.restoreBackup(input.backupId, input.targetDatabaseName);
      return {
        success: true,
        message: 'Database restored successfully',
        restoredDatabase: input.targetDatabaseName || 'current database',
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to restore database: ${error.message}`,
      };
    }
  }

  /**
   * Delete a backup (removes from S3 and marks as deleted)
   */
  @Mutation(() => BackupOperationResponse)
  async deleteDatabaseBackup(@Args('id', { type: () => ID }) id: string): Promise<BackupOperationResponse> {
    try {
      await this.backupService.deleteBackup(id);
      return {
        success: true,
        message: 'Backup deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to delete backup: ${error.message}`,
      };
    }
  }
}
