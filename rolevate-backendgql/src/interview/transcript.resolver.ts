import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { TranscriptService } from './transcript.service';
import { Transcript } from './transcript.entity';
import { CreateTranscriptInput } from './create-transcript.input';
import { UpdateTranscriptInput } from './update-transcript.input';
import { InterviewTranscriptSummary } from './interview-transcript-summary.dto';

@Resolver(() => Transcript)
export class TranscriptResolver {
  constructor(private readonly transcriptService: TranscriptService) {}

  @Mutation(() => Transcript)
  async createTranscript(@Args('input') createTranscriptInput: CreateTranscriptInput): Promise<Transcript> {
    return this.transcriptService.create(createTranscriptInput);
  }

  @Mutation(() => [Transcript])
  async createBulkTranscripts(@Args('inputs', { type: () => [CreateTranscriptInput] }) inputs: CreateTranscriptInput[]): Promise<Transcript[]> {
    return this.transcriptService.createBulk(inputs);
  }

  @Query(() => [Transcript], { name: 'transcripts' })
  async findAll(): Promise<Transcript[]> {
    return this.transcriptService.findAll();
  }

  @Query(() => Transcript, { name: 'transcript', nullable: true })
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<Transcript | null> {
    return this.transcriptService.findOne(id);
  }

  @Query(() => [Transcript], { name: 'transcriptsByInterview' })
  async findByInterviewId(@Args('interviewId', { type: () => ID }) interviewId: string): Promise<Transcript[]> {
    return this.transcriptService.findByInterviewId(interviewId);
  }

  @Query(() => InterviewTranscriptSummary, { name: 'interviewTranscriptSummary', nullable: true })
  async getInterviewTranscriptSummary(@Args('interviewId', { type: () => ID }) interviewId: string): Promise<InterviewTranscriptSummary | null> {
    return this.transcriptService.getInterviewTranscriptSummary(interviewId);
  }

  @Mutation(() => Transcript, { nullable: true })
  async updateTranscript(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateTranscriptInput: UpdateTranscriptInput,
  ): Promise<Transcript | null> {
    return this.transcriptService.update(id, updateTranscriptInput);
  }

  @Mutation(() => Boolean)
  async removeTranscript(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.transcriptService.remove(id);
  }

  @Mutation(() => Number)
  async removeTranscriptsByInterview(@Args('interviewId', { type: () => ID }) interviewId: string): Promise<number> {
    return this.transcriptService.removeByInterviewId(interviewId);
  }
}
