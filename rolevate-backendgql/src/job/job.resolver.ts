import { Resolver, Query, Mutation, Args, Int, Context, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JobService } from './job.service';
import { JobDto } from './job.dto';
import { CreateJobInput } from './create-job.input';
import { UpdateJobInput } from './update-job.input';
import { JobFilterInput } from './job-filter.input';
import { PaginationInput } from './pagination.input';
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
}