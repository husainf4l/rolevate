
import { Body, Controller, Post, Req, UseGuards, UnauthorizedException, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApplicationService } from './application.service';
import { CreateApplicationDto, ApplicationResponseDto } from './dto/application.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createApplication(
    @Body() createApplicationDto: CreateApplicationDto,
    @Req() req: Request & { user?: { id: string; candidateProfileId?: string } }
  ): Promise<ApplicationResponseDto> {
    // Require JWT and extract candidate profile from user
    const user = req.user;
    if (!user || !user.candidateProfileId) {
      throw new UnauthorizedException('Candidate authentication required');
    }
    return this.applicationService.createApplication(createApplicationDto, user.candidateProfileId);
  }

  @Post('anonymous')
  async createAnonymousApplication(
    @Body() createApplicationDto: CreateApplicationDto
  ): Promise<ApplicationResponseDto & { candidateCredentials?: { email: string; password: string } }> {
    // No authentication required - creates candidate account from CV
    return this.applicationService.createAnonymousApplication(createApplicationDto);
  }

  @Post('apply-with-cv')
  @UseInterceptors(FileInterceptor('cv', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        // Create temp directory for anonymous uploads
        const uploadDir = join(process.cwd(), 'uploads', 'cvs', 'anonymous');
        if (!existsSync(uploadDir)) {
          mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const fileExtension = extname(file.originalname);
        const fileName = `cv_${uuidv4()}${fileExtension}`;
        cb(null, fileName);
      },
    }),
    fileFilter: (req, file, cb) => {
      // Accept only PDF and DOC files
      const allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only PDF and DOC/DOCX files are allowed'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  }))
  async applyWithCV(
    @UploadedFile() file: Express.Multer.File,
    @Body() applicationData: { 
      jobId: string; 
      coverLetter?: string; 
      expectedSalary?: string; 
      noticePeriod?: string; 
    }
  ): Promise<ApplicationResponseDto & { candidateCredentials?: { email: string; password: string } }> {
    if (!file) {
      throw new BadRequestException('CV file is required');
    }

    if (!applicationData.jobId) {
      throw new BadRequestException('Job ID is required');
    }

    // Create the resume URL for the uploaded file
    const resumeUrl = `/uploads/cvs/anonymous/${file.filename}`;

    // Create application DTO with the uploaded CV
    const createApplicationDto: CreateApplicationDto = {
      jobId: applicationData.jobId,
      resumeUrl: resumeUrl,
      coverLetter: applicationData.coverLetter,
      expectedSalary: applicationData.expectedSalary,
      noticePeriod: applicationData.noticePeriod,
    };

    // Process the anonymous application
    return this.applicationService.createAnonymousApplication(createApplicationDto);
  }
}
