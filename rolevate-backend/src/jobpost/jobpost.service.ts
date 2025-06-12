import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { CreateJobPostDto, UpdateJobPostDto, JobPostQueryDto } from './dto/jobpost.dto';
import { JobPost, Prisma } from '@prisma/client';

@Injectable()
export class JobPostService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async create(createJobPostDto: CreateJobPostDto, userId: string, companyId: string): Promise<JobPost> {
    // Check if user can create job posts
    const canCreate = await this.authService.canCreateJobPost(companyId);
    if (!canCreate) {
      throw new ForbiddenException('Job post limit reached or subscription not active');
    }

    const data: Prisma.JobPostCreateInput = {
      title: createJobPostDto.title,
      description: createJobPostDto.description,
      requirements: createJobPostDto.requirements,
      responsibilities: createJobPostDto.responsibilities,
      benefits: createJobPostDto.benefits,
      skills: createJobPostDto.skills,
      experienceLevel: createJobPostDto.experienceLevel,
      location: createJobPostDto.location,
      workType: createJobPostDto.workType || 'ONSITE',
      salaryMin: createJobPostDto.salaryMin,
      salaryMax: createJobPostDto.salaryMax,
      currency: createJobPostDto.currency || 'USD',
      isFeatured: createJobPostDto.isFeatured || false,
      expiresAt: createJobPostDto.expiresAt ? new Date(createJobPostDto.expiresAt) : null,
      enableAiInterview: createJobPostDto.enableAiInterview ?? true,
      interviewLanguages: createJobPostDto.interviewLanguages || ['ENGLISH'],
      interviewDuration: createJobPostDto.interviewDuration || 30,
      aiPrompt: createJobPostDto.aiPrompt,
      aiInstructions: createJobPostDto.aiInstructions,
      publishedAt: new Date(),
      company: {
        connect: { id: companyId }
      },
      createdBy: {
        connect: { id: userId }
      }
    };

    return this.prisma.jobPost.create({
      data,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            displayName: true,
            industry: true,
            location: true,
            logo: true,
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        _count: {
          select: {
            applications: true,
          }
        }
      },
    });
  }

  async findAll(query: JobPostQueryDto) {
    const {
      search,
      experienceLevel,
      workType,
      location,
      skills,
      isActive,
      isFeatured,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const whereConditions: Prisma.JobPostWhereInput[] = [
      // Only show active and non-expired job posts for public queries
      { isActive: true },
      {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    ];

    if (isActive !== undefined) {
      whereConditions[0] = { isActive }; // Override the default active filter
    }
    if (isFeatured !== undefined) {
      whereConditions.push({ isFeatured });
    }
    if (experienceLevel) {
      whereConditions.push({ experienceLevel });
    }
    if (workType) {
      whereConditions.push({ workType });
    }
    if (location) {
      whereConditions.push({ 
        location: {
          contains: location,
          mode: 'insensitive' as const
        }
      });
    }
    if (search) {
      whereConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          { requirements: { contains: search, mode: 'insensitive' as const } },
          { company: { name: { contains: search, mode: 'insensitive' as const } } },
        ]
      });
    }
    if (skills && skills.length > 0) {
      whereConditions.push({
        skills: {
          hasSome: skills
        }
      });
    }

    const where: Prisma.JobPostWhereInput = {
      AND: whereConditions
    };

    // Get total count
    const total = await this.prisma.jobPost.count({ where });

    // Get job posts
    const jobPosts = await this.prisma.jobPost.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            displayName: true,
            industry: true,
            location: true,
            logo: true,
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
          }
        },
        _count: {
          select: {
            applications: true,
          }
        }
      },
    });

    return {
      data: jobPosts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      }
    };
  }

  async findByCompany(companyId: string, query: JobPostQueryDto) {
    const {
      search,
      experienceLevel,
      workType,
      location,
      skills,
      isActive,
      isFeatured,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    const skip = (page - 1) * limit;

    const whereConditions: Prisma.JobPostWhereInput[] = [];

    if (isActive !== undefined) {
      whereConditions.push({ isActive });
    }
    if (isFeatured !== undefined) {
      whereConditions.push({ isFeatured });
    }
    if (experienceLevel) {
      whereConditions.push({ experienceLevel });
    }
    if (workType) {
      whereConditions.push({ workType });
    }
    if (location) {
      whereConditions.push({ 
        location: {
          contains: location,
          mode: 'insensitive' as const
        }
      });
    }
    if (search) {
      whereConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          { requirements: { contains: search, mode: 'insensitive' as const } },
        ]
      });
    }
    if (skills && skills.length > 0) {
      whereConditions.push({
        skills: {
          hasSome: skills
        }
      });
    }

    const where: Prisma.JobPostWhereInput = {
      companyId,
      ...(whereConditions.length > 0 && { AND: whereConditions })
    };

    const total = await this.prisma.jobPost.count({ where });

    const jobPosts = await this.prisma.jobPost.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            displayName: true,
            industry: true,
            location: true,
            logo: true,
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
          }
        },
        _count: {
          select: {
            applications: true,
          }
        }
      },
    });

    return {
      data: jobPosts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      }
    };
  }

  async findOne(id: string): Promise<JobPost> {
    const jobPost = await this.prisma.jobPost.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            displayName: true,
            industry: true,
            location: true,
            logo: true,
            website: true,
            description: true,
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
          }
        },
        _count: {
          select: {
            applications: true,
          }
        }
      },
    });

    if (!jobPost) {
      throw new NotFoundException('Job post not found');
    }

    // Increment view count
    await this.prisma.jobPost.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });

    return jobPost;
  }

  async update(id: string, updateJobPostDto: UpdateJobPostDto, userId: string, companyId: string): Promise<JobPost> {
    // Check if job post exists and belongs to the company
    const existingJobPost = await this.prisma.jobPost.findFirst({
      where: { id, companyId }
    });

    if (!existingJobPost) {
      throw new NotFoundException('Job post not found or access denied');
    }

    const data: Prisma.JobPostUpdateInput = {
      ...(updateJobPostDto.title && { title: updateJobPostDto.title }),
      ...(updateJobPostDto.description && { description: updateJobPostDto.description }),
      ...(updateJobPostDto.requirements && { requirements: updateJobPostDto.requirements }),
      ...(updateJobPostDto.responsibilities !== undefined && { responsibilities: updateJobPostDto.responsibilities }),
      ...(updateJobPostDto.benefits !== undefined && { benefits: updateJobPostDto.benefits }),
      ...(updateJobPostDto.skills && { skills: updateJobPostDto.skills }),
      ...(updateJobPostDto.experienceLevel && { experienceLevel: updateJobPostDto.experienceLevel }),
      ...(updateJobPostDto.location !== undefined && { location: updateJobPostDto.location }),
      ...(updateJobPostDto.workType && { workType: updateJobPostDto.workType }),
      ...(updateJobPostDto.salaryMin !== undefined && { salaryMin: updateJobPostDto.salaryMin }),
      ...(updateJobPostDto.salaryMax !== undefined && { salaryMax: updateJobPostDto.salaryMax }),
      ...(updateJobPostDto.currency && { currency: updateJobPostDto.currency }),
      ...(updateJobPostDto.isActive !== undefined && { isActive: updateJobPostDto.isActive }),
      ...(updateJobPostDto.isFeatured !== undefined && { isFeatured: updateJobPostDto.isFeatured }),
      ...(updateJobPostDto.expiresAt !== undefined && { 
        expiresAt: updateJobPostDto.expiresAt ? new Date(updateJobPostDto.expiresAt) : null 
      }),
      ...(updateJobPostDto.enableAiInterview !== undefined && { enableAiInterview: updateJobPostDto.enableAiInterview }),
      ...(updateJobPostDto.interviewLanguages && { interviewLanguages: updateJobPostDto.interviewLanguages }),
      ...(updateJobPostDto.interviewDuration && { interviewDuration: updateJobPostDto.interviewDuration }),
      ...(updateJobPostDto.aiPrompt !== undefined && { aiPrompt: updateJobPostDto.aiPrompt }),
      ...(updateJobPostDto.aiInstructions !== undefined && { aiInstructions: updateJobPostDto.aiInstructions }),
    };

    return this.prisma.jobPost.update({
      where: { id },
      data,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            displayName: true,
            industry: true,
            location: true,
            logo: true,
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
          }
        },
        _count: {
          select: {
            applications: true,
          }
        }
      },
    });
  }

  async remove(id: string, companyId: string): Promise<{ message: string }> {
    // Check if job post exists and belongs to the company
    const existingJobPost = await this.prisma.jobPost.findFirst({
      where: { id, companyId }
    });

    if (!existingJobPost) {
      throw new NotFoundException('Job post not found or access denied');
    }

    // Soft delete by setting isActive to false
    await this.prisma.jobPost.update({
      where: { id },
      data: { isActive: false }
    });

    return { message: 'Job post deleted successfully' };
  }

  async getApplications(id: string, companyId: string) {
    // Check if job post exists and belongs to the company
    const jobPost = await this.prisma.jobPost.findFirst({
      where: { id, companyId }
    });

    if (!jobPost) {
      throw new NotFoundException('Job post not found or access denied');
    }

    return this.prisma.application.findMany({
      where: { jobPostId: id },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          }
        },
        cvAnalysis: true,
        fitScore: true,
        _count: {
          select: {
            interviews: true,
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });
  }
}
