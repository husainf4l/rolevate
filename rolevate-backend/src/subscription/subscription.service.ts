import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto/subscription.dto';
import { SubscriptionPlan, SubscriptionStatus, BillingCycle, Prisma } from '@prisma/client';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSubscriptionDto: CreateSubscriptionDto) {
    const { companyId, plan, billingCycle } = createSubscriptionDto;

    // Check if company exists
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { subscription: true }
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Check if company already has a subscription
    if (company.subscription) {
      throw new BadRequestException('Company already has an active subscription');
    }

    // Set subscription limits based on plan
    const limits = this.getSubscriptionLimits(plan);
    
    // Set subscription dates
    const startDate = new Date();
    const endDate = this.calculateEndDate(startDate, billingCycle || BillingCycle.MONTHLY);
    const renewsAt = new Date(endDate);

    // Create subscription
    return this.prisma.subscription.create({
      data: {
        plan,
        status: SubscriptionStatus.ACTIVE,
        startDate,
        endDate,
        renewsAt,
        billingCycle: billingCycle || BillingCycle.MONTHLY,
        companyId,
        ...limits,
        priceAmount: createSubscriptionDto.priceAmount,
        currency: createSubscriptionDto.currency || 'USD',
        stripeCustomerId: createSubscriptionDto.stripeCustomerId,
        stripeSubscriptionId: createSubscriptionDto.stripeSubscriptionId,
        stripePriceId: createSubscriptionDto.stripePriceId
      }
    });
  }

  async findAll() {
    return this.prisma.subscription.findMany({
      include: {
        company: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        }
      }
    });
  }

  async findOne(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        }
      }
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async findByCompany(companyId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { companyId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        }
      }
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found for this company');
    }

    return subscription;
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    // Check if subscription exists
    const subscription = await this.prisma.subscription.findUnique({
      where: { id }
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // If plan is changing, update limits
    let limits = {};
    if (updateSubscriptionDto.plan) {
      limits = this.getSubscriptionLimits(updateSubscriptionDto.plan);
    }

    // If billing cycle is changing, update end date and renews at
    let dateUpdates = {};
    if (updateSubscriptionDto.billingCycle) {
      const endDate = this.calculateEndDate(
        subscription.startDate, 
        updateSubscriptionDto.billingCycle
      );
      dateUpdates = {
        endDate,
        renewsAt: new Date(endDate)
      };
    }

    // Update subscription
    return this.prisma.subscription.update({
      where: { id },
      data: {
        ...updateSubscriptionDto,
        ...limits,
        ...dateUpdates
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        }
      }
    });
  }

  async cancel(id: string) {
    // Check if subscription exists
    const subscription = await this.prisma.subscription.findUnique({
      where: { id }
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Cancel subscription
    return this.prisma.subscription.update({
      where: { id },
      data: {
        status: SubscriptionStatus.CANCELLED,
        cancelledAt: new Date()
      }
    });
  }

  async remove(id: string) {
    // Check if subscription exists
    const subscription = await this.prisma.subscription.findUnique({
      where: { id }
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Delete subscription (this should rarely be used - prefer cancel)
    return this.prisma.subscription.delete({
      where: { id }
    });
  }

  // Helper methods
  private getSubscriptionLimits(plan: SubscriptionPlan) {
    switch (plan) {
      case SubscriptionPlan.FREE:
        return {
          jobPostLimit: 5,
          candidateLimit: 100,
          interviewLimit: 50
        };
      case SubscriptionPlan.BASIC:
        return {
          jobPostLimit: 15,
          candidateLimit: 500,
          interviewLimit: 150
        };
      case SubscriptionPlan.PREMIUM:
        return {
          jobPostLimit: 50,
          candidateLimit: 2000,
          interviewLimit: 500
        };
      case SubscriptionPlan.ENTERPRISE:
        return {
          jobPostLimit: 999999, // Unlimited
          candidateLimit: 999999, // Unlimited
          interviewLimit: 999999 // Unlimited
        };
      default:
        return {
          jobPostLimit: 5,
          candidateLimit: 100,
          interviewLimit: 50
        };
    }
  }

  private calculateEndDate(startDate: Date, billingCycle: BillingCycle): Date {
    const endDate = new Date(startDate);
    
    switch (billingCycle) {
      case BillingCycle.MONTHLY:
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case BillingCycle.QUARTERLY:
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case BillingCycle.YEARLY:
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      default:
        endDate.setMonth(endDate.getMonth() + 1);
    }

    return endDate;
  }

  // Method to validate subscription for features
  async canUseFeature(companyId: string, feature: string): Promise<boolean> {
    // Find company subscription
    const subscription = await this.prisma.subscription.findUnique({
      where: { companyId }
    });

    if (!subscription) {
      return false;
    }

    // Check if subscription is active
    if (
      subscription.status !== SubscriptionStatus.ACTIVE && 
      subscription.status !== SubscriptionStatus.TRIALING
    ) {
      return false;
    }

    // Check if subscription has expired
    if (subscription.endDate < new Date()) {
      return false;
    }

    // Check feature-specific limits
    switch (feature) {
      case 'createJobPost':
        // Count current job posts
        const jobPostCount = await this.prisma.jobPost.count({
          where: { 
            companyId,
            isActive: true
          }
        });
        return jobPostCount < subscription.jobPostLimit;
      
      case 'createCandidate':
        // Count current candidates
        const candidateCount = await this.prisma.$queryRaw<[{count: string}]>`
          SELECT COUNT(DISTINCT "candidateId") as count
          FROM "applications" 
          WHERE "jobPostId" IN (
            SELECT id FROM "job_posts" WHERE "companyId" = ${companyId}
          )
        `;
        return Number(candidateCount[0].count) < subscription.candidateLimit;
      
      case 'createInterview':
        // Count interviews this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const interviewCount = await this.prisma.$queryRaw<[{count: string}]>`
          SELECT COUNT(*) as count
          FROM "interviews" i
          JOIN "applications" a ON i."applicationId" = a.id
          JOIN "job_posts" j ON a."jobPostId" = j.id
          WHERE j."companyId" = ${companyId}
          AND i."scheduledAt" >= ${startOfMonth}
        `;
        return Number(interviewCount[0].count) < subscription.interviewLimit;
      
      default:
        return true;
    }
  }

  // Method to check limits and stats
  async getSubscriptionStats(companyId: string) {
    // Find company subscription
    const subscription = await this.prisma.subscription.findUnique({
      where: { companyId }
    });

    if (!subscription) {
      throw new NotFoundException('No subscription found for this company');
    }

    // Count current job posts
    const jobPosts = await this.prisma.jobPost.count({
      where: { 
        companyId,
        isActive: true
      }
    });

    // Count current candidates
    const candidatesResult = await this.prisma.$queryRaw<[{count: string}]>`
      SELECT COUNT(DISTINCT "candidateId") as count
      FROM "applications" 
      WHERE "jobPostId" IN (
        SELECT id FROM "job_posts" WHERE "companyId" = ${companyId}
      )
    `;
    const candidates = Number(candidatesResult[0].count);

    // Count interviews this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const interviewsResult = await this.prisma.$queryRaw<[{count: string}]>`
      SELECT COUNT(*) as count
      FROM "interviews" i
      JOIN "applications" a ON i."applicationId" = a.id
      JOIN "job_posts" j ON a."jobPostId" = j.id
      WHERE j."companyId" = ${companyId}
      AND i."scheduledAt" >= ${startOfMonth}
    `;
    const interviews = Number(interviewsResult[0].count);

    return {
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        renewsAt: subscription.renewsAt,
        cancelledAt: subscription.cancelledAt,
        billingCycle: subscription.billingCycle
      },
      limits: {
        jobPosts: {
          used: jobPosts,
          limit: subscription.jobPostLimit,
          percent: (jobPosts / subscription.jobPostLimit) * 100
        },
        candidates: {
          used: candidates,
          limit: subscription.candidateLimit,
          percent: (candidates / subscription.candidateLimit) * 100
        },
        interviews: {
          used: interviews,
          limit: subscription.interviewLimit,
          percent: (interviews / subscription.interviewLimit) * 100
        }
      },
      isActive: subscription.status === SubscriptionStatus.ACTIVE || 
                subscription.status === SubscriptionStatus.TRIALING,
      daysRemaining: Math.ceil((subscription.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    };
  }
}
