import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Interview, InterviewStatus } from './interview.entity';
import { CreateInterviewInput } from './create-interview.input';
import { UpdateInterviewInput } from './update-interview.input';
import { SubmitInterviewFeedbackInput } from './submit-interview-feedback.input';
import { TranscriptService } from './transcript.service';
import { InterviewWithTranscriptSummary } from './interview-with-transcript-summary.dto';
import { RoomAccess } from './room-access.dto';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { LiveKitService } from '../livekit/livekit.service';
import { ConfigService } from '@nestjs/config';
import { Application } from '../application/application.entity';
import { User, UserType } from '../user/user.entity';

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private transcriptService: TranscriptService,
    private whatsAppService: WhatsAppService,
    private liveKitService: LiveKitService,
    private configService: ConfigService,
  ) {}

  async create(createInterviewInput: CreateInterviewInput): Promise<Interview> {
    // Check if interviewer exists, if not create an AI interviewer
    const existingInterviewer = await this.userRepository.findOne({
      where: { id: createInterviewInput.interviewerId }
    });

    if (!existingInterviewer) {
      console.log(`🤖 Creating AI interviewer with ID: ${createInterviewInput.interviewerId}`);
      // Create AI interviewer user
      const aiInterviewer = this.userRepository.create({
        id: createInterviewInput.interviewerId, // Use the provided ID
        userType: UserType.SYSTEM,
        name: 'AI Interviewer',
        email: `ai-interviewer-${createInterviewInput.interviewerId}@rolevate.ai`,
        isActive: true,
      });
      await this.userRepository.save(aiInterviewer);
      console.log(`✅ AI interviewer created: ${aiInterviewer.name} (${aiInterviewer.id})`);
    }

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

  /**
   * Generate room access token for joining an interview (Public - no auth required)
   * Supports multiple ways to join:
   * 1. By interviewId - Join a specific interview room
   * 2. By jobId + phone - Find or create room for candidate's interview with full metadata
   * 3. By roomName - Join directly by room name (can extract applicationId from room name)
   */
  async generateRoomAccessToken(
    interviewId?: string,
    participantName?: string,
    jobId?: string,
    phone?: string,
    roomName?: string,
  ): Promise<RoomAccess> {
    try {
      let interview: Interview | null = null;
      let finalRoomName: string | undefined = roomName;
      let finalParticipantName = participantName || 'Anonymous';
      let shouldCreateRoom = false;
      let metadata: any = {};
      let application: Application | null = null;

      // Option 1: Join by interview ID
      if (interviewId) {
        interview = await this.findOne(interviewId);
        
        if (!interview) {
          return {
            success: false,
            error: 'Interview not found',
          };
        }

        // If interview doesn't have a room, create one
        if (!interview.roomId) {
          finalRoomName = `interview-${interviewId}-${Date.now()}`;
          shouldCreateRoom = true;
          
          // Update interview with the new roomId
          await this.interviewRepository.update(interviewId, {
            roomId: finalRoomName,
          });
          
          // Fetch application data for metadata
          application = await this.applicationRepository.findOne({
            where: { id: interview.applicationId },
            relations: ['candidate', 'job', 'job.company'],
          });
          
          if (application) {
            metadata = this.buildRoomMetadata(application);
          }
        } else {
          finalRoomName = interview.roomId;
        }
      }
      // Option 2: Join by jobId + phone (find or create candidate's interview room with full metadata)
      else if (jobId && phone) {
        console.log(`🔍 Looking for application with jobId: ${jobId}, phone: ${phone}`);
        
        // Normalize phone numbers for matching
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, ''); // Remove spaces, dashes, parentheses
        const phoneWithPlus = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
        const phoneWithoutPlus = cleanPhone.replace('+', '');
        
        console.log(`📱 Phone variations - original: ${phone}, with+: ${phoneWithPlus}, without+: ${phoneWithoutPlus}`);
        
        // Find application by job and candidate phone with all relations
        // Note: candidate is a User entity, so we check the user's phone field
        application = await this.applicationRepository
          .createQueryBuilder('application')
          .leftJoinAndSelect('application.candidate', 'candidate')
          .leftJoinAndSelect('application.job', 'job')
          .leftJoinAndSelect('job.company', 'company')
          .where('application.jobId = :jobId', { jobId })
          .andWhere(
            new Brackets((qb) => {
              qb.where('candidate.phone = :phone', { phone })
                .orWhere('candidate.phone = :phoneWithPlus', { phoneWithPlus })
                .orWhere('candidate.phone = :phoneWithoutPlus', { phoneWithoutPlus })
                .orWhere('candidate.phone LIKE :phonePattern1', { phonePattern1: `%${phoneWithoutPlus}` })
                .orWhere('candidate.phone LIKE :phonePattern2', { phonePattern2: `${phoneWithoutPlus}%` })
                .orWhere('REPLACE(REPLACE(REPLACE(REPLACE(candidate.phone, \'+\', \'\'), \' \', \'\'), \'-\', \'\'), \'(\', \'\') = :cleanPhone', { cleanPhone: phoneWithoutPlus });
            })
          )
          .getOne();

        if (!application) {
          console.log(`❌ No application found for jobId: ${jobId}, phone variations: ${phone}, ${phoneWithPlus}, ${phoneWithoutPlus}`);
          
          // Debug: Let's see what applications exist for this job
          const debugApplications = await this.applicationRepository
            .createQueryBuilder('application')
            .leftJoinAndSelect('application.candidate', 'candidate')
            .where('application.jobId = :jobId', { jobId })
            .getMany();
          
          console.log(`📋 Found ${debugApplications.length} applications for jobId ${jobId}:`);
          debugApplications.forEach(app => {
            console.log(`  - Application ID: ${app.id}, Candidate: ${app.candidate?.name}, Phone: ${app.candidate?.phone}`);
          });
          
          // If roomName is provided and follows format interview_{applicationId}_{timestamp}
          // Try to extract applicationId and use it
          if (roomName && roomName.startsWith('interview_')) {
            const parts = roomName.split('_');
            if (parts.length >= 2) {
              const possibleAppId = parts[1];
              console.log(`🔍 Attempting to find application by extracted ID from roomName: ${possibleAppId}`);
              
              application = await this.applicationRepository.findOne({
                where: { id: possibleAppId },
                relations: ['candidate', 'job', 'job.company'],
              });
              
              if (application) {
                console.log(`✅ Found application by roomName: ${application.candidate.name} for job: ${application.job.title}`);
                finalRoomName = roomName;
                shouldCreateRoom = true;
                metadata = this.buildRoomMetadata(application);
                
                if (!participantName && application.candidate?.name) {
                  finalParticipantName = application.candidate.name;
                }
              }
            }
          }
          
          if (!application) {
            return {
              success: false,
              error: 'No application found for this job and phone number. Please verify the phone number is registered.',
            };
          }
        } else {
          console.log(`✅ Found application: ${application.candidate.name} for job: ${application.job.title}`);
          console.log(`📱 Matched with phone: ${application.candidate.phone}`);
        }

        if (application) {
          // Use candidate name if available and participantName not provided
          if (!participantName && application.candidate?.name) {
            finalParticipantName = application.candidate.name;
          }

          // Build comprehensive metadata for the AI agent
          metadata = this.buildRoomMetadata(application);
          
          // If roomName was not already set, check for existing interview or create new room
          if (!finalRoomName) {
            // Check if there's an existing interview for this application
            const existingInterviews = await this.interviewRepository.find({
              where: {
                applicationId: application.id,
                status: InterviewStatus.SCHEDULED,
              },
              order: {
                scheduledAt: 'ASC',
              },
            });

            if (existingInterviews.length > 0 && existingInterviews[0].roomId) {
              // Use existing room
              interview = existingInterviews[0];
              finalRoomName = interview.roomId;
              console.log(`🔗 Using existing room: ${finalRoomName}`);
            } else {
              // Create new room with comprehensive metadata
              const timestamp = Date.now();
              finalRoomName = `interview_${application.id}_${timestamp}`;
              shouldCreateRoom = true;
              
              console.log(`🏗️ Creating new room: ${finalRoomName} with metadata`);
              console.log(`📋 Metadata includes: job, company, candidate, CV analysis, interview language: ${metadata.interviewLanguage}`);
              
              // Create or update interview record
              if (existingInterviews.length > 0) {
                interview = existingInterviews[0];
                await this.interviewRepository.update(interview.id, {
                  roomId: finalRoomName,
                });
              }
            }
          }
        }
      }
      // Option 3: Join by room name directly
      else if (finalRoomName) {
        // Room name is already set, we'll create it if it doesn't exist
        shouldCreateRoom = true;
        metadata = {
          roomName: finalRoomName,
          participantName: finalParticipantName,
        };
      }
      else {
        return {
          success: false,
          error: 'Please provide either interviewId, (jobId + phone), or roomName to join a room',
        };
      }

      if (!finalRoomName) {
        return {
          success: false,
          error: 'No room name available',
        };
      }

      // Create the room on LiveKit with metadata if needed
      if (shouldCreateRoom && Object.keys(metadata).length > 0) {
        try {
          console.log(`🚀 Creating LiveKit room with metadata:`, JSON.stringify(metadata, null, 2));
          
          await this.liveKitService.createRoomWithToken(
            finalRoomName,
            metadata,
            'system',
            finalParticipantName,
            2 * 60 * 60, // 2 hours token duration
          );
          
          console.log(`✅ Room created/verified: ${finalRoomName} with full metadata`);
        } catch (error) {
          console.log(`⚠️ Room creation note: ${error.message} (continuing with token generation)`);
          // Continue even if room creation fails - it might already exist
        }
      }

      // Generate token for the room
      const token = await this.liveKitService.generateToken(
        finalRoomName,
        finalParticipantName,
        'anonymous', // Use anonymous for public access
      );

      const liveKitUrl = this.configService.get<string>('LIVEKIT_URL');

      console.log(`🎫 Token generated successfully for ${finalParticipantName} in room: ${finalRoomName}`);

      return {
        success: true,
        token,
        roomName: finalRoomName,
        liveKitUrl,
      };
    } catch (error) {
      console.error('❌ Error generating room access token:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate access token',
      };
    }
  }

  /**
   * Build minimal room metadata for AI agent (matches original room service)
   */
  private buildRoomMetadata(application: Application): any {
    const metadata: any = {
      candidateName: `${application.candidate?.name || 'Unknown'}`,
      jobName: application.job?.title || 'Unknown Position',
      companyName: application.job?.company?.name || 'Unknown Company',
      companySpelling: application.job?.company?.name || 'Unknown Company', // For AI pronunciation
      interviewLanguage: application.interviewLanguage || application.job?.interviewLanguage || 'english',
      interviewPrompt: application.job?.interviewPrompt || 'Conduct a professional interview for this position.',
      
      // CV Analysis for agent (structured format)
      cvAnalysis: application.cvAnalysisResults ? (() => {
        const cvAnalysis = application.cvAnalysisResults as any;
        return {
          score: cvAnalysis.score,
          summary: cvAnalysis.summary,
          overallFit: cvAnalysis.overallFit,
          strengths: cvAnalysis.strengths,
          weaknesses: cvAnalysis.weaknesses
        };
      })() : null,
      
      // CV Summary for agent (text format that agent expects)
      cv_summary: application.cvAnalysisResults ? (() => {
        const cvAnalysis = application.cvAnalysisResults as any;
        // Build a comprehensive text summary for the agent
        let summary = `CV Analysis Summary:\n\n`;
        
        if (cvAnalysis.summary) {
          summary += `Overall: ${cvAnalysis.summary}\n\n`;
        }
        
        if (cvAnalysis.overallFit) {
          summary += `Fit for Position: ${cvAnalysis.overallFit}\n\n`;
        }
        
        if (cvAnalysis.strengths && Array.isArray(cvAnalysis.strengths) && cvAnalysis.strengths.length > 0) {
          summary += `Strengths:\n`;
          cvAnalysis.strengths.forEach((strength: string, index: number) => {
            summary += `${index + 1}. ${strength}\n`;
          });
          summary += `\n`;
        }
        
        if (cvAnalysis.weaknesses && Array.isArray(cvAnalysis.weaknesses) && cvAnalysis.weaknesses.length > 0) {
          summary += `Areas for Improvement:\n`;
          cvAnalysis.weaknesses.forEach((weakness: string, index: number) => {
            summary += `${index + 1}. ${weakness}\n`;
          });
        }
        
        return summary;
      })() : null,
      
      // Also add cv_analysis as alias for backward compatibility
      cv_analysis: application.cvAnalysisResults ? (() => {
        const cvAnalysis = application.cvAnalysisResults as any;
        return {
          score: cvAnalysis.score,
          summary: cvAnalysis.summary,
          overallFit: cvAnalysis.overallFit,
          strengths: cvAnalysis.strengths,
          weaknesses: cvAnalysis.weaknesses
        };
      })() : null
    };

    console.log(`📦 Built metadata for ${metadata.candidateName} - ${metadata.jobName} at ${metadata.companyName}`);
    console.log(`🌐 Interview Language: ${metadata.interviewLanguage}`);
    if (metadata.cv_summary) {
      console.log(`📄 CV Summary included (${metadata.cv_summary.length} characters)`);
    }
    
    return metadata;
  }
}