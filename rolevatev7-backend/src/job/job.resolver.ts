import { Resolver, Query, Mutation, Args, Context, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JobService } from './job.service';
import { JobDto } from './job.dto';
import { SavedJobDto } from './saved-job.dto';
import { JobFilterInput } from './job-filter.input';
import { PaginationInput } from '../common/pagination.dto';
import { CreateJobInput } from './create-job.input';
import { UpdateJobInput } from './update-job.input';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from '../user/user.service';

@Resolver(() => JobDto)
export class JobResolver {
  constructor(
    private jobService: JobService,
    private userService: UserService,
  ) {}

  @Mutation(() => JobDto)
  @UseGuards(JwtAuthGuard) // Only authenticated users can post jobs
  async createJob(
    @Args('input') input: CreateJobInput,
    @Context() context: any,
  ): Promise<JobDto> {
    const userId = context.req.user.id;
    return this.jobService.createJob(input, userId);
  }

  @Mutation(() => JobDto)
  @UseGuards(JwtAuthGuard) // Only authenticated users can update jobs
  async updateJob(
    @Args('input') input: UpdateJobInput,
    @Context() context: any,
  ): Promise<JobDto> {
    const userId = context.req.user.id;
    return this.jobService.updateJob(input, userId);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard) // Only authenticated users can delete jobs
  async deleteJob(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.req.user.id;
    return this.jobService.deleteJob(id, userId);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard) // Only authenticated users can hard delete jobs
  async hardDeleteJob(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.req.user.id;
    return this.jobService.hardDeleteJob(id, userId);
  }

  @Query(() => [JobDto])
  async jobs(
    @Args('filter', { nullable: true }) filter?: JobFilterInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<JobDto[]> {
    return this.jobService.findAll(filter, pagination);
  }

  @Query(() => JobDto, { nullable: true })
  async job(@Args('id', { type: () => ID }) id: string): Promise<JobDto | null> {
    return this.jobService.findOne(id);
  }

  @Query(() => JobDto, { nullable: true })
  async jobBySlug(@Args('slug') slug: string): Promise<JobDto | null> {
    return this.jobService.findBySlug(slug);
  }

  @Query(() => [JobDto])
  @UseGuards(JwtAuthGuard)
  async companyJobs(@Context() context: any): Promise<JobDto[]> {
    const userId = context.req.user.id;
    const user = await this.userService.findOne(userId);
    if (!user || !user.companyId) {
      return [];
    }
    return this.jobService.findAll({ companyId: user.companyId });
  }

  // ==================== SAVED JOBS MUTATIONS & QUERIES ====================

  /**
   * Save a job (bookmark/favorite)
   * Allows authenticated users to save jobs for later viewing
   */
  @Mutation(() => SavedJobDto, {
    description: 'Save a job to your favorites/bookmarks'
  })
  @UseGuards(JwtAuthGuard)
  async saveJob(
    @Args('jobId', { type: () => ID }) jobId: string,
    @Args('notes', { type: () => String, nullable: true }) notes: string | undefined,
    @Context() context: any,
  ): Promise<SavedJobDto> {
    const userId = context.req.user.id;
    return this.jobService.saveJob(userId, jobId, notes);
  }

  /**
   * Unsave a job (remove from bookmarks)
   * Removes a job from the user's saved jobs list
   */
  @Mutation(() => Boolean, {
    description: 'Remove a job from your favorites/bookmarks'
  })
  @UseGuards(JwtAuthGuard)
  async unsaveJob(
    @Args('jobId', { type: () => ID }) jobId: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.req.user.id;
    return this.jobService.unsaveJob(userId, jobId);
  }

  /**
   * Check if a job is saved by the current user
   * Useful for UI to show saved/unsaved state
   */
  @Query(() => Boolean, {
    description: 'Check if a job is saved in your favorites'
  })
  @UseGuards(JwtAuthGuard)
  async isJobSaved(
    @Args('jobId', { type: () => ID }) jobId: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.req.user.id;
    return this.jobService.isJobSaved(userId, jobId);
  }

  /**
   * Get all saved jobs for the current user
   * Returns list of jobs with savedAt timestamp and notes
   */
  @Query(() => [SavedJobDto], {
    description: 'Get all your saved/favorited jobs'
  })
  @UseGuards(JwtAuthGuard)
  async savedJobs(
    @Context() context: any,
  ): Promise<SavedJobDto[]> {
    const userId = context.req.user.id;
    return this.jobService.getSavedJobs(userId);
  }
}