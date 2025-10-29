import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interview, InterviewStatus } from './interview.entity';
import { CreateInterviewInput } from './create-interview.input';
import { UpdateInterviewInput } from './update-interview.input';
import { SubmitInterviewFeedbackInput } from './submit-interview-feedback.input';
import { TranscriptService } from './transcript.service';
import { InterviewWithTranscriptSummary } from './interview-with-transcript-summary.dto';
import { RoomAccess } from './room-access.dto';
import { InterviewerCreatorService } from './services/interviewer-creator.service';
import { InterviewNotificationService } from './services/interview-notification.service';
import { InterviewRoomService } from './services/interview-room.service';

/**
 * Core Interview Service
 * Delegates specialized logic to dedicated services following Single Responsibility Principle
 */
@Injectable()
export class InterviewService {
  private readonly logger = new Logger(InterviewService.name);

  constructor(
    @InjectRepository(Interview)
    private readonly interviewRepository: Repository<Interview>,
    private readonly transcriptService: TranscriptService,
    private readonly interviewerCreatorService: InterviewerCreatorService,
    private readonly notificationService: InterviewNotificationService,
    private readonly roomService: InterviewRoomService,
  ) {}

  /**
   * Create a new interview
   * Delegates AI interviewer creation to InterviewerCreatorService
   */
  async create(createInterviewInput: CreateInterviewInput): Promise<Interview> {
    await this.interviewerCreatorService.ensureInterviewerExists(
      createInterviewInput.interviewerId
    );

    const interview = this.interviewRepository.create(createInterviewInput);
    const saved = await this.interviewRepository.save(interview);
    
    this.logger.log(`Interview created: ${saved.id}`);
    return saved;
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

  /**
   * Submit interview feedback
   * Delegates notification to InterviewNotificationService
   */
  async submitFeedback(submitFeedbackInput: SubmitInterviewFeedbackInput): Promise<Interview | null> {
    const { interviewId, ...feedbackData } = submitFeedbackInput;

    await this.interviewRepository.update(interviewId, {
      ...feedbackData,
      status: InterviewStatus.COMPLETED,
    });

    const updatedInterview = await this.findOne(interviewId);
    if (!updatedInterview) {
      this.logger.warn(`Interview not found after feedback submission: ${interviewId}`);
      return null;
    }

    try {
      await this.notificationService.sendFeedbackToCandidate(updatedInterview);
    } catch (error) {
      this.logger.error(`Failed to send feedback notification: ${error.message}`, error.stack);
    }

    this.logger.log(`Feedback submitted for interview: ${interviewId}`);
    return updatedInterview;
  }

  /**
   * Complete an interview
   */
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
  async getInterviewWithTranscripts(id: string): Promise<InterviewWithTranscriptSummary | null> {
    const interview = await this.findOne(id);
    if (!interview) return null;

    const transcriptSummary = await this.transcriptService.getInterviewTranscriptSummary(id);

    return {
      id: interview.id,
      applicationId: interview.applicationId,
      interviewerId: interview.interviewerId,
      scheduledAt: interview.scheduledAt,
      duration: interview.duration,
      type: interview.type,
      status: interview.status,
      notes: interview.notes,
      feedback: interview.feedback,
      rating: interview.rating,
      recordingUrl: interview.recordingUrl,
      roomId: interview.roomId,
      transcriptSummary: transcriptSummary || undefined,
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
    };
  }

  // Get all interviews for an application with transcript summaries
  async getApplicationInterviewsWithTranscripts(applicationId: string): Promise<InterviewWithTranscriptSummary[]> {
    const interviews = await this.findByApplicationId(applicationId);

    // Add transcript summaries to each interview
    const interviewsWithSummaries = await Promise.all(
      interviews.map(async (interview) => {
        const transcriptSummary = await this.transcriptService.getInterviewTranscriptSummary(interview.id);
        return {
          id: interview.id,
          applicationId: interview.applicationId,
          interviewerId: interview.interviewerId,
          scheduledAt: interview.scheduledAt,
          duration: interview.duration,
          type: interview.type,
          status: interview.status,
          notes: interview.notes,
          feedback: interview.feedback,
          rating: interview.rating,
          recordingUrl: interview.recordingUrl,
          roomId: interview.roomId,
          transcriptSummary: transcriptSummary || undefined,
          createdAt: interview.createdAt,
          updatedAt: interview.updatedAt,
        };
      })
    );

    return interviewsWithSummaries;
  }

  /**
   * Generate room access token for joining an interview
   * Delegates to InterviewRoomService
   */
  async generateRoomAccessToken(
    interviewId?: string,
    participantName?: string,
    jobId?: string,
    phone?: string,
    roomName?: string,
  ): Promise<RoomAccess> {
    return this.roomService.generateRoomAccessToken(
      interviewId,
      participantName,
      jobId,
      phone,
      roomName,
    );
  }
}