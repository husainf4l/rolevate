import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SavedJobService } from './saved-job.service';
import { SavedJobDto } from './saved-job.dto';
import { SavedJob } from './saved-job.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JobDto } from '../job/job.dto';

@Resolver(() => SavedJobDto)
export class SavedJobResolver {
  constructor(private readonly savedJobService: SavedJobService) {}

  @Mutation(() => SavedJobDto, {
    description: 'Save a job to your saved list',
  })
  @UseGuards(JwtAuthGuard)
  async saveJob(
    @Args('jobId', { type: () => ID, description: 'ID of the job to save' }) jobId: string,
    @Context() context: any,
  ): Promise<SavedJobDto> {
    const userId = context.request.user.id;
    const savedJob = await this.savedJobService.saveJob(userId, jobId);
    return this.mapToDto(savedJob);
  }

  @Mutation(() => Boolean, {
    description: 'Remove a job from your saved list',
  })
  @UseGuards(JwtAuthGuard)
  async unsaveJob(
    @Args('jobId', { type: () => ID, description: 'ID of the job to unsave' }) jobId: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.request.user.id;
    return this.savedJobService.unsaveJob(userId, jobId);
  }

  @Query(() => [SavedJobDto], {
    name: 'mySavedJobs',
    description: 'Get all your saved jobs',
  })
  @UseGuards(JwtAuthGuard)
  async getMySavedJobs(@Context() context: any): Promise<SavedJobDto[]> {
    const userId = context.request.user.id;
    const savedJobs = await this.savedJobService.findAllByUser(userId);
    return savedJobs.map(savedJob => this.mapToDto(savedJob));
  }

  @Query(() => Boolean, {
    name: 'isJobSaved',
    description: 'Check if a job is saved',
  })
  @UseGuards(JwtAuthGuard)
  async isJobSaved(
    @Args('jobId', { type: () => ID }) jobId: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.request.user.id;
    return this.savedJobService.isSaved(userId, jobId);
  }

  @Query(() => Number, {
    name: 'savedJobsCount',
    description: 'Get count of saved jobs',
  })
  @UseGuards(JwtAuthGuard)
  async getSavedJobsCount(@Context() context: any): Promise<number> {
    const userId = context.request.user.id;
    return this.savedJobService.countByUser(userId);
  }

  private mapToDto(savedJob: SavedJob): SavedJobDto {
    return {
      id: savedJob.id,
      userId: savedJob.userId,
      jobId: savedJob.jobId,
      job: savedJob.job ? this.mapJobToDto(savedJob.job) : undefined,
      savedAt: savedJob.savedAt,
    };
  }

  private mapJobToDto(job: any): JobDto {
    return {
      id: job.id,
      slug: job.slug,
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
      status: job.status,
      featured: job.featured,
      companyDescription: job.companyDescription,
      applicants: job.applicants,
      views: job.views,
      featuredJobs: job.featuredJobs,
      postedBy: job.postedBy,
      interviewPrompt: job.interviewPrompt,
      aiSecondInterviewPrompt: job.aiSecondInterviewPrompt,
      interviewLanguage: job.interviewLanguage,
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
        email: job.company.email,
        phone: job.company.phone,
        addressId: job.company.addressId,
        createdAt: job.company.createdAt,
        updatedAt: job.company.updatedAt,
      } : undefined,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }
}
