import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Patch,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ChangePasswordDto, CreateCompanyDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { GetUser } from './decorators/get-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { UserRole, SubscriptionPlan } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('create-company')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createCompany(@Body() createCompanyDto: CreateCompanyDto, @GetUser() user: any) {
    return this.authService.createCompany(createCompanyDto, user.id);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@GetUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(@GetUser('id') userId: string) {
    return this.authService.refreshToken(userId);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @GetUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, changePasswordDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@GetUser() user: any) {
    return { user };
  }

  // Example of role-based endpoint
  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN)
  async adminOnlyEndpoint(@GetUser() user: any) {
    return { message: 'This is an admin-only endpoint', user };
  }

  // Example of HR manager and above endpoint
  @Get('hr-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.HR_MANAGER)
  async hrOnlyEndpoint(@GetUser() user: any) {
    return { message: 'This is an HR manager and above endpoint', user };
  }

  @Get('company')
  @UseGuards(JwtAuthGuard)
  async getCompany(@GetUser() user: any) {
    if (!user.companyId) {
      return { message: 'User is not associated with any company' };
    }
    return this.authService.getCompanyWithSubscription(user.companyId);
  }

  @Get('subscription/status')
  @UseGuards(JwtAuthGuard)
  async getSubscriptionStatus(@GetUser() user: any) {
    if (!user.companyId) {
      return { isActive: false, message: 'User is not associated with any company' };
    }
    return this.authService.checkSubscriptionStatus(user.companyId);
  }

  @Post('subscription/upgrade')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN)
  async upgradeSubscription(
    @GetUser() user: any,
    @Body('plan') plan: SubscriptionPlan,
  ) {
    if (!user.companyId) {
      throw new Error('User is not associated with any company');
    }
    return this.authService.upgradeSubscription(user.companyId, plan);
  }

  @Get('subscription/limits')
  @UseGuards(JwtAuthGuard)
  async getSubscriptionLimits(@GetUser() user: any) {
    if (!user.companyId) {
      return { message: 'User is not associated with any company' };
    }
    
    const { subscription } = await this.authService.checkSubscriptionStatus(user.companyId);
    if (!subscription) {
      return { message: 'No subscription found' };
    }

    const company = await this.authService.getCompanyWithSubscription(user.companyId);
    if (!company) {
      return { message: 'Company not found' };
    }
    
    return {
      plan: subscription.plan,
      limits: {
        jobPosts: {
          limit: subscription.jobPostLimit,
          used: company._count.jobPosts,
          remaining: subscription.jobPostLimit === -1 ? 'unlimited' : Math.max(0, subscription.jobPostLimit - company._count.jobPosts),
        },
        candidates: {
          limit: subscription.candidateLimit,
          // You can add actual count here if needed
        },
        interviews: {
          limit: subscription.interviewLimit,
          // You can add actual count here if needed
        },
      },
      status: subscription.status,
      endDate: subscription.endDate,
    };
  }
}
