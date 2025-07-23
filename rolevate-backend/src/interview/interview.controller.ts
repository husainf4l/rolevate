import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { InterviewService } from './interview.service';
import {
  CreateInterviewDto,
  UpdateInterviewDto,
  CreateTranscriptDto,
  BulkCreateTranscriptDto,
  InterviewResponseDto,
  TranscriptResponseDto,
  InterviewListResponseDto,
} from './dto/interview.dto';
@Controller('interviews')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  // === ROOM-BASED ENDPOINTS FOR EXISTING ROOMS ===

  @Get('candidate/:candidateId/job/:jobId')
  async getInterviewsByCandidateAndJob(
    @Param('candidateId') candidateId: string,
    @Param('jobId') jobId: string,
  ): Promise<InterviewResponseDto[]> {
    console.log('🔍 Get interviews for candidate:', candidateId, 'and job:', jobId);
    
    return await this.interviewService.getInterviewsByCandidateAndJob(candidateId, jobId);
  }

  @Get('room/:roomId')
  async getInterviewByRoomId(
    @Param('roomId') roomId: string,
  ): Promise<InterviewResponseDto | null> {
    console.log('� Get interview by room ID request:', roomId);
    
    return await this.interviewService.getInterviewByRoomId(roomId);
  }

  @Post('room/:roomId/save-video')
  async saveVideoLink(
    @Param('roomId') roomId: string,
    @Body() videoData: { 
      videoLink?: string; 
      recordingUrl?: string;
      title?: string;
      timestamp?: string; // ISO 8601 timestamp
    },
  ): Promise<InterviewResponseDto> {
    console.log('🎥 Save video link for room:', roomId);
    console.log('📊 Video data:', videoData);
    
    // Convert timestamp to number if provided
    const processedVideoData = {
      ...videoData,
      timestamp: videoData.timestamp ? new Date(videoData.timestamp).getTime() : undefined,
    };
    
    return await this.interviewService.saveVideoToRoom(roomId, processedVideoData);
  }

  @Post('room/:roomId/transcripts')
  async addTranscriptToRoom(
    @Param('roomId') roomId: string,
    @Body() transcriptData: {
      speakerType: 'INTERVIEWER' | 'CANDIDATE' | 'SYSTEM' | 'AI_ASSISTANT';
      speakerName?: string;
      speakerId?: string;
      content: string;
      startTime: number;
      endTime: number;
      duration: number;
      sequenceNumber: number;
      confidence?: number;
      language?: string;
      sentiment?: string;
      keywords?: string[];
      aiSummary?: string;
      importance?: number;
    },
  ): Promise<TranscriptResponseDto> {
    console.log('📝 Add transcript to room:', roomId);
    console.log('�️ Speaker:', transcriptData.speakerType, transcriptData.speakerName);
    
    return await this.interviewService.addTranscriptToRoom(roomId, transcriptData);
  }

  @Post('room/:roomId/transcripts/bulk')
  async addBulkTranscriptsToRoom(
    @Param('roomId') roomId: string,
    @Body() bulkData: {
      transcripts: Array<{
        speakerType: 'INTERVIEWER' | 'CANDIDATE' | 'SYSTEM' | 'AI_ASSISTANT';
        speakerName?: string;
        speakerId?: string;
        content: string;
        startTime: number;
        endTime: number;
        duration: number;
        sequenceNumber: number;
        confidence?: number;
        language?: string;
        sentiment?: string;
        keywords?: string[];
        aiSummary?: string;
        importance?: number;
      }>;
    },
  ): Promise<TranscriptResponseDto[]> {
    console.log('📝 Add bulk transcripts to room:', roomId);
    console.log('📊 Number of transcripts:', bulkData.transcripts.length);
    
    return await this.interviewService.addBulkTranscriptsToRoom(roomId, bulkData.transcripts);
  }

  @Get('room/:roomId/transcripts')
  async getTranscriptsByRoom(
    @Param('roomId') roomId: string,
  ): Promise<TranscriptResponseDto[]> {
    console.log('📋 Get transcripts for room:', roomId);
    
    return await this.interviewService.getTranscriptsByRoom(roomId);
  }

  @Post('room/:roomId/complete')
  async completeInterview(
    @Param('roomId') roomId: string,
    @Body() completionData?: {
      duration?: number;
      interviewerNotes?: string;
      overallRating?: number;
      aiScore?: number;
      aiRecommendation?: string;
    },
  ): Promise<InterviewResponseDto> {
    console.log('✅ Complete interview for room:', roomId);
    
    return await this.interviewService.completeInterviewByRoom(roomId, completionData);
  }

  @Post('room/:roomId/end-session')
  async endInterviewSession(
    @Param('roomId') roomId: string,
  ): Promise<InterviewResponseDto> {
    console.log('🛑 End interview session for room:', roomId);
    
    return await this.interviewService.endInterviewSession(roomId);
  }
}
