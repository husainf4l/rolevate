import { Injectable, UnauthorizedException, ConflictException, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, ChangePasswordDto, CreateCompanyDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { User, UserRole, Company, Subscription, SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { AuthSubscriptionAdapter } from './auth-subscription.service';

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  role: UserRole;
  companyId?: string;
}

export interface AuthResult {
  access_token: string;
  user: Omit<User, 'password'>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => AuthSubscriptionAdapter))
    private readonly subscriptionAdapter?: AuthSubscriptionAdapter,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResult> {
    const { email, username, password, role = UserRole.RECRUITER, createCompany, companyData, companyId, ...userData } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email already exists');
      }
      if (existingUser.username === username) {
        throw new ConflictException('Username already exists');
      }
    }

    // Validate company connection/creation logic
    if (createCompany && companyId) {
      throw new BadRequestException('Cannot both create a company and connect to an existing one');
    }

    if (createCompany && !companyData) {
      throw new BadRequestException('Company data is required when creating a new company');
    }

    if (companyId) {
      // Verify the company exists
      const company = await this.prisma.company.findUnique({
        where: { id: companyId },
        include: { subscription: true },
      });

      if (!company) {
        throw new BadRequestException('Company not found');
      }

      if (!company.subscription || company.subscription.status !== SubscriptionStatus.ACTIVE) {
        throw new BadRequestException('Company does not have an active subscription');
      }
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Use transaction to ensure atomicity
    const result = await this.prisma.$transaction(async (tx) => {
      let finalCompanyId = companyId;

      // Create company if requested
      if (createCompany && companyData) {
        // Check if company name already exists
        const existingCompany = await tx.company.findUnique({
          where: { name: companyData.name },
        });

        if (existingCompany) {
          throw new ConflictException('Company name already exists');
        }

        // Create the company
        const newCompany = await tx.company.create({
          data: {
            name: companyData.name,
            displayName: companyData.displayName,
            industry: companyData.industry,
            description: companyData.description,
            website: companyData.website,
            location: companyData.location,
            country: companyData.country,
            city: companyData.city,
            size: companyData.size,
          },
        });

        finalCompanyId = newCompany.id;

        // Create subscription for the new company
        const subscriptionPlan = companyData.subscriptionPlan || SubscriptionPlan.FREE;
        const now = new Date();
        const endDate = new Date();
        
        // Set subscription duration based on plan
        switch (subscriptionPlan) {
          case SubscriptionPlan.FREE:
            endDate.setFullYear(endDate.getFullYear() + 10); // Long-term free
            break;
          case SubscriptionPlan.BASIC:
            endDate.setMonth(endDate.getMonth() + 1); // 1 month
            break;
          case SubscriptionPlan.PREMIUM:
            endDate.setMonth(endDate.getMonth() + 1); // 1 month
            break;
          case SubscriptionPlan.ENTERPRISE:
            endDate.setFullYear(endDate.getFullYear() + 1); // 1 year
            break;
        }

        // Set limits based on subscription plan
        const limits = this.getSubscriptionLimits(subscriptionPlan);

        await tx.subscription.create({
          data: {
            companyId: finalCompanyId,
            plan: subscriptionPlan,
            status: SubscriptionStatus.ACTIVE,
            startDate: now,
            endDate: endDate,
            jobPostLimit: limits.jobPostLimit,
            candidateLimit: limits.candidateLimit,
            interviewLimit: limits.interviewLimit,
          },
        });
      }

      // Create user
      const user = await tx.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          role,
          companyId: finalCompanyId,
          ...userData,
        },
        include: {
          company: {
            include: {
              subscription: true,
            },
          },
        },
      });

      return user;
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = result;

    // Generate JWT token
    const payload: JwtPayload = {
      sub: result.id,
      email: result.email,
      username: result.username,
      role: result.role,
      companyId: result.companyId ?? undefined,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  private getSubscriptionLimits(plan: SubscriptionPlan) {
    switch (plan) {
      case SubscriptionPlan.FREE:
        return {
          jobPostLimit: 3,
          candidateLimit: 50,
          interviewLimit: 20,
        };
      case SubscriptionPlan.BASIC:
        return {
          jobPostLimit: 10,
          candidateLimit: 200,
          interviewLimit: 100,
        };
      case SubscriptionPlan.PREMIUM:
        return {
          jobPostLimit: 50,
          candidateLimit: 1000,
          interviewLimit: 500,
        };
      case SubscriptionPlan.ENTERPRISE:
        return {
          jobPostLimit: -1, // Unlimited
          candidateLimit: -1, // Unlimited
          interviewLimit: -1, // Unlimited
        };
      default:
        return {
          jobPostLimit: 3,
          candidateLimit: 50,
          interviewLimit: 20,
        };
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResult> {
    const { emailOrUsername, password } = loginDto;

    // Find user by email or username with company and subscription
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername },
          { username: emailOrUsername },
        ],
        isActive: true,
      },
      include: {
        company: {
          include: {
            subscription: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user's company has an active subscription (if user belongs to a company)
    if (user.company) {
      if (!user.company.subscription || user.company.subscription.status !== SubscriptionStatus.ACTIVE) {
        throw new UnauthorizedException('Company subscription is not active');
      }

      // Check if subscription has expired
      if (user.company.subscription.endDate < new Date()) {
        await this.prisma.subscription.update({
          where: { companyId: user.company.id },
          data: { status: SubscriptionStatus.EXPIRED },
        });
        throw new UnauthorizedException('Company subscription has expired');
      }
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      companyId: user.companyId ?? undefined,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  async validateUser(payload: JwtPayload): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { 
        id: payload.sub,
        isActive: true,
      },
    });

    if (!user) {
      return null;
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    // Get user with password
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async createCompany(createCompanyDto: CreateCompanyDto, userId?: string): Promise<Company> {
    // Check if company name already exists
    const existingCompany = await this.prisma.company.findUnique({
      where: { name: createCompanyDto.name },
    });

    if (existingCompany) {
      throw new ConflictException('Company name already exists');
    }

    // Use transaction to ensure atomicity
    return this.prisma.$transaction(async (tx) => {
      // Create the company
      const newCompany = await tx.company.create({
        data: {
          name: createCompanyDto.name,
          displayName: createCompanyDto.displayName,
          industry: createCompanyDto.industry,
          description: createCompanyDto.description,
          website: createCompanyDto.website,
          location: createCompanyDto.location,
          country: createCompanyDto.country,
          city: createCompanyDto.city,
          size: createCompanyDto.size,
        },
        include: {
          subscription: true,
          _count: {
            select: {
              users: true,
              jobPosts: true,
            },
          },
        },
      });

      // Create subscription for the new company
      const subscriptionPlan = createCompanyDto.subscriptionPlan || SubscriptionPlan.FREE;
      const now = new Date();
      const endDate = new Date();
      
      // Set subscription duration based on plan
      switch (subscriptionPlan) {
        case SubscriptionPlan.FREE:
          endDate.setFullYear(endDate.getFullYear() + 10); // Long-term free
          break;
        case SubscriptionPlan.BASIC:
          endDate.setMonth(endDate.getMonth() + 1); // 1 month
          break;
        case SubscriptionPlan.PREMIUM:
          endDate.setMonth(endDate.getMonth() + 1); // 1 month
          break;
        case SubscriptionPlan.ENTERPRISE:
          endDate.setFullYear(endDate.getFullYear() + 1); // 1 year
          break;
      }

      // Set limits based on subscription plan
      const limits = this.getSubscriptionLimits(subscriptionPlan);

      await tx.subscription.create({
        data: {
          companyId: newCompany.id,
          plan: subscriptionPlan,
          status: SubscriptionStatus.ACTIVE,
          startDate: now,
          endDate: endDate,
          jobPostLimit: limits.jobPostLimit,
          candidateLimit: limits.candidateLimit,
          interviewLimit: limits.interviewLimit,
        },
      });

      // Assign the user who created the company to the company (if userId is provided)
      if (userId) {
        await tx.user.update({
          where: { id: userId },
          data: { companyId: newCompany.id },
        });
      }

      return newCompany;
    });
  }

  async getProfile(userId: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { 
        id: userId,
        isActive: true,
      },
      include: {
        company: {
          include: {
            subscription: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async refreshToken(userId: string): Promise<{ access_token: string }> {
    const user = await this.prisma.user.findUnique({
      where: { 
        id: userId,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate new JWT token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      companyId: user.companyId ?? undefined,
    };

    const access_token = this.jwtService.sign(payload);

    return { access_token };
  }

  async checkSubscriptionStatus(companyId: string): Promise<{ isActive: boolean; subscription?: Subscription }> {
    // Use adapter if available, otherwise fall back to original implementation
    if (this.subscriptionAdapter) {
      return this.subscriptionAdapter.checkSubscriptionStatus(companyId);
    }

    // Legacy implementation (can be removed once adapter is fully integrated)
    const subscription = await this.prisma.subscription.findUnique({
      where: { companyId },
    });

    if (!subscription) {
      return { isActive: false };
    }

    // Check if subscription has expired
    if (subscription.endDate < new Date() && subscription.status === SubscriptionStatus.ACTIVE) {
      await this.prisma.subscription.update({
        where: { companyId },
        data: { status: SubscriptionStatus.EXPIRED },
      });
      return { isActive: false, subscription: { ...subscription, status: SubscriptionStatus.EXPIRED } };
    }

    const isActive = subscription.status === SubscriptionStatus.ACTIVE;
    return { isActive, subscription };
  }

  async getCompanyWithSubscription(companyId: string) {
    return this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        subscription: true,
        users: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            createdAt: true,
            lastLoginAt: true,
          },
        },
        _count: {
          select: {
            jobPosts: true,
            users: true,
          },
        },
      },
    });
  }

  async canCreateJobPost(companyId: string): Promise<boolean> {
    // Use adapter if available, otherwise fall back to original implementation
    if (this.subscriptionAdapter) {
      return this.subscriptionAdapter.canCreateJobPost(companyId);
    }
    
    // Legacy implementation (can be removed once adapter is fully integrated)
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        subscription: true,
        _count: {
          select: { jobPosts: { where: { isActive: true } } },
        },
      },
    });

    if (!company?.subscription || company.subscription.status !== SubscriptionStatus.ACTIVE) {
      return false;
    }

    // Check if unlimited (-1) or within limits
    return company.subscription.jobPostLimit === -1 || 
           company._count.jobPosts < company.subscription.jobPostLimit;
  }

  async canProcessInterview(companyId: string): Promise<boolean> {
    // Use adapter if available, otherwise fall back to original implementation
    if (this.subscriptionAdapter) {
      return this.subscriptionAdapter.canProcessInterview(companyId);
    }
    
    // Legacy implementation (can be removed once adapter is fully integrated)
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        subscription: true,
      },
    });

    if (!company?.subscription || company.subscription.status !== SubscriptionStatus.ACTIVE) {
      return false;
    }

    // For interview limits, you might want to count interviews in the current billing period
    // For simplicity, we'll just check the subscription status
    return true;
  }

  async upgradeSubscription(companyId: string, newPlan: SubscriptionPlan): Promise<Subscription> {
    const limits = this.getSubscriptionLimits(newPlan);
    const now = new Date();
    const endDate = new Date();

    // Set new end date based on plan
    switch (newPlan) {
      case SubscriptionPlan.BASIC:
      case SubscriptionPlan.PREMIUM:
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case SubscriptionPlan.ENTERPRISE:
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      default:
        endDate.setFullYear(endDate.getFullYear() + 10);
        break;
    }

    return this.prisma.subscription.upsert({
      where: { companyId },
      update: {
        plan: newPlan,
        status: SubscriptionStatus.ACTIVE,
        endDate,
        jobPostLimit: limits.jobPostLimit,
        candidateLimit: limits.candidateLimit,
        interviewLimit: limits.interviewLimit,
        updatedAt: now,
      },
      create: {
        companyId,
        plan: newPlan,
        status: SubscriptionStatus.ACTIVE,
        startDate: now,
        endDate,
        jobPostLimit: limits.jobPostLimit,
        candidateLimit: limits.candidateLimit,
        interviewLimit: limits.interviewLimit,
      },
    });
  }
}
