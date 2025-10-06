import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiautocompleteService } from '../aiautocomplete/aiautocomplete.service';
import OpenAI from 'openai';
import { 
  CreateInterviewDto, 
  UpdateInterviewDto, 
  CreateTranscriptDto, 
  BulkCreateTranscriptDto,
  InterviewResponseDto, 
  TranscriptResponseDto,
  InterviewListResponseDto 
} from './dto/interview.dto';
import { InterviewStatus, InterviewType, SpeakerType } from '@prisma/client';

@Injectable()
export class InterviewService {
  private openai: OpenAI;

  constructor(
    private prisma: PrismaService,
    private aiautocompleteService: AiautocompleteService,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async createInterview(createInterviewDto: CreateInterviewDto): Promise<InterviewResponseDto> {
    console.log('🎤 Creating new interview...');

    // Verify that job, candidate, and company exist and are related
    const job = await this.prisma.job.findUnique({
      where: { id: createInterviewDto.jobId },
      include: { company: true }
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.companyId !== createInterviewDto.companyId) {
      throw new BadRequestException('Job does not belong to the specified company');
    }

    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { id: createInterviewDto.candidateId }
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    // Check if there's already an interview for this job and candidate
    const existingInterview = await this.prisma.interview.findFirst({
      where: {
        jobId: createInterviewDto.jobId,
        candidateId: createInterviewDto.candidateId,
        status: {
          not: 'CANCELLED'
        }
      }
    });

    if (existingInterview) {
      throw new BadRequestException('An active interview already exists for this job and candidate');
    }

    const interview = await this.prisma.interview.create({
      data: {
        jobId: createInterviewDto.jobId,
        candidateId: createInterviewDto.candidateId,
        companyId: createInterviewDto.companyId,
        title: createInterviewDto.title,
        description: createInterviewDto.description,
        type: createInterviewDto.type || InterviewType.FIRST_ROUND,
        status: createInterviewDto.status || InterviewStatus.SCHEDULED,
        scheduledAt: new Date(createInterviewDto.scheduledAt),
        startedAt: createInterviewDto.startedAt ? new Date(createInterviewDto.startedAt) : null,
        endedAt: createInterviewDto.endedAt ? new Date(createInterviewDto.endedAt) : null,
        duration: createInterviewDto.duration,
        roomId: createInterviewDto.roomId,
        videoLink: createInterviewDto.videoLink,
        recordingUrl: createInterviewDto.recordingUrl,
        interviewerNotes: createInterviewDto.interviewerNotes,
        candidateFeedback: createInterviewDto.candidateFeedback,
        overallRating: createInterviewDto.overallRating,
        technicalQuestions: createInterviewDto.technicalQuestions,
        technicalAnswers: createInterviewDto.technicalAnswers,
        metadata: createInterviewDto.metadata,
      },
      include: {
        job: {
          select: { id: true, title: true }
        },
        candidate: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        company: {
          select: { id: true, name: true }
        }
      }
    });

    console.log('✅ Interview created successfully:', interview.id);
    return this.mapToInterviewResponse(interview);
  }

  async updateInterview(id: string, updateInterviewDto: UpdateInterviewDto, companyId?: string): Promise<InterviewResponseDto> {
    console.log('📝 Updating interview:', id);

    const existingInterview = await this.prisma.interview.findUnique({
      where: { id },
      include: {
        job: true,
        candidate: true,
        company: true
      }
    });

    if (!existingInterview) {
      throw new NotFoundException('Interview not found');
    }

    // If companyId is provided, verify access
    if (companyId && existingInterview.companyId !== companyId) {
      throw new ForbiddenException('Access denied to this interview');
    }

    const updatedInterview = await this.prisma.interview.update({
      where: { id },
      data: {
        title: updateInterviewDto.title,
        description: updateInterviewDto.description,
        type: updateInterviewDto.type,
        status: updateInterviewDto.status,
        scheduledAt: updateInterviewDto.scheduledAt ? new Date(updateInterviewDto.scheduledAt) : undefined,
        startedAt: updateInterviewDto.startedAt ? new Date(updateInterviewDto.startedAt) : undefined,
        endedAt: updateInterviewDto.endedAt ? new Date(updateInterviewDto.endedAt) : undefined,
        duration: updateInterviewDto.duration,
        roomId: updateInterviewDto.roomId,
        videoLink: updateInterviewDto.videoLink,
        recordingUrl: updateInterviewDto.recordingUrl,
        interviewerNotes: updateInterviewDto.interviewerNotes,
        candidateFeedback: updateInterviewDto.candidateFeedback,
        overallRating: updateInterviewDto.overallRating,
        technicalQuestions: updateInterviewDto.technicalQuestions,
        technicalAnswers: updateInterviewDto.technicalAnswers,
        aiAnalysis: updateInterviewDto.aiAnalysis,
        aiScore: updateInterviewDto.aiScore,
        aiRecommendation: updateInterviewDto.aiRecommendation,
        analyzedAt: updateInterviewDto.aiAnalysis ? new Date() : undefined,
        metadata: updateInterviewDto.metadata,
      },
      include: {
        job: {
          select: { id: true, title: true }
        },
        candidate: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        company: {
          select: { id: true, name: true }
        }
      }
    });

    console.log('✅ Interview updated successfully');
    return this.mapToInterviewResponse(updatedInterview);
  }

  async getInterviewById(id: string, companyId?: string): Promise<InterviewResponseDto> {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
      include: {
        job: {
          select: { id: true, title: true }
        },
        candidate: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        company: {
          select: { id: true, name: true }
        },
        transcripts: {
          orderBy: { sequenceNumber: 'asc' }
        }
      }
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    // If companyId is provided, verify access
    if (companyId && interview.companyId !== companyId) {
      throw new ForbiddenException('Access denied to this interview');
    }

    return this.mapToInterviewResponse(interview);
  }

  async getInterviewsByJob(jobId: string, companyId?: string): Promise<InterviewListResponseDto> {
    // Verify job exists and belongs to company if companyId provided
    if (companyId) {
      const job = await this.prisma.job.findFirst({
        where: { id: jobId, companyId }
      });
      if (!job) {
        throw new NotFoundException('Job not found or access denied');
      }
    }

    const interviews = await this.prisma.interview.findMany({
      where: { jobId },
      include: {
        job: {
          select: { id: true, title: true }
        },
        candidate: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        company: {
          select: { id: true, name: true }
        }
      },
      orderBy: { scheduledAt: 'desc' }
    });

    return {
      interviews: interviews.map(interview => this.mapToInterviewResponse(interview)),
      totalCount: interviews.length,
      page: 1,
      limit: interviews.length
    };
  }

  async getInterviewsByCandidate(candidateId: string): Promise<InterviewListResponseDto> {
    const interviews = await this.prisma.interview.findMany({
      where: { candidateId },
      include: {
        job: {
          select: { id: true, title: true }
        },
        candidate: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        company: {
          select: { id: true, name: true }
        }
      },
      orderBy: { scheduledAt: 'desc' }
    });

    return {
      interviews: interviews.map(interview => this.mapToInterviewResponse(interview)),
      totalCount: interviews.length,
      page: 1,
      limit: interviews.length
    };
  }

  async getInterviewsByCandidateAndJob(candidateId: string, jobId: string): Promise<InterviewResponseDto[]> {
    console.log('🔍 Finding interviews for candidate:', candidateId, 'and job:', jobId);

    const interviews = await this.prisma.interview.findMany({
      where: { 
        candidateId,
        jobId 
      },
      include: {
        job: {
          include: { company: true }
        },
        candidate: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        company: {
          select: { id: true, name: true }
        },
        transcripts: {
          orderBy: { sequenceNumber: 'asc' }
        }
      },
      orderBy: { scheduledAt: 'desc' }
    });

    console.log('✅ Found', interviews.length, 'interviews');

    // Process each interview to check if AI analysis is needed
    const processedInterviews = await Promise.all(
      interviews.map(async (interview) => {
        // Check if interview has transcripts but no AI analysis
        const hasTranscripts = interview.transcripts && interview.transcripts.length > 0;
        const hasAIAnalysis = interview.aiScore !== null || interview.aiRecommendation !== null;
        
        if (hasTranscripts && !hasAIAnalysis) {
          console.log('🤖 Generating AI analysis for interview:', interview.id);
          try {
            const updatedInterview = await this.generateAIAnalysisForInterview(interview);
            return updatedInterview;
          } catch (error) {
            console.error('❌ Failed to generate AI analysis for interview:', interview.id, error);
            // Return original interview if AI analysis fails
            return interview;
          }
        }
        
        return interview;
      })
    );

    return processedInterviews.map(interview => this.mapToInterviewResponse(interview));
  }

  async createTranscript(createTranscriptDto: CreateTranscriptDto): Promise<TranscriptResponseDto> {
    console.log('📝 Creating transcript for interview:', createTranscriptDto.interviewId);

    // Verify interview exists
    const interview = await this.prisma.interview.findUnique({
      where: { id: createTranscriptDto.interviewId }
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    const transcript = await this.prisma.transcript.create({
      data: {
        interviewId: createTranscriptDto.interviewId,
        speakerType: createTranscriptDto.speakerType,
        speakerName: createTranscriptDto.speakerName,
        speakerId: createTranscriptDto.speakerId,
        content: createTranscriptDto.content,
        confidence: createTranscriptDto.confidence,
        language: createTranscriptDto.language || 'en',
        startTime: createTranscriptDto.startTime,
        endTime: createTranscriptDto.endTime,
        duration: createTranscriptDto.duration,
        sentiment: createTranscriptDto.sentiment,
        keywords: createTranscriptDto.keywords || [],
        aiSummary: createTranscriptDto.aiSummary,
        importance: createTranscriptDto.importance || 1,
        sequenceNumber: createTranscriptDto.sequenceNumber,
        metadata: createTranscriptDto.metadata,
      }
    });

    console.log('✅ Transcript created successfully');
    return this.mapToTranscriptResponse(transcript);
  }

  async createBulkTranscripts(bulkCreateTranscriptDto: BulkCreateTranscriptDto): Promise<TranscriptResponseDto[]> {
    console.log('📝 Creating bulk transcripts for interview:', bulkCreateTranscriptDto.interviewId);

    // Verify interview exists
    const interview = await this.prisma.interview.findUnique({
      where: { id: bulkCreateTranscriptDto.interviewId }
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    // Delete existing transcripts for this interview
    await this.prisma.transcript.deleteMany({
      where: { interviewId: bulkCreateTranscriptDto.interviewId }
    });

    // Create new transcripts
    const transcripts = await Promise.all(
      bulkCreateTranscriptDto.transcripts.map(transcriptData => 
        this.prisma.transcript.create({
          data: {
            interviewId: bulkCreateTranscriptDto.interviewId,
            speakerType: transcriptData.speakerType,
            speakerName: transcriptData.speakerName,
            speakerId: transcriptData.speakerId,
            content: transcriptData.content,
            confidence: transcriptData.confidence,
            language: transcriptData.language || 'en',
            startTime: transcriptData.startTime,
            endTime: transcriptData.endTime,
            duration: transcriptData.duration,
            sentiment: transcriptData.sentiment,
            keywords: transcriptData.keywords || [],
            aiSummary: transcriptData.aiSummary,
            importance: transcriptData.importance || 1,
            sequenceNumber: transcriptData.sequenceNumber,
            metadata: transcriptData.metadata,
          }
        })
      )
    );

    console.log('✅ Bulk transcripts created successfully:', transcripts.length);
    return transcripts.map(transcript => this.mapToTranscriptResponse(transcript));
  }

  async getTranscriptsByInterview(interviewId: string): Promise<TranscriptResponseDto[]> {
    const transcripts = await this.prisma.transcript.findMany({
      where: { interviewId },
      orderBy: { sequenceNumber: 'asc' }
    });

    return transcripts.map(transcript => this.mapToTranscriptResponse(transcript));
  }

  // === ROOM ID BASED METHODS (for LiveKit integration) ===

  async getInterviewByRoomId(roomId: string): Promise<InterviewResponseDto> {
    const interview = await this.prisma.interview.findFirst({
      where: { roomId },
      include: {
        job: {
          select: { id: true, title: true }
        },
        candidate: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        company: {
          select: { id: true, name: true }
        },
        transcripts: {
          orderBy: { sequenceNumber: 'asc' }
        }
      }
    });

    if (!interview) {
      throw new NotFoundException('Interview not found for room ID: ' + roomId);
    }

    return this.mapToInterviewResponse(interview);
  }

  async startInterviewByRoomId(roomId: string): Promise<InterviewResponseDto> {
    console.log('▶️ Starting interview for room:', roomId);

    const interview = await this.prisma.interview.findFirst({
      where: { roomId }
    });

    if (!interview) {
      throw new NotFoundException('Interview not found for room ID: ' + roomId);
    }

    const updatedInterview = await this.prisma.interview.update({
      where: { id: interview.id },
      data: {
        status: InterviewStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
      include: {
        job: {
          select: { id: true, title: true }
        },
        candidate: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        company: {
          select: { id: true, name: true }
        }
      }
    });

    console.log('✅ Interview started successfully');
    return this.mapToInterviewResponse(updatedInterview);
  }

  async endInterviewByRoomId(roomId: string, endData?: { recordingUrl?: string; duration?: number }): Promise<InterviewResponseDto> {
    console.log('⏹️ Ending interview for room:', roomId);

    const interview = await this.prisma.interview.findFirst({
      where: { roomId }
    });

    if (!interview) {
      throw new NotFoundException('Interview not found for room ID: ' + roomId);
    }

    const endTime = new Date();
    const calculatedDuration = interview.startedAt 
      ? Math.round((endTime.getTime() - interview.startedAt.getTime()) / 60000) // Duration in minutes
      : endData?.duration;

    const updatedInterview = await this.prisma.interview.update({
      where: { id: interview.id },
      data: {
        status: InterviewStatus.COMPLETED,
        endedAt: endTime,
        duration: calculatedDuration,
        recordingUrl: endData?.recordingUrl,
      },
      include: {
        job: {
          select: { id: true, title: true }
        },
        candidate: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        company: {
          select: { id: true, name: true }
        }
      }
    });

    console.log('✅ Interview ended successfully');
    return this.mapToInterviewResponse(updatedInterview);
  }

  async addTranscriptByRoomId(roomId: string, transcriptData: Omit<CreateTranscriptDto, 'interviewId'>): Promise<TranscriptResponseDto> {
    console.log('📝 Adding transcript for room:', roomId);

    const interview = await this.prisma.interview.findFirst({
      where: { roomId }
    });

    if (!interview) {
      throw new NotFoundException('Interview not found for room ID: ' + roomId);
    }

    const createTranscriptDto: CreateTranscriptDto = {
      ...transcriptData,
      interviewId: interview.id,
    };

    return await this.createTranscript(createTranscriptDto);
  }

  private mapToInterviewResponse(interview: any): InterviewResponseDto {
    return {
      id: interview.id,
      jobId: interview.jobId,
      candidateId: interview.candidateId,
      companyId: interview.companyId,
      title: interview.title,
      description: interview.description,
      type: interview.type,
      status: interview.status,
      scheduledAt: interview.scheduledAt,
      startedAt: interview.startedAt,
      endedAt: interview.endedAt,
      duration: interview.duration,
      roomId: interview.roomId,
      videoLink: interview.videoLink,
      recordingUrl: interview.recordingUrl,
      aiAnalysis: interview.aiAnalysis,
      aiScore: interview.aiScore,
      aiRecommendation: interview.aiRecommendation,
      analyzedAt: interview.analyzedAt,
      interviewerNotes: interview.interviewerNotes,
      candidateFeedback: interview.candidateFeedback,
      overallRating: interview.overallRating,
      technicalQuestions: interview.technicalQuestions,
      technicalAnswers: interview.technicalAnswers,
      metadata: interview.metadata,
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
      job: interview.job,
      candidate: interview.candidate,
      company: interview.company,
      transcripts: interview.transcripts ? interview.transcripts.map(t => this.mapToTranscriptResponse(t)) : undefined,
    };
  }

  private mapToTranscriptResponse(transcript: any): TranscriptResponseDto {
    return {
      id: transcript.id,
      interviewId: transcript.interviewId,
      speakerType: transcript.speakerType,
      speakerName: transcript.speakerName,
      speakerId: transcript.speakerId,
      content: transcript.content,
      confidence: transcript.confidence,
      language: transcript.language,
      startTime: transcript.startTime,
      endTime: transcript.endTime,
      duration: transcript.duration,
      sentiment: transcript.sentiment,
      keywords: transcript.keywords,
      aiSummary: transcript.aiSummary,
      importance: transcript.importance,
      sequenceNumber: transcript.sequenceNumber,
      metadata: transcript.metadata,
      createdAt: transcript.createdAt,
      updatedAt: transcript.updatedAt,
    };
  }

  // === ROOM-BASED METHODS FOR EXISTING ROOMS ===

  async saveVideoToRoom(roomId: string, videoData: {
    videoLink?: string;
    recordingUrl?: string;
    title?: string;
    timestamp?: number;
  }): Promise<InterviewResponseDto> {
    console.log('🎥 Saving video link to room:', roomId);

    // First, try to find existing interview for this room
    let interview = await this.prisma.interview.findFirst({
      where: { roomId },
      include: {
        job: { include: { company: true } },
        candidate: true,
        transcripts: true,
      },
    });

    if (interview) {
      // Update existing interview with video info
      console.log('🔄 Updating existing interview:', interview.id);
      console.log('📊 Video data to save:', videoData);
      
      interview = await this.prisma.interview.update({
        where: { id: interview.id },
        data: {
          videoLink: videoData.videoLink,
          recordingUrl: videoData.recordingUrl,
          status: InterviewStatus.IN_PROGRESS,
          startedAt: videoData.timestamp ? new Date(videoData.timestamp) : new Date(),
        },
        include: {
          job: { include: { company: true } },
          candidate: true,
          transcripts: true,
        },
      });
      
      console.log('📝 Updated interview data:');
      console.log('   - videoLink:', interview.videoLink);
      console.log('   - recordingUrl:', interview.recordingUrl);
      console.log('   - status:', interview.status);
    } else {
      // Extract application ID from room name (format: interview_{applicationId}_{timestamp})
      const roomParts = roomId.split('_');
      if (roomParts.length < 3 || roomParts[0] !== 'interview') {
        throw new BadRequestException(`Invalid room ID format: ${roomId}`);
      }
      
      const applicationId = roomParts[1];
      
      // Find the application to get job/candidate/company info
      const application = await this.prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          job: { include: { company: true } },
          candidate: true,
        },
      });

      if (!application) {
        throw new NotFoundException(`Application not found for room: ${roomId}`);
      }

      // Create new interview for this room
      console.log('🆕 Creating new interview for room:', roomId);
      console.log('📊 Video data to save:', videoData);
      
      interview = await this.prisma.interview.create({
        data: {
          jobId: application.jobId,
          candidateId: application.candidateId,
          companyId: application.job.companyId,
          title: videoData.title || `Interview for ${application.job.title}`,
          type: InterviewType.FIRST_ROUND,
          status: InterviewStatus.IN_PROGRESS,
          scheduledAt: new Date(),
          startedAt: videoData.timestamp ? new Date(videoData.timestamp) : new Date(),
          roomId,
          videoLink: videoData.videoLink,
          recordingUrl: videoData.recordingUrl,
        },
        include: {
          job: { include: { company: true } },
          candidate: true,
          transcripts: true,
        },
      });
      
      console.log('📝 Created interview data:');
      console.log('   - id:', interview.id);
      console.log('   - videoLink:', interview.videoLink);
      console.log('   - recordingUrl:', interview.recordingUrl);
      console.log('   - status:', interview.status);
    }

    console.log('✅ Video saved to interview:', interview.id);
    
    // Verify what's actually in the database
    const verifyInterview = await this.prisma.interview.findUnique({
      where: { id: interview.id },
      select: { id: true, videoLink: true, recordingUrl: true, status: true }
    });
    console.log('🔍 Database verification:', verifyInterview);
    
    const response = this.mapToInterviewResponse(interview);
    console.log('📤 Returning response with video data:');
    console.log('   - videoLink:', response.videoLink);
    console.log('   - recordingUrl:', response.recordingUrl);
    return response;
  }

  async addTranscriptToRoom(roomId: string, transcriptData: any): Promise<TranscriptResponseDto> {
    console.log('📝 Adding transcript to room:', roomId);

    // Find or create interview for this room
    const interview = await this.prisma.interview.findFirst({
      where: { roomId },
    });

    if (!interview) {
      throw new NotFoundException(`No interview found for room: ${roomId}`);
    }

    // Create transcript
    const transcript = await this.prisma.transcript.create({
      data: {
        interviewId: interview.id,
        speakerType: transcriptData.speakerType as SpeakerType,
        speakerName: transcriptData.speakerName,
        speakerId: transcriptData.speakerId,
        content: transcriptData.content,
        startTime: transcriptData.startTime,
        endTime: transcriptData.endTime,
        duration: transcriptData.duration,
        sequenceNumber: transcriptData.sequenceNumber,
        confidence: transcriptData.confidence,
        language: transcriptData.language || 'en',
        sentiment: transcriptData.sentiment,
        keywords: transcriptData.keywords || [],
        aiSummary: transcriptData.aiSummary,
        importance: transcriptData.importance || 1,
      },
    });

    console.log('✅ Transcript added:', transcript.id);
    return this.mapToTranscriptResponse(transcript);
  }

  async addBulkTranscriptsToRoom(roomId: string, transcripts: any[]): Promise<TranscriptResponseDto[]> {
    console.log('📝 Adding bulk transcripts to room:', roomId);

    // Find interview for this room
    const interview = await this.prisma.interview.findFirst({
      where: { roomId },
    });

    if (!interview) {
      throw new NotFoundException(`No interview found for room: ${roomId}`);
    }

    // Create all transcripts
    const createdTranscripts = await Promise.all(
      transcripts.map(async (transcriptData) => {
        return await this.prisma.transcript.create({
          data: {
            interviewId: interview.id,
            speakerType: transcriptData.speakerType as SpeakerType,
            speakerName: transcriptData.speakerName,
            speakerId: transcriptData.speakerId,
            content: transcriptData.content,
            startTime: transcriptData.startTime,
            endTime: transcriptData.endTime,
            duration: transcriptData.duration,
            sequenceNumber: transcriptData.sequenceNumber,
            confidence: transcriptData.confidence,
            language: transcriptData.language || 'en',
            sentiment: transcriptData.sentiment,
            keywords: transcriptData.keywords || [],
            aiSummary: transcriptData.aiSummary,
            importance: transcriptData.importance || 1,
          },
        });
      })
    );

    console.log('✅ Bulk transcripts added:', createdTranscripts.length);
    return createdTranscripts.map(transcript => this.mapToTranscriptResponse(transcript));
  }

  async getTranscriptsByRoom(roomId: string): Promise<TranscriptResponseDto[]> {
    console.log('📋 Getting transcripts for room:', roomId);

    // Find interview for this room
    const interview = await this.prisma.interview.findFirst({
      where: { roomId },
      include: { transcripts: true },
    });

    if (!interview) {
      throw new NotFoundException(`No interview found for room: ${roomId}`);
    }

    // Sort transcripts by sequence number
    const sortedTranscripts = interview.transcripts.sort((a, b) => a.sequenceNumber - b.sequenceNumber);

    return sortedTranscripts.map(transcript => this.mapToTranscriptResponse(transcript));
  }

  async completeInterviewByRoom(roomId: string, completionData?: {
    duration?: number;
    interviewerNotes?: string;
    overallRating?: number;
    aiScore?: number;
    aiRecommendation?: string;
  }): Promise<InterviewResponseDto> {
    console.log('✅ Completing interview for room:', roomId);

    // Find interview for this room
    const interview = await this.prisma.interview.findFirst({
      where: { roomId },
    });

    if (!interview) {
      throw new NotFoundException(`No interview found for room: ${roomId}`);
    }

    // Update interview status to completed
    const updatedInterview = await this.prisma.interview.update({
      where: { id: interview.id },
      data: {
        status: InterviewStatus.COMPLETED,
        endedAt: new Date(),
        duration: completionData?.duration,
        interviewerNotes: completionData?.interviewerNotes,
        overallRating: completionData?.overallRating,
        aiScore: completionData?.aiScore,
        aiRecommendation: completionData?.aiRecommendation,
      },
      include: {
        job: { include: { company: true } },
        candidate: true,
        transcripts: true,
      },
    });

    console.log('✅ Interview completed:', updatedInterview.id);
    return this.mapToInterviewResponse(updatedInterview);
  }

  async endInterviewSession(roomId: string): Promise<any> {
    try {
      console.log('🔚 Ending interview session for room:', roomId);
      
      // Find the interview by room ID
      const interview = await this.prisma.interview.findFirst({
        where: { roomId },
        include: {
          job: { include: { company: true } },
          candidate: true,
          transcripts: true,
        },
      });

      if (!interview) {
        throw new NotFoundException(`Interview not found for room: ${roomId}`);
      }

      // Update the interview status to completed
      const updatedInterview = await this.prisma.interview.update({
        where: { id: interview.id },
        data: {
          status: 'COMPLETED',
          endedAt: new Date(),
        },
        include: {
          job: { include: { company: true } },
          candidate: true,
          transcripts: true,
        },
      });

      console.log('✅ Interview session ended successfully:', updatedInterview.id);
      
      return {
        success: true,
        message: 'Interview session ended successfully',
        interviewId: updatedInterview.id,
        roomId: roomId,
        status: updatedInterview.status,
        endedAt: updatedInterview.endedAt,
      };
    } catch (error) {
      console.error('❌ Error ending interview session:', error);
      throw error;
    }
  }

  private async generateAIAnalysisForInterview(interview: any): Promise<any> {
    console.log('🤖 Generating AI analysis for interview:', interview.id);

    try {
      // Prepare transcript text
      const transcriptText = interview.transcripts
        .map(t => `[${t.speakerType}] ${t.speakerName || 'Speaker'}: ${t.content}`)
        .join('\n');

      // Prepare job context
      const jobContext = interview.job ? {
        title: interview.job.title,
        requirements: interview.job.requirements,
        skills: interview.job.skills,
        description: interview.job.description,
      } : null;

      // Generate AI analysis prompt
      const analysisPrompt = `
You are an expert HR analyst. Analyze the following interview transcript and provide comprehensive feedback.

${jobContext ? `
JOB CONTEXT:
- Title: ${jobContext.title}
- Requirements: ${jobContext.requirements || 'Not specified'}
- Required Skills: ${jobContext.skills?.join(', ') || 'Not specified'}
- Description: ${jobContext.description || 'Not specified'}
` : ''}

INTERVIEW TRANSCRIPT:
${transcriptText}

Please analyze this interview and provide a comprehensive assessment focusing on:

1. **Communication Skills**: How clearly and effectively did the candidate communicate?
2. **Technical Knowledge**: Demonstration of relevant skills and expertise
3. **Problem-Solving**: Approach to challenges and questions
4. **Cultural Fit**: Alignment with company values and work style
5. **Motivation & Interest**: Enthusiasm for the role and company
6. **Overall Performance**: General interview performance

Provide a score from 0-100 and a recommendation (HIRE, SECOND_INTERVIEW, or REJECT).
Also include specific strengths, areas for improvement, and next steps.

Keep the analysis professional, constructive, and focused on job-relevant factors.
`;

      console.log('🤖 Calling AI service for interview analysis...');
      
      // Use OpenAI directly to generate analysis
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ 
          role: 'user', 
          content: analysisPrompt 
        }],
        max_tokens: 1000,
        temperature: 0.3,
      });

      const aiResponse = completion.choices[0]?.message?.content?.trim() || '';
      console.log('🤖 AI Response received:', aiResponse.substring(0, 200) + '...');

      // Parse the AI response to extract score and recommendation
      const aiScore = this.extractScoreFromResponse(aiResponse);
      const aiRecommendation = this.extractRecommendationFromResponse(aiResponse);

      console.log('✅ AI Analysis complete. Score:', aiScore, 'Recommendation:', aiRecommendation);

      // Update the interview with AI analysis
      const updatedInterview = await this.prisma.interview.update({
        where: { id: interview.id },
        data: {
          aiScore: aiScore,
          aiRecommendation: aiRecommendation,
          interviewerNotes: aiResponse, // Store full analysis in notes
          updatedAt: new Date(),
        },
        include: {
          job: { include: { company: true } },
          candidate: true,
          transcripts: {
            orderBy: { sequenceNumber: 'asc' }
          }
        },
      });

      return updatedInterview;

    } catch (error) {
      console.error('❌ Error generating AI analysis:', error);
      throw error;
    }
  }

  private extractScoreFromResponse(content: string): number | null {
    try {
      // Look for patterns like "Score: 85", "85/100", "Overall: 85%"
      const scorePatterns = [
        /score[:\s]+(\d+)/i,
        /(\d+)\/100/i,
        /overall[:\s]+(\d+)/i,
        /rating[:\s]+(\d+)/i
      ];

      for (const pattern of scorePatterns) {
        const match = content.match(pattern);
        if (match) {
          const score = parseInt(match[1]);
          return score >= 0 && score <= 100 ? score : null;
        }
      }
    } catch (error) {
      console.error('Error extracting score:', error);
    }
    
    return null; // Default if no score found
  }

  private extractRecommendationFromResponse(content: string): string | null {
    try {
      const lowerContent = content.toLowerCase();
      
      if (lowerContent.includes('hire') && !lowerContent.includes('not hire') && !lowerContent.includes("don't hire")) {
        return 'HIRE';
      } else if (lowerContent.includes('second interview') || lowerContent.includes('next round')) {
        return 'SECOND_INTERVIEW';
      } else if (lowerContent.includes('reject') || lowerContent.includes('not suitable') || lowerContent.includes('not recommend')) {
        return 'REJECT';
      }
    } catch (error) {
      console.error('Error extracting recommendation:', error);
    }
    
    return 'SECOND_INTERVIEW'; // Default recommendation
  }
}
