import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationDto } from './notification.dto';
import { NotificationSettingsDto } from './notification-settings.dto';
import { CreateNotificationInput } from './create-notification.input';
import { UpdateNotificationSettingsInput } from './update-notification-settings.input';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Resolver(() => NotificationDto)
export class NotificationResolver {
  constructor(private notificationService: NotificationService) {}

  @Mutation(() => NotificationDto)
  @UseGuards(JwtAuthGuard) // Only authenticated users can create notifications (admin/system)
  async createNotification(
    @Args('input') input: CreateNotificationInput,
    @Context() _context: any,
  ): Promise<NotificationDto> {
    // In production, check if user has admin role
    return this.notificationService.createNotification(input);
  }

  @Query(() => [NotificationDto])
  @UseGuards(JwtAuthGuard)
  async myNotifications(
    @Context() context: any,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Args('unreadOnly', { type: () => Boolean, nullable: true }) unreadOnly?: boolean,
  ): Promise<NotificationDto[]> {
    const userId = context.req.user.id;
    const result = await this.notificationService.findAllByUser(userId, { limit, offset, unreadOnly });
    return result.notifications;
  }

  @Query(() => Int)
  @UseGuards(JwtAuthGuard)
  async unreadNotificationCount(@Context() context: any): Promise<number> {
    const userId = context.req.user.id;
    return this.notificationService.getUnreadCount(userId);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async markNotificationAsRead(
    @Args('notificationId') notificationId: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.req.user.id;
    return this.notificationService.markAsRead(userId, notificationId);
  }

  @Mutation(() => Int)
  @UseGuards(JwtAuthGuard)
  async markAllNotificationsAsRead(@Context() context: any): Promise<number> {
    const userId = context.req.user.id;
    return this.notificationService.markAllAsRead(userId);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteNotification(
    @Args('notificationId') notificationId: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.req.user.id;
    return this.notificationService.deleteNotification(userId, notificationId);
  }

  // ==================== NOTIFICATION SETTINGS ====================

  /**
   * Get the current user's notification settings
   * Creates default settings if none exist
   */
  @Query(() => NotificationSettingsDto, {
    description: 'Get your notification preferences'
  })
  @UseGuards(JwtAuthGuard)
  async notificationSettings(
    @Context() context: any,
  ): Promise<NotificationSettingsDto> {
    const userId = context.req.user.id;
    return this.notificationService.getNotificationSettings(userId);
  }

  /**
   * Update the current user's notification settings
   * Only updates the fields that are provided
   */
  @Mutation(() => NotificationSettingsDto, {
    description: 'Update your notification preferences'
  })
  @UseGuards(JwtAuthGuard)
  async updateNotificationSettings(
    @Args('input') input: UpdateNotificationSettingsInput,
    @Context() context: any,
  ): Promise<NotificationSettingsDto> {
    const userId = context.req.user.id;
    return this.notificationService.updateNotificationSettings(userId, input);
  }
}