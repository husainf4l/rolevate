import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { ApplicationService } from './application.service';
import { Application } from './application.entity';
import { ApplicationNote } from './application-note.entity';
import { CreateApplicationInput } from './create-application.input';
import { UpdateApplicationInput } from './update-application.input';
import { UpdateApplicationAnalysisInput } from './update-application-analysis.input';
import { CreateApplicationNoteInput } from './create-application-note.input';
import { UpdateApplicationNoteInput } from './update-application-note.input';
import { ApplicationFilterInput } from './application-filter.input';
import { ApplicationPaginationInput } from './application-filter.input';
import { ApplicationResponse } from './application-response.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { BusinessOrApiKeyGuard } from '../auth/business-or-api-key.guard';
import { JwtOrApiKeyGuard } from '../auth/jwt-or-api-key.guard';
import { Public } from '../auth/public.decorator';

@Resolver(() => Application)
export class ApplicationResolver {
  constructor(private readonly applicationService: ApplicationService) {}

  @Public()
  @Mutation(() => ApplicationResponse)
  async createApplication(
    @Args('input') createApplicationInput: CreateApplicationInput,
    @Context() context: any,
  ): Promise<ApplicationResponse> {
    // Check if user is authenticated
    const userId = context.req?.user?.userId;
    
    // If candidateId is not provided and user is not authenticated, create anonymous application
    if (!createApplicationInput.candidateId && !userId) {
      return this.applicationService.createAnonymousApplication(createApplicationInput);
    }
    
    // If candidateId is not provided but user is authenticated, use the authenticated user's ID
    if (!createApplicationInput.candidateId && userId) {
      createApplicationInput.candidateId = userId;
    }
    
    const application = await this.applicationService.create(createApplicationInput, userId);
    return {
      application,
      message: 'Application submitted successfully'
    };
  }

  @Query(() => [Application], { name: 'applications' })
  @UseGuards(JwtOrApiKeyGuard)
  async findAll(
    @Context() context: any,
    @Args('filter', { nullable: true }) filter?: ApplicationFilterInput,
    @Args('pagination', { nullable: true }) pagination?: ApplicationPaginationInput,
  ): Promise<Application[]> {
    return this.applicationService.findAll(filter, pagination, context.req.user);
  }

  @Query(() => Application, { name: 'application', nullable: true })
  @UseGuards(JwtOrApiKeyGuard)
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
  @UseGuards(JwtOrApiKeyGuard)
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

    @Mutation(() => Boolean, { name: 'removeApplicationNote' })
  @UseGuards(JwtAuthGuard)
  async removeApplicationNote(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.req.user.userId;
    return this.applicationService.removeApplicationNote(id, userId);
  }

  /**
   * Update application CV analysis results
   * This mutation is called by the FastAPI CV analysis service
   * Requires API Key authentication (system API key)
   */
  @Mutation(() => Application, { name: 'updateApplicationAnalysis' })
  @UseGuards(ApiKeyGuard)
  async updateApplicationAnalysis(
    @Args('input') input: UpdateApplicationAnalysisInput,
  ): Promise<Application> {
    console.log('📊 Received CV analysis results from FastAPI service for application:', input.applicationId);
    return this.applicationService.updateApplicationAnalysis(input);
  }
}