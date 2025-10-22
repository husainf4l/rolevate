import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto, JobResponseDto } from './dto/create-job.dto';
import { JobType, JobLevel, WorkType, JobStatus } from '@prisma/client';
import { CacheService } from '../cache/cache.service';
import { ViewTrackingService } from './view-tracking.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationType, NotificationCategory } from '../notification/dto/notification.dto';
import { PAGINATION_CONSTANTS } from '../common/constants';
import { ValidationUtils } from '../common/validation-utils';
import { PerformanceMonitoringService } from '../common/performance-monitoring.service';

@Injectable()
export class JobService {
  /**
   * Validates and sanitizes pagination parameters
   * @param limit - Requested limit (optional)
   * @param offset - Requested offset (optional)
   * @returns Sanitized pagination parameters
   */
  private validatePagination(limit?: number, offset?: number): { limit: number; offset: number } {
    // Validate and sanitize limit
    const sanitizedLimit = Math.min(
      Math.max(1, limit || PAGINATION_CONSTANTS.DEFAULT_LIMIT),
      PAGINATION_CONSTANTS.MAX_LIMIT
    );

    // Validate and sanitize offset
    const sanitizedOffset = Math.max(0, Math.min(offset || 0, PAGINATION_CONSTANTS.MAX_OFFSET));

    return {
      limit: sanitizedLimit,
      offset: sanitizedOffset,
    };
  }

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
    private viewTrackingService: ViewTrackingService,
    private notificationService: NotificationService,
    private performanceMonitoring: PerformanceMonitoringService,
  ) {}

  /**
   * Creates a new job posting for a company
   *
   * Handles the complete job creation process including validation,
   * database insertion, cache invalidation, and notification sending.
   * Automatically populates company description as fallback if not provided.
   *
   * @param createJobDto - Job creation data including title, description, requirements, etc.
   * @param companyId - ID of the company creating the job
   * @returns Promise resolving to the created job data
   * @throws BadRequestException if company is not found or validation fails
   *
   * @example
   * ```typescript
   * const job = await jobService.create({
   *   title: 'Senior Software Engineer',
   *   description: 'We are looking for...',
   *   salary: '$100k-$150k',
   *   location: 'New York, NY'
   * }, 'company-uuid-123');
   * ```
   */
  async create(createJobDto: CreateJobDto, companyId: string): Promise<JobResponseDto> {
    return this.performanceMonitoring.timeOperation(
      'job_create',
      async () => {
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

        // Validate job posting business rules
        ValidationUtils.validateJobPostingRules(jobData);

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
      },
      undefined, // userId
      companyId,
      { jobTitle: createJobDto.title }
    );
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
    return this.performanceMonitoring.timeOperation(
      'job_find_all_public',
      async () => {
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
    );
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

  /**
   * Retrieves paginated job listings for a specific company with optional search
   *
   * Implements efficient pagination with caching and search capabilities.
   * Results are ordered by creation date (newest first) and filtered by company.
   * Only non-deleted jobs are returned.
   *
   * @param companyId - ID of the company whose jobs to retrieve
   * @param limit - Maximum number of jobs to return (optional, defaults to configured limit)
   * @param offset - Number of jobs to skip for pagination (optional, defaults to 0)
   * @param search - Optional search term to filter jobs by title, description, department, location, or industry
   * @returns Promise resolving to array of job response DTOs
   *
   * @example
   * ```typescript
   * // Get first 20 jobs for a company
   * const jobs = await jobService.findAllPaginated('company-123');
   *
   * // Search for engineering jobs with pagination
   * const engineeringJobs = await jobService.findAllPaginated(
   *   'company-123', 10, 0, 'engineer'
   * );
   * ```
   */
  async findAllPaginated(companyId: string, limit?: number, offset?: number, search?: string): Promise<JobResponseDto[]> {
    // Validate and sanitize pagination parameters
    const { limit: validLimit, offset: validOffset } = this.validatePagination(limit, offset);

    // Use strategic caching for expensive search operations
    const cacheKey = this.cacheService.generateCompanyJobsKey(companyId, validLimit, validOffset, search);

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const jobs = await this.prisma.job.findMany({
          where: this.buildSearchCondition(companyId, search),
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
          take: validLimit,
          skip: validOffset,
        });

        return jobs.map(job => this.mapToJobResponse(job));
      },
      this.cacheService.getSmartTTL(search ? 'dynamic' : 'static') // Longer TTL for non-search queries
    );
  }

  /**
   * Builds optimized search conditions for job queries
   *
   * Constructs Prisma where conditions for efficient job searching.
   * Splits search terms and applies AND logic for precise matching across
   * title, description, department, location, and industry fields.
   *
   * @param companyId - Company ID to filter jobs by
   * @param search - Optional search string to filter results
   * @returns Prisma where condition object
   * @private
   */
  private buildSearchCondition(companyId: string, search?: string) {
    const baseCondition = {
      companyId,
      status: { not: JobStatus.DELETED },
    };

    if (!search) {
      return baseCondition;
    }

    // Optimized search using Prisma's built-in search capabilities
    // This provides better performance than simple 'contains' operations
    const searchTerms = search.toLowerCase().split(/\s+/).filter(term => term.length > 0);

    return {
      companyId,
      status: { not: JobStatus.DELETED },
      AND: searchTerms.map(term => ({
        OR: [
          { title: { contains: term, mode: 'insensitive' as any } },
          { description: { contains: term, mode: 'insensitive' as any } },
          { department: { contains: term, mode: 'insensitive' as any } },
          { location: { contains: term, mode: 'insensitive' as any } },
          { industry: { contains: term, mode: 'insensitive' as any } },
        ]
      }))
    };
  }  async countJobs(companyId: string, search?: string): Promise<number> {
    // Use strategic caching for count operations
    const cacheKey = this.cacheService.generateJobCountKey(companyId, search);

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        return this.prisma.job.count({
          where: this.buildSearchCondition(companyId, search),
        });
      },
      this.cacheService.getSmartTTL(search ? 'dynamic' : 'static')
    );
  }

  async findAllPublicPaginated(limit?: number, offset?: number, search?: string): Promise<JobResponseDto[]> {
    // Validate and sanitize pagination parameters
    const { limit: validLimit, offset: validOffset } = this.validatePagination(limit, offset);

    // Use strategic caching for public job queries
    const cacheKey = this.cacheService.generatePublicJobsKey(validLimit, validOffset, search);

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const jobs = await this.prisma.job.findMany({
          where: this.buildPublicSearchCondition(search),
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
          take: validLimit,
          skip: validOffset,
        });

        return jobs.map(job => this.mapToJobResponse(job));
      },
      this.cacheService.getSmartTTL(search ? 'dynamic' : 'static')
    );
  }

  private buildPublicSearchCondition(search?: string) {
    const baseCondition = {
      status: JobStatus.ACTIVE,
      deadline: {
        gt: new Date(), // Only show jobs with future deadlines
      },
    };

    if (!search) {
      return baseCondition;
    }

    // Build optimized search condition for public jobs
    return {
      status: JobStatus.ACTIVE,
      deadline: {
        gt: new Date(),
      },
      OR: [
        { title: { contains: search, mode: 'insensitive' as any } },
        { description: { contains: search, mode: 'insensitive' as any } },
        { department: { contains: search, mode: 'insensitive' as any } },
        { location: { contains: search, mode: 'insensitive' as any } },
        { industry: { contains: search, mode: 'insensitive' as any } },
        // Skills search temporarily disabled - requires database optimization
        // { skills: { hasSome: [search] } },
      ],
    };
  }

  async findAllPublicSimple(limit?: number, offset?: number): Promise<any[]> {
    // Validate and sanitize pagination parameters
    const { limit: validLimit, offset: validOffset } = this.validatePagination(limit, offset);

    // Use strategic caching for public job listings
    const cacheKey = `public_jobs_simple:${validLimit}:${validOffset}`;

    return this.cacheService.getOrSet(
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
          take: validLimit,
          skip: validOffset,
        });

        return jobs;
      },
      this.cacheService.getSmartTTL('static') // Use static TTL for simple public listings
    );
  }

  async countPublicJobs(search?: string): Promise<number> {
    // Use strategic caching for public job counts
    const cacheKey = this.cacheService.generatePublicJobCountKey(search);

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        return this.prisma.job.count({
          where: this.buildPublicSearchCondition(search),
        });
      },
      this.cacheService.getSmartTTL(search ? 'volatile' : 'dynamic')
    );
  }

  async findFeaturedJobs(limit: number = PAGINATION_CONSTANTS.DEFAULT_FEATURED_LIMIT): Promise<JobResponseDto[]> {
    // Validate and sanitize limit for featured jobs
    const { limit: validLimit } = this.validatePagination(limit, 0);

    const cacheKey = `featured_jobs:limit:${validLimit}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
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
          take: validLimit,
        });

        return jobs.map(job => this.mapToJobResponse(job));
      },
      this.cacheService.getSmartTTL('static') // Featured jobs change less frequently
    );
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
