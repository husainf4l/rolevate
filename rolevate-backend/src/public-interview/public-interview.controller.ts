import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { LiveKitService } from '../livekit/livekit.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JoinInterviewDto, CreateInterviewRoomDto } from './dto/public-interview.dto';

@Controller('public/interview')
export class PublicInterviewController {
  constructor(
    private readonly liveKitService: LiveKitService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Create an interview room (used by HR/authenticated users)
   * Multiple candidates can interview for the same job post
   */
  @Post('room/create')
  @UseGuards(JwtAuthGuard)
  async createInterviewRoom(@Body() createRoomDto: CreateInterviewRoomDto) {
    const { jobPostId, interviewType, maxDuration, instructions, customRoomCode, maxCandidates } = createRoomDto;
    
    // Verify job post exists
    const jobPost = await this.prisma.jobPost.findUnique({
      where: { id: jobPostId },
      include: { company: true },
    });

    if (!jobPost) {
      throw new BadRequestException('Job post not found');
    }
    
    // Use custom room code or generate unique one
    const roomCode = customRoomCode || this.generateRoomCode();
    const roomName = `interview_${roomCode}`;
    
    try {
      // Create room in LiveKit
      await this.liveKitService.createRoom(
        roomName,
        maxDuration || 1800, // 30 minutes default
        maxCandidates || 50 // Allow multiple candidates
      );

      // Find or create a generic candidate for job-based interviews
      let genericCandidate = await this.prisma.user.findFirst({
        where: { email: 'generic-interview@system.temp' }
      });

      if (!genericCandidate) {
        genericCandidate = await this.prisma.user.create({
          data: {
            email: 'generic-interview@system.temp',
            username: 'generic-interview',
            name: 'Generic Interview Candidate',
            firstName: 'Generic',
            lastName: 'Candidate',
            password: 'temp-password',
            role: 'CANDIDATE',
          }
        });
      }

      // Find or create a generic application for this job post
      let genericApplication = await this.prisma.application.findFirst({
        where: { 
          jobPostId: jobPostId,
          candidateId: genericCandidate.id 
        }
      });

      if (!genericApplication) {
        genericApplication = await this.prisma.application.create({
          data: {
            status: 'PENDING',
            jobPostId: jobPostId,
            candidateId: genericCandidate.id,
          }
        });
      }

      // Store interview session in database
      const interviewSession = await this.prisma.interview.create({
        data: {
          roomName,
          roomCode,
          type: interviewType,
          status: 'SCHEDULED',
          scheduledAt: new Date(),
          maxDuration: maxDuration || 1800,
          instructions: instructions || 'Welcome to your interview. Please speak clearly and answer questions to the best of your ability.',
          applicationId: genericApplication.id,
          candidateId: genericCandidate.id,
        },
      });

      return {
        roomCode,
        roomName,
        joinUrl: `/interview/join/${roomCode}`,
        instructions: instructions || 'Welcome to your interview. Please speak clearly and answer questions to the best of your ability.',
        maxDuration: maxDuration || 1800,
        maxCandidates: maxCandidates || 50,
        sessionId: interviewSession.id,
        jobTitle: jobPost.title,
        companyName: jobPost.company.name,
      };
    } catch (error) {
      console.error('Failed to create interview room:', error);
      throw new BadRequestException('Failed to create interview room');
    }
  }

  /**
   * Join interview room with phone number (PUBLIC - no authentication required)
   * Multiple candidates can join the same room code for the same job
   */
  @Post('join/:roomCode')
  @HttpCode(HttpStatus.OK)
  async joinInterview(
    @Param('roomCode') roomCode: string,
    @Body() joinDto: JoinInterviewDto,
  ) {
    const { phoneNumber, firstName, lastName } = joinDto;

    // Find interview session
    const interviewSession = await this.prisma.interview.findUnique({
      where: { roomCode },
      include: { 
        application: { 
          include: { jobPost: true } 
        } 
      },
    });

    if (!interviewSession) {
      throw new BadRequestException('Interview session not found');
    }

    if (interviewSession.status === 'COMPLETED') {
      throw new BadRequestException('This interview session has already been completed');
    }

    // Create participant identity using phone number
    const participantName = `${firstName} ${lastName}`.trim();
    const identity = `candidate_${phoneNumber.replace(/\D/g, '')}_${Date.now()}`; // Add timestamp for uniqueness
    
    try {
      // Generate LiveKit token
      const tokenData = await this.liveKitService.generateToken(
        identity,
        interviewSession.roomName,
        participantName,
      );

      // Create a new interview record for this specific candidate
      const candidateInterview = await this.prisma.interview.create({
        data: {
          roomName: interviewSession.roomName,
          roomCode: `${roomCode}_${phoneNumber.replace(/\D/g, '').slice(-4)}`, // Unique code per candidate
          type: interviewSession.type,
          status: 'IN_PROGRESS',
          scheduledAt: new Date(),
          startedAt: new Date(),
          maxDuration: interviewSession.maxDuration,
          instructions: interviewSession.instructions,
          candidatePhone: phoneNumber,
          candidateName: participantName,
          applicationId: interviewSession.applicationId,
          candidateId: interviewSession.candidateId,
        },
      });

      return {
        ...tokenData,
        roomCode,
        participantName,
        jobTitle: interviewSession.application?.jobPost?.title,
        instructions: interviewSession.instructions,
        maxDuration: interviewSession.maxDuration,
        candidateInterviewId: candidateInterview.id,
      };
    } catch (error) {
      console.error('Failed to join interview:', error);
      throw new BadRequestException('Failed to join interview');
    }
  }

  /**
   * Get interview room info (PUBLIC)
   */
  @Get('room/:roomCode')
  async getInterviewRoomInfo(@Param('roomCode') roomCode: string) {
    const interviewSession = await this.prisma.interview.findUnique({
      where: { roomCode },
      include: { 
        application: { 
          include: { 
            jobPost: { 
              include: { company: { select: { name: true } } } 
            } 
          } 
        } 
      },
    });

    if (!interviewSession) {
      throw new BadRequestException('Interview session not found');
    }

    // Count how many candidates have joined this interview
    const candidateCount = await this.prisma.interview.count({
      where: { 
        roomName: interviewSession.roomName,
        candidatePhone: { not: null }
      }
    });

    return {
      roomCode,
      jobTitle: interviewSession.application?.jobPost?.title,
      companyName: interviewSession.application?.jobPost?.company?.name,
      instructions: interviewSession.instructions,
      maxDuration: interviewSession.maxDuration,
      status: interviewSession.status,
      interviewType: interviewSession.type,
      candidatesJoined: candidateCount,
    };
  }

  /**
   * List all candidates who have joined this interview room
   */
  @Get('room/:roomCode/candidates')
  async getInterviewCandidates(@Param('roomCode') roomCode: string) {
    const mainInterview = await this.prisma.interview.findUnique({
      where: { roomCode },
    });

    if (!mainInterview) {
      throw new BadRequestException('Interview session not found');
    }

    const candidates = await this.prisma.interview.findMany({
      where: { 
        roomName: mainInterview.roomName,
        candidatePhone: { not: null }
      },
      select: {
        id: true,
        candidateName: true,
        candidatePhone: true,
        status: true,
        startedAt: true,
        endedAt: true,
      }
    });

    return { candidates };
  }

  /**
   * End interview session (can be called by candidate or system)
   */
  @Post('room/:roomCode/end')
  @HttpCode(HttpStatus.OK)
  async endInterview(@Param('roomCode') roomCode: string) {
    const interviewSession = await this.prisma.interview.findUnique({
      where: { roomCode },
    });

    if (!interviewSession) {
      throw new BadRequestException('Interview session not found');
    }

    // Update interview status
    await this.prisma.interview.update({
      where: { id: interviewSession.id },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
      },
    });

    return { message: 'Interview session ended successfully' };
  }

  /**
   * Generate unique room code
   */
  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
