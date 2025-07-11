# NestJS LiveKit Integration - Backend Documentation

## Overview
This document outlines the professional implementation of LiveKit integration in a NestJS backend for real-time AI-powered interview sessions.

## Architecture

### Dependencies
```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "livekit-server-sdk": "^2.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1"
  }
}
```

## Configuration Module

### Environment Variables
```typescript
// config/livekit.config.ts
export interface LiveKitConfig {
  apiKey: string;
  apiSecret: string;
  wsUrl: string;
  httpUrl: string;
}

export const liveKitConfig = (): { livekit: LiveKitConfig } => ({
  livekit: {
    apiKey: process.env.LIVEKIT_API_KEY,
    apiSecret: process.env.LIVEKIT_API_SECRET,
    wsUrl: process.env.LIVEKIT_WS_URL,
    httpUrl: process.env.LIVEKIT_HTTP_URL,
  },
});
```

### Environment File (.env)
```env
# LiveKit Configuration
LIVEKIT_API_KEY=your_api_key_here
LIVEKIT_API_SECRET=your_api_secret_here
LIVEKIT_WS_URL=wss://your-livekit-server.com
LIVEKIT_HTTP_URL=https://your-livekit-server.com
```

## Service Layer

### LiveKit Service
```typescript
// services/livekit.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  AccessToken, 
  RoomServiceClient,
  Room,
  CreateRoomRequest,
  ParticipantInfo,
  TrackKind
} from 'livekit-server-sdk';

@Injectable()
export class LiveKitService {
  private readonly logger = new Logger(LiveKitService.name);
  private roomService: RoomServiceClient;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('livekit.apiKey');
    const apiSecret = this.configService.get<string>('livekit.apiSecret');
    const httpUrl = this.configService.get<string>('livekit.httpUrl');

    if (!apiKey || !apiSecret || !httpUrl) {
      throw new Error('LiveKit configuration is incomplete');
    }

    this.roomService = new RoomServiceClient(httpUrl, apiKey, apiSecret);
  }

  /**
   * Create a new interview room
   */
  async createRoom(roomName: string, maxParticipants = 10): Promise<Room> {
    try {
      const request: CreateRoomRequest = {
        name: roomName,
        emptyTimeout: 300, // 5 minutes
        maxParticipants,
        metadata: JSON.stringify({
          type: 'interview',
          createdAt: new Date().toISOString(),
        }),
      };

      const room = await this.roomService.createRoom(request);
      this.logger.log(`Created room: ${roomName}`);
      return room;
    } catch (error) {
      this.logger.error(`Failed to create room ${roomName}:`, error);
      throw new BadRequestException('Failed to create interview room');
    }
  }

  /**
   * Generate access token for participant
   */
  generateToken(
    roomName: string,
    participantName: string,
    permissions: {
      canPublish?: boolean;
      canSubscribe?: boolean;
      canPublishData?: boolean;
      canUpdateMetadata?: boolean;
    } = {}
  ): string {
    try {
      const apiKey = this.configService.get<string>('livekit.apiKey');
      const apiSecret = this.configService.get<string>('livekit.apiSecret');

      const token = new AccessToken(apiKey, apiSecret, {
        identity: participantName,
        ttl: '4h', // Token valid for 4 hours
      });

      token.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: permissions.canPublish ?? true,
        canSubscribe: permissions.canSubscribe ?? true,
        canPublishData: permissions.canPublishData ?? true,
        canUpdateMetadata: permissions.canUpdateMetadata ?? false,
      });

      return token.toJwt();
    } catch (error) {
      this.logger.error('Failed to generate token:', error);
      throw new BadRequestException('Failed to generate access token');
    }
  }

  /**
   * Get room information
   */
  async getRoomInfo(roomName: string): Promise<Room | null> {
    try {
      const rooms = await this.roomService.listRooms([roomName]);
      return rooms.length > 0 ? rooms[0] : null;
    } catch (error) {
      this.logger.error(`Failed to get room info for ${roomName}:`, error);
      return null;
    }
  }

  /**
   * End a room session
   */
  async endRoom(roomName: string): Promise<void> {
    try {
      await this.roomService.deleteRoom(roomName);
      this.logger.log(`Ended room: ${roomName}`);
    } catch (error) {
      this.logger.error(`Failed to end room ${roomName}:`, error);
      throw new BadRequestException('Failed to end interview room');
    }
  }

  /**
   * List participants in a room
   */
  async listParticipants(roomName: string): Promise<ParticipantInfo[]> {
    try {
      const participants = await this.roomService.listParticipants(roomName);
      return participants;
    } catch (error) {
      this.logger.error(`Failed to list participants in ${roomName}:`, error);
      return [];
    }
  }

  /**
   * Remove participant from room
   */
  async removeParticipant(roomName: string, participantId: string): Promise<void> {
    try {
      await this.roomService.removeParticipant(roomName, participantId);
      this.logger.log(`Removed participant ${participantId} from room ${roomName}`);
    } catch (error) {
      this.logger.error(`Failed to remove participant ${participantId}:`, error);
      throw new BadRequestException('Failed to remove participant');
    }
  }
}
```

## Interview Service

### Interview Business Logic
```typescript
// services/interview.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { LiveKitService } from './livekit.service';
import { CreateInterviewDto, JoinInterviewDto } from '../dto/interview.dto';

@Injectable()
export class InterviewService {
  private readonly logger = new Logger(InterviewService.name);

  constructor(
    private liveKitService: LiveKitService,
    // Add your database service here
    // private databaseService: DatabaseService,
  ) {}

  /**
   * Create a new interview session
   */
  async createInterview(createInterviewDto: CreateInterviewDto) {
    const { jobId, candidateId, scheduledAt } = createInterviewDto;
    
    // Generate unique room name
    const roomName = `interview_${jobId}_${candidateId}_${Date.now()}`;
    
    try {
      // Create LiveKit room
      await this.liveKitService.createRoom(roomName, 3); // Candidate + AI + Optional HR
      
      // Save interview record to database
      const interview = {
        id: roomName,
        jobId,
        candidateId,
        roomName,
        status: 'scheduled',
        scheduledAt,
        createdAt: new Date(),
      };
      
      // await this.databaseService.interviews.create(interview);
      
      this.logger.log(`Created interview session: ${roomName}`);
      
      return {
        interviewId: roomName,
        roomName,
        scheduledAt,
        status: 'scheduled',
      };
    } catch (error) {
      this.logger.error('Failed to create interview:', error);
      throw error;
    }
  }

  /**
   * Generate join token for participant
   */
  async joinInterview(joinInterviewDto: JoinInterviewDto) {
    const { interviewId, participantId, participantType } = joinInterviewDto;
    
    try {
      // Verify interview exists and is active
      const roomInfo = await this.liveKitService.getRoomInfo(interviewId);
      if (!roomInfo) {
        throw new NotFoundException('Interview session not found');
      }
      
      // Get participant information
      // const participant = await this.databaseService.getParticipant(participantId);
      const participantName = `${participantType}_${participantId}`;
      
      // Set permissions based on participant type
      const permissions = this.getParticipantPermissions(participantType);
      
      // Generate access token
      const token = this.liveKitService.generateToken(
        interviewId,
        participantName,
        permissions
      );
      
      this.logger.log(`Generated token for ${participantName} in ${interviewId}`);
      
      return {
        token,
        roomName: interviewId,
        serverUrl: process.env.LIVEKIT_WS_URL,
        participantName,
        permissions,
      };
    } catch (error) {
      this.logger.error('Failed to join interview:', error);
      throw error;
    }
  }

  /**
   * End interview session
   */
  async endInterview(interviewId: string, endedBy: string) {
    try {
      // Update interview status in database
      // await this.databaseService.interviews.update(interviewId, {
      //   status: 'completed',
      //   endedAt: new Date(),
      //   endedBy,
      // });
      
      // End LiveKit room
      await this.liveKitService.endRoom(interviewId);
      
      this.logger.log(`Interview ${interviewId} ended by ${endedBy}`);
      
      return { success: true, message: 'Interview ended successfully' };
    } catch (error) {
      this.logger.error('Failed to end interview:', error);
      throw error;
    }
  }

  /**
   * Get interview status and participants
   */
  async getInterviewStatus(interviewId: string) {
    try {
      const participants = await this.liveKitService.listParticipants(interviewId);
      const roomInfo = await this.liveKitService.getRoomInfo(interviewId);
      
      return {
        interviewId,
        isActive: !!roomInfo,
        participants: participants.map(p => ({
          identity: p.identity,
          isConnected: p.state === 'ACTIVE',
          joinedAt: new Date(Number(p.joinedAt) * 1000),
        })),
        roomMetadata: roomInfo?.metadata ? JSON.parse(roomInfo.metadata) : {},
      };
    } catch (error) {
      this.logger.error('Failed to get interview status:', error);
      throw error;
    }
  }

  private getParticipantPermissions(participantType: string) {
    switch (participantType) {
      case 'candidate':
        return {
          canPublish: true,
          canSubscribe: true,
          canPublishData: true,
          canUpdateMetadata: false,
        };
      case 'ai_agent':
        return {
          canPublish: true,
          canSubscribe: true,
          canPublishData: true,
          canUpdateMetadata: true,
        };
      case 'hr':
        return {
          canPublish: false,
          canSubscribe: true,
          canPublishData: false,
          canUpdateMetadata: false,
        };
      default:
        return {
          canPublish: false,
          canSubscribe: true,
          canPublishData: false,
          canUpdateMetadata: false,
        };
    }
  }
}
```

## DTOs (Data Transfer Objects)

### Request/Response DTOs
```typescript
// dto/interview.dto.ts
import { IsString, IsUUID, IsDateString, IsEnum, IsOptional } from 'class-validator';

export class CreateInterviewDto {
  @IsUUID()
  jobId: string;

  @IsUUID()
  candidateId: string;

  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class JoinInterviewDto {
  @IsString()
  interviewId: string;

  @IsUUID()
  participantId: string;

  @IsEnum(['candidate', 'ai_agent', 'hr'])
  participantType: 'candidate' | 'ai_agent' | 'hr';
}

export class InterviewTokenResponseDto {
  token: string;
  roomName: string;
  serverUrl: string;
  participantName: string;
  permissions: {
    canPublish: boolean;
    canSubscribe: boolean;
    canPublishData: boolean;
    canUpdateMetadata: boolean;
  };
}
```

## Controller Layer

### Interview Controller
```typescript
// controllers/interview.controller.ts
import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { InterviewService } from '../services/interview.service';
import { 
  CreateInterviewDto, 
  JoinInterviewDto,
  InterviewTokenResponseDto 
} from '../dto/interview.dto';

@Controller('interviews')
@UseGuards(JwtAuthGuard)
export class InterviewController {
  private readonly logger = new Logger(InterviewController.name);

  constructor(private readonly interviewService: InterviewService) {}

  @Post()
  async createInterview(
    @Body() createInterviewDto: CreateInterviewDto,
    @Request() req: any
  ) {
    this.logger.log(`Creating interview for job ${createInterviewDto.jobId}`);
    return this.interviewService.createInterview(createInterviewDto);
  }

  @Post(':id/join')
  async joinInterview(
    @Param('id') interviewId: string,
    @Body() joinInterviewDto: JoinInterviewDto,
    @Request() req: any
  ): Promise<InterviewTokenResponseDto> {
    this.logger.log(`User ${req.user.id} joining interview ${interviewId}`);
    
    // Verify user has permission to join this interview
    // Add your authorization logic here
    
    return this.interviewService.joinInterview({
      ...joinInterviewDto,
      interviewId,
    });
  }

  @Get(':id/status')
  async getInterviewStatus(@Param('id') interviewId: string) {
    return this.interviewService.getInterviewStatus(interviewId);
  }

  @Delete(':id')
  async endInterview(
    @Param('id') interviewId: string,
    @Request() req: any
  ) {
    this.logger.log(`Ending interview ${interviewId} by user ${req.user.id}`);
    return this.interviewService.endInterview(interviewId, req.user.id);
  }

  @Get(':id/participants')
  async getParticipants(@Param('id') interviewId: string) {
    return this.interviewService.getInterviewStatus(interviewId);
  }
}
```

## Module Configuration

### Interview Module
```typescript
// modules/interview.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InterviewController } from '../controllers/interview.controller';
import { InterviewService } from '../services/interview.service';
import { LiveKitService } from '../services/livekit.service';

@Module({
  imports: [ConfigModule],
  controllers: [InterviewController],
  providers: [InterviewService, LiveKitService],
  exports: [InterviewService, LiveKitService],
})
export class InterviewModule {}
```

### App Module Integration
```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InterviewModule } from './modules/interview.module';
import { liveKitConfig } from './config/livekit.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [liveKitConfig],
      isGlobal: true,
      envFilePath: '.env',
    }),
    InterviewModule,
  ],
})
export class AppModule {}
```

## Error Handling & Middleware

### Global Exception Filter
```typescript
// filters/livekit-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class LiveKitExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(LiveKitExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`LiveKit Error: ${message}`, exception.stack);
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
    });
  }
}
```

## Security Best Practices

### JWT Auth Guard
```typescript
// guards/jwt-auth.guard.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid token');
    }
    return user;
  }
}
```

## Testing

### Unit Tests Example
```typescript
// tests/interview.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { InterviewService } from '../src/services/interview.service';
import { LiveKitService } from '../src/services/livekit.service';

describe('InterviewService', () => {
  let service: InterviewService;
  let liveKitService: LiveKitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewService,
        {
          provide: LiveKitService,
          useValue: {
            createRoom: jest.fn(),
            generateToken: jest.fn(),
            getRoomInfo: jest.fn(),
            endRoom: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() => 'test-value'),
          },
        },
      ],
    }).compile();

    service = module.get<InterviewService>(InterviewService);
    liveKitService = module.get<LiveKitService>(LiveKitService);
  });

  it('should create interview room', async () => {
    const createInterviewDto = {
      jobId: 'job-123',
      candidateId: 'candidate-456',
      scheduledAt: new Date().toISOString(),
    };

    jest.spyOn(liveKitService, 'createRoom').mockResolvedValue({} as any);

    const result = await service.createInterview(createInterviewDto);

    expect(result).toBeDefined();
    expect(result.roomName).toContain('interview_');
    expect(liveKitService.createRoom).toHaveBeenCalled();
  });
});
```

## Deployment Configuration

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

### Environment Variables for Production
```env
# Production Environment
NODE_ENV=production
PORT=3000

# LiveKit Configuration
LIVEKIT_API_KEY=your_production_api_key
LIVEKIT_API_SECRET=your_production_api_secret
LIVEKIT_WS_URL=wss://your-production-livekit.com
LIVEKIT_HTTP_URL=https://your-production-livekit.com

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Database Configuration
DATABASE_URL=your_database_connection_string

# Redis (for session management)
REDIS_URL=your_redis_connection_string
```

## Monitoring & Logging

### Health Check
```typescript
// health/livekit.health.ts
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { LiveKitService } from '../services/livekit.service';

@Injectable()
export class LiveKitHealthIndicator extends HealthIndicator {
  constructor(private liveKitService: LiveKitService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Test LiveKit connectivity
      await this.liveKitService.getRoomInfo('health-check');
      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError('LiveKit check failed', this.getStatus(key, false));
    }
  }
}
```

This documentation provides a comprehensive, production-ready implementation of LiveKit integration in NestJS with proper error handling, security, testing, and deployment considerations.