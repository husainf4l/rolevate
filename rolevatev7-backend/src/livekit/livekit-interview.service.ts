import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiveKitRoom } from './livekit-room.entity';
import { Application } from '../application/application.entity';
import { ConfigService } from '@nestjs/config';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import * as bcrypt from 'bcrypt';
import { CreateRoomResponse, RoomTokenResponse } from './livekit.dto';

@Injectable()
export class LiveKitInterviewService {
  private roomServiceClient: RoomServiceClient;

  constructor(
    @InjectRepository(LiveKitRoom)
    private readonly liveKitRoomRepository: Repository<LiveKitRoom>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');
    const liveKitUrl = this.configService.get<string>('LIVEKIT_URL');
    
    if (!apiKey || !apiSecret || !liveKitUrl) {
      throw new Error('LiveKit configuration missing');
    }

    const httpUrl = liveKitUrl.replace('wss://', 'https://').replace('ws://', 'http://');
    this.roomServiceClient = new RoomServiceClient(httpUrl, apiKey, apiSecret);
  }

  /**
   * Create a new interview room and return token (no password required)
   */
  async createInterviewRoom(applicationId: string): Promise<CreateRoomResponse> {
    // 1. Verify application exists and get candidate info
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['candidate', 'job'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // 2. Count existing interviews for this application to get the next number
    const existingCount = await this.liveKitRoomRepository.count({
      where: { applicationId },
    });

    // 3. Create room name with application ID and interview number (always increment)
    const interviewNumber = existingCount + 1;
    const roomName = `interview-${applicationId}-${interviewNumber}`;

    // 4. Create room in LiveKit with metadata
    const metadata = {
      applicationId,
      candidateId: application.candidateId,
      jobId: application.jobId,
      jobTitle: application.job?.title || 'Interview',
      interviewLanguage: application.job?.interviewLanguage || 'english',
      createdAt: new Date().toISOString(),
      type: 'interview'
    };

    const newRoom = await this.roomServiceClient.createRoom({
      name: roomName,
      emptyTimeout: 600, // 10 minutes
      maxParticipants: 10,
      metadata: JSON.stringify(metadata),
    });

    console.log(`✅ LiveKit room created: ${roomName}`);

    // 5. Save room to database (no password required)
    const liveKitRoom = this.liveKitRoomRepository.create({
      roomName,
      roomSid: newRoom.sid,
      roomPassword: 'no-password', // No password needed
      passwordExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      passwordUsed: true, // Mark as used since no password check needed
      applicationId,
    });
    await this.liveKitRoomRepository.save(liveKitRoom);

    // 6. Generate access token for the candidate
    const candidateName = application.candidate.name || `candidate-${applicationId}`;
    const token = await this.generateToken(roomName, candidateName);

    console.log(`🎫 Token generated for ${candidateName} to join room: ${roomName}`);

    return {
      roomName,
      token,
      message: `Interview room #${interviewNumber} created successfully`,
    };
  }

  /**
   * Get room token by verifying password
   */
  async getRoomToken(applicationId: string, password: string): Promise<RoomTokenResponse> {
    // 1. Get the latest room for this application
    const room = await this.liveKitRoomRepository.findOne({
      where: { applicationId },
      order: { createdAt: 'DESC' },
    });

    if (!room) {
      throw new NotFoundException('No interview room found for this application');
    }

    // 2. Check if password has expired
    if (new Date() > room.passwordExpiresAt) {
      throw new UnauthorizedException('Password has expired. Please request a new room.');
    }

    // 3. Check if password was already used (optional one-time use)
    if (room.passwordUsed) {
      throw new UnauthorizedException('Password has already been used. Please request a new room.');
    }

    // 4. Verify password
    const isPasswordValid = await bcrypt.compare(password, room.roomPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // 5. Mark password as used (optional - comment out if you want reusable passwords)
    // await this.liveKitRoomRepository.update(room.id, { passwordUsed: true });

    // 6. Generate participant name
    const participantName = `participant-${Date.now()}`;

    // 7. Generate LiveKit access token
    const token = await this.generateToken(room.roomName, participantName);

    return {
      token,
      roomName: room.roomName,
    };
  }

  /**
   * Generate LiveKit access token
   */
  private async generateToken(roomName: string, participantName: string): Promise<string> {
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      ttl: 3600, // 1 hour
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    return at.toJwt();
  }
}
