import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './job.entity';
import { CreateJobInput } from './create-job.input';
import { JobDto } from './job.dto';
import { JobFilterInput } from './job-filter.input';
import { PaginationInput } from './pagination.input';
import { User } from '../user/user.entity';
import { Company } from '../company/company.entity';
import { AuditService } from '../audit.service';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private auditService: AuditService,
  ) {}

  async createJob(input: CreateJobInput): Promise<JobDto> {
    const postedBy = await this.userRepository.findOne({ where: { id: input.postedById } });
    if (!postedBy) {
      throw new NotFoundException('User not found');
    }

    const job = this.jobRepository.create({
      ...input,
      postedBy,
      companyId: postedBy.companyId,
    });
    const savedJob = await this.jobRepository.save(job);
    this.auditService.logJobCreation(input.postedById, savedJob.id);

    // Return the full job with relations
    return this.findOne(savedJob.id) as Promise<JobDto>;
  }

  async findAll(filter?: JobFilterInput, pagination?: PaginationInput): Promise<JobDto[]> {
    const queryBuilder = this.jobRepository.createQueryBuilder('job')
      .leftJoinAndSelect('job.postedBy', 'postedBy')
      .leftJoinAndSelect('job.company', 'company');

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

    if (pagination) {
      if (pagination.skip) {
        queryBuilder.skip(pagination.skip);
      }
      if (pagination.take) {
        queryBuilder.take(pagination.take);
      }
    } else {
      queryBuilder.take(10); // default limit
    }

    const jobs = await queryBuilder.getMany();

    return jobs.map(job => ({
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
      cvAnalysisPrompt: job.cvAnalysisPrompt,
      interviewPrompt: job.interviewPrompt,
      aiSecondInterviewPrompt: job.aiSecondInterviewPrompt,
      interviewLanguage: job.interviewLanguage,
      featured: job.featured,
      applicants: job.applicants,
      views: job.views,
      featuredJobs: job.featured,
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
    }));
  }

  async findOne(id: string): Promise<JobDto | null> {
    const job = await this.jobRepository.findOne({
      where: { id },
      relations: ['postedBy', 'company'],
    });
    if (!job) return null;

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
}