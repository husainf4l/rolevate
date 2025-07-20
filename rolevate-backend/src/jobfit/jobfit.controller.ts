import {
  Controller,
  Post,
  Get,
  Query,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Body,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JobFitService } from './jobfit.service';
import { AvailableCandidateResponseDto, JobMatchResponseDto } from './dto/jobfit.dto';
import { memoryStorage } from 'multer';

@Controller('jobfit')
export class JobFitController {
  constructor(private readonly jobFitService: JobFitService) {}

  @Post('upload-cv')
  @UseInterceptors(
    FileInterceptor('cv', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only PDF files are allowed'), false);
        }
      },
    })
  )
  async uploadAndAnalyzeCV(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AvailableCandidateResponseDto> {
    console.log('🎯 JobFit CV upload request received');
    
    if (!file) {
      throw new BadRequestException('CV file is required');
    }

    console.log('📄 File details:', {
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    });

    return await this.jobFitService.uploadAndAnalyzeCV(file);
  }

  @Get('candidates')
  async findCandidates(
    @Query('skills') skills?: string,
    @Query('minExperience', new DefaultValuePipe(0), ParseIntPipe) minExperience?: number,
    @Query('maxExperience', new DefaultValuePipe(50), ParseIntPipe) maxExperience?: number,
    @Query('location') location?: string,
    @Query('jobTitle') jobTitle?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ): Promise<JobMatchResponseDto> {
    console.log('🔍 JobFit candidate search request:', {
      skills,
      experienceRange: { min: minExperience, max: maxExperience },
      location,
      jobTitle,
      page,
      limit,
    });

    const filters: any = {
      page,
      limit: Math.min(limit || 20, 100), // Max 100 per request
    };

    if (skills) {
      filters.skills = skills.split(',').map(skill => skill.trim());
    }

    if (minExperience !== undefined || maxExperience !== undefined) {
      filters.experienceRange = {
        min: minExperience || 0,
        max: maxExperience || 50,
      };
    }

    if (location) {
      filters.location = location;
    }

    if (jobTitle) {
      filters.jobTitle = jobTitle;
    }

    return await this.jobFitService.findCandidatesForJob(filters);
  }

  @Get('candidates/all')
  async getAllCandidates(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ): Promise<JobMatchResponseDto> {
    console.log('📋 Getting all available candidates:', { page, limit });
    
    return await this.jobFitService.getAllAvailableCandidates(
      page || 1,
      Math.min(limit || 20, 100)
    );
  }

  @Get('candidates/:id')
  async getCandidateById(@Param('id') id: string): Promise<AvailableCandidateResponseDto> {
    console.log('👤 Getting candidate by ID:', id);
    
    const candidate = await this.jobFitService.getCandidateById(id);
    if (!candidate) {
      throw new BadRequestException('Candidate not found');
    }
    
    return candidate;
  }

  @Delete('candidates/:id/deactivate')
  async deactivateCandidate(@Param('id') id: string): Promise<{ message: string }> {
    console.log('🗑️ Deactivating candidate:', id);
    
    await this.jobFitService.deactivateCandidate(id);
    return { message: 'Candidate deactivated successfully' };
  }
}
