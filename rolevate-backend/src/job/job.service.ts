import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto, JobResponseDto } from './dto/create-job.dto';
import { JobType, JobLevel, WorkType, JobStatus } from '@prisma/client';
import { CacheService } from '../cache/cache.service';
import { ViewTrackingService } from './view-tracking.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationType, NotificationCategory } from '../notification/dto/notification.dto';

@Injectable()
export class JobService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
    private viewTrackingService: ViewTrackingService,
    private notificationService: NotificationService,
  ) {}

  async create(createJobDto: CreateJobDto, companyId: string): Promise<JobResponseDto> {
    // Get company information to use as fallback for description
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { description: true }
    });

    if (!company) {
      throw new BadRequestException('Company not found');
    }

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
      companyDescription: createJobDto.companyDescription || company.description || '', // Use company description as fallback
      interviewLanguage: createJobDto.interviewLanguage || 'english',
      cvAnalysisPrompt: createJobDto.cvAnalysisPrompt || createJobDto.aiCvAnalysisPrompt,
      interviewPrompt: createJobDto.interviewPrompt || createJobDto.aiFirstInterviewPrompt,
      aiSecondInterviewPrompt: createJobDto.aiSecondInterviewPrompt || null,
      companyId,
      status: JobStatus.DRAFT, // Set as draft by default
    };

      const job = await this.prisma.job.create({
        data: {
        ...jobData,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            description: true,
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
        company: {
          select: {
            id: true,
            name: true,
            description: true,
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
        company: {
          select: {
            id: true,
            name: true,
            description: true,
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

    const job = await this.prisma.job.update({
      where: { id },
      data: updateData,
      include: {
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
        company: {
          select: {
            id: true,
            name: true,
          }
        }
      },
    });

    // Create notification when job is published
    if (status === JobStatus.ACTIVE && existingJob.status !== JobStatus.ACTIVE) {
      try {
        await this.notificationService.create({
          type: NotificationType.SUCCESS,
          category: NotificationCategory.SYSTEM,
          title: 'Job Published Successfully',
          message: `Your job "${job.title}" has been published and is now live for candidates to apply.`,
          companyId: job.companyId,
          metadata: {
            jobTitle: job.title,
            jobId: job.id,
          },
        });
      } catch (error) {
        console.error('Failed to create job published notification:', error);
      }
    }

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
    // Use strategic caching for expensive search operations
    const cacheKey = this.cacheService.generateCompanyJobsKey(companyId, limit, offset, search);
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
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

        return jobs.map(job => this.mapToJobResponse(job));
      },
      this.cacheService.getSmartTTL(search ? 'dynamic' : 'static') // Longer TTL for non-search queries
    );
  }

  async countJobs(companyId: string, search?: string): Promise<number> {
    // Use strategic caching for count operations
    const cacheKey = this.cacheService.generateJobCountKey(companyId, search);
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
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

        return this.prisma.job.count({
          where: {
            companyId,
            status: { not: JobStatus.DELETED }, // Exclude deleted jobs
            ...searchCondition,
          },
        });
      },
      this.cacheService.getSmartTTL(search ? 'dynamic' : 'static')
    );
  }

  async findAllPublicPaginated(limit: number, offset: number, search?: string): Promise<JobResponseDto[]> {
    // Temporarily disable cache to ensure fresh data with logo
    // const cacheKey = this.cacheService.generatePublicJobsKey(limit, offset, search);
    // const cachedJobs = await this.cacheService.get<JobResponseDto[]>(cacheKey);
    
    // if (cachedJobs) {
    //   return cachedJobs;
    // }

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

    // Get all active jobs for public viewing (optimized query)
    const jobs = await this.prisma.job.findMany({
      where: {
        status: JobStatus.ACTIVE,
        deadline: {
          gt: new Date(), // Only show jobs with future deadlines
        },
        ...searchCondition,
      },
      select: {
        id: true,
        title: true,
        department: true,
        location: true,
        salary: true,
        type: true,
        deadline: true,
        shortDescription: true, // Use short description for listing
        companyDescription: true, // Include stored company description for fallback
        skills: true,
        experience: true,
        education: true,
        jobLevel: true,
        workType: true,
        industry: true,
        featured: true,
        applicants: true,
        views: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            description: true,
            industry: true,
            numberOfEmployees: true,
            address: {
              select: {
                city: true,
                country: true,
              },
            },
          },
        },
      },
      orderBy: [
        { featured: 'desc' }, // Featured jobs first
        { createdAt: 'desc' },
      ],
      take: limit,
      skip: offset,
    });

    const jobResponses = jobs.map(job => this.mapToJobResponse(job));
    
    // Temporarily disable cache to ensure fresh data with logo
    // await this.cacheService.set(cacheKey, jobResponses, 600);

    return jobResponses;
  }

  async findAllPublicSimple(limit: number, offset: number): Promise<any[]> {
    // Use strategic caching for public job listings
    const cacheKey = `public_jobs_simple:${limit}:${offset}`;
    
    return this.cacheService.getWithFallback(
      cacheKey,
      async () => {
        // Ultra-lightweight query - only essential fields
        const jobs = await this.prisma.job.findMany({
          where: {
            status: JobStatus.ACTIVE,
            deadline: {
              gt: new Date(),
            },
          },
          select: {
            id: true,
            title: true,
            location: true,
            salary: true,
            type: true,
            jobLevel: true,
            workType: true,
            featured: true,
            createdAt: true,
            company: {
              select: {
                name: true,
                logo: true,
                address: {
                  select: {
                    city: true,
                    country: true,
                  },
                },
              },
            },
          },
          orderBy: [
            { featured: 'desc' },
            { createdAt: 'desc' },
          ],
          take: limit,
          skip: offset,
        });

        return jobs;
      },
      this.cacheService.getSmartTTL('dynamic'), // 10 minutes for dynamic public data
      true // Enable stale-while-revalidate for better performance
    );
  }

  async countPublicJobs(search?: string): Promise<number> {
    // Use strategic caching for public job counts
    const cacheKey = this.cacheService.generatePublicJobCountKey(search);
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
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

        return this.prisma.job.count({
          where: {
            status: JobStatus.ACTIVE,
            deadline: {
              gt: new Date(), // Only count jobs with future deadlines
            },
            ...searchCondition,
          },
        });
      },
      this.cacheService.getSmartTTL(search ? 'volatile' : 'dynamic')
    );
  }

  async findFeaturedJobs(limit: number = 6): Promise<JobResponseDto[]> {
    const cacheKey = `featured_jobs:limit:${limit}`;
    
    // Temporarily disable cache to ensure fresh data
    // const cached = await this.cacheService.get(cacheKey);
    // if (cached) {
    //   return cached as JobResponseDto[];
    // }

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
      },
      orderBy: [
        { createdAt: 'desc' }, // Most recently created featured jobs first
      ],
      take: limit,
    });

    const result = jobs.map(job => this.mapToJobResponse(job));
    
    // Temporarily disable cache to ensure fresh data
    // await this.cacheService.set(cacheKey, result, 600);
    
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
      companyDescription: job.company?.description || job.companyDescription, // Use current company description, fallback to stored value
      companyLogo: job.company?.logo, // Use current company logo
      interviewLanguage: job.interviewLanguage,
      status: job.status,
      companyId: job.companyId,
      company: job.company ? {
        id: job.company.id,
        name: job.company.name,
        logo: job.company.logo,
        address: job.company.address ? {
          id: job.company.address.id,
          street: job.company.address.street,
          city: job.company.address.city,
          state: job.company.address.state,
          country: job.company.address.country,
          zipCode: job.company.address.zipCode,
        } : undefined,
      } : undefined,
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
