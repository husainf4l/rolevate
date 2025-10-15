import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interview, InterviewStatus } from './interview.entity';
import { CreateInterviewInput } from './create-interview.input';
import { UpdateInterviewInput } from './update-interview.input';
import { SubmitInterviewFeedbackInput } from './submit-interview-feedback.input';
import { TranscriptService } from './transcript.service';

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    private transcriptService: TranscriptService,
  ) {}

  async create(createInterviewInput: CreateInterviewInput): Promise<Interview> {
    const interview = this.interviewRepository.create(createInterviewInput);
    return this.interviewRepository.save(interview);
  }

  async findAll(): Promise<Interview[]> {
    return this.interviewRepository.find({
      relations: ['application', 'interviewer', 'transcripts'],
    });
  }

  async findOne(id: string): Promise<Interview | null> {
    return this.interviewRepository.findOne({
      where: { id },
      relations: ['application', 'interviewer', 'transcripts'],
    });
  }

  async findByApplicationId(applicationId: string): Promise<Interview[]> {
    return this.interviewRepository.find({
      where: { applicationId },
      relations: ['application', 'interviewer', 'transcripts'],
    });
  }

  async findByInterviewerId(interviewerId: string): Promise<Interview[]> {
    return this.interviewRepository.find({
      where: { interviewerId },
      relations: ['application', 'interviewer', 'transcripts'],
    });
  }

  async update(id: string, updateInterviewInput: UpdateInterviewInput): Promise<Interview | null> {
    await this.interviewRepository.update(id, updateInterviewInput);
    return this.findOne(id);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.interviewRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async submitFeedback(submitFeedbackInput: SubmitInterviewFeedbackInput): Promise<Interview | null> {
    const { interviewId, ...feedbackData } = submitFeedbackInput;

    // Update interview with feedback and mark as completed
    await this.interviewRepository.update(interviewId, {
      ...feedbackData,
      status: InterviewStatus.COMPLETED,
    });

    return this.findOne(interviewId);
  }

  async completeInterview(interviewId: string): Promise<Interview | null> {
    await this.interviewRepository.update(interviewId, {
      status: InterviewStatus.COMPLETED,
    });

    return this.findOne(interviewId);
  }

  async cancelInterview(interviewId: string, reason?: string): Promise<Interview | null> {
    await this.interviewRepository.update(interviewId, {
      status: InterviewStatus.CANCELLED,
      notes: reason,
    });

    return this.findOne(interviewId);
  }

  async markNoShow(interviewId: string): Promise<Interview | null> {
    await this.interviewRepository.update(interviewId, {
      status: InterviewStatus.NO_SHOW,
    });

    return this.findOne(interviewId);
  }

  // Get interview with full transcript data
  async getInterviewWithTranscripts(id: string): Promise<Interview | null> {
    const interview = await this.findOne(id);
    if (interview) {
      const transcriptSummary = await this.transcriptService.getInterviewTranscriptSummary(id);
      return {
        ...interview,
        transcriptSummary,
      } as Interview;
    }
    return null;
  }

  // Get all interviews for an application with transcript summaries
  async getApplicationInterviewsWithTranscripts(applicationId: string): Promise<Interview[]> {
    const interviews = await this.findByApplicationId(applicationId);

    // Add transcript summaries to each interview
    const interviewsWithSummaries = await Promise.all(
      interviews.map(async (interview) => {
        const transcriptSummary = await this.transcriptService.getInterviewTranscriptSummary(interview.id);
        return {
          ...interview,
          transcriptSummary,
        } as Interview;
      })
    );

    return interviewsWithSummaries;
  }
}