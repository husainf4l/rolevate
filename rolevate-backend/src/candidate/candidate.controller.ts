import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  Req,
  NotFoundException,
  Param,
  UseInterceptors,
  UploadedFile,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { CandidateService } from './candidate.service';
import {
  CreateBasicCandidateProfileDto,
  CandidateProfileResponseDto,
  CVResponseDto,
  UpdateCVStatusDto,
  SaveJobDto,
} from './dto/candidate.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { FileValidationService } from '../services/file-validation.service';

@Controller('candidate')
export class CandidateController {
  constructor(
    private readonly candidateService: CandidateService,
    private readonly fileValidationService: FileValidationService,
  ) {}

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  async createProfile(
    @Body() createBasicDto: CreateBasicCandidateProfileDto,
    @Req() req: Request,
  ): Promise<CandidateProfileResponseDto> {
    const user = req.user as any;
    const userId = user.userId;
    return this.candidateService.createBasicProfile(createBasicDto, userId);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@Req() req: Request): Promise<CandidateProfileResponseDto> {
    const user = req.user as any;
    const userId = user.userId;
    const profile = await this.candidateService.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Candidate profile not found');
    }
    return profile;
  }

  @Patch('cv-url')
  @UseGuards(JwtAuthGuard)
  async updateCVUrl(
    @Body() body: { cvUrl: string },
    @Req() req: Request,
  ): Promise<CandidateProfileResponseDto> {
    const user = req.user as any;
    const userId = user.userId;
    return this.candidateService.updateCVUrl(userId, body.cvUrl);
  }

  @Post('upload-cv')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('cv', {
    storage: multer.memoryStorage(),
  }))
  async uploadCV(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ): Promise<CVResponseDto> {
    // Validate file using our enhanced validation service
    const validationOptions = this.fileValidationService.getCVValidationOptions();
    const validatedFile = this.fileValidationService.validateFile(file, validationOptions);

    const user = req.user as any;
    const userId = user.userId;

    return this.candidateService.uploadCV(
      userId,
      validatedFile.buffer,
      validatedFile.sanitizedFilename || validatedFile.originalname,
      validatedFile.size,
      validatedFile.mimetype,
    );
  }

  @Get('cvs')
  @UseGuards(JwtAuthGuard)
  async getCVs(@Req() req: Request): Promise<CVResponseDto[]> {
    const user = req.user as any;
    const userId = user.userId;
    return this.candidateService.getCVs(userId);
  }

  @Delete('cvs/:cvId')
  @UseGuards(JwtAuthGuard)
  async deleteCV(
    @Param('cvId') cvId: string,
    @Req() req: Request,
  ): Promise<{ success: boolean; message: string }> {
    const user = req.user as any;
    const userId = user.userId;
    
    await this.candidateService.deleteCV(userId, cvId);
    return { success: true, message: 'CV deleted successfully' };
  }

  @Patch('cvs/:cvId/status')
  @UseGuards(JwtAuthGuard)
  async updateCVStatus(
    @Param('cvId') cvId: string,
    @Body() updateStatusDto: UpdateCVStatusDto,
    @Req() req: Request,
  ): Promise<CVResponseDto> {
    const user = req.user as any;
    const userId = user.userId;

    return this.candidateService.updateCVStatus(userId, cvId, updateStatusDto.status);
  }

  @Patch('cvs/:cvId/activate')
  @UseGuards(JwtAuthGuard)
  async activateCV(
    @Param('cvId') cvId: string,
    @Req() req: Request,
  ): Promise<CVResponseDto> {
    const user = req.user as any;
    const userId = user.userId;

    return this.candidateService.activateCV(userId, cvId);
  }

  @Post('saved-jobs')
  @UseGuards(JwtAuthGuard)
  async saveJob(
    @Body() saveJobDto: SaveJobDto,
    @Req() req: Request,
  ): Promise<CandidateProfileResponseDto> {
    const user = req.user as any;
    const userId = user.userId;

    return this.candidateService.saveJob(userId, saveJobDto.jobId);
  }

  @Delete('saved-jobs/:jobId')
  @UseGuards(JwtAuthGuard)
  async unsaveJob(
    @Param('jobId') jobId: string,
    @Req() req: Request,
  ): Promise<CandidateProfileResponseDto> {
    const user = req.user as any;
    const userId = user.userId;

    return this.candidateService.unsaveJob(userId, jobId);
  }

  @Get('saved-jobs')
  @UseGuards(JwtAuthGuard)
  async getSavedJobs(@Req() req: Request): Promise<{ savedJobs: string[] }> {
    const user = req.user as any;
    const userId = user.userId;

    const savedJobs = await this.candidateService.getSavedJobs(userId);
    return { savedJobs };
  }

  @Get('saved-jobs/details')
  @UseGuards(JwtAuthGuard)
  async getSavedJobsDetails(@Req() req: Request): Promise<{ savedJobs: any[] }> {
    const user = req.user as any;
    const userId = user.userId;

    const savedJobs = await this.candidateService.getSavedJobsDetails(userId);
    return { savedJobs };
  }

  // Test endpoint to check candidate profile without auth
  @Get('test/:userId')
  async testGetProfile(@Param('userId') userId: string) {
    console.log('=== Test endpoint called ===');
    console.log('userId parameter:', userId);

    try {
      const profile = await this.candidateService.findProfileByUserId(userId);
      console.log('Profile found:', !!profile);

      if (!profile) {
        return {
          success: false,
          message: 'No candidate profile found for userId: ' + userId,
          userId: userId,
        };
      }

      return {
        success: true,
        message: 'Candidate profile found!',
        profile: profile,
        userId: userId,
      };
    } catch (error) {
      console.error('Error in test endpoint:', error);
      return {
        success: false,
        message: 'Error: ' + error.message,
        error: error.stack,
        userId: userId,
      };
    }
  }
}
