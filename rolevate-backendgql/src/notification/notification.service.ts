import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationCategory } from './notification.entity';
import { CreateNotificationInput } from './create-notification.input';
import { NotificationDto } from './notification.dto';
import { AuditService } from '../audit.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
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
    const { limit = 20, offset = 0, unreadOnly = false } = options;

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
}