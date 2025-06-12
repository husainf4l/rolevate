import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto, UpdateNotificationDto, NotificationQueryDto } from './dto/notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async findAll(@Query() query: NotificationQueryDto) {
    return this.notificationService.findAll(query);
  }

  @Get('my-notifications')
  @UseGuards(JwtAuthGuard)
  async findMyNotifications(
    @GetUser() user: any,
    @Query() query: NotificationQueryDto,
  ) {
    return this.notificationService.findByUser(user.id, query);
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(@GetUser() user: any) {
    return this.notificationService.getUnreadCount(user.id);
  }

  @Patch('mark-all-read')
  @UseGuards(JwtAuthGuard)
  async markAllAsRead(@GetUser() user: any) {
    return this.notificationService.markAllAsRead(user.id);
  }

  @Delete('delete-all-read')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteAllRead(@GetUser() user: any) {
    return this.notificationService.deleteAllRead(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @GetUser() user: any) {
    const notification = await this.notificationService.findOne(id);
    
    // Users can only access their own notifications
    if (notification.userId !== user.id && user.role !== UserRole.SUPER_ADMIN) {
      throw new Error('Access denied to this notification');
    }
    
    return notification;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @GetUser() user: any,
  ) {
    return this.notificationService.update(id, updateNotificationDto, user.id);
  }

  @Patch(':id/mark-read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Param('id') id: string, @GetUser() user: any) {
    return this.notificationService.markAsRead(id, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @GetUser() user: any) {
    return this.notificationService.remove(id, user.id);
  }
}
