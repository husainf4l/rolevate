import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { RoomServiceClient, AccessToken } from 'livekit-server-sdk';
import { PrismaService } from '../prisma/prisma.service';
import { ScheduleInterviewDto, UpdateInterviewDto, InterviewQueryDto } from './dto/interview.dto';
import { Interview, Prisma, InterviewStatus } from '@prisma/client';

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

  async scheduleInterview(scheduleInterviewDto: ScheduleInterviewDto): Promise<Interview> {
    // Verify application exists
    const application = await this.prisma.application.findUnique({
      where: { id: scheduleInterviewDto.applicationId },
      include: {
        jobPost: {
          include: {
            company: true,
          },
        },
        candidate: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return this.prisma.interview.create({
      data: {
        applicationId: scheduleInterviewDto.applicationId,
        candidateId: application.candidateId,
        candidateName: application.candidate.name || 'Candidate',
        candidatePhone: application.candidate.phoneNumber,
        type: 'TECHNICAL',
        status: 'SCHEDULED',
        scheduledAt: scheduleInterviewDto.scheduledAt,
        roomName: `scheduled_${application.id}_${Date.now()}`,
        instructions: scheduleInterviewDto.interviewerNotes,
        maxDuration: 3600, // Default 1 hour
      },
      include: {
        application: {
          include: {
            jobPost: {
              include: {
                company: {
                  select: {
                    id: true,
                    name: true,
                    displayName: true,
                  },
                },
              },
            },
            candidate: {
              select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(query: InterviewQueryDto) {
    const {
      search,
      status,
      applicationId,
      candidateId,
      jobPostId,
      companyId,
      fromDate,
      toDate,
      page = 1,
      limit = 10,
      sortBy = 'scheduledAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const whereConditions: Prisma.InterviewWhereInput[] = [];

    if (status) {
      whereConditions.push({ status });
    }

    if (applicationId) {
      whereConditions.push({ applicationId });
    }

    if (candidateId) {
      whereConditions.push({ candidateId });
    }

    if (jobPostId) {
      whereConditions.push({
        application: {
          jobPostId,
        },
      });
    }

    if (companyId) {
      whereConditions.push({
        application: {
          jobPost: {
            companyId,
          },
        },
      });
    }

    if (fromDate) {
      whereConditions.push({
        scheduledAt: {
          gte: fromDate,
        },
      });
    }

    if (toDate) {
      whereConditions.push({
        scheduledAt: {
          lte: toDate,
        },
      });
    }

    if (search) {
      whereConditions.push({
        OR: [
          { candidateName: { contains: search, mode: 'insensitive' } },
          { candidatePhone: { contains: search } },
          { instructions: { contains: search, mode: 'insensitive' } },
          { summary: { contains: search, mode: 'insensitive' } },
          {
            application: {
              jobPost: {
                title: { contains: search, mode: 'insensitive' },
              },
            },
          },
          {
            application: {
              candidate: {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { firstName: { contains: search, mode: 'insensitive' } },
                  { lastName: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                ],
              },
            },
          },
        ],
      });
    }

    const where: Prisma.InterviewWhereInput =
      whereConditions.length > 0 ? { AND: whereConditions } : {};

    const total = await this.prisma.interview.count({ where });

    const interviews = await this.prisma.interview.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        application: {
          include: {
            jobPost: {
              select: {
                id: true,
                title: true,
                company: {
                  select: {
                    id: true,
                    name: true,
                    displayName: true,
                  },
                },
              },
            },
            candidate: {
              select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    return {
      data: interviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async findByCompany(companyId: string, query: InterviewQueryDto) {
    return this.findAll({ ...query, companyId });
  }

  async findOne(id: string): Promise<Interview> {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            jobPost: {
              include: {
                company: {
                  select: {
                    id: true,
                    name: true,
                    displayName: true,
                    industry: true,
                    location: true,
                    logo: true,
                  },
                },
              },
            },
            candidate: {
              include: {
                _count: {
                  select: {
                    applications: true,
                    interviews: true,
                    cvAnalyses: true,
                  },
                },
              },
            },
            cvAnalysis: true,
          },
        },
      },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    return interview;
  }

  async update(id: string, updateInterviewDto: UpdateInterviewDto, companyId?: string): Promise<Interview> {
    const existingInterview = await this.prisma.interview.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            jobPost: true,
          },
        },
      },
    });

    if (!existingInterview) {
      throw new NotFoundException('Interview not found');
    }

    // If companyId is provided, verify the interview belongs to the company
    if (companyId && existingInterview.application?.jobPost.companyId !== companyId) {
      throw new ForbiddenException('Access denied to this interview');
    }

    return this.prisma.interview.update({
      where: { id },
      data: updateInterviewDto,
      include: {
        application: {
          include: {
            jobPost: {
              include: {
                company: {
                  select: {
                    id: true,
                    name: true,
                    displayName: true,
                  },
                },
              },
            },
            candidate: {
              select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string, companyId?: string): Promise<{ message: string }> {
    const existingInterview = await this.prisma.interview.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            jobPost: true,
          },
        },
      },
    });

    if (!existingInterview) {
      throw new NotFoundException('Interview not found');
    }

    // If companyId is provided, verify the interview belongs to the company
    if (companyId && existingInterview.application?.jobPost.companyId !== companyId) {
      throw new ForbiddenException('Access denied to this interview');
    }

    await this.prisma.interview.delete({
      where: { id },
    });

    return { message: 'Interview deleted successfully' };
  }

  async getInterviewsByCandidate(candidateId: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return this.prisma.interview.findMany({
      where: { candidateId },
      include: {
        application: {
          include: {
            jobPost: {
              select: {
                id: true,
                title: true,
                company: {
                  select: {
                    id: true,
                    name: true,
                    displayName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async getInterviewsByApplication(applicationId: string, companyId?: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        jobPost: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // If companyId is provided, verify the application belongs to the company
    if (companyId && application.jobPost.companyId !== companyId) {
      throw new ForbiddenException('Access denied to this application');
    }

    return this.prisma.interview.findMany({
      where: { applicationId },
      include: {
        application: {
          include: {
            candidate: {
              select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                profileImage: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async startInterview(id: string): Promise<Interview> {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    if (interview.status !== 'SCHEDULED') {
      throw new ForbiddenException('Interview cannot be started');
    }

    return this.prisma.interview.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });
  }

  async completeInterview(id: string, feedback?: string, rating?: number): Promise<Interview> {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    if (interview.status !== 'IN_PROGRESS') {
      throw new ForbiddenException('Interview is not in progress');
    }

    return this.prisma.interview.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }

  async cancelInterview(id: string, reason?: string): Promise<Interview> {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    if (interview.status === 'COMPLETED' || interview.status === 'CANCELLED') {
      throw new ForbiddenException('Interview cannot be cancelled');
    }

    return this.prisma.interview.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        summary: reason ? `Cancelled: ${reason}` : 'Cancelled',
      },
    });
  }
}
