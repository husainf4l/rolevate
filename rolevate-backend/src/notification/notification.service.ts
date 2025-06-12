import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto, UpdateNotificationDto, NotificationQueryDto } from './dto/notification.dto';
import { Notification, Prisma, NotificationType } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: createNotificationDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.notification.create({
      data: {
        ...createNotificationDto,
        createdAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(query: NotificationQueryDto) {
    const {
      search,
      type,
      isRead,
      userId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const whereConditions: Prisma.NotificationWhereInput[] = [];

    if (type) {
      whereConditions.push({ type });
    }

    if (isRead !== undefined) {
      whereConditions.push({ isRead });
    }

    if (userId) {
      whereConditions.push({ userId });
    }

    if (search) {
      whereConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { message: { contains: search, mode: 'insensitive' } },
          {
            user: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        ],
      });
    }

    const where: Prisma.NotificationWhereInput =
      whereConditions.length > 0 ? { AND: whereConditions } : {};

    const total = await this.prisma.notification.count({ where });

    const notifications = await this.prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async findByUser(userId: string, query: NotificationQueryDto) {
    return this.findAll({ ...query, userId });
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto, userId?: string): Promise<Notification> {
    const existingNotification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!existingNotification) {
      throw new NotFoundException('Notification not found');
    }

    // If userId is provided, verify the notification belongs to the user
    if (userId && existingNotification.userId !== userId) {
      throw new ForbiddenException('Access denied to this notification');
    }

    return this.prisma.notification.update({
      where: { id },
      data: updateNotificationDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId?: string): Promise<{ message: string }> {
    const existingNotification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!existingNotification) {
      throw new NotFoundException('Notification not found');
    }

    // If userId is provided, verify the notification belongs to the user
    if (userId && existingNotification.userId !== userId) {
      throw new ForbiddenException('Access denied to this notification');
    }

    await this.prisma.notification.delete({
      where: { id },
    });

    return { message: 'Notification deleted successfully' };
  }

  async markAsRead(id: string, userId?: string): Promise<Notification> {
    return this.update(id, { isRead: true }, userId);
  }

  async markAllAsRead(userId: string): Promise<{ message: string; updated: number }> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return {
      message: 'All notifications marked as read',
      updated: result.count,
    };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return { count };
  }

  async deleteAllRead(userId: string): Promise<{ message: string; deleted: number }> {
    const result = await this.prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true,
      },
    });

    return {
      message: 'All read notifications deleted',
      deleted: result.count,
    };
  }

  // Helper methods for creating specific notification types
  async createJobApplicationNotification(
    userId: string,
    candidateName: string,
    jobTitle: string,
    applicationId: string,
  ): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.APPLICATION_RECEIVED,
      title: 'New Job Application',
      message: `${candidateName} has applied for ${jobTitle}`,
      applicationId: applicationId,
    });
  }

  async createInterviewScheduledNotification(
    userId: string,
    candidateName: string,
    jobTitle: string,
    interviewId: string,
    scheduledAt: Date,
  ): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.INTERVIEW_SCHEDULED,
      title: 'Interview Scheduled',
      message: `Interview with ${candidateName} for ${jobTitle} scheduled for ${scheduledAt.toLocaleDateString()}`,
    });
  }

  async createInterviewCompletedNotification(
    userId: string,
    candidateName: string,
    jobTitle: string,
    interviewId: string,
  ): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.INTERVIEW_COMPLETED,
      title: 'Interview Completed',
      message: `Interview with ${candidateName} for ${jobTitle} has been completed`,
    });
  }

  async createCvAnalysisNotification(
    userId: string,
    candidateName: string,
    score: number,
    analysisId: string,
  ): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.CV_ANALYZED,
      title: 'CV Analysis Completed',
      message: `CV analysis for ${candidateName} completed with score: ${score}%`,
    });
  }
}
