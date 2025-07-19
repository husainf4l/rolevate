import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LiveKitService } from '../livekit/livekit.service';

interface LeaveRoomDto {
  candidateId: string;
  roomName: string;
}

interface RoomStatusDto {
  roomName: string;
}

interface RefreshTokenDto {
  roomName: string;
  candidateId: string;
}

interface CreateRoomDto {
  jobId: string;
  phone: string;
}

@Injectable()
export class RoomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly liveKitService: LiveKitService,
  ) {}

  async leaveRoom(leaveRoomDto: LeaveRoomDto) {
    const { candidateId, roomName } = leaveRoomDto;

    // Validate required fields
    if (!candidateId || !roomName) {
      throw new BadRequestException('CandidateId and roomName are required');
    }

    console.log(`🚪 Candidate ${candidateId} leaving room: ${roomName}`);

    try {
      // Find the candidate
      const candidate = await this.prisma.candidateProfile.findUnique({
        where: { id: candidateId },
        include: { user: true }
      });

      if (!candidate) {
        throw new NotFoundException('Candidate not found');
      }

      // Check if the LiveKit room exists
      const liveKitRoom = await this.prisma.liveKitRoom.findFirst({
        where: {
          name: roomName
        }
      });

      if (!liveKitRoom) {
        throw new NotFoundException('Interview room not found');
      }

      // For now, we'll just log the leave action
      // In a full implementation, you might want to:
      // 1. Remove the participant from the LiveKit room server-side
      // 2. Update room metadata
      // 3. Log the session end time
      // 4. Send notifications if needed

      console.log(`✅ ${candidate.firstName} ${candidate.lastName} left room: ${roomName}`);

      return {
        success: true,
        message: `Successfully left room ${roomName}`,
        candidateId,
        roomName,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error leaving room:', error);
      
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException('Failed to leave interview room');
    }
  }

  async getRoomStatus(roomStatusDto: RoomStatusDto) {
    const { roomName } = roomStatusDto;

    if (!roomName) {
      throw new BadRequestException('Room name is required');
    }

    console.log(`📊 Checking status for room: ${roomName}`);

    try {
      // Get room from database
      const liveKitRoom = await this.prisma.liveKitRoom.findFirst({
        where: {
          name: roomName
        }
      });

      if (!liveKitRoom) {
        throw new NotFoundException('Interview room not found');
      }

      // Get related application and candidate info
      let application: any = null;
      if (liveKitRoom.metadata && typeof liveKitRoom.metadata === 'object') {
        const metadata = liveKitRoom.metadata as any;
        if (metadata.applicationId) {
          application = await this.prisma.application.findFirst({
            where: {
              id: metadata.applicationId
            },
            include: {
              candidate: true,
              job: {
                include: {
                  company: true
                }
              }
            }
          });
        }
      }

      // Calculate room duration
      const createdAt = liveKitRoom.createdAt;
      const now = new Date();
      const durationMs = now.getTime() - createdAt.getTime();
      const durationMinutes = Math.floor(durationMs / (1000 * 60));

      return {
        success: true,
        room: {
          id: liveKitRoom.id,
          name: liveKitRoom.name,
          createdAt: liveKitRoom.createdAt,
          createdBy: liveKitRoom.createdBy,
          metadata: liveKitRoom.metadata,
          durationMinutes,
          status: 'active' // In a full implementation, you'd check LiveKit server for actual status
        },
        application: application ? {
          id: application.id,
          status: application.status,
          candidate: {
            id: application.candidate.id,
            firstName: application.candidate.firstName,
            lastName: application.candidate.lastName,
            email: application.candidate.email
          },
          job: {
            id: application.job.id,
            title: application.job.title,
            company: application.job.company.name
          }
        } : null,
        liveKitUrl: process.env.LIVEKIT_URL
      };

    } catch (error) {
      console.error('Error getting room status:', error);
      
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException('Failed to get room status');
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { roomName, candidateId } = refreshTokenDto;

    if (!roomName || !candidateId) {
      throw new BadRequestException('Room name and candidate ID are required');
    }

    console.log(`🔄 Refreshing token for candidate ${candidateId} in room: ${roomName}`);

    try {
      // Find the candidate
      const candidate = await this.prisma.candidateProfile.findUnique({
        where: { id: candidateId },
        include: { user: true }
      });

      if (!candidate) {
        throw new NotFoundException('Candidate not found');
      }

      // Check if the LiveKit room exists
      const liveKitRoom = await this.prisma.liveKitRoom.findFirst({
        where: {
          name: roomName
        }
      });

      if (!liveKitRoom) {
        throw new NotFoundException('Interview room not found');
      }

      // Generate a new token with extended duration (2 hours)
      const participantName = `${candidate.firstName} ${candidate.lastName}`;
      const token = await this.liveKitService.generateTokenWithDuration(
        roomName,
        participantName,
        candidateId,
        2 * 60 * 60 // 2 hours in seconds
      );

      console.log(`✅ New token generated for ${participantName} (2 hour duration)`);

      // Calculate token expiration time
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now

      return {
        success: true,
        token,
        roomName,
        participantName,
        candidateId,
        expiresAt: expiresAt.toISOString(),
        durationSeconds: 2 * 60 * 60,
        liveKitUrl: process.env.LIVEKIT_URL,
        message: 'Token refreshed successfully with 2 hour duration'
      };

    } catch (error) {
      console.error('Error refreshing token:', error);
      
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException('Failed to refresh token');
    }
  }

  async getLiveKitServerStatus(roomName: string) {
    try {
      console.log(`🔍 Getting real-time LiveKit server status for room: ${roomName}`);
      
      // Get real-time status from LiveKit server
      const serverStatus = await this.liveKitService.getLiveKitRoomStatus(roomName);
      
      // Also get database status for comparison
      const dbRoom = await this.prisma.liveKitRoom.findFirst({
        where: { name: roomName }
      });

      return {
        success: true,
        roomName,
        serverStatus,
        databaseStatus: dbRoom ? {
          exists: true,
          roomId: dbRoom.id,
          name: dbRoom.name,
          metadata: dbRoom.metadata,
          createdAt: dbRoom.createdAt,
          createdBy: dbRoom.createdBy
        } : {
          exists: false,
          message: 'Room not found in database'
        },
        timestamp: new Date().toISOString(),
        comparison: {
          serverExists: serverStatus.exists,
          databaseExists: !!dbRoom,
          statusMatch: serverStatus.exists === !!dbRoom
        }
      };

    } catch (error) {
      console.error('Error getting LiveKit server status:', error);
      throw new BadRequestException(`Failed to get LiveKit server status: ${error.message}`);
    }
  }

  async createNewRoomWithMetadata(createRoomDto: CreateRoomDto) {
    const { jobId, phone } = createRoomDto;

    try {
      console.log(`🔄 Creating new interview room for phone: ${phone}, jobId: ${jobId}`);

      // Step 1: Find the application/candidate
      const application = await this.prisma.application.findFirst({
        where: {
          jobId: jobId,
          candidate: {
            phone: {
              contains: phone.replace('+', '') // Support both +962 and 962 formats
            }
          }
        },
        include: {
          candidate: {
            include: {
              workExperiences: true,
              educationHistory: true,
              cvs: {
                where: { isActive: true },
                take: 1
              }
            }
          },
          job: {
            include: {
              company: {
                include: {
                  address: true
                }
              }
            }
          }
        }
      });

      if (!application) {
        throw new NotFoundException('Application not found for the given jobId and phone');
      }

      // Step 2: Generate room name with timestamp
      const timestamp = Date.now();
      const roomName = `interview_${application.id}_${timestamp}`;

      // Step 3: Create minimal metadata for the agent
      const newMetadata = {
        candidateName: `${application.candidate.firstName} ${application.candidate.lastName}`,
        jobName: application.job.title,
        companyName: application.job.company.name,
        interviewPrompt: application.job.interviewPrompt || "Conduct a professional interview for this position.",
        cvAnalysis: application.cvAnalysisResults ? (() => {
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

      // Step 4: Create room on LiveKit server AND database with metadata
      const participantName = `${application.candidate.firstName} ${application.candidate.lastName}`;
      
      console.log(`🏗️ Creating room on LiveKit server: ${roomName}`);
      console.log(`📋 Metadata includes: job, company, candidate, application details`);
      
      const { room: newRoom, token } = await this.liveKitService.createRoomWithToken(
        roomName,
        newMetadata,
        'system',
        participantName,
        2 * 60 * 60 // 2 hours
      );

      console.log(`✅ Room created on LiveKit server: ${roomName} with comprehensive metadata`);

      return {
        success: true,
        room: {
          id: newRoom.id,
          name: roomName,
          metadata: newMetadata,
          createdAt: newRoom.createdAt
        },
        token: token,
        participantName: participantName,
        candidateId: application.candidateId,
        liveKitUrl: process.env.LIVEKIT_URL,
        expiresAt: new Date(Date.now() + (2 * 60 * 60 * 1000)).toISOString(),
        
        // Simple interview context for agent
        interviewContext: {
          candidateName: newMetadata.candidateName,
          jobName: newMetadata.jobName,
          companyName: newMetadata.companyName,
          interviewPrompt: newMetadata.interviewPrompt,
          cvAnalysis: newMetadata.cvAnalysis
        },
        
        // Summary for quick reference
        interviewSummary: {
          candidateName: newMetadata.candidateName,
          position: newMetadata.jobName,
          company: newMetadata.companyName,
          interviewType: "video_interview"
        },
        
        message: 'Interview room created with minimal metadata sent to LiveKit server. AI agent will have access to essential interview information.',
        instructions: {
          step1: 'Use the provided token to join the LiveKit room',
          step2: 'The AI agent will automatically detect the metadata from LiveKit server',
          step3: 'Agent will conduct interview based on the provided prompt',
          step4: 'Interview will be personalized for the candidate and position'
        }
      };

    } catch (error) {
      console.error('Error creating new room:', error);
      
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException('Failed to create new room');
    }
  }

  async closeAllLiveKitSessions() {
    try {
      console.log('🧹 Initiating closure of all LiveKit sessions...');
      
      // Use the LiveKit service to close all sessions
      const result = await this.liveKitService.closeAllSessions();
      
      if (result.success) {
        console.log(`✅ Successfully closed ${result.roomsClosed} rooms`);
        
        return {
          success: true,
          message: result.message,
          details: {
            totalRooms: result.totalRooms,
            roomsClosed: result.roomsClosed,
            errors: result.errors,
            rooms: result.rooms
          },
          timestamp: result.timestamp
        };
      } else {
        console.log('❌ Failed to close sessions:', result.error);
        throw new BadRequestException(`Failed to close sessions: ${result.error}`);
      }
      
    } catch (error) {
      console.error('Error closing all LiveKit sessions:', error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException('Failed to close all LiveKit sessions');
    }
  }
}
