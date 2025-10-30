import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { AuditLog, AuditAction } from './common/entities/audit-log.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Create an audit log entry
   */
  private async createAuditLog(
    action: AuditAction,
    userId?: string,
    userEmail?: string,
    resourceType?: string,
    resourceId?: string,
    description?: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
  ): Promise<void> {
    try {
      const auditLog = this.auditLogRepository.create({
        action,
        userId,
        userEmail,
        resourceType,
        resourceId,
        description,
        metadata,
        ipAddress,
        isSystemAction: !userId,
      });

      await this.auditLogRepository.save(auditLog);
      this.logger.log(`Audit log created: ${action} by ${userEmail || userId || 'system'}`);
    } catch (error) {
      // Don't let audit logging failures break the application
      this.logger.error(`Failed to create audit log: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Clean up old audit logs (runs daily at 2 AM)
   * Default retention: 90 days
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOldAuditLogs(): Promise<void> {
    const retentionDays = parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '90', 10);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
      const result = await this.auditLogRepository.delete({
        createdAt: LessThan(cutoffDate),
      });

      const deletedCount = result.affected || 0;
      if (deletedCount > 0) {
        this.logger.log(`Cleaned up ${deletedCount} old audit logs (older than ${retentionDays} days)`);
      }
    } catch (error) {
      this.logger.error(`Failed to cleanup old audit logs: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async logLoginAttempt(email: string, success: boolean, ip?: string) {
    const action = success ? AuditAction.LOGIN_SUCCESS : AuditAction.LOGIN_FAILURE;
    await this.createAuditLog(
      action,
      undefined,
      email,
      'user',
      undefined,
      `Login attempt: ${success ? 'successful' : 'failed'}`,
      { success },
      ip,
    );
  }

  async logApiKeyGeneration(userId: string, keyId: string) {
    await this.createAuditLog(
      AuditAction.API_KEY_GENERATED,
      userId,
      undefined,
      'api_key',
      keyId,
      'API key generated',
    );
  }

  async logApiKeyRevocation(userId: string, keyId: string) {
    await this.createAuditLog(
      AuditAction.API_KEY_REVOKED,
      userId,
      undefined,
      'api_key',
      keyId,
      'API key revoked',
    );
  }

  async logUserLogin(userId: string, email: string) {
    await this.createAuditLog(
      AuditAction.LOGIN_SUCCESS,
      userId,
      email,
      'user',
      userId,
      'User logged in',
    );
  }

  async logUserLogout(userId: string, email: string) {
    await this.createAuditLog(
      AuditAction.LOGOUT,
      userId,
      email,
      'user',
      userId,
      'User logged out',
    );
  }

  async logUserRegistration(userId: string, email: string) {
    await this.createAuditLog(
      AuditAction.USER_CREATED,
      userId,
      email,
      'user',
      userId,
      'User registered',
    );
  }

  async logJobCreation(userId: string, jobId: string) {
    await this.createAuditLog(
      AuditAction.JOB_CREATED,
      userId,
      undefined,
      'job',
      jobId,
      'Job created',
    );
  }

  async logNotificationCreation(userId: string, notificationId: string) {
    await this.createAuditLog(
      AuditAction.NOTIFICATION_CREATED,
      userId,
      undefined,
      'notification',
      notificationId,
      'Notification created',
    );
  }

  async logNotificationRead(userId: string, notificationId: string) {
    await this.createAuditLog(
      AuditAction.NOTIFICATION_READ,
      userId,
      undefined,
      'notification',
      notificationId,
      'Notification read',
    );
  }

  async logBulkNotificationRead(userId: string, count: number) {
    await this.createAuditLog(
      AuditAction.BULK_NOTIFICATION_READ,
      userId,
      undefined,
      'notification',
      undefined,
      `Bulk notification read: ${count} notifications`,
      { count },
    );
  }

  async logNotificationDeletion(userId: string, notificationId: string) {
    await this.createAuditLog(
      AuditAction.NOTIFICATION_DELETED,
      userId,
      undefined,
      'notification',
      notificationId,
      'Notification deleted',
    );
  }

  async logInvalidApiKey(key: string, ip?: string) {
    await this.createAuditLog(
      AuditAction.API_KEY_INVALID,
      undefined,
      undefined,
      'api_key',
      undefined,
      'Invalid API key used',
      { keyPrefix: key.substring(0, 8) },
      ip,
    );
  }

  async logApplicationCreation(userId: string, applicationId: string, jobId: string) {
    await this.createAuditLog(
      AuditAction.APPLICATION_CREATED,
      userId,
      undefined,
      'application',
      applicationId,
      'Application created',
      { jobId },
    );
  }

  async logApplicationStatusChange(userId: string, applicationId: string, oldStatus: string, newStatus: string) {
    await this.createAuditLog(
      AuditAction.APPLICATION_STATUS_CHANGED,
      userId,
      undefined,
      'application',
      applicationId,
      `Application status changed: ${oldStatus} -> ${newStatus}`,
      { oldStatus, newStatus },
    );
  }

  async logApplicationUpdate(userId: string, applicationId: string) {
    await this.createAuditLog(
      AuditAction.APPLICATION_UPDATED,
      userId,
      undefined,
      'application',
      applicationId,
      'Application updated',
    );
  }

  async logApplicationDeletion(userId: string, applicationId: string) {
    await this.createAuditLog(
      AuditAction.APPLICATION_DELETED,
      userId,
      undefined,
      'application',
      applicationId,
      'Application deleted',
    );
  }

  async logApplicationNoteCreation(userId: string, noteId: string, applicationId: string) {
    await this.createAuditLog(
      AuditAction.APPLICATION_NOTE_CREATED,
      userId,
      undefined,
      'application_note',
      noteId,
      'Application note created',
      { applicationId },
    );
  }

  async logApplicationNoteUpdate(userId: string, noteId: string, applicationId: string) {
    await this.createAuditLog(
      AuditAction.APPLICATION_NOTE_UPDATED,
      userId,
      undefined,
      'application_note',
      noteId,
      'Application note updated',
      { applicationId },
    );
  }

  async logApplicationNoteDeletion(userId: string, noteId: string, applicationId: string) {
    await this.createAuditLog(
      AuditAction.APPLICATION_NOTE_DELETED,
      userId,
      undefined,
      'application_note',
      noteId,
      'Application note deleted',
      { applicationId },
    );
  }

  async logUnauthorizedAccess(userId: string, resource: string, attemptedAction: string) {
    await this.createAuditLog(
      AuditAction.UNAUTHORIZED_ACCESS,
      userId,
      undefined,
      'security',
      resource,
      `Unauthorized access attempt: ${attemptedAction}`,
      { resource, attemptedAction },
    );
  }

  async logPasswordResetRequest(email: string, ip?: string) {
    await this.createAuditLog(
      AuditAction.PASSWORD_RESET_REQUEST,
      undefined,
      email,
      'authentication',
      'password_reset',
      'Password reset requested',
      { email, ip },
    );
  }

  async logJobUpdate(userId: string, jobId: string) {
    await this.createAuditLog(
      AuditAction.JOB_UPDATED,
      userId,
      undefined,
      'job',
      jobId,
      'Job updated',
    );
  }

  async logJobDeletion(userId: string, jobId: string) {
    await this.createAuditLog(
      AuditAction.JOB_DELETED,
      userId,
      undefined,
      'job',
      jobId,
      'Job deleted',
    );
  }

  // Security Event Tracking
  async logSecurityEvent(
    eventType: 'rate_limit_exceeded' | 'suspicious_activity' | 'brute_force_detected' | 'invalid_token' | 'csrf_attempt',
    userId?: string,
    ipAddress?: string,
    metadata?: Record<string, any>,
  ) {
    await this.createAuditLog(
      AuditAction.SECURITY_EVENT,
      userId,
      undefined,
      'security',
      eventType,
      `Security event: ${eventType}`,
      { eventType, ...metadata },
      ipAddress,
    );
  }

  async logRateLimitExceeded(ipAddress: string, endpoint: string, userId?: string) {
    await this.logSecurityEvent(
      'rate_limit_exceeded',
      userId,
      ipAddress,
      { endpoint, timestamp: new Date().toISOString() },
    );
  }

  async logSuspiciousActivity(userId: string, activityType: string, ipAddress?: string, metadata?: Record<string, any>) {
    await this.logSecurityEvent(
      'suspicious_activity',
      userId,
      ipAddress,
      { activityType, ...metadata },
    );
  }

  async logBruteForceAttempt(email: string, ipAddress: string, attemptCount: number) {
    await this.logSecurityEvent(
      'brute_force_detected',
      undefined,
      ipAddress,
      { email, attemptCount, timestamp: new Date().toISOString() },
    );
  }

  async logInvalidToken(ipAddress: string, tokenType: string, userId?: string) {
    await this.logSecurityEvent(
      'invalid_token',
      userId,
      ipAddress,
      { tokenType, timestamp: new Date().toISOString() },
    );
  }

  async logDataExport(userId: string, dataType: string, recordCount: number) {
    await this.createAuditLog(
      AuditAction.DATA_EXPORT,
      userId,
      undefined,
      'data',
      dataType,
      `Data exported: ${dataType}`,
      { recordCount, timestamp: new Date().toISOString() },
    );
  }

  async logDataDeletion(userId: string, dataType: string, recordCount: number, reason?: string) {
    await this.createAuditLog(
      AuditAction.DATA_DELETION,
      userId,
      undefined,
      'data',
      dataType,
      `Data deleted: ${dataType}`,
      { recordCount, reason, timestamp: new Date().toISOString() },
    );
  }

  async logConfigChange(userId: string, configKey: string, oldValue: any, newValue: any) {
    await this.createAuditLog(
      AuditAction.CONFIG_CHANGE,
      userId,
      undefined,
      'configuration',
      configKey,
      `Configuration changed: ${configKey}`,
      { oldValue, newValue, timestamp: new Date().toISOString() },
    );
  }
}
