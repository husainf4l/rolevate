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

  // === INTERVIEW ENDPOINTS (NO AUTH) ===

  @Post()
  async createInterview(
    @Body() createInterviewDto: CreateInterviewDto,
  ): Promise<InterviewResponseDto> {
    console.log('🎤 Interview creation request received (No Auth)');
    console.log('📋 Interview data:', JSON.stringify(createInterviewDto, null, 2));
    
    return await this.interviewService.createInterview(createInterviewDto);
  }

  @Put(':id')
  async updateInterview(
    @Param('id') id: string,
    @Body() updateInterviewDto: UpdateInterviewDto,
  ): Promise<InterviewResponseDto> {
    console.log('📝 Interview update request received for:', id);
    console.log('🔄 Update data:', JSON.stringify(updateInterviewDto, null, 2));
    
    return await this.interviewService.updateInterview(id, updateInterviewDto);
  }

  @Get(':id')
  async getInterviewById(
    @Param('id') id: string,
  ): Promise<InterviewResponseDto> {
    console.log('🔍 Get interview by ID request:', id);
    
    return await this.interviewService.getInterviewById(id);
  }

  @Get('job/:jobId')
  async getInterviewsByJob(
    @Param('jobId') jobId: string,
  ): Promise<InterviewListResponseDto> {
    console.log('📋 Get interviews by job request:', jobId);
    
    return await this.interviewService.getInterviewsByJob(jobId);
  }

  @Get('candidate/:candidateId')
  async getInterviewsByCandidate(
    @Param('candidateId') candidateId: string,
  ): Promise<InterviewListResponseDto> {
    console.log('👤 Get interviews by candidate request:', candidateId);
    
    return await this.interviewService.getInterviewsByCandidate(candidateId);
  }

  // === TRANSCRIPT ENDPOINTS (NO AUTH) ===

  @Post('transcripts')
  async createTranscript(
    @Body() createTranscriptDto: CreateTranscriptDto,
  ): Promise<TranscriptResponseDto> {
    console.log('📝 Transcript creation request received for interview:', createTranscriptDto.interviewId);
    console.log('🎤 Speaker:', createTranscriptDto.speakerType, '-', createTranscriptDto.speakerName);
    console.log('⏱️ Time:', createTranscriptDto.startTime, 'to', createTranscriptDto.endTime);
    
    return await this.interviewService.createTranscript(createTranscriptDto);
  }

  @Post('transcripts/bulk')
  async createBulkTranscripts(
    @Body() bulkCreateTranscriptDto: BulkCreateTranscriptDto,
  ): Promise<TranscriptResponseDto[]> {
    console.log('📝 Bulk transcript creation request received for interview:', bulkCreateTranscriptDto.interviewId);
    console.log('📊 Number of transcripts:', bulkCreateTranscriptDto.transcripts.length);
    
    return await this.interviewService.createBulkTranscripts(bulkCreateTranscriptDto);
  }

  @Get(':interviewId/transcripts')
  async getTranscriptsByInterview(
    @Param('interviewId') interviewId: string,
  ): Promise<TranscriptResponseDto[]> {
    console.log('📋 Get transcripts by interview request:', interviewId);
    
    return await this.interviewService.getTranscriptsByInterview(interviewId);
  }

  // === ROOM ID BASED ENDPOINTS (for LiveKit/FastAPI integration) ===

  @Get('room/:roomId')
  async getInterviewByRoomId(
    @Param('roomId') roomId: string,
  ): Promise<InterviewResponseDto> {
    console.log('🏠 Get interview by room ID request:', roomId);
    
    return await this.interviewService.getInterviewByRoomId(roomId);
  }

  @Post('room/:roomId/start')
  async startInterviewByRoomId(
    @Param('roomId') roomId: string,
  ): Promise<InterviewResponseDto> {
    console.log('▶️ Start interview by room ID request:', roomId);
    
    return await this.interviewService.startInterviewByRoomId(roomId);
  }

  @Post('room/:roomId/end')
  async endInterviewByRoomId(
    @Param('roomId') roomId: string,
    @Body() endData?: { recordingUrl?: string; duration?: number },
  ): Promise<InterviewResponseDto> {
    console.log('⏹️ End interview by room ID request:', roomId);
    console.log('📹 End data:', JSON.stringify(endData, null, 2));
    
    return await this.interviewService.endInterviewByRoomId(roomId, endData);
  }

  @Post('room/:roomId/transcripts')
  async addTranscriptByRoomId(
    @Param('roomId') roomId: string,
    @Body() transcriptData: Omit<CreateTranscriptDto, 'interviewId'>,
  ): Promise<TranscriptResponseDto> {
    console.log('📝 Add transcript by room ID request:', roomId);
    console.log('🎤 Transcript:', transcriptData.speakerType, '-', transcriptData.content?.substring(0, 50) + '...');
    
    return await this.interviewService.addTranscriptByRoomId(roomId, transcriptData);
  }

  // === FASTAPI SPECIFIC ENDPOINTS ===

  @Post('fastapi/save-interview')
  async saveInterviewFromFastAPI(
    @Body() data: {
      interview: CreateInterviewDto;
      transcripts?: Omit<CreateTranscriptDto, 'interviewId'>[];
    },
  ): Promise<{ interview: InterviewResponseDto; transcripts: TranscriptResponseDto[] }> {
    console.log('🚀 FastAPI save interview and transcripts request received');
    console.log('🎤 Interview data:', JSON.stringify(data.interview, null, 2));
    console.log('📝 Transcripts count:', data.transcripts?.length || 0);
    
    // Create interview first
    const interview = await this.interviewService.createInterview(data.interview);
    
    // Create transcripts if provided
    let transcripts: TranscriptResponseDto[] = [];
    if (data.transcripts && data.transcripts.length > 0) {
      const bulkTranscriptDto: BulkCreateTranscriptDto = {
        interviewId: interview.id,
        transcripts: data.transcripts,
      };
      transcripts = await this.interviewService.createBulkTranscripts(bulkTranscriptDto);
    }
    
    console.log('✅ Interview and transcripts saved successfully');
    
    return { interview, transcripts };
  }

  @Put('fastapi/update-interview/:id')
  async updateInterviewFromFastAPI(
    @Param('id') id: string,
    @Body() data: {
      interview?: UpdateInterviewDto;
      transcripts?: Omit<CreateTranscriptDto, 'interviewId'>[];
    },
  ): Promise<{ interview: InterviewResponseDto; transcripts: TranscriptResponseDto[] }> {
    console.log('🔄 FastAPI update interview request received for:', id);
    
    // Update interview if data provided
    let interview: InterviewResponseDto;
    if (data.interview) {
      interview = await this.interviewService.updateInterview(id, data.interview);
    } else {
      interview = await this.interviewService.getInterviewById(id);
    }
    
    // Add new transcripts if provided
    let transcripts: TranscriptResponseDto[] = [];
    if (data.transcripts && data.transcripts.length > 0) {
      const bulkTranscriptDto: BulkCreateTranscriptDto = {
        interviewId: id,
        transcripts: data.transcripts,
      };
      transcripts = await this.interviewService.createBulkTranscripts(bulkTranscriptDto);
    }
    
    console.log('✅ Interview updated successfully');
    
    return { interview, transcripts };
  }
}
