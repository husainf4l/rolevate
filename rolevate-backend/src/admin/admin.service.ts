import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { NotificationService } from '../notification/notification.service';
import { SecurityService } from '../security/security.service';
import { UserType } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
    private notificationService: NotificationService,
    private securityService: SecurityService,
  ) {}

  // User Management Methods
  // TODO: Implement getUserManagement methods
  // - getAllUsers()
  // - getUserById()
  // - updateUserStatus()
  // - deleteUser()
  // - getUserStatistics()

  // Candidate Management Methods
  async getAllCandidates(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    
    // Build where clause for search
    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { currentJobTitle: { contains: search, mode: 'insensitive' } },
        { currentCompany: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get candidates with related data
    const [candidates, total] = await Promise.all([
      this.prisma.candidateProfile.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              isActive: true,
              createdAt: true,
            },
          },
          applications: {
            select: {
              id: true,
              status: true,
              job: {
                select: {
                  id: true,
                  title: true,
                  company: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 5, // Latest 5 applications
          },
          interviews: {
            select: {
              id: true,
              type: true,
              status: true,
              scheduledAt: true,
              job: {
                select: {
                  title: true,
                  company: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              scheduledAt: 'desc',
            },
            take: 3, // Latest 3 interviews
          },
          _count: {
            select: {
              applications: true,
              interviews: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.candidateProfile.count({ where: whereClause }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      candidates: candidates.map(candidate => ({
        id: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        phone: candidate.phone,
        currentJobTitle: candidate.currentJobTitle,
        currentCompany: candidate.currentCompany,
        experienceLevel: candidate.experienceLevel,
        totalExperience: candidate.totalExperience,
        expectedSalary: candidate.expectedSalary,
        skills: candidate.skills,
        preferredJobTypes: candidate.preferredJobTypes,
        preferredWorkType: candidate.preferredWorkType,
        resumeUrl: candidate.resumeUrl,
        totalApplications: candidate._count.applications,
        totalInterviews: candidate._count.interviews,
        isActive: candidate.user?.isActive || false,
        recentApplications: candidate.applications,
        upcomingInterviews: candidate.interviews,
        user: candidate.user,
        createdAt: candidate.createdAt,
        updatedAt: candidate.updatedAt,
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
    };
  }

  async getCandidateDetails(candidateId: string) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { id: candidateId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true,
            createdAt: true,
            userType: true,
          },
        },
        applications: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                company: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            notes: {
              select: {
                id: true,
                source: true,
                text: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        interviews: {
          include: {
            job: {
              select: {
                title: true,
                company: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            scheduledAt: 'desc',
          },
        },
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return candidate;
  }

  // Company Management Methods
  async getAllCompanies(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    
    // Build where clause for search
    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get companies with related data
    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          users: {
            select: {
              id: true,
              email: true,
              name: true,
              isActive: true,
              createdAt: true,
              userType: true,
            },
          },
          address: true,
          jobs: {
            select: {
              id: true,
              title: true,
              status: true,
              _count: {
                select: {
                  applications: true,
                },
              },
            },
          },
          _count: {
            select: {
              jobs: true,
              users: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.company.count({ where: whereClause }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      companies: companies.map(company => ({
        id: company.id,
        name: company.name,
        email: company.email,
        industry: company.industry,
        numberOfEmployees: company.numberOfEmployees,
        website: company.website,
        description: company.description,
        logo: company.logo,
        subscription: company.subscription,
        totalUsers: company._count.users,
        isActive: company.users.some(user => user.isActive) || false,
        totalJobs: company._count.jobs,
        activeJobs: company.jobs.filter(job => job.status === 'ACTIVE').length,
        totalApplications: company.jobs.reduce((sum, job) => sum + job._count.applications, 0),
        address: company.address,
        users: company.users,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
    };
  }
  
  // TODO: Implement other company management methods
  // - getCompanyDetails()
  // - manageCompanyProfile()
  // - getCompanyJobs()

  // Interview Management Methods
  async getAllInterviews(page: number = 1, limit: number = 10, search?: string, status?: string) {
    const skip = (page - 1) * limit;
    
    // Build where clause for search and filters
    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { job: { title: { contains: search, mode: 'insensitive' } } },
        { candidate: { firstName: { contains: search, mode: 'insensitive' } } },
        { candidate: { lastName: { contains: search, mode: 'insensitive' } } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }
    
    if (status) {
      whereClause.status = status;
    }

    // Get interviews with related data
    const [interviews, total] = await Promise.all([
      this.prisma.interview.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              department: true,
              salary: true,
            },
          },
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              currentJobTitle: true,
              experienceLevel: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
              industry: true,
            },
          },
        },
        orderBy: {
          scheduledAt: 'desc',
        },
      }),
      this.prisma.interview.count({ where: whereClause }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      interviews: interviews.map(interview => ({
        id: interview.id,
        title: interview.title,
        description: interview.description,
        type: interview.type,
        status: interview.status,
        scheduledAt: interview.scheduledAt,
        startedAt: interview.startedAt,
        endedAt: interview.endedAt,
        duration: interview.duration,
        roomId: interview.roomId,
        videoLink: interview.videoLink,
        recordingUrl: interview.recordingUrl,
        aiScore: interview.aiScore,
        aiRecommendation: interview.aiRecommendation,
        job: interview.job,
        candidate: interview.candidate,
        company: interview.company,
        createdAt: interview.createdAt,
        updatedAt: interview.updatedAt,
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
    };
  }

  async getInterviewDetails(interviewId: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            department: true,
            description: true,
            requirements: true,
            salary: true,
            location: true,
            workType: true,
          },
        },
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            currentJobTitle: true,
            currentCompany: true,
            experienceLevel: true,
            totalExperience: true,
            skills: true,
            resumeUrl: true,
            linkedInUrl: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            website: true,
            description: true,
          },
        },
      },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    return interview;
  }

  async getInterviewStatistics() {
    const [
      totalInterviews,
      scheduledInterviews,
      completedInterviews,
      cancelledInterviews,
      todayInterviews,
      upcomingInterviews,
    ] = await Promise.all([
      this.prisma.interview.count(),
      this.prisma.interview.count({ where: { status: 'SCHEDULED' } }),
      this.prisma.interview.count({ where: { status: 'COMPLETED' } }),
      this.prisma.interview.count({ where: { status: 'CANCELLED' } }),
      this.prisma.interview.count({
        where: {
          scheduledAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      this.prisma.interview.count({
        where: {
          scheduledAt: {
            gte: new Date(),
          },
          status: 'SCHEDULED',
        },
      }),
    ]);

    // Get average interview score
    const avgScoreResult = await this.prisma.interview.aggregate({
      where: {
        aiScore: { not: null },
      },
      _avg: {
        aiScore: true,
      },
    });

    return {
      totalInterviews,
      scheduledInterviews,
      completedInterviews,
      cancelledInterviews,
      todayInterviews,
      upcomingInterviews,
      averageScore: avgScoreResult._avg.aiScore || 0,
    };
  }

  // Subscription Management Methods
  // TODO: Implement subscription management methods
  // - getAllSubscriptions()
  // - getSubscriptionDetails()
  // - updateSubscription()
  // - cancelSubscription()

  // System Analytics Methods
  // TODO: Implement analytics methods
  // - getSystemStatistics()
  // - getUserAnalytics()
  // - getApplicationAnalytics()
  // - getJobAnalytics()

  // Security & Audit Methods
  // TODO: Implement security methods
  // - getSecurityLogs()
  // - getAuditTrail()
  // - getFailedLogins()
  // - getSuspiciousActivities()

  // Content Management Methods
  // TODO: Implement content management methods
  // - manageNotifications()
  // - manageSystemSettings()
  // - manageBulkOperations()

  // Helper Methods
  private async validateAdminUser(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.userType !== UserType.ADMIN) {
      throw new UnauthorizedException('Admin access required');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Admin account is not active');
    }
  }

  private async logAdminAction(adminId: string, action: string, details?: any): Promise<void> {
    // Log admin actions for audit trail
    try {
      await this.securityService.logSecurityEvent({
        type: 'SUSPICIOUS_ACTIVITY', // Using available type for admin actions
        severity: 'MEDIUM',
        userId: adminId,
        ip: 'internal', // Will be updated when we have request context
        userAgent: 'admin-panel',
        details: {
          action,
          timestamp: new Date(),
          ...details,
        },
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  }
}
