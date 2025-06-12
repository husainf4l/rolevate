import { Injectable } from '@nestjs/common';
import { RoomServiceClient, AccessToken } from 'livekit-server-sdk';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InterviewService {
  private roomService: RoomServiceClient;
  private livekitHost = process.env.LIVEKIT_URL || 'wss://rolvate2-ckmk80qb.livekit.cloud';
  private apiKey = process.env.LIVEKIT_API_KEY || 'APIYBd8YH53faWX';
  private apiSecret = process.env.LIVEKIT_API_SECRET || 'fgQLGjbNx1WJ42Y4LOlySajbjJoR1CYwXmslUu1ftLfB';

  constructor(private readonly prisma: PrismaService) {
    this.roomService = new RoomServiceClient(this.livekitHost, this.apiKey, this.apiSecret);
  }

  async createInterviewSession(jobPostId: string, phoneNumber: string, firstName?: string, lastName?: string) {
    // Verify job post exists
    const jobPost = await this.prisma.jobPost.findUnique({
      where: { id: jobPostId },
      include: { company: true },
    });

    if (!jobPost) {
      throw new Error('Job post not found');
    }

    // Find or create candidate first (we need this for room code generation)
    let candidate = await this.prisma.candidate.findUnique({
      where: { phoneNumber: phoneNumber }
    });

    if (!candidate) {
      candidate = await this.prisma.candidate.create({
        data: {
          phoneNumber: phoneNumber,
          name: firstName && lastName ? `${firstName} ${lastName}` : 'Candidate',
          firstName: firstName || 'Candidate',
          lastName: lastName || '',
        }
      });
    } else if (firstName && lastName) {
      candidate = await this.prisma.candidate.update({
        where: { id: candidate.id },
        data: {
          name: `${firstName} ${lastName}`,
          firstName: firstName,
          lastName: lastName,
        }
      });
    }

    // Generate unique room details based on candidate phone and timestamp
    const phoneDigits = phoneNumber.replace(/\D/g, ''); // Remove non-digits
    const timestamp = Date.now().toString().slice(-4); // Last 4 digits of timestamp
    const roomCode = `${phoneDigits.slice(-6)}${timestamp}`; // 6 digits from phone + 4 from timestamp
    const roomName = `interview_${candidate.id}_${timestamp}`; // More descriptive room name

    // Find or create application
    let application = await this.prisma.application.findFirst({
      where: { 
        jobPostId: jobPostId,
        candidateId: candidate.id 
      }
    });

    if (!application) {
      application = await this.prisma.application.create({
        data: {
          status: 'INTERVIEW_SCHEDULED',
          jobPostId: jobPostId,
          candidateId: candidate.id,
        }
      });
    }

    // Create complete metadata for AI agent
    const roomMetadata = JSON.stringify({
      candidate_id: candidate.id,
      job_id: jobPostId,
      candidate_name: candidate.name,
      candidate_phone: phoneNumber,
      job_title: jobPost.title,
      job_description: jobPost.description,
      job_requirements: jobPost.requirements,
      company: jobPost.company.name,
      ai_prompt: jobPost.aiPrompt,
      ai_instructions: jobPost.aiInstructions,
      room_type: 'interview',
      created_at: new Date().toISOString(),
      application_id: application.id
    });

    // Create room in LiveKit
    await this.roomService.createRoom({
      name: roomName,
      metadata: roomMetadata,
      maxParticipants: 2,
      emptyTimeout: 1800,
    });

    // Create interview session
    const interviewSession = await this.prisma.interview.create({
      data: {
        roomName,
        roomCode,
        type: 'AI_SCREENING',
        status: 'IN_PROGRESS',
        scheduledAt: new Date(),
        startedAt: new Date(),
        maxDuration: 1800,
        instructions: `Welcome to your interview for ${jobPost.title} at ${jobPost.company.name}`,
        candidatePhone: phoneNumber,
        candidateName: candidate.name,
        applicationId: application.id,
        candidateId: candidate.id,
      },
    });

    // Generate LiveKit access token
    const participantName = candidate.name || 'Candidate';
    const identity = `candidate_${phoneNumber.replace(/\D/g, '')}_${Date.now()}`;
    
    const token = new AccessToken(this.apiKey, this.apiSecret, {
      identity: identity,
      name: participantName,
    });

    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    const accessToken = await token.toJwt();

    return {
      // LiveKit connection details
      token: accessToken,
      roomName,
      participantName,
      identity,
      wsUrl: this.livekitHost,
      
      // Interview details
      roomCode,
      jobTitle: jobPost.title,
      companyName: jobPost.company.name,
      maxDuration: 1800,
      
      // Database IDs
      interviewId: interviewSession.id,
      candidateId: candidate.id,
      applicationId: application.id,
      jobPostId: jobPostId,
      
      status: 'READY_TO_JOIN'
    };
  }
}
