import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { 
  CreateSubscriptionDto, 
  UpdateSubscriptionDto,
  SubscriptionQueryDto 
} from './dto/subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN)
  async create(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @GetUser() user: any,
  ) {
    // For COMPANY_ADMIN, enforce that they can only create for their company
    if (user.role === UserRole.COMPANY_ADMIN) {
      if (!user.companyId) {
        throw new ForbiddenException('You must be associated with a company to create a subscription');
      }
      
      if (user.companyId !== createSubscriptionDto.companyId) {
        throw new ForbiddenException('You can only create subscriptions for your own company');
      }
    }
    
    return this.subscriptionService.create(createSubscriptionDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async findAll() {
    return this.subscriptionService.findAll();
  }

  @Get('my-company')
  @UseGuards(JwtAuthGuard)
  async findMyCompanySubscription(@GetUser() user: any) {
    if (!user.companyId) {
      throw new ForbiddenException('You must be associated with a company');
    }
    
    return this.subscriptionService.findByCompany(user.companyId);
  }
  
  @Get('company/:companyId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN)
  async findByCompany(
    @Param('companyId') companyId: string,
    @GetUser() user: any,
  ) {
    // For COMPANY_ADMIN, enforce that they can only view their company
    if (user.role === UserRole.COMPANY_ADMIN && user.companyId !== companyId) {
      throw new ForbiddenException('You can only view subscriptions for your own company');
    }
    
    return this.subscriptionService.findByCompany(companyId);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getSubscriptionStats(@GetUser() user: any) {
    if (!user.companyId) {
      throw new ForbiddenException('You must be associated with a company');
    }
    
    return this.subscriptionService.getSubscriptionStats(user.companyId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN)
  async findOne(
    @Param('id') id: string,
    @GetUser() user: any,
  ) {
    const subscription = await this.subscriptionService.findOne(id);
    
    // For COMPANY_ADMIN, enforce that they can only view their company
    if (user.role === UserRole.COMPANY_ADMIN && user.companyId !== subscription.companyId) {
      throw new ForbiddenException('You can only view subscriptions for your own company');
    }
    
    return subscription;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @GetUser() user: any,
  ) {
    const subscription = await this.subscriptionService.findOne(id);
    
    // For COMPANY_ADMIN, enforce that they can only update their company
    if (user.role === UserRole.COMPANY_ADMIN && user.companyId !== subscription.companyId) {
      throw new ForbiddenException('You can only update subscriptions for your own company');
    }
    
    return this.subscriptionService.update(id, updateSubscriptionDto);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN)
  async cancelSubscription(
    @Param('id') id: string,
    @GetUser() user: any,
  ) {
    const subscription = await this.subscriptionService.findOne(id);
    
    // For COMPANY_ADMIN, enforce that they can only cancel their company
    if (user.role === UserRole.COMPANY_ADMIN && user.companyId !== subscription.companyId) {
      throw new ForbiddenException('You can only cancel subscriptions for your own company');
    }
    
    return this.subscriptionService.cancel(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async remove(@Param('id') id: string) {
    return this.subscriptionService.remove(id);
  }
}
