import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto, JobResponseDto } from './dto/create-job.dto';
import { JobType, JobLevel, WorkType, JobStatus, ScreeningQuestionType } from '@prisma/client';
import { CacheService } from '../cache/cache.service';
import { ViewTrackingService } from './view-tracking.service';

@Injectable()
export class JobService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
    private viewTrackingService: ViewTrackingService,
  ) {}

  async create(createJobDto: CreateJobDto, companyId: string): Promise<JobResponseDto> {
    // Convert frontend enums to Prisma enums
    const jobData = {
      title: createJobDto.title,
      department: createJobDto.department,
      location: createJobDto.location,
      salary: createJobDto.salary,
      type: createJobDto.type as JobType,
      deadline: new Date(createJobDto.deadline),
      description: createJobDto.description,
      shortDescription: createJobDto.shortDescription || '',
      responsibilities: createJobDto.responsibilities,
      requirements: createJobDto.requirements,
      benefits: createJobDto.benefits,
      skills: createJobDto.skills,
      experience: createJobDto.experience,
      education: createJobDto.education,
      jobLevel: createJobDto.jobLevel as JobLevel,
      workType: createJobDto.workType as WorkType,
      industry: createJobDto.industry,
      companyDescription: createJobDto.companyDescription,
      cvAnalysisPrompt: createJobDto.cvAnalysisPrompt || createJobDto.aiCvAnalysisPrompt,
      interviewPrompt: createJobDto.interviewPrompt || createJobDto.aiFirstInterviewPrompt,
      aiSecondInterviewPrompt: createJobDto.aiSecondInterviewPrompt || null,
      companyId,
      status: JobStatus.DRAFT, // Set as draft by default
    };

      const job = await this.prisma.job.create({
        data: {
        ...jobData,
        screeningQuestions: createJobDto.screeningQuestions?.length ? {
          create: createJobDto.screeningQuestions.map(q => ({
            question: q.question,
            type: q.type as ScreeningQuestionType,
            options: q.options || [],
            required: q.required || false,
          }))
        } : undefined,
      },
      include: {
        screeningQuestions: true,
        company: {
          select: {
            id: true,
            name: true,
          }
        }
      },
    });

    // Invalidate related caches
    await this.cacheService.invalidateCompanyJobsCache(companyId);
    await this.cacheService.invalidatePublicJobsCache();

    return this.mapToJobResponse(job);
  }

  async findAll(companyId?: string): Promise<JobResponseDto[]> {
    const jobs = await this.prisma.job.findMany({
      where: {
        ...(companyId && { companyId }),
        status: { not: JobStatus.DELETED }, // Exclude deleted jobs
      },
      include: {
        screeningQuestions: true,
        company: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return jobs.map(job => this.mapToJobResponse(job));
  }

  async findOne(id: string, companyId?: string): Promise<JobResponseDto> {
    // Try to get from cache first
    const cacheKey = this.cacheService.generateJobKey(id);
    const cachedJob = await this.cacheService.get<JobResponseDto>(cacheKey);
    
    if (cachedJob) {
      // For company users, don't increment view count
      return cachedJob;
    }

    const job = await this.prisma.job.findFirst({
      where: {
        id,
        ...(companyId && { companyId }),
        status: { not: JobStatus.DELETED }, // Exclude deleted jobs
      },
      include: {
        screeningQuestions: true,
        company: {
          select: {
            id: true,
            name: true,
          }
        }
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // For company users, don't increment view count
    const jobResponse = this.mapToJobResponse(job);
    
    // Cache the job for 10 minutes
    await this.cacheService.set(cacheKey, jobResponse, 600);

    return jobResponse;
  }

  async update(id: string, updateJobDto: Partial<CreateJobDto>, companyId: string): Promise<JobResponseDto> {
    // Verify job belongs to company
    const existingJob = await this.prisma.job.findFirst({
      where: { id, companyId },
    });

    if (!existingJob) {
      throw new NotFoundException('Job not found or you do not have permission to update it');
    }

    // Map frontend fields to database fields
    const updateData: any = { ...updateJobDto };
    
    // Remove frontend-specific fields and map to database fields
    delete updateData.aiCvAnalysisPrompt;
    delete updateData.aiFirstInterviewPrompt;
    delete updateData.aiSecondInterviewPrompt;
    
    // Map AI prompt fields correctly
    if (updateJobDto.aiCvAnalysisPrompt !== undefined) {
      updateData.cvAnalysisPrompt = updateJobDto.aiCvAnalysisPrompt;
    }
    if (updateJobDto.aiFirstInterviewPrompt !== undefined) {
      updateData.interviewPrompt = updateJobDto.aiFirstInterviewPrompt;
    }
    if (updateJobDto.aiSecondInterviewPrompt !== undefined) {
      updateData.aiSecondInterviewPrompt = updateJobDto.aiSecondInterviewPrompt;
    }
    
    if (updateJobDto.deadline) {
      updateData.deadline = new Date(updateJobDto.deadline);
    }

    // Handle screening questions update
    if (updateJobDto.screeningQuestions) {
      // Delete existing questions and create new ones
      await this.prisma.screeningQuestion.deleteMany({
        where: { jobId: id },
      });

      updateData.screeningQuestions = {
        create: updateJobDto.screeningQuestions.map(q => ({
          question: q.question,
          type: q.type as ScreeningQuestionType,
          options: q.options || [],
          required: q.required || false,
        }))
      };
    }

    const job = await this.prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        screeningQuestions: true,
        company: {
          select: {
            id: true,
            name: true,
          }
        }
      },
    });

    // Invalidate caches
    await this.cacheService.invalidateJobCache(id, companyId);
    await this.cacheService.invalidateCompanyJobsCache(companyId);
    await this.cacheService.invalidatePublicJobsCache();

    return this.mapToJobResponse(job);
  }

  async remove(id: string, companyId: string): Promise<void> {
    // Verify job belongs to company
    const existingJob = await this.prisma.job.findFirst({
      where: { id, companyId },
    });

    if (!existingJob) {
      throw new NotFoundException('Job not found or you do not have permission to delete it');
    }

    // Instead of deleting, mark as DELETED
    await this.prisma.job.update({
      where: { id },
      data: { status: JobStatus.DELETED },
    });

    // Invalidate caches
    await this.cacheService.invalidateJobCache(id, companyId);
    await this.cacheService.invalidateCompanyJobsCache(companyId);
    await this.cacheService.invalidatePublicJobsCache();
  }

  async updateStatus(id: string, status: JobStatus, companyId: string): Promise<JobResponseDto> {
    // Verify job belongs to company
    const existingJob = await this.prisma.job.findFirst({
      where: { id, companyId },
    });

    if (!existingJob) {
      throw new NotFoundException('Job not found or you do not have permission to update it');
    }

    const job = await this.prisma.job.update({
      where: { id },
      data: { status },
      include: {
        screeningQuestions: true,
        company: {
          select: {
            id: true,
            name: true,
          }
        }
      },
    });

    // Invalidate caches
    await this.cacheService.invalidateJobCache(id, companyId);
    await this.cacheService.invalidateCompanyJobsCache(companyId);
    await this.cacheService.invalidatePublicJobsCache();

    return this.mapToJobResponse(job);
  }

  async findAllPublic(): Promise<JobResponseDto[]> {
    // Get all active jobs for public viewing (no company restriction)
    const jobs = await this.prisma.job.findMany({
      where: {
        status: JobStatus.ACTIVE,
        deadline: {
          gt: new Date(), // Only show jobs with future deadlines
        },
      },
      include: {
        screeningQuestions: true,
        company: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return jobs.map(job => this.mapToJobResponse(job));
  }

  async findOnePublic(id: string, ipAddress?: string): Promise<JobResponseDto> {
    // Try to get from cache first
    const cacheKey = this.cacheService.generateJobKey(id);
    const cachedJob = await this.cacheService.get<JobResponseDto>(cacheKey);
    
    // Check if we should increment view count (only once per IP)
    let shouldIncrement = false;
    if (ipAddress) {
      shouldIncrement = await this.viewTrackingService.shouldIncrementView(id, ipAddress);
    }
    
    if (cachedJob) {
      // Increment view count only if it's a new view from this IP
      if (shouldIncrement) {
        await this.prisma.job.update({
          where: { id },
          data: { views: { increment: 1 } },
        });
        // Update cached job with new view count
        const updatedJob = { ...cachedJob, views: cachedJob.views + 1 };
        await this.cacheService.set(cacheKey, updatedJob, 600);
        return updatedJob;
      }
      return cachedJob;
    }

    const job = await this.prisma.job.findFirst({
      where: {
        id,
        status: JobStatus.ACTIVE,
        deadline: {
          gt: new Date(), // Only show jobs with future deadlines
        },
      },
      include: {
        screeningQuestions: true,
        company: {
          include: {
            address: true,
          },
        }
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found or not available');
    }

    // Increment view count only if it's a new view from this IP
    if (shouldIncrement) {
      await this.prisma.job.update({
        where: { id },
        data: { views: { increment: 1 } },
      });
      // Update the job object with incremented view count
      job.views = job.views + 1;
    }

    const jobResponse = this.mapToJobResponse(job);
    
    // Cache the job for 10 minutes
    await this.cacheService.set(cacheKey, jobResponse, 600);

    return jobResponse;
  }

  async restore(id: string, companyId: string): Promise<JobResponseDto> {
    // Verify job belongs to company
    const existingJob = await this.prisma.job.findFirst({
      where: { id, companyId, status: JobStatus.DELETED },
    });

    if (!existingJob) {
      throw new NotFoundException('Deleted job not found or you do not have permission to restore it');
    }

    const job = await this.prisma.job.update({
      where: { id },
      data: { status: JobStatus.DRAFT }, // Restore as draft
      include: {
        screeningQuestions: true,
        company: {
          select: {
            id: true,
            name: true,
          }
        }
      },
    });

    // Invalidate caches
    await this.cacheService.invalidateJobCache(id, companyId);
    await this.cacheService.invalidateCompanyJobsCache(companyId);
    await this.cacheService.invalidatePublicJobsCache();

    return this.mapToJobResponse(job);
  }

  async permanentlyDelete(id: string, companyId: string): Promise<void> {
    // Verify job belongs to company and is deleted
    const existingJob = await this.prisma.job.findFirst({
      where: { id, companyId, status: JobStatus.DELETED },
    });

    if (!existingJob) {
      throw new NotFoundException('Deleted job not found or you do not have permission to permanently delete it');
    }

    await this.prisma.job.delete({
      where: { id },
    });

    // Invalidate caches
    await this.cacheService.invalidateJobCache(id, companyId);
    await this.cacheService.invalidateCompanyJobsCache(companyId);
    await this.cacheService.invalidatePublicJobsCache();
  }

  async findAllDeleted(companyId: string): Promise<JobResponseDto[]> {
    const jobs = await this.prisma.job.findMany({
      where: {
        companyId,
        status: JobStatus.DELETED,
      },
      include: {
        screeningQuestions: true,
        company: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: {
        updatedAt: 'desc', // Order by when they were deleted
      },
    });

    return jobs.map(job => this.mapToJobResponse(job));
  }

  async findAllPaginated(companyId: string, limit: number, offset: number, search?: string): Promise<JobResponseDto[]> {
    // Try to get from cache first
    const cacheKey = this.cacheService.generateCompanyJobsKey(companyId, limit, offset, search);
    const cachedJobs = await this.cacheService.get<JobResponseDto[]>(cacheKey);
    
    if (cachedJobs) {
      return cachedJobs;
    }

    const searchCondition = search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' as any } },
        { description: { contains: search, mode: 'insensitive' as any } },
        { department: { contains: search, mode: 'insensitive' as any } },
        { location: { contains: search, mode: 'insensitive' as any } },
        { industry: { contains: search, mode: 'insensitive' as any } },
        { skills: { hasSome: [search] } }, // Search in skills array
      ]
    } : {};

    const jobs = await this.prisma.job.findMany({
      where: {
        companyId,
        status: { not: JobStatus.DELETED }, // Exclude deleted jobs
        ...searchCondition,
      },
      include: {
        screeningQuestions: true,
        company: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    const jobResponses = jobs.map(job => this.mapToJobResponse(job));
    
    // Cache for 5 minutes
    await this.cacheService.set(cacheKey, jobResponses, 300);

    return jobResponses;
  }

  async countJobs(companyId: string, search?: string): Promise<number> {
    // Try to get from cache first
    const cacheKey = this.cacheService.generateJobCountKey(companyId, search);
    const cachedCount = await this.cacheService.get<number>(cacheKey);
    
    if (cachedCount !== null) {
      return cachedCount;
    }

    const searchCondition = search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' as any } },
        { description: { contains: search, mode: 'insensitive' as any } },
        { department: { contains: search, mode: 'insensitive' as any } },
        { location: { contains: search, mode: 'insensitive' as any } },
        { industry: { contains: search, mode: 'insensitive' as any } },
        { skills: { hasSome: [search] } }, // Search in skills array
      ]
    } : {};

    const count = await this.prisma.job.count({
      where: {
        companyId,
        status: { not: JobStatus.DELETED }, // Exclude deleted jobs
        ...searchCondition,
      },
    });

    // Cache for 5 minutes
    await this.cacheService.set(cacheKey, count, 300);

    return count;
  }

  async findAllPublicPaginated(limit: number, offset: number, search?: string): Promise<JobResponseDto[]> {
    // Try to get from cache first
    const cacheKey = this.cacheService.generatePublicJobsKey(limit, offset, search);
    const cachedJobs = await this.cacheService.get<JobResponseDto[]>(cacheKey);
    
    if (cachedJobs) {
      return cachedJobs;
    }

    const searchCondition = search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' as any } },
        { description: { contains: search, mode: 'insensitive' as any } },
        { department: { contains: search, mode: 'insensitive' as any } },
        { location: { contains: search, mode: 'insensitive' as any } },
        { industry: { contains: search, mode: 'insensitive' as any } },
        { skills: { hasSome: [search] } }, // Search in skills array
      ]
    } : {};

    // Get all active jobs for public viewing (no company restriction)
    const jobs = await this.prisma.job.findMany({
      where: {
        status: JobStatus.ACTIVE,
        deadline: {
          gt: new Date(), // Only show jobs with future deadlines
        },
        ...searchCondition,
      },
      include: {
        screeningQuestions: true,
        company: {
          include: {
            address: true,
          },
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    const jobResponses = jobs.map(job => this.mapToJobResponse(job));
    
    // Cache for 5 minutes
    await this.cacheService.set(cacheKey, jobResponses, 300);

    return jobResponses;
  }

  async countPublicJobs(search?: string): Promise<number> {
    // Try to get from cache first
    const cacheKey = this.cacheService.generatePublicJobCountKey(search);
    const cachedCount = await this.cacheService.get<number>(cacheKey);
    
    if (cachedCount !== null) {
      return cachedCount;
    }

    const searchCondition = search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' as any } },
        { description: { contains: search, mode: 'insensitive' as any } },
        { department: { contains: search, mode: 'insensitive' as any } },
        { location: { contains: search, mode: 'insensitive' as any } },
        { industry: { contains: search, mode: 'insensitive' as any } },
        { skills: { hasSome: [search] } }, // Search in skills array
      ]
    } : {};

    const count = await this.prisma.job.count({
      where: {
        status: JobStatus.ACTIVE,
        deadline: {
          gt: new Date(), // Only count jobs with future deadlines
        },
        ...searchCondition,
      },
    });

    // Cache for 5 minutes
    await this.cacheService.set(cacheKey, count, 300);

    return count;
  }

  async findFeaturedJobs(limit: number = 6): Promise<JobResponseDto[]> {
    const cacheKey = `featured_jobs:limit:${limit}`;
    
    // Check cache first
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached as JobResponseDto[];
    }

    // Get featured jobs that are active and have future deadlines
    const jobs = await this.prisma.job.findMany({
      where: {
        featured: true,
        status: JobStatus.ACTIVE,
        deadline: {
          gt: new Date(), // Only show jobs with future deadlines
        },
      },
      include: {
        company: {
          include: {
            address: true,
          },
        },
        screeningQuestions: true,
      },
      orderBy: [
        { createdAt: 'desc' }, // Most recently created featured jobs first
      ],
      take: limit,
    });

    const result = jobs.map(job => this.mapToJobResponse(job));
    
    // Cache for 10 minutes
    await this.cacheService.set(cacheKey, result, 600);
    
    return result;
  }

  async toggleFeatured(id: string, featured: boolean, companyId: string): Promise<JobResponseDto> {
    // First check if the job exists and belongs to the company
    const existingJob = await this.prisma.job.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!existingJob) {
      throw new NotFoundException('Job not found or you do not have permission to modify it');
    }

    // Update the featured status
    const job = await this.prisma.job.update({
      where: { id },
      data: { featured },
      include: {
        company: {
          include: {
            address: true,
          },
        },
        screeningQuestions: true,
      },
    });

    // Invalidate caches
    await this.cacheService.invalidateJobCache(id, companyId);
    await this.cacheService.invalidateCompanyJobsCache(companyId);
    await this.cacheService.invalidatePublicJobsCache();
    
    // Invalidate featured jobs cache by deleting common cache keys
    for (let i = 1; i <= 50; i++) {
      await this.cacheService.del(`featured_jobs:limit:${i}`);
    }

    return this.mapToJobResponse(job);
  }

  private mapToJobResponse(job: any): JobResponseDto {
    return {
      id: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      salary: job.salary,
      type: job.type,
      deadline: job.deadline,
      description: job.description,
      shortDescription: job.shortDescription,
      responsibilities: job.responsibilities,
      requirements: job.requirements,
      benefits: job.benefits,
      skills: job.skills,
      experience: job.experience,
      education: job.education,
      jobLevel: job.jobLevel,
      workType: job.workType,
      industry: job.industry,
      companyDescription: job.companyDescription,
      status: job.status,
      companyId: job.companyId,
      company: job.company ? {
        id: job.company.id,
        name: job.company.name,
        address: job.company.address ? {
          id: job.company.address.id,
          street: job.company.address.street,
          city: job.company.address.city,
          state: job.company.address.state,
          country: job.company.address.country,
          zipCode: job.company.address.zipCode,
        } : undefined,
      } : undefined,
      screeningQuestions: job.screeningQuestions.map((q: any) => ({
        id: q.id,
        question: q.question,
        type: q.type,
        options: q.options,
        required: q.required,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
      })),
      cvAnalysisPrompt: job.cvAnalysisPrompt,
      interviewPrompt: job.interviewPrompt,
      aiSecondInterviewPrompt: job.aiSecondInterviewPrompt,
      featured: job.featured,
      applicants: job.applicants,
      views: job.views,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }
}
