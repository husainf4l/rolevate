import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { InterviewService } from './interview.service';
import { Interview } from './interview.entity';
import { CreateInterviewInput } from './create-interview.input';
import { UpdateInterviewInput } from './update-interview.input';
import { SubmitInterviewFeedbackInput } from './submit-interview-feedback.input';
import { InterviewWithTranscriptSummary } from './interview-with-transcript-summary.dto';
import { RoomAccess } from './room-access.dto';
import { Public } from '../auth/public.decorator';

@Resolver(() => Interview)
export class InterviewResolver {
  constructor(private readonly interviewService: InterviewService) {}

  @Mutation(() => Interview)
  async createInterview(@Args('input') createInterviewInput: CreateInterviewInput): Promise<Interview> {
    return this.interviewService.create(createInterviewInput);
  }

  @Query(() => [Interview], { name: 'interviews' })
  async findAll(): Promise<Interview[]> {
    return this.interviewService.findAll();
  }

  @Query(() => Interview, { name: 'interview', nullable: true })
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<Interview | null> {
    return this.interviewService.findOne(id);
  }

  @Query(() => [Interview], { name: 'interviewsByApplication' })
  async findByApplicationId(@Args('applicationId', { type: () => ID }) applicationId: string): Promise<Interview[]> {
    return this.interviewService.findByApplicationId(applicationId);
  }

  @Query(() => [Interview], { name: 'interviewsByInterviewer' })
  async findByInterviewerId(@Args('interviewerId', { type: () => ID }) interviewerId: string): Promise<Interview[]> {
    return this.interviewService.findByInterviewerId(interviewerId);
  }

  @Mutation(() => Interview, { nullable: true })
  async updateInterview(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateInterviewInput: UpdateInterviewInput,
  ): Promise<Interview | null> {
    return this.interviewService.update(id, updateInterviewInput);
  }

  @Mutation(() => Boolean)
  async removeInterview(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.interviewService.remove(id);
  }

  @Mutation(() => Interview, { nullable: true })
  async submitInterviewFeedback(@Args('input') submitFeedbackInput: SubmitInterviewFeedbackInput): Promise<Interview | null> {
    return this.interviewService.submitFeedback(submitFeedbackInput);
  }

  @Mutation(() => Interview, { nullable: true })
  async completeInterview(@Args('id', { type: () => ID }) id: string): Promise<Interview | null> {
    return this.interviewService.completeInterview(id);
  }

  @Mutation(() => Interview, { nullable: true })
  async cancelInterview(
    @Args('id', { type: () => ID }) id: string,
    @Args('reason', { nullable: true }) reason?: string,
  ): Promise<Interview | null> {
    return this.interviewService.cancelInterview(id, reason);
  }

  @Mutation(() => Interview, { nullable: true })
  async markInterviewNoShow(@Args('id', { type: () => ID }) id: string): Promise<Interview | null> {
    return this.interviewService.markNoShow(id);
  }

  @Query(() => InterviewWithTranscriptSummary, { name: 'interviewWithTranscripts', nullable: true })
  async getInterviewWithTranscripts(@Args('id', { type: () => ID }) id: string): Promise<InterviewWithTranscriptSummary | null> {
    return this.interviewService.getInterviewWithTranscripts(id);
  }

  @Query(() => [InterviewWithTranscriptSummary], { name: 'applicationInterviewsWithTranscripts' })
  async getApplicationInterviewsWithTranscripts(@Args('applicationId', { type: () => ID }) applicationId: string): Promise<InterviewWithTranscriptSummary[]> {
    return this.interviewService.getApplicationInterviewsWithTranscripts(applicationId);
  }

  @Public()
  @Query(() => RoomAccess, { name: 'joinInterviewRoom' })
  async joinInterviewRoom(
    @Args('interviewId', { type: () => ID, nullable: true }) interviewId?: string,
    @Args('participantName', { nullable: true }) participantName?: string,
    @Args('jobId', { type: () => ID, nullable: true }) jobId?: string,
    @Args('phone', { nullable: true }) phone?: string,
    @Args('roomName', { nullable: true }) roomName?: string,
  ): Promise<RoomAccess> {
    return this.interviewService.generateRoomAccessToken(
      interviewId,
      participantName,
      jobId,
      phone,
      roomName,
    );
  }
}