import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './job.entity';
import { CreateJobInput } from './create-job.input';
import { JobDto } from './job.dto';
import { User } from '../user/user.entity';
import { AuditService } from '../audit.service';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
    });
    const savedJob = await this.jobRepository.save(job);
    this.auditService.logJobCreation(input.postedById, savedJob.id);

    return {
      id: savedJob.id,
      title: savedJob.title,
      department: savedJob.department,
      location: savedJob.location,
      salary: savedJob.salary,
      type: savedJob.type,
      deadline: savedJob.deadline,
      description: savedJob.description,
      shortDescription: savedJob.shortDescription,
      responsibilities: savedJob.responsibilities,
      requirements: savedJob.requirements,
      benefits: savedJob.benefits,
      skills: savedJob.skills,
      experience: savedJob.experience,
      education: savedJob.education,
      jobLevel: savedJob.jobLevel,
      workType: savedJob.workType,
      industry: savedJob.industry,
      companyDescription: savedJob.companyDescription,
      status: savedJob.status,
      cvAnalysisPrompt: savedJob.cvAnalysisPrompt,
      interviewPrompt: savedJob.interviewPrompt,
      aiSecondInterviewPrompt: savedJob.aiSecondInterviewPrompt,
      interviewLanguage: savedJob.interviewLanguage,
      featured: savedJob.featured,
      applicants: savedJob.applicants,
      views: savedJob.views,
      featuredJobs: savedJob.featuredJobs,
      postedBy: {
        id: postedBy.id,
        userType: postedBy.userType,
        email: postedBy.email,
        name: postedBy.name,
        phone: postedBy.phone,
        avatar: postedBy.avatar,
        isActive: postedBy.isActive,
        companyId: postedBy.companyId,
        createdAt: postedBy.createdAt,
        updatedAt: postedBy.updatedAt,
      },
      createdAt: savedJob.createdAt,
      updatedAt: savedJob.updatedAt,
    };
  }

  async findAll(): Promise<JobDto[]> {
    const jobs = await this.jobRepository.find({ relations: ['postedBy'] });
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
      featuredJobs: job.featuredJobs,
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
      relations: ['postedBy'],
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