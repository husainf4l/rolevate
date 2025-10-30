import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Application } from '../../application/application.entity';
import { Interview, InterviewStatus } from '../interview.entity';
import { RoomAccess } from '../room-access.dto';
import { LiveKitService } from '../../livekit/livekit.service';

/**
 * Service responsible for managing LiveKit room access for interviews
 * Single Responsibility: Room access token generation and metadata management
 */
@Injectable()
export class InterviewRoomService {
  private readonly logger = new Logger(InterviewRoomService.name);

  constructor(
    @InjectRepository(Interview)
    private readonly interviewRepository: Repository<Interview>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    private readonly liveKitService: LiveKitService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generate room access token for joining an interview (Public - no auth required)
   * Supports multiple ways to join:
   * 1. By interviewId - Join a specific interview room
   * 2. By jobId + phone - Find or create room for candidate's interview with full metadata
   * 3. By roomName - Join directly by room name
   */
  async generateRoomAccessToken(
    interviewId?: string,
    participantName?: string,
    jobId?: string,
    phone?: string,
    roomName?: string,
  ): Promise<RoomAccess> {
    try {
      if (interviewId) {
        return await this.joinByInterviewId(interviewId, participantName);
      }

      if (jobId && phone) {
        return await this.joinByJobAndPhone(jobId, phone, participantName, roomName);
      }

      if (roomName) {
        return await this.joinByRoomName(roomName, participantName);
      }

      return {
        success: false,
        error: 'Please provide either interviewId, (jobId + phone), or roomName to join a room',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error('Error generating room access token', errorStack);
      return {
        success: false,
        error: errorMessage || 'Failed to generate access token',
      };
    }
  }

  /**
   * Join interview by interview ID
   */
  private async joinByInterviewId(
    interviewId: string,
    participantName?: string,
  ): Promise<RoomAccess> {
    const interview = await this.interviewRepository.findOne({
      where: { id: interviewId },
      relations: ['application', 'application.candidate', 'application.job', 'application.job.company'],
    });

    if (!interview) {
      return { success: false, error: 'Interview not found' };
    }

    let roomName = interview.roomId;

    if (!roomName) {
      roomName = `interview-${interviewId}-${Date.now()}`;
      await this.interviewRepository.update(interviewId, { roomId: roomName });

      if (interview.application) {
        const metadata = this.buildRoomMetadata(interview.application);
        await this.createLiveKitRoom(roomName, metadata, participantName || 'Anonymous');
      }
    }

    return this.generateToken(roomName, participantName || 'Anonymous');
  }

  /**
   * Join interview by job ID and phone number
   */
  private async joinByJobAndPhone(
    jobId: string,
    phone: string,
    participantName?: string,
    roomName?: string,
  ): Promise<RoomAccess> {
    const application = await this.findApplicationByJobAndPhone(jobId, phone, roomName);

    if (!application) {
      return {
        success: false,
        error: 'No application found for this job and phone number. Please verify the phone number is registered.',
      };
    }

    const finalParticipantName = participantName || application.candidate?.name || 'Anonymous';
    const metadata = this.buildRoomMetadata(application);

    let finalRoomName = roomName;

    if (!finalRoomName) {
      const existingInterview = await this.findExistingInterviewRoom(application.id);
      
      if (existingInterview?.roomId) {
        finalRoomName = existingInterview.roomId;
        this.logger.log(`Using existing room: ${finalRoomName}`);
      } else {
        finalRoomName = `interview_${application.id}_${Date.now()}`;
        this.logger.log(`Creating new room: ${finalRoomName}`);
        await this.createLiveKitRoom(finalRoomName, metadata, finalParticipantName);
      }
    } else {
      await this.createLiveKitRoom(finalRoomName, metadata, finalParticipantName);
    }

    return this.generateToken(finalRoomName, finalParticipantName);
  }

  /**
   * Join interview by room name directly
   */
  private async joinByRoomName(
    roomName: string,
    participantName?: string,
  ): Promise<RoomAccess> {
    const metadata = {
      roomName,
      participantName: participantName || 'Anonymous',
    };

    await this.createLiveKitRoom(roomName, metadata, participantName || 'Anonymous');
    return this.generateToken(roomName, participantName || 'Anonymous');
  }

  /**
   * Find application by job ID and phone number with fuzzy matching
   */
  private async findApplicationByJobAndPhone(
    jobId: string,
    phone: string,
    roomName?: string,
  ): Promise<Application | null> {
    this.logger.log(`Looking for application with jobId: ${jobId}, phone: ${phone}`);

    const phoneVariations = this.generatePhoneVariations(phone);
    this.logger.log(`Phone variations: ${JSON.stringify(phoneVariations)}`);

    let application = await this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.candidate', 'candidate')
      .leftJoinAndSelect('application.job', 'job')
      .leftJoinAndSelect('job.company', 'company')
      .where('application.jobId = :jobId', { jobId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('candidate.phone = :phone', { phone })
            .orWhere('candidate.phone = :phoneWithPlus', { phoneWithPlus: phoneVariations.withPlus })
            .orWhere('candidate.phone = :phoneWithoutPlus', { phoneWithoutPlus: phoneVariations.withoutPlus })
            .orWhere('candidate.phone LIKE :phonePattern1', { phonePattern1: `%${phoneVariations.withoutPlus}` })
            .orWhere('candidate.phone LIKE :phonePattern2', { phonePattern2: `${phoneVariations.withoutPlus}%` })
            .orWhere(
              'REPLACE(REPLACE(REPLACE(REPLACE(candidate.phone, \'+\', \'\'), \' \', \'\'), \'-\', \'\'), \'(\', \'\') = :cleanPhone',
              { cleanPhone: phoneVariations.withoutPlus }
            );
        })
      )
      .getOne();

    if (!application && roomName) {
      application = await this.findApplicationByRoomName(roomName);
    }

    if (application) {
      this.logger.log(`Found application: ${application.candidate.name} for job: ${application.job.title}`);
    } else {
      this.logger.warn(`No application found for jobId: ${jobId}, phone: ${phone}`);
    }

    return application;
  }

  /**
   * Extract application ID from room name and find application
   */
  private async findApplicationByRoomName(roomName: string): Promise<Application | null> {
    if (!roomName.startsWith('interview_')) {
      return null;
    }

    const parts = roomName.split('_');
    if (parts.length < 2) {
      return null;
    }

    const applicationId = parts[1];
    this.logger.log(`Attempting to find application by extracted ID from roomName: ${applicationId}`);

    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['candidate', 'job', 'job.company'],
    });

    if (application) {
      this.logger.log(`Found application by roomName: ${application.candidate.name}`);
    }

    return application;
  }

  /**
   * Find existing interview room for an application
   */
  private async findExistingInterviewRoom(applicationId: string): Promise<Interview | null> {
    const interviews = await this.interviewRepository.find({
      where: {
        applicationId,
        status: InterviewStatus.SCHEDULED,
      },
      order: { scheduledAt: 'ASC' },
    });

    return interviews.find((i) => i.roomId) || null;
  }

  /**
   * Generate phone number variations for fuzzy matching
   */
  private generatePhoneVariations(phone: string): {
    withPlus: string;
    withoutPlus: string;
  } {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const withPlus = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
    const withoutPlus = cleanPhone.replace('+', '');

    return { withPlus, withoutPlus };
  }

  /**
   * Create LiveKit room with metadata
   */
  private async createLiveKitRoom(
    roomName: string,
    metadata: any,
    participantName: string,
  ): Promise<void> {
    try {
      this.logger.log(`Creating LiveKit room: ${roomName}`);
      this.logger.debug(`Room metadata: ${JSON.stringify(metadata, null, 2)}`);

      await this.liveKitService.createRoomWithToken(
        roomName,
        metadata,
        'system',
        participantName,
        2 * 60 * 60, // 2 hours
      );

      this.logger.log(`Room created/verified: ${roomName}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Room creation note: ${errorMessage} (continuing with token generation)`);
    }
  }

  /**
   * Generate access token for a room
   */
  private async generateToken(roomName: string, participantName: string): Promise<RoomAccess> {
    const token = await this.liveKitService.generateToken(
      roomName,
      participantName,
      'anonymous',
    );

    const liveKitUrl = this.configService.get<string>('LIVEKIT_URL');

    this.logger.log(`Token generated for ${participantName} in room: ${roomName}`);

    return {
      success: true,
      token,
      roomName,
      liveKitUrl,
    };
  }

  /**
   * Build comprehensive room metadata for AI agent
   */
  private buildRoomMetadata(application: Application): any {
    const metadata: any = {
      candidateName: application.candidate?.name || 'Unknown',
      jobName: application.job?.title || 'Unknown Position',
      companyName: application.job?.company?.name || 'Unknown Company',
      companySpelling: application.job?.company?.name || 'Unknown Company',
      interviewLanguage: application.interviewLanguage || application.job?.interviewLanguage || 'english',
      interviewPrompt: application.job?.interviewPrompt || 'Conduct a professional interview for this position.',
    };

    if (application.cvAnalysisResults) {
      const cvAnalysis = application.cvAnalysisResults as any;
      
      metadata.cvAnalysis = {
        score: cvAnalysis.score,
        summary: cvAnalysis.summary,
        overallFit: cvAnalysis.overallFit,
        strengths: cvAnalysis.strengths,
        weaknesses: cvAnalysis.weaknesses,
      };

      metadata.cv_summary = this.buildCVSummaryText(cvAnalysis);
      metadata.cv_analysis = metadata.cvAnalysis;
    }

    this.logger.log(
      `Built metadata for ${metadata.candidateName} - ${metadata.jobName} at ${metadata.companyName}`
    );
    this.logger.log(`Interview Language: ${metadata.interviewLanguage}`);

    return metadata;
  }

  /**
   * Build CV summary text for AI agent
   */
  private buildCVSummaryText(cvAnalysis: any): string {
    let summary = 'CV Analysis Summary:\n\n';

    if (cvAnalysis.summary) {
      summary += `Overall: ${cvAnalysis.summary}\n\n`;
    }

    if (cvAnalysis.overallFit) {
      summary += `Fit for Position: ${cvAnalysis.overallFit}\n\n`;
    }

    if (cvAnalysis.strengths && Array.isArray(cvAnalysis.strengths) && cvAnalysis.strengths.length > 0) {
      summary += 'Strengths:\n';
      cvAnalysis.strengths.forEach((strength: string, index: number) => {
        summary += `${index + 1}. ${strength}\n`;
      });
      summary += '\n';
    }

    if (cvAnalysis.weaknesses && Array.isArray(cvAnalysis.weaknesses) && cvAnalysis.weaknesses.length > 0) {
      summary += 'Areas for Improvement:\n';
      cvAnalysis.weaknesses.forEach((weakness: string, index: number) => {
        summary += `${index + 1}. ${weakness}\n`;
      });
    }

    return summary;
  }
}
