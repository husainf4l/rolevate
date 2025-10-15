import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ApplicationService } from './application.service';
import { Application } from './application.entity';
import { CreateApplicationInput } from './create-application.input';
import { UpdateApplicationInput } from './update-application.input';

@Resolver(() => Application)
export class ApplicationResolver {
  constructor(private readonly applicationService: ApplicationService) {}

  @Mutation(() => Application)
  async createApplication(@Args('input') createApplicationInput: CreateApplicationInput): Promise<Application> {
    return this.applicationService.create(createApplicationInput);
  }

  @Query(() => [Application], { name: 'applications' })
  async findAll(): Promise<Application[]> {
    return this.applicationService.findAll();
  }

  @Query(() => Application, { name: 'application', nullable: true })
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<Application | null> {
    return this.applicationService.findOne(id);
  }

  @Query(() => [Application], { name: 'applicationsByJob' })
  async findByJobId(@Args('jobId', { type: () => ID }) jobId: string): Promise<Application[]> {
    return this.applicationService.findByJobId(jobId);
  }

  @Query(() => [Application], { name: 'applicationsByCandidate' })
  async findByCandidateId(@Args('candidateId', { type: () => ID }) candidateId: string): Promise<Application[]> {
    return this.applicationService.findByCandidateId(candidateId);
  }

  @Mutation(() => Application, { nullable: true })
  async updateApplication(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateApplicationInput: UpdateApplicationInput,
  ): Promise<Application | null> {
    return this.applicationService.update(id, updateApplicationInput);
  }

  @Mutation(() => Boolean)
  async removeApplication(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.applicationService.remove(id);
  }
}