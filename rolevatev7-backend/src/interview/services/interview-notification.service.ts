import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interview } from '../interview.entity';
import { WhatsAppService } from '../../whatsapp/whatsapp.service';

/**
 * Service responsible for sending interview-related notifications
 * Single Responsibility: Interview notification logic
 */
@Injectable()
export class InterviewNotificationService {
  private readonly logger = new Logger(InterviewNotificationService.name);

  constructor(
    @InjectRepository(Interview)
    private readonly interviewRepository: Repository<Interview>,
    private readonly whatsAppService: WhatsAppService,
  ) {}

  /**
   * Send interview feedback to candidate via WhatsApp
   */
  async sendFeedbackToCandidate(interview: Interview): Promise<void> {
    try {
      const interviewWithDetails = await this.getInterviewWithCandidateDetails(interview.id);

      if (!interviewWithDetails?.application?.candidate?.phone) {
        this.logger.warn(`No phone number found for candidate in interview ${interview.id}`);
        return;
      }

      const candidate = interviewWithDetails.application.candidate;
      const message = this.formatFeedbackMessage(interview, candidate.name);

      await this.whatsAppService.sendTextMessage(candidate.phone!, message);
      
      this.logger.log(
        `Feedback sent to candidate ${candidate.name} (${candidate.phone}) for interview ${interview.id}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to send feedback to candidate for interview ${interview.id}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Get interview with full candidate details
   */
  private async getInterviewWithCandidateDetails(interviewId: string): Promise<Interview | null> {
    return this.interviewRepository.findOne({
      where: { id: interviewId },
      relations: ['application', 'application.candidate'],
    });
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
}
