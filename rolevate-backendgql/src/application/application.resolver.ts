import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { ApplicationService } from './application.service';
import { Application } from './application.entity';
import { ApplicationNote } from './application-note.entity';
import { CreateApplicationInput } from './create-application.input';
import { UpdateApplicationInput } from './update-application.input';
import { CreateApplicationNoteInput } from './create-application-note.input';
import { UpdateApplicationNoteInput } from './update-application-note.input';
import { ApplicationFilterInput } from './application-filter.input';
import { ApplicationPaginationInput } from './application-filter.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiKeyGuard } from '../auth/api-key.guard';

@Resolver(() => Application)
export class ApplicationResolver {
  constructor(private readonly applicationService: ApplicationService) {}

  @Mutation(() => Application)
  @UseGuards(JwtAuthGuard)
  async createApplication(
    @Args('input') createApplicationInput: CreateApplicationInput,
    @Context() context: any,
  ): Promise<Application> {
    const userId = context.req.user.userId;
    return this.applicationService.create(createApplicationInput, userId);
  }

  @Query(() => [Application], { name: 'applications' })
  @UseGuards(ApiKeyGuard)
  async findAll(
    @Args('filter', { nullable: true }) filter?: ApplicationFilterInput,
    @Args('pagination', { nullable: true }) pagination?: ApplicationPaginationInput,
  ): Promise<Application[]> {
    return this.applicationService.findAll(filter, pagination);
  }

  @Query(() => Application, { name: 'application', nullable: true })
  @UseGuards(ApiKeyGuard)
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<Application | null> {
    return this.applicationService.findOne(id);
  }

  @Query(() => [Application], { name: 'applicationsByJob' })
  @UseGuards(ApiKeyGuard)
  async findByJobId(@Args('jobId', { type: () => ID }) jobId: string): Promise<Application[]> {
    return this.applicationService.findByJobId(jobId);
  }

  @Query(() => [Application], { name: 'applicationsByCandidate' })
  @UseGuards(JwtAuthGuard)
  async findByCandidateId(
    @Args('candidateId', { type: () => ID }) candidateId: string,
    @Context() context: any,
  ): Promise<Application[]> {
    const userId = context.req.user.userId;
    // Only allow users to see their own applications or authorized personnel
    if (candidateId !== userId) {
      // TODO: Add role-based authorization check
      throw new Error('Unauthorized: Can only view your own applications');
    }
    return this.applicationService.findByCandidateId(candidateId);
  }

  @Mutation(() => Application, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async updateApplication(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateApplicationInput: UpdateApplicationInput,
    @Context() context: any,
  ): Promise<Application | null> {
    const userId = context.req.user.userId;
    return this.applicationService.update(id, updateApplicationInput, userId);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async removeApplication(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.req.user.userId;
    return this.applicationService.remove(id, userId);
  }

  // Application Notes
  @Mutation(() => ApplicationNote)
  @UseGuards(JwtAuthGuard)
  async createApplicationNote(
    @Args('input') createNoteInput: CreateApplicationNoteInput,
    @Context() context: any,
  ): Promise<ApplicationNote> {
    const userId = context.req.user.userId;
    return this.applicationService.createApplicationNote(createNoteInput, userId);
  }

  @Query(() => [ApplicationNote], { name: 'applicationNotes' })
  @UseGuards(ApiKeyGuard)
  async findApplicationNotes(
    @Args('applicationId', { type: () => ID }) applicationId: string,
  ): Promise<ApplicationNote[]> {
    return this.applicationService.findApplicationNotes(applicationId);
  }

  @Query(() => ApplicationNote, { name: 'applicationNote', nullable: true })
  @UseGuards(ApiKeyGuard)
  async findApplicationNote(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<ApplicationNote | null> {
    return this.applicationService.findApplicationNote(id);
  }

  @Mutation(() => ApplicationNote, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async updateApplicationNote(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateNoteInput: UpdateApplicationNoteInput,
    @Context() context: any,
  ): Promise<ApplicationNote | null> {
    const userId = context.req.user.userId;
    return this.applicationService.updateApplicationNote(id, updateNoteInput, userId);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async removeApplicationNote(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.req.user.userId;
    return this.applicationService.removeApplicationNote(id, userId);
  }
}