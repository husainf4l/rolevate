import { Injectable, NotFoundException, ForbiddenException, ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from './job.entity';
import { CreateJobInput } from './create-job.input';
import { UpdateJobInput } from './update-job.input';
import { JobDto } from './job.dto';
import { JobFilterInput } from './job-filter.input';
import { PaginationInput, createPaginationMeta, PaginatedResult } from '../common/pagination.dto';
import { User } from '../user/user.entity';
import { Company } from '../company/company.entity';
import { SavedJob } from './saved-job.entity';
import { SavedJobDto } from './saved-job.dto';
import { AuditService } from '../audit.service';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);

  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(SavedJob)
    private savedJobRepository: Repository<SavedJob>,
    private auditService: AuditService,
  ) {}

  async createJob(input: CreateJobInput, userId?: string): Promise<JobDto> {
    // Use userId from parameter (from JWT token) if postedById is not provided in input
    const postedById = input.postedById || userId;
    
    if (!postedById) {
      throw new NotFoundException('User ID is required');
    }

    const postedBy = await this.userRepository.findOne({ where: { id: postedById } });
    if (!postedBy) {
      throw new NotFoundException('User not found');
    }

    const slug = `${Date.now()}-${input.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // remove special chars except spaces
      .replace(/\s+/g, '-') // replace spaces with hyphens
      .replace(/^-+|-+$/g, '') // trim hyphens
    }`;

    const job = this.jobRepository.create({
      ...input,
      slug,
      postedBy,
      companyId: postedBy.companyId,
    });
    const savedJob = await this.jobRepository.save(job);
    this.auditService.logJobCreation(postedById, savedJob.id);

    // Return the full job with relations
    return this.findOne(savedJob.id) as Promise<JobDto>;
  }

  /**
   * Find all jobs with optional filtering and pagination
   * @param filter - Filter criteria (status, type, location, etc.)
   * @param pagination - Pagination options (page, limit)
   * @returns Paginated result with jobs and metadata
   */
  async findAll(filter?: JobFilterInput, pagination?: PaginationInput): Promise<PaginatedResult<JobDto>> {
    this.logger.log('Finding all jobs with filters and pagination');
    
    const queryBuilder = this.jobRepository.createQueryBuilder('job')
      .leftJoinAndSelect('job.postedBy', 'postedBy')
      .leftJoinAndSelect('job.company', 'company')
      .orderBy('job.createdAt', 'DESC'); // Most recent jobs first

    // Apply filters
    if (filter) {
      if (filter.status) {
        queryBuilder.andWhere('job.status = :status', { status: filter.status });
      }
      if (filter.type) {
        queryBuilder.andWhere('job.type = :type', { type: filter.type });
      }
      if (filter.jobLevel) {
        queryBuilder.andWhere('job.jobLevel = :jobLevel', { jobLevel: filter.jobLevel });
      }
      if (filter.workType) {
        queryBuilder.andWhere('job.workType = :workType', { workType: filter.workType });
      }
      if (filter.industry) {
        queryBuilder.andWhere('job.industry ILIKE :industry', { industry: `%${filter.industry}%` });
      }
      if (filter.location) {
        queryBuilder.andWhere('job.location ILIKE :location', { location: `%${filter.location}%` });
      }
      if (filter.department) {
        queryBuilder.andWhere('job.department ILIKE :department', { department: `%${filter.department}%` });
      }
      if (filter.postedById) {
        queryBuilder.andWhere('job.postedById = :postedById', { postedById: filter.postedById });
      }
      if (filter.companyId) {
        queryBuilder.andWhere('job.companyId = :companyId', { companyId: filter.companyId });
      }
      if (filter.featured !== undefined) {
        queryBuilder.andWhere('job.featured = :featured', { featured: filter.featured });
      }
    }

    // Apply pagination
    const page = pagination?.page || 1;
    const limit = Math.min(pagination?.limit || 20, 100); // Cap at 100
    const skip = (page - 1) * limit;
    
    // Get total count for pagination metadata
    const total = await queryBuilder.getCount();
    
    // Apply pagination to query
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const jobs = await queryBuilder.getMany();

    this.logger.log(`Found ${jobs.length} jobs (page ${page}/${Math.ceil(total / limit)})`);

    return {
      data: jobs as JobDto[],
      meta: createPaginationMeta(page, limit, total),
    };
  }

  async findOne(id: string): Promise<JobDto | null> {
    const job = await this.jobRepository.findOne({
      where: { id },
      relations: ['postedBy', 'company'],
    });
    
    if (!job) {
      this.logger.warn(`Job not found: ${id}`);
      return null;
    }

    return {
      id: job.id,
      title: job.title,
      slug: job.slug,
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
      cvAnalysisPrompt: job.cvAnalysisPrompt,
      interviewPrompt: job.interviewPrompt,
      aiSecondInterviewPrompt: job.aiSecondInterviewPrompt,
      interviewLanguage: job.interviewLanguage,
      featured: job.featured,
      applicants: job.applicants,
      views: job.views,
      featuredJobs: job.featuredJobs,
      company: job.company ? {
        id: job.company.id,
        name: job.company.name,
        description: job.company.description,
        website: job.company.website,
        logo: job.company.logo,
        industry: job.company.industry,
        size: job.company.size,
        founded: job.company.founded,
        location: job.company.location,
        addressId: job.company.addressId,
        createdAt: job.company.createdAt,
        updatedAt: job.company.updatedAt,
      } : undefined,
      postedBy: {
        id: job.postedBy.id,
        userType: job.postedBy.userType,
        email: job.postedBy.email,
        name: job.postedBy.name,
        phone: job.postedBy.phone,
        avatar: job.postedBy.avatar,
        isActive: job.postedBy.isActive,
        companyId: job.postedBy.companyId,
        createdAt: job.postedBy.createdAt,
        updatedAt: job.postedBy.updatedAt,
      },
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }

  async findBySlug(slug: string): Promise<JobDto | null> {
    const job = await this.jobRepository.findOne({
      where: { slug },
      relations: ['postedBy', 'company'],
    });
    
    if (!job) {
      this.logger.warn(`Job not found with slug: ${slug}`);
      return null;
    }

    return this.findOne(job.id);
  }

  async updateJob(input: UpdateJobInput, userId: string): Promise<JobDto> {
    const job = await this.jobRepository.findOne({
      where: { id: input.id },
      relations: ['postedBy', 'company'],
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check if user has permission to update (must be the job poster or from the same company)
    if (job.postedById !== userId && job.companyId !== (await this.userRepository.findOne({ where: { id: userId } }))?.companyId) {
      throw new ForbiddenException('You do not have permission to update this job');
    }

    // Update only the fields that are provided
    const { id, ...updateData } = input;
    Object.assign(job, updateData);

    const updatedJob = await this.jobRepository.save(job);
    this.auditService.logJobCreation(userId, updatedJob.id); // Log the update

    return this.findOne(updatedJob.id) as Promise<JobDto>;
  }

  async deleteJob(id: string, userId: string): Promise<boolean> {
    const job = await this.jobRepository.findOne({
      where: { id },
      relations: ['postedBy'],
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check if user has permission to delete (must be the job poster or from the same company)
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (job.postedById !== userId && job.companyId !== user?.companyId) {
      throw new ForbiddenException('You do not have permission to delete this job');
    }

    // Soft delete: update status to DELETED instead of actually deleting
    job.status = JobStatus.DELETED;
    await this.jobRepository.save(job);
    
    this.auditService.logJobCreation(userId, id); // Log the deletion

    return true;
  }

  async hardDeleteJob(id: string, userId: string): Promise<boolean> {
    const job = await this.jobRepository.findOne({
      where: { id },
      relations: ['postedBy'],
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check if user has permission to delete (must be the job poster or from the same company)
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (job.postedById !== userId && job.companyId !== user?.companyId) {
      throw new ForbiddenException('You do not have permission to delete this job');
    }

    // Hard delete: actually remove from database
    await this.jobRepository.remove(job);
    this.auditService.logJobCreation(userId, id); // Log the deletion

    return true;
  }

  // ==================== SAVED JOBS METHODS ====================

  /**
   * Save a job for a user (bookmark/favorite)
   * @param userId - The ID of the user saving the job
   * @param jobId - The ID of the job to save
   * @param notes - Optional notes about why they saved this job
   * @returns The saved job record
   */
  async saveJob(userId: string, jobId: string, notes?: string): Promise<SavedJobDto> {
    // Verify job exists
    const job = await this.jobRepository.findOne({ 
      where: { id: jobId },
      relations: ['postedBy', 'company']
    });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check if already saved
    const existing = await this.savedJobRepository.findOne({
      where: { userId, jobId }
    });
    if (existing) {
      throw new ConflictException('Job already saved');
    }

    // Create saved job record
    const savedJob = this.savedJobRepository.create({
      userId,
      jobId,
      notes
    });

    const saved = await this.savedJobRepository.save(savedJob);
    
    console.log(`✅ User ${userId} saved job ${jobId}`);

    // Return with full job details
    return {
      id: saved.id,
      userId: saved.userId,
      jobId: saved.jobId,
      savedAt: saved.savedAt,
      notes: saved.notes,
      job: await this.findOne(jobId) as JobDto
    };
  }

  /**
   * Unsave a job for a user (remove bookmark/favorite)
   * @param userId - The ID of the user unsaving the job
   * @param jobId - The ID of the job to unsave
   * @returns True if successfully unsaved
   */
  async unsaveJob(userId: string, jobId: string): Promise<boolean> {
    const savedJob = await this.savedJobRepository.findOne({
      where: { userId, jobId }
    });

    if (!savedJob) {
      throw new NotFoundException('Saved job not found');
    }

    await this.savedJobRepository.remove(savedJob);
    
    console.log(`🗑️ User ${userId} unsaved job ${jobId}`);

    return true;
  }

  /**
   * Check if a user has saved a specific job
   * @param userId - The ID of the user
   * @param jobId - The ID of the job
   * @returns True if the job is saved
   */
  async isJobSaved(userId: string, jobId: string): Promise<boolean> {
    const count = await this.savedJobRepository.count({
      where: { userId, jobId }
    });
    return count > 0;
  }

  /**
   * Get all saved jobs for a user
   * @param userId - The ID of the user
   * @returns List of saved jobs with full job details
   */
  async getSavedJobs(userId: string): Promise<SavedJobDto[]> {
    const savedJobs = await this.savedJobRepository.find({
      where: { userId },
      relations: ['job', 'job.postedBy', 'job.company'],
      order: { savedAt: 'DESC' }
    });

    return Promise.all(savedJobs.map(async (saved) => ({
      id: saved.id,
      userId: saved.userId,
      jobId: saved.jobId,
      savedAt: saved.savedAt,
      notes: saved.notes,
      job: await this.findOne(saved.jobId) as JobDto
    })));
  }
}