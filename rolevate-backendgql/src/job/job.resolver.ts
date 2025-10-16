import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JobService } from './job.service';
import { JobDto } from './job.dto';
import { CreateJobInput } from './create-job.input';
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
  async createJob(@Args('input') input: CreateJobInput): Promise<JobDto> {
    return this.jobService.createJob(input);
  }

  @Query(() => [JobDto])
  async jobs(
    @Args('filter', { nullable: true }) filter?: JobFilterInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<JobDto[]> {
    return this.jobService.findAll(filter, pagination);
  }

  @Query(() => JobDto, { nullable: true })
  async job(@Args('id') id: string): Promise<JobDto | null> {
    return this.jobService.findOne(id);
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