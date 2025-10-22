import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';

interface RequestWithUser {
  user: {
    id: string;
    email: string;
  };
}
import { NotificationService } from './notification.service';
import { CreateNotificationDto, UpdateNotificationDto, NotificationQueryDto } from './dto/notification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async create(@Request() req: RequestWithUser, @Body() createNotificationDto: CreateNotificationDto) {
    const userId = req.user.id;
    
    // Automatically set the userId from the authenticated user
    const enhancedDto = {
      ...createNotificationDto,
      userId: userId,
      // If companyId is not provided, get it from the user's profile
      companyId: createNotificationDto.companyId || await this.getUserCompanyId(userId),
    };
    
    return this.notificationService.create(enhancedDto);
  }

  private async getUserCompanyId(userId: string): Promise<string | undefined> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true }
      });
      
      return user?.companyId || undefined;
    } catch (error) {
      console.error('Error fetching user company:', error);
      return undefined;
    }
  }

  @Get()
  async findAll(@Request() req: RequestWithUser, @Query() query: NotificationQueryDto) {
    const userId = req.user.id;
    return this.notificationService.findByUser(userId, query);
  }

  @Get('my')
  async findMyNotifications(@Request() req: RequestWithUser, @Query() query: NotificationQueryDto) {
    const userId = req.user.id;
    return this.notificationService.findByUser(userId, query);
  }

  @Get('company/:companyId')
  async findByCompany(
    @Param('companyId') companyId: string,
    @Query() query: NotificationQueryDto,
  ) {
    return this.notificationService.findByCompany(companyId, query);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: RequestWithUser, @Query('companyId') companyId?: string) {
    const userId = req.user.id;
    return {
      count: await this.notificationService.getUnreadCount(userId, companyId),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.notificationService.findById(id);
  }

  @Patch('mark-all-read')
  async markAllAsRead(@Request() req: RequestWithUser, @Query('companyId') companyId?: string) {
    const userId = req.user.id;
    return this.notificationService.markAllAsRead(userId, companyId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationService.update(id, updateNotificationDto);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  @Patch(':id/unread')
  async markAsUnread(@Param('id') id: string) {
    return this.notificationService.markAsUnread(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.notificationService.remove(id);
    return { message: 'Notification deleted successfully' };
  }

  @Delete('cleanup/:days')
  async cleanup(@Param('days') days: string) {
    const daysOld = parseInt(days, 10);
    if (isNaN(daysOld) || daysOld < 1) {
      throw new Error('Days must be a positive number');
    }
    return this.notificationService.removeOldNotifications(daysOld);
  }
}