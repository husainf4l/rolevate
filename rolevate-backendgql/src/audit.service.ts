import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  logLoginAttempt(email: string, success: boolean, ip?: string) {
    this.logger.log(`Login attempt: ${email}, success: ${success}, IP: ${ip || 'unknown'}`);
  }

  logApiKeyGeneration(userId: string, keyId: string) {
    this.logger.log(`API key generated: user ${userId}, key ${keyId}`);
  }

  logApiKeyRevocation(userId: string, keyId: string) {
    this.logger.log(`API key revoked: user ${userId}, key ${keyId}`);
  }

  logUserLogin(userId: string, email: string) {
    this.logger.log(`User login: ${userId} (${email})`);
  }

  logUserRegistration(userId: string, email: string) {
    this.logger.log(`User registration: ${userId} (${email})`);
  }

  logJobCreation(userId: string, jobId: string) {
    this.logger.log(`Job created: user ${userId}, job ${jobId}`);
  }

  logNotificationCreation(userId: string, notificationId: string) {
    this.logger.log(`Notification created: user ${userId}, notification ${notificationId}`);
  }

  logNotificationRead(userId: string, notificationId: string) {
    this.logger.log(`Notification read: user ${userId}, notification ${notificationId}`);
  }

  logBulkNotificationRead(userId: string, count: number) {
    this.logger.log(`Bulk notification read: user ${userId}, count ${count}`);
  }

  logNotificationDeletion(userId: string, notificationId: string) {
    this.logger.log(`Notification deleted: user ${userId}, notification ${notificationId}`);
  }

  logRateLimitExceeded(ip?: string) {
    this.logger.warn(`Rate limit exceeded: IP ${ip || 'unknown'}`);
  }

  logInvalidApiKey(key: string, ip?: string) {
    this.logger.warn(`Invalid API key used: ${key.substring(0, 8)}..., IP: ${ip || 'unknown'}`);
  }
}