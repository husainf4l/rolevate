import { Resolver, Query, Mutation, Args, Context, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JobService } from './job.service';
import { JobDto } from './job.dto';
import { PaginatedJobsResponse } from './paginated-jobs.dto';
import { SavedJobDto } from './saved-job.dto';
import { JobFilterInput } from './job-filter.input';
import { PaginationInput } from '../common/pagination.dto';
import { CreateJobInput } from './create-job.input';
import { UpdateJobInput } from './update-job.input';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';
import { UserType } from '../user/user.entity';
import { UserService } from '../user/user.service';

@Resolver(() => JobDto)
export class JobResolver {
  constructor(
    private jobService: JobService,
    private userService: UserService,
  ) {}

  @Mutation(() => JobDto)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.BUSINESS)
  async createJob(
    @Args('input') input: CreateJobInput,
    @Context() context: any,
  ): Promise<JobDto> {
    const userId = context.req.user.id;
    return this.jobService.createJob(input, userId);
  }

  @Mutation(() => JobDto)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.BUSINESS)
  async updateJob(
    @Args('input') input: UpdateJobInput,
    @Context() context: any,
  ): Promise<JobDto> {
    const userId = context.req.user.id;
    return this.jobService.updateJob(input, userId);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.BUSINESS)
  async deleteJob(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.req.user.id;
    return this.jobService.deleteJob(id, userId);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  async hardDeleteJob(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.req.user.id;
    return this.jobService.hardDeleteJob(id, userId);
  }

  @Query(() => PaginatedJobsResponse, { 
    name: 'jobs',
    description: 'Get all jobs with optional filtering and pagination. Public endpoint - no authentication required.'
  })
  @Public()
  async jobs(
    @Args('filter', { nullable: true, description: 'Filter jobs by various criteria' }) filter?: JobFilterInput,
    @Args('pagination', { nullable: true, description: 'Pagination options (page, limit)' }) pagination?: PaginationInput,
  ): Promise<PaginatedJobsResponse> {
    return this.jobService.findAll(filter, pagination);
  }

  @Query(() => JobDto, { nullable: true, description: 'Get a single job by ID. Public endpoint.' })
  @Public()
  async job(@Args('id', { type: () => ID }) id: string): Promise<JobDto | null> {
    return this.jobService.findOne(id);
  }

  @Query(() => JobDto, { nullable: true, description: 'Get a single job by slug. Public endpoint.' })
  @Public()
  async jobBySlug(@Args('slug') slug: string): Promise<JobDto | null> {
    return this.jobService.findBySlug(slug);
  }

  @Query(() => [JobDto], { description: 'Get all jobs posted by the authenticated user\'s company' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.BUSINESS)
  async companyJobs(@Context() context: any): Promise<JobDto[]> {
    const userId = context.req.user.id;
    const user = await this.userService.findOne(userId);
    if (!user || !user.companyId) {
      return [];
    }
    const result = await this.jobService.findAll({ companyId: user.companyId });
    return result.data;
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