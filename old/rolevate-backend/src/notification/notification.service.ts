import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto, UpdateNotificationDto, NotificationQueryDto } from './dto/notification.dto';
import { Notification } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        type: createNotificationDto.type,
        category: createNotificationDto.category,
        title: createNotificationDto.title,
        message: createNotificationDto.message,
        actionUrl: createNotificationDto.actionUrl,
        metadata: createNotificationDto.metadata,
        userId: createNotificationDto.userId,
        companyId: createNotificationDto.companyId,
      },
    });
  }

  async findAll(query: NotificationQueryDto = {}): Promise<Notification[]> {
    const where: any = {};

    if (query.type) where.type = query.type;
    if (query.category) where.category = query.category;
    if (typeof query.read === 'boolean') where.read = query.read;
    if (query.userId) where.userId = query.userId;
    if (query.companyId) where.companyId = query.companyId;

    return this.prisma.notification.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<Notification> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async findByUser(userId: string, query: NotificationQueryDto = {}): Promise<Notification[]> {
    const where: any = { userId };

    if (query.type) where.type = query.type;
    if (query.category) where.category = query.category;
    if (typeof query.read === 'boolean') where.read = query.read;

    return this.prisma.notification.findMany({
      where,
      orderBy: { timestamp: 'desc' },
    });
  }

  async findByCompany(companyId: string, query: NotificationQueryDto = {}): Promise<Notification[]> {
    const where: any = { companyId };

    if (query.type) where.type = query.type;
    if (query.category) where.category = query.category;
    if (typeof query.read === 'boolean') where.read = query.read;

    return this.prisma.notification.findMany({
      where,
      orderBy: { timestamp: 'desc' },
    });
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const existingNotification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!existingNotification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        ...updateNotificationDto,
      },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.update(id, { read: true });
  }

  async markAsUnread(id: string): Promise<Notification> {
    return this.update(id, { read: false });
  }

  async markAllAsRead(userId?: string, companyId?: string): Promise<{ count: number }> {
    if (!userId && !companyId) {
      throw new BadRequestException('Either userId or companyId must be provided');
    }

    const where: any = { read: false };
    if (userId) where.userId = userId;
    if (companyId) where.companyId = companyId;

    const result = await this.prisma.notification.updateMany({
      where,
      data: { read: true },
    });

    return { count: result.count };
  }

  async remove(id: string): Promise<void> {
    const existingNotification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!existingNotification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    await this.prisma.notification.delete({
      where: { id },
    });
  }

  async getUnreadCount(userId?: string, companyId?: string): Promise<number> {
    const where: any = { read: false };
    if (userId) where.userId = userId;
    if (companyId) where.companyId = companyId;

    return this.prisma.notification.count({
      where,
    });
  }

  async removeOldNotifications(daysOld: number = 30): Promise<{ count: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        read: true,
      },
    });

    return { count: result.count };
  }
}