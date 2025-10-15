import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interview, InterviewStatus } from './interview.entity';
import { CreateInterviewInput } from './create-interview.input';
import { UpdateInterviewInput } from './update-interview.input';
import { SubmitInterviewFeedbackInput } from './submit-interview-feedback.input';
import { TranscriptService } from './transcript.service';
import { InterviewWithTranscriptSummary } from './interview-with-transcript-summary.dto';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    private transcriptService: TranscriptService,
    private whatsAppService: WhatsAppService,
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

    const updatedInterview = await this.findOne(interviewId);
    if (!updatedInterview) return null;

    // Automatically send feedback to candidate via WhatsApp
    try {
      await this.sendFeedbackToCandidate(updatedInterview);
    } catch (error) {
      // Log error but don't fail the feedback submission
      console.error('Failed to send feedback notification:', error);
    }

    return updatedInterview;
  }

  /**
   * Send interview feedback to candidate via WhatsApp
   */
  private async sendFeedbackToCandidate(interview: Interview): Promise<void> {
    // Get interview with application and candidate details
    const interviewWithDetails = await this.interviewRepository.findOne({
      where: { id: interview.id },
      relations: ['application', 'application.candidate'],
    });

    if (!interviewWithDetails?.application?.candidate?.phone) {
      console.warn(`No phone number found for candidate in interview ${interview.id}`);
      return;
    }

    const candidate = interviewWithDetails.application.candidate;
    const feedbackMessage = this.formatFeedbackMessage(interview, candidate.name);

    try {
      await this.whatsAppService.sendTextMessage(candidate.phone!, feedbackMessage);
      console.log(`Feedback sent to candidate ${candidate.name} (${candidate.phone}) for interview ${interview.id}`);
    } catch (error) {
      console.error(`Failed to send feedback to candidate ${candidate.phone}:`, error);
      throw error;
    }
  }

  /**
   * Format feedback message for WhatsApp delivery
   */
  private formatFeedbackMessage(interview: Interview, candidateName?: string): string {
    const greeting = candidateName ? `Hi ${candidateName},` : 'Hi,';

    let message = `${greeting}\n\nThank you for participating in your interview. Here is the feedback from your interviewer:\n\n`;

    if (interview.rating) {
      const stars = '⭐'.repeat(Math.round(interview.rating));
      message += `Rating: ${stars} (${interview.rating}/5)\n\n`;
    }

    if (interview.feedback) {
      message += `Feedback:\n${interview.feedback}\n\n`;
    }

    if (interview.notes) {
      message += `Additional Notes:\n${interview.notes}\n\n`;
    }

    message += `Best regards,\nRolevate Team`;

    return message;
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
}