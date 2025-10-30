import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationCategory } from './notification.entity';
import { NotificationSettings } from './notification-settings.entity';
import { CreateNotificationInput } from './create-notification.input';
import { UpdateNotificationSettingsInput } from './update-notification-settings.input';
import { NotificationDto } from './notification.dto';
import { NotificationSettingsDto } from './notification-settings.dto';
import { AuditService } from '../audit.service';
import { NOTIFICATION } from '../common/constants/config.constants';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationSettings)
    private notificationSettingsRepository: Repository<NotificationSettings>,
    private auditService: AuditService,
  ) {}

  async createNotification(input: CreateNotificationInput): Promise<NotificationDto> {
    const notification = this.notificationRepository.create(input);
    const savedNotification = await this.notificationRepository.save(notification);

    this.auditService.logNotificationCreation(savedNotification.userId, savedNotification.id);

    return {
      id: savedNotification.id,
      title: savedNotification.title,
      message: savedNotification.message,
      type: savedNotification.type,
      category: savedNotification.category,
      read: savedNotification.read,
      createdAt: savedNotification.createdAt,
      readAt: savedNotification.readAt,
      userId: savedNotification.userId,
      metadata: savedNotification.metadata,
    };
  }

  async findAllByUser(
    userId: string,
    options: { limit?: number; offset?: number; unreadOnly?: boolean } = {}
  ): Promise<{ notifications: NotificationDto[]; total: number }> {
    const { limit = NOTIFICATION.BATCH_FETCH_SIZE, offset = 0, unreadOnly = false } = options;

    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    if (unreadOnly) {
      queryBuilder.andWhere('notification.read = :read', { read: false });
    }

    const [notifications, total] = await queryBuilder.getManyAndCount();

    return {
      notifications: notifications.map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        category: notification.category,
        read: notification.read,
        createdAt: notification.createdAt,
        readAt: notification.readAt,
        userId: notification.userId,
        metadata: notification.metadata,
      })),
      total,
    };
  }

  async markAsRead(userId: string, notificationId: string): Promise<boolean> {
    const result = await this.notificationRepository.update(
      { id: notificationId, userId },
      { read: true, readAt: new Date() }
    );

    if (result.affected && result.affected > 0) {
      this.auditService.logNotificationRead(userId, notificationId);
    }

    return (result.affected ?? 0) > 0;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationRepository.update(
      { userId, read: false },
      { read: true, readAt: new Date() }
    );

    const affected = result.affected ?? 0;
    if (affected > 0) {
      this.auditService.logBulkNotificationRead(userId, affected);
    }

    return affected;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, read: false },
    });
  }

  async deleteNotification(userId: string, notificationId: string): Promise<boolean> {
    const result = await this.notificationRepository.delete({
      id: notificationId,
      userId,
    });

    if (result.affected && result.affected > 0) {
      this.auditService.logNotificationDeletion(userId, notificationId);
    }

    return (result.affected ?? 0) > 0;
  }

  async createSystemNotification(
    userId: string,
    title: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<NotificationDto> {
    return this.createNotification({
      userId,
      title,
      message,
      type: NotificationType.INFO,
      category: NotificationCategory.SYSTEM,
      metadata,
    });
  }

  // Utility method for creating job-related notifications
  async createJobNotification(
    userId: string,
    title: string,
    message: string,
    jobId: string
  ): Promise<NotificationDto> {
    return this.createNotification({
      userId,
      title,
      message,
      type: NotificationType.INFO,
      category: NotificationCategory.APPLICATION,
      metadata: { jobId },
    });
  }

  // ==================== NOTIFICATION SETTINGS METHODS ====================

  /**
   * Get notification settings for a user
   * Creates default settings if none exist
   * @param userId - The ID of the user
   * @returns User's notification settings
   */
  async getNotificationSettings(userId: string): Promise<NotificationSettingsDto> {
    let settings = await this.notificationSettingsRepository.findOne({
      where: { userId }
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await this.createDefaultSettings(userId);
    }

    return this.mapSettingsToDto(settings);
  }

  /**
   * Update notification settings for a user
   * Creates default settings first if none exist
   * @param userId - The ID of the user
   * @param input - The settings to update
   * @returns Updated notification settings
   */
  async updateNotificationSettings(
    userId: string,
    input: UpdateNotificationSettingsInput
  ): Promise<NotificationSettingsDto> {
    let settings = await this.notificationSettingsRepository.findOne({
      where: { userId }
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await this.createDefaultSettings(userId);
    }

    // Update only provided fields
    Object.assign(settings, input);
    
    const updated = await this.notificationSettingsRepository.save(settings);

    console.log(`⚙️ Updated notification settings for user ${userId}`);

    return this.mapSettingsToDto(updated);
  }

  /**
   * Create default notification settings for a new user
   * Called automatically when user is created or first accesses settings
   * @param userId - The ID of the user
   * @returns Created default settings
   */
  async createDefaultSettings(userId: string): Promise<NotificationSettings> {
    const settings = this.notificationSettingsRepository.create({
      userId,
      // Email defaults (all true)
      emailNotifications: true,
      emailApplicationUpdates: true,
      emailInterviewReminders: true,
      emailJobRecommendations: true,
      emailNewsletter: true,
      // SMS defaults (all false - opt-in)
      smsNotifications: false,
      smsApplicationUpdates: false,
      smsInterviewReminders: false,
      // Push defaults (all true)
      pushNotifications: true,
      pushApplicationUpdates: true,
      pushInterviewReminders: true,
      pushNewMessages: true,
      // Marketing defaults (all false - opt-in)
      marketingEmails: false,
      partnerOffers: false,
    });

    const saved = await this.notificationSettingsRepository.save(settings);

    console.log(`✨ Created default notification settings for user ${userId}`);

    return saved;
  }

  /**
   * Check if a specific notification type is enabled for a user
   * Useful for checking before sending notifications
   * @param userId - The ID of the user
   * @param type - The type of notification to check
   * @returns True if the notification type is enabled
   */
  async isNotificationEnabled(
    userId: string,
    type: 'email' | 'sms' | 'push'
  ): Promise<boolean> {
    const settings = await this.getNotificationSettings(userId);

    switch (type) {
      case 'email':
        return settings.emailNotifications;
      case 'sms':
        return settings.smsNotifications;
      case 'push':
        return settings.pushNotifications;
      default:
        return false;
    }
  }

  /**
   * Helper method to map entity to DTO
   */
  private mapSettingsToDto(settings: NotificationSettings): NotificationSettingsDto {
    return {
      id: settings.id,
      userId: settings.userId,
      emailNotifications: settings.emailNotifications,
      emailApplicationUpdates: settings.emailApplicationUpdates,
      emailInterviewReminders: settings.emailInterviewReminders,
      emailJobRecommendations: settings.emailJobRecommendations,
      emailNewsletter: settings.emailNewsletter,
      smsNotifications: settings.smsNotifications,
      smsApplicationUpdates: settings.smsApplicationUpdates,
      smsInterviewReminders: settings.smsInterviewReminders,
      pushNotifications: settings.pushNotifications,
      pushApplicationUpdates: settings.pushApplicationUpdates,
      pushInterviewReminders: settings.pushInterviewReminders,
      pushNewMessages: settings.pushNewMessages,
      marketingEmails: settings.marketingEmails,
      partnerOffers: settings.partnerOffers,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }
}