import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto, UpdateApplicationDto, ApplicationQueryDto } from './dto/application.dto';
import { Application, Prisma } from '@prisma/client';

@Injectable()
export class ApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createApplicationDto: CreateApplicationDto): Promise<Application> {
    // Check if application already exists
    const existingApplication = await this.prisma.application.findFirst({
      where: {
        jobPostId: createApplicationDto.jobPostId,
        candidateId: createApplicationDto.candidateId,
      },
    });

    if (existingApplication) {
      throw new ConflictException('Application already exists for this job post and candidate');
    }

    // Verify job post exists and is active
    const jobPost = await this.prisma.jobPost.findUnique({
      where: { id: createApplicationDto.jobPostId },
      include: { company: true },
    });

    if (!jobPost) {
      throw new NotFoundException('Job post not found');
    }

    if (!jobPost.isActive) {
      throw new ForbiddenException('Cannot apply to inactive job post');
    }

    // Verify candidate exists
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: createApplicationDto.candidateId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return this.prisma.application.create({
      data: {
        ...createApplicationDto,
        appliedAt: new Date(),
        status: createApplicationDto.status || 'PENDING',
      },
      include: {
        jobPost: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
            },
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
        cvAnalysis: true,
        interviews: true,
      },
    });
  }

  async findAll(query: ApplicationQueryDto) {
    const {
      search,
      status,
      jobPostId,
      candidateId,
      companyId,
      page = 1,
      limit = 10,
      sortBy = 'appliedAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const whereConditions: Prisma.ApplicationWhereInput[] = [];

    if (status) {
      whereConditions.push({ status });
    }

    if (jobPostId) {
      whereConditions.push({ jobPostId });
    }

    if (candidateId) {
      whereConditions.push({ candidateId });
    }

    if (companyId) {
      whereConditions.push({
        jobPost: {
          companyId,
        },
      });
    }

    if (search) {
      whereConditions.push({
        OR: [
          {
            candidate: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
          {
            jobPost: {
              title: { contains: search, mode: 'insensitive' },
            },
          },
          {
            coverLetter: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    const where: Prisma.ApplicationWhereInput =
      whereConditions.length > 0 ? { AND: whereConditions } : {};

    const total = await this.prisma.application.count({ where });

    const applications = await this.prisma.application.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        jobPost: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
            },
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            profileImage: true,
          },
        },
        cvAnalysis: true,
        interviews: {
          orderBy: { scheduledAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            interviews: true,
          },
        },
      },
    });

    return {
      data: applications,
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

  async findByCompany(companyId: string, query: ApplicationQueryDto) {
    return this.findAll({ ...query, companyId });
  }

  async findOne(id: string): Promise<Application> {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        jobPost: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                displayName: true,
                industry: true,
                location: true,
                logo: true,
              },
            },
          },
        },
        candidate: {
          include: {
            _count: {
              select: {
                applications: true,
                interviews: true,
                cvAnalyses: true,
              },
            },
          },
        },
        cvAnalysis: true,
        interviews: {
          orderBy: { scheduledAt: 'desc' },
          include: {
            application: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async update(id: string, updateApplicationDto: UpdateApplicationDto, companyId?: string): Promise<Application> {
    const existingApplication = await this.prisma.application.findUnique({
      where: { id },
      include: {
        jobPost: true,
      },
    });

    if (!existingApplication) {
      throw new NotFoundException('Application not found');
    }

    // If companyId is provided, verify the application belongs to the company
    if (companyId && existingApplication.jobPost.companyId !== companyId) {
      throw new ForbiddenException('Access denied to this application');
    }

    return this.prisma.application.update({
      where: { id },
      data: updateApplicationDto,
      include: {
        jobPost: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
            },
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
        cvAnalysis: true,
        interviews: true,
      },
    });
  }

  async remove(id: string, companyId?: string): Promise<{ message: string }> {
    const existingApplication = await this.prisma.application.findUnique({
      where: { id },
      include: {
        jobPost: true,
      },
    });

    if (!existingApplication) {
      throw new NotFoundException('Application not found');
    }

    // If companyId is provided, verify the application belongs to the company
    if (companyId && existingApplication.jobPost.companyId !== companyId) {
      throw new ForbiddenException('Access denied to this application');
    }

    await this.prisma.application.delete({
      where: { id },
    });

    return { message: 'Application deleted successfully' };
  }

  async getApplicationsByCandidate(candidateId: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return this.prisma.application.findMany({
      where: { candidateId },
      include: {
        jobPost: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
            },
          },
        },
        cvAnalysis: true,
        interviews: {
          orderBy: { scheduledAt: 'desc' },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async getApplicationsByJobPost(jobPostId: string, companyId?: string) {
    const jobPost = await this.prisma.jobPost.findUnique({
      where: { id: jobPostId },
    });

    if (!jobPost) {
      throw new NotFoundException('Job post not found');
    }

    // If companyId is provided, verify the job post belongs to the company
    if (companyId && jobPost.companyId !== companyId) {
      throw new ForbiddenException('Access denied to this job post');
    }

    return this.prisma.application.findMany({
      where: { jobPostId },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            profileImage: true,
          },
        },
        cvAnalysis: true,
        interviews: {
          orderBy: { scheduledAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            interviews: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }
}
