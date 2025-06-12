import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto, CompanyQueryDto } from './dto/company.dto';
import { Company, Prisma, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    // Check if company name already exists
    const existingCompany = await this.prisma.company.findUnique({
      where: { name: createCompanyDto.name },
    });

    if (existingCompany) {
      throw new ConflictException('Company name already exists');
    }

    return this.prisma.company.create({
      data: createCompanyDto,
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
  }

  async findAll(query: CompanyQueryDto) {
    const {
      search,
      size,
      industry,
      country,
      city,
      isActive,
      hasActiveSubscription,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const whereConditions: Prisma.CompanyWhereInput[] = [];

    if (size) {
      whereConditions.push({ size });
    }

    if (industry) {
      whereConditions.push({ industry: { contains: industry, mode: 'insensitive' } });
    }

    if (country) {
      whereConditions.push({ country: { contains: country, mode: 'insensitive' } });
    }

    if (city) {
      whereConditions.push({ city: { contains: city, mode: 'insensitive' } });
    }

    if (isActive !== undefined) {
      whereConditions.push({ isActive });
    }

    if (hasActiveSubscription !== undefined) {
      if (hasActiveSubscription) {
        whereConditions.push({
          subscription: {
            status: SubscriptionStatus.ACTIVE,
          },
        });
      } else {
        whereConditions.push({
          OR: [
            { subscription: null },
            {
              subscription: {
                status: { not: SubscriptionStatus.ACTIVE },
              },
            },
          ],
        });
      }
    }

    if (search) {
      whereConditions.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { displayName: { contains: search, mode: 'insensitive' } },
          { industry: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
          { country: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.CompanyWhereInput =
      whereConditions.length > 0 ? { AND: whereConditions } : {};

    const total = await this.prisma.company.count({ where });

    const companies = await this.prisma.company.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        subscription: {
          select: {
            id: true,
            plan: true,
            status: true,
            startDate: true,
            endDate: true,
          },
        },
        _count: {
          select: {
            users: true,
            jobPosts: true,
          },
        },
      },
    });

    return {
      data: companies,
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

  async findOne(id: string): Promise<Company> {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        subscription: true,
        users: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
            role: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        jobPosts: {
          select: {
            id: true,
            title: true,
            isActive: true,
            publishedAt: true,
            createdAt: true,
            _count: {
              select: {
                applications: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            users: true,
            jobPosts: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto, userCompanyId?: string): Promise<Company> {
    const existingCompany = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!existingCompany) {
      throw new NotFoundException('Company not found');
    }

    // If userCompanyId is provided, verify the user belongs to this company
    if (userCompanyId && userCompanyId !== id) {
      throw new ForbiddenException('Access denied to this company');
    }

    // Check if new name conflicts with existing company (if name is being updated)
    if (updateCompanyDto.name && updateCompanyDto.name !== existingCompany.name) {
      const nameConflict = await this.prisma.company.findUnique({
        where: { name: updateCompanyDto.name },
      });

      if (nameConflict) {
        throw new ConflictException('Company name already exists');
      }
    }

    return this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
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
  }

  async remove(id: string): Promise<{ message: string }> {
    const existingCompany = await this.prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            jobPosts: true,
          },
        },
      },
    });

    if (!existingCompany) {
      throw new NotFoundException('Company not found');
    }

    // Check if company has active users or job posts
    if (existingCompany._count.users > 0) {
      throw new ForbiddenException('Cannot delete company with active users. Please transfer or remove users first.');
    }

    if (existingCompany._count.jobPosts > 0) {
      throw new ForbiddenException('Cannot delete company with job posts. Please remove job posts first.');
    }

    await this.prisma.company.delete({
      where: { id },
    });

    return { message: 'Company deleted successfully' };
  }

  async getCompanyStats(id: string, userCompanyId?: string) {
    // If userCompanyId is provided, verify the user belongs to this company
    if (userCompanyId && userCompanyId !== id) {
      throw new ForbiddenException('Access denied to this company');
    }

    const company = await this.prisma.company.findUnique({
      where: { id },
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

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Get application stats
    const applicationStats = await this.prisma.application.groupBy({
      by: ['status'],
      where: {
        jobPost: {
          companyId: id,
        },
      },
      _count: {
        status: true,
      },
    });

    // Get recent job posts
    const recentJobPosts = await this.prisma.jobPost.findMany({
      where: { companyId: id },
      select: {
        id: true,
        title: true,
        isActive: true,
        publishedAt: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Get recent applications
    const recentApplications = await this.prisma.application.findMany({
      where: {
        jobPost: {
          companyId: id,
        },
      },
      select: {
        id: true,
        status: true,
        appliedAt: true,
        candidate: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        jobPost: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
      take: 10,
    });

    // Get active users
    const activeUsers = await this.prisma.user.findMany({
      where: {
        companyId: id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        lastLoginAt: true,
      },
      orderBy: { lastLoginAt: 'desc' },
    });

    return {
      company: {
        id: company.id,
        name: company.name,
        displayName: company.displayName,
        subscription: company.subscription,
      },
      stats: {
        totalUsers: company._count.users,
        totalJobPosts: company._count.jobPosts,
        applicationsByStatus: applicationStats.reduce(
          (acc, stat) => {
            acc[stat.status] = stat._count.status;
            return acc;
          },
          {} as Record<string, number>,
        ),
      },
      recentJobPosts,
      recentApplications,
      activeUsers,
    };
  }

  async getCompanyUsers(id: string, userCompanyId?: string) {
    // If userCompanyId is provided, verify the user belongs to this company
    if (userCompanyId && userCompanyId !== id) {
      throw new ForbiddenException('Access denied to this company');
    }

    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return this.prisma.user.findMany({
      where: { companyId: id },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCompanyJobPosts(id: string, userCompanyId?: string) {
    // If userCompanyId is provided, verify the user belongs to this company
    if (userCompanyId && userCompanyId !== id) {
      throw new ForbiddenException('Access denied to this company');
    }

    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return this.prisma.jobPost.findMany({
      where: { companyId: id },
      select: {
        id: true,
        title: true,
        description: true,
        skills: true,
        location: true,
        experienceLevel: true,
        workType: true,
        isActive: true,
        publishedAt: true,
        createdAt: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
