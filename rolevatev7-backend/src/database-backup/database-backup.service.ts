import { Injectable, Logger, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { DatabaseBackup, BackupStatus, BackupType } from './database-backup.entity';
import { AwsS3Service } from '../services/aws-s3.service';

const execAsync = promisify(exec);

@Injectable()
export class DatabaseBackupService {
  private readonly logger = new Logger(DatabaseBackupService.name);
  private readonly backupDir: string;

  constructor(
    @InjectRepository(DatabaseBackup)
    private readonly backupRepository: Repository<DatabaseBackup>,
    private readonly awsS3Service: AwsS3Service,
    private readonly configService: ConfigService,
  ) {
    // Create temp backup directory
    this.backupDir = path.join(process.cwd(), 'temp-backups');
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      this.logger.log(`Created backup directory: ${this.backupDir}`);
    }
  }

  /**
   * Create a manual database backup
   */
  async createBackup(userId: string, description?: string): Promise<DatabaseBackup> {
    this.logger.log('Starting manual database backup');

    const backup = this.backupRepository.create({
      fileName: '',
      s3Key: '',
      s3Url: '',
      fileSize: 0,
      status: BackupStatus.PENDING,
      type: BackupType.MANUAL,
      createdBy: userId,
      description,
      databaseName: this.configService.get('DATABASE_NAME'),
    });

    await this.backupRepository.save(backup);

    // Execute backup in background
    this.executeBackup(backup.id, BackupType.MANUAL).catch((error) => {
      this.logger.error(`Backup failed: ${error.message}`, error.stack);
    });

    return backup;
  }

  /**
   * Execute the actual backup operation
   */
  private async executeBackup(backupId: string, backupType: BackupType): Promise<void> {
    const startTime = Date.now();
    let localFilePath: string | null = null;

    try {
      const backup = await this.backupRepository.findOne({ where: { id: backupId } });
      if (!backup) {
        throw new NotFoundException('Backup record not found');
      }

      // Update status to IN_PROGRESS
      backup.status = BackupStatus.IN_PROGRESS;
      await this.backupRepository.save(backup);

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `db-backup-${timestamp}.sql.gz`;
      localFilePath = path.join(this.backupDir, fileName);

      // Get database connection details
      const dbHost = this.configService.get('DATABASE_HOST');
      const dbPort = this.configService.get('DATABASE_PORT') || 5432;
      const dbUser = this.configService.get('DATABASE_USERNAME');
      const dbPassword = this.configService.get('DATABASE_PASSWORD');
      const dbName = this.configService.get('DATABASE_NAME');

      // Build pg_dump command with compression
      const pgDumpCommand = `PGPASSWORD="${dbPassword}" pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} --format=custom --compress=9 -f ${localFilePath}`;

      this.logger.log(`Executing pg_dump for database: ${dbName}`);

      // Execute pg_dump
      await execAsync(pgDumpCommand);

      // Check if file was created
      if (!fs.existsSync(localFilePath)) {
        throw new Error('Backup file was not created');
      }

      // Get file stats
      const stats = fs.statSync(localFilePath);
      const fileSize = stats.size;

      this.logger.log(`Backup file created: ${fileName}, size: ${this.formatBytes(fileSize)}`);

      // Read file and upload to S3
      const fileBuffer = fs.readFileSync(localFilePath);
      const s3Url = await this.awsS3Service.uploadFile(fileBuffer, fileName, 'database-backups');

      // Get database size
      const dbSize = await this.getDatabaseSize(dbName);

      // Update backup record
      const executionTime = Date.now() - startTime;
      backup.fileName = fileName;
      backup.s3Key = `database-backups/${fileName}`;
      backup.s3Url = s3Url;
      backup.fileSize = fileSize;
      backup.status = BackupStatus.COMPLETED;
      backup.databaseSize = dbSize;
      backup.executionTime = executionTime;

      await this.backupRepository.save(backup);

      this.logger.log(`Backup completed successfully: ${backupId} in ${executionTime}ms`);

      // Cleanup local file
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
        this.logger.log(`Cleaned up local backup file: ${fileName}`);
      }

      // Cleanup old backups based on retention policy
      await this.cleanupOldBackups(backupType);
    } catch (error) {
      this.logger.error(`Backup execution failed: ${error.message}`, error.stack);

      // Update backup record to failed
      await this.backupRepository.update(backupId, {
        status: BackupStatus.FAILED,
        errorMessage: error.message,
        executionTime: Date.now() - startTime,
      });

      // Cleanup local file if exists
      if (localFilePath && fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }

      throw error;
    }
  }

  /**
   * Get database size using SQL query
   */
  private async getDatabaseSize(dbName: string): Promise<string> {
    try {
      const result = await this.backupRepository.query(
        `SELECT pg_size_pretty(pg_database_size($1)) as size`,
        [dbName]
      );
      return result[0]?.size || 'Unknown';
    } catch (error) {
      this.logger.warn(`Failed to get database size: ${error.message}`);
      return 'Unknown';
    }
  }

  /**
   * List all backups with optional filtering
   */
  async listBackups(status?: BackupStatus, type?: BackupType): Promise<DatabaseBackup[]> {
    try {
      const where: any = {};
      if (status) where.status = status;
      if (type) where.type = type;

      return await this.backupRepository.find({
        where,
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Failed to list backups: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve backups');
    }
  }

  /**
   * Get backup by ID
   */
  async getBackupById(id: string): Promise<DatabaseBackup> {
    const backup = await this.backupRepository.findOne({ where: { id } });
    if (!backup) {
      throw new NotFoundException(`Backup with ID ${id} not found`);
    }
    return backup;
  }

  /**
   * Restore database from backup
   */
  async restoreBackup(backupId: string, targetDbName?: string): Promise<DatabaseBackup> {
    this.logger.log(`Starting database restore from backup: ${backupId}`);

    const backup = await this.getBackupById(backupId);

    if (backup.status !== BackupStatus.COMPLETED) {
      throw new BadRequestException('Cannot restore from incomplete or failed backup');
    }

    let localFilePath: string | null = null;

    try {
      // Download backup from S3
      this.logger.log(`Downloading backup from S3: ${backup.s3Url}`);
      const fileBuffer = await this.awsS3Service.getFileBuffer(backup.s3Url);

      // Save to local temp file
      localFilePath = path.join(this.backupDir, `restore-${backup.fileName}`);
      fs.writeFileSync(localFilePath, fileBuffer);

      // Get database connection details
      const dbHost = this.configService.get('DATABASE_HOST');
      const dbPort = this.configService.get('DATABASE_PORT') || 5432;
      const dbUser = this.configService.get('DATABASE_USERNAME');
      const dbPassword = this.configService.get('DATABASE_PASSWORD');
      const dbName = targetDbName || this.configService.get('DATABASE_NAME');

      // WARNING: This will drop and recreate the database
      this.logger.warn(`⚠️  RESTORING DATABASE: ${dbName} - This will replace all existing data!`);

      // Build pg_restore command
      const pgRestoreCommand = `PGPASSWORD="${dbPassword}" pg_restore -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} --clean --if-exists ${localFilePath}`;

      this.logger.log(`Executing pg_restore for database: ${dbName}`);

      // Execute pg_restore
      await execAsync(pgRestoreCommand);

      this.logger.log(`Database restored successfully from backup: ${backupId}`);

      // Cleanup local file
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }

      return backup;
    } catch (error) {
      this.logger.error(`Database restore failed: ${error.message}`, error.stack);

      // Cleanup local file
      if (localFilePath && fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }

      throw new InternalServerErrorException(`Failed to restore database: ${error.message}`);
    }
  }

  /**
   * Delete a backup (marks as deleted and removes from S3)
   */
  async deleteBackup(backupId: string): Promise<void> {
    try {
      const backup = await this.getBackupById(backupId);

      // Delete from S3
      if (backup.s3Url) {
        await this.awsS3Service.deleteFile(backup.s3Url);
        this.logger.log(`Deleted backup from S3: ${backup.fileName}`);
      }

      // Mark as deleted in database
      backup.status = BackupStatus.DELETED;
      await this.backupRepository.save(backup);

      this.logger.log(`Backup marked as deleted: ${backupId}`);
    } catch (error) {
      this.logger.error(`Failed to delete backup: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to delete backup');
    }
  }

  /**
   * Get backup statistics
   */
  async getBackupStats(): Promise<any> {
    try {
      const [backups, totalBackups] = await this.backupRepository.findAndCount({
        where: { status: BackupStatus.COMPLETED },
      });

      const totalSize = backups.reduce((sum, backup) => sum + Number(backup.fileSize), 0);
      const completedBackups = await this.backupRepository.count({ where: { status: BackupStatus.COMPLETED } });
      const failedBackups = await this.backupRepository.count({ where: { status: BackupStatus.FAILED } });

      const sortedBackups = backups.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      return {
        totalBackups,
        totalSize,
        totalSizeFormatted: this.formatBytes(totalSize),
        oldestBackup: sortedBackups[0]?.createdAt || new Date(),
        latestBackup: sortedBackups[sortedBackups.length - 1]?.createdAt || new Date(),
        completedBackups,
        failedBackups,
      };
    } catch (error) {
      this.logger.error(`Failed to get backup stats: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve backup statistics');
    }
  }

  /**
   * Cleanup old backups based on retention policy
   */
  private async cleanupOldBackups(backupType: BackupType): Promise<void> {
    try {
      let retentionDays: number;

      // Set retention policy based on backup type
      switch (backupType) {
        case BackupType.SCHEDULED_DAILY:
          retentionDays = 7; // Keep daily backups for 7 days
          break;
        case BackupType.SCHEDULED_WEEKLY:
          retentionDays = 30; // Keep weekly backups for 30 days
          break;
        case BackupType.SCHEDULED_MONTHLY:
          retentionDays = 365; // Keep monthly backups for 1 year
          break;
        default:
          retentionDays = 30; // Keep manual backups for 30 days
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const oldBackups = await this.backupRepository.find({
        where: {
          type: backupType,
          status: BackupStatus.COMPLETED,
          createdAt: LessThan(cutoffDate),
        },
      });

      this.logger.log(`Found ${oldBackups.length} old ${backupType} backups to cleanup`);

      for (const backup of oldBackups) {
        await this.deleteBackup(backup.id);
      }

      if (oldBackups.length > 0) {
        this.logger.log(`Cleaned up ${oldBackups.length} old backups`);
      }
    } catch (error) {
      this.logger.error(`Failed to cleanup old backups: ${error.message}`, error.stack);
    }
  }

  /**
   * CRON JOB: Daily backup at 2 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async scheduledDailyBackup() {
    this.logger.log('🕒 Starting scheduled daily backup');
    try {
      const backup = this.backupRepository.create({
        fileName: '',
        s3Key: '',
        s3Url: '',
        fileSize: 0,
        status: BackupStatus.PENDING,
        type: BackupType.SCHEDULED_DAILY,
        description: 'Automated daily backup',
        databaseName: this.configService.get('DATABASE_NAME'),
      });

      await this.backupRepository.save(backup);
      await this.executeBackup(backup.id, BackupType.SCHEDULED_DAILY);
    } catch (error) {
      this.logger.error(`Scheduled daily backup failed: ${error.message}`, error.stack);
    }
  }

  /**
   * CRON JOB: Weekly backup every Sunday at 3 AM
   */
  @Cron(CronExpression.EVERY_WEEK)
  async scheduledWeeklyBackup() {
    this.logger.log('🕒 Starting scheduled weekly backup');
    try {
      const backup = this.backupRepository.create({
        fileName: '',
        s3Key: '',
        s3Url: '',
        fileSize: 0,
        status: BackupStatus.PENDING,
        type: BackupType.SCHEDULED_WEEKLY,
        description: 'Automated weekly backup',
        databaseName: this.configService.get('DATABASE_NAME'),
      });

      await this.backupRepository.save(backup);
      await this.executeBackup(backup.id, BackupType.SCHEDULED_WEEKLY);
    } catch (error) {
      this.logger.error(`Scheduled weekly backup failed: ${error.message}`, error.stack);
    }
  }

  /**
   * CRON JOB: Monthly backup on 1st of every month at 4 AM
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async scheduledMonthlyBackup() {
    this.logger.log('🕒 Starting scheduled monthly backup');
    try {
      const backup = this.backupRepository.create({
        fileName: '',
        s3Key: '',
        s3Url: '',
        fileSize: 0,
        status: BackupStatus.PENDING,
        type: BackupType.SCHEDULED_MONTHLY,
        description: 'Automated monthly backup',
        databaseName: this.configService.get('DATABASE_NAME'),
      });

      await this.backupRepository.save(backup);
      await this.executeBackup(backup.id, BackupType.SCHEDULED_MONTHLY);
    } catch (error) {
      this.logger.error(`Scheduled monthly backup failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Format bytes to human-readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
