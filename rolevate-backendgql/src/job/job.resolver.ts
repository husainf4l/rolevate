import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JobService } from './job.service';
import { JobDto } from './job.dto';
import { CreateJobInput } from './create-job.input';
import { JobFilterInput } from './job-filter.input';
import { PaginationInput } from './pagination.input';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiKeyGuard } from '../auth/api-key.guard';

@Resolver(() => JobDto)
export class JobResolver {
  constructor(private jobService: JobService) {}

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
  @UseGuards(ApiKeyGuard)
  async job(@Args('id') id: string): Promise<JobDto | null> {
    return this.jobService.findOne(id);
  }
}