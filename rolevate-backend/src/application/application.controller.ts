import { Body, Controller, Post, Get, Patch, Param, Query, Req, UseGuards, UnauthorizedException, UseInterceptors, UploadedFile, BadRequestException, SetMetadata } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApplicationService } from './application.service';
import { CreateApplicationDto, ApplicationResponseDto, UpdateApplicationStatusDto } from './dto/application.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

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

  @SetMetadata('skipAuth', true)
  @Post('anonymous')
  async createAnonymousApplication(
    @Body() createApplicationDto: CreateApplicationDto
  ): Promise<ApplicationResponseDto & { candidateCredentials?: { email: string; password: string } }> {
    // No authentication required - creates candidate account from CV
    return this.applicationService.createAnonymousApplication(createApplicationDto);
  }

  @SetMetadata('skipAuth', true)
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

  @Get('job/:jobId')
  @UseGuards(JwtAuthGuard)
  async getApplicationsByJob(
    @Param('jobId') jobId: string,
    @Req() req: Request & { user?: { id: string; companyId?: string; userType?: string } }
  ): Promise<ApplicationResponseDto[]> {
    const user = req.user;
    if (!user || user.userType !== 'COMPANY' || !user.companyId) {
      throw new UnauthorizedException('Company authentication required');
    }
    return this.applicationService.getApplicationsByJob(jobId, user.companyId);
  }

  @Get('company')
  @UseGuards(JwtAuthGuard)
  async getCompanyApplications(
    @Req() req: Request & { user?: { id: string; companyId?: string; userType?: string } },
    @Query('status') status?: string,
    @Query('jobId') jobId?: string,
    @Query('applicationId') applicationId?: string
  ): Promise<ApplicationResponseDto[] | ApplicationResponseDto> {
    const user = req.user;
    if (!user || user.userType !== 'COMPANY' || !user.companyId) {
      throw new UnauthorizedException('Company authentication required');
    }
    
    // If applicationId is provided, return the specific application
    if (applicationId) {
      return this.applicationService.getApplicationByIdForCompany(applicationId, user.companyId);
    }
    
    // If jobId is provided, use the existing getApplicationsByJob method
    if (jobId) {
      return this.applicationService.getApplicationsByJob(jobId, user.companyId);
    }
    // Otherwise, return all applications for the company, optionally filtered by status
    return this.applicationService.getAllApplicationsForCompany(user.companyId, status);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateApplicationStatus(
    @Param('id') applicationId: string,
    @Body() updateDto: UpdateApplicationStatusDto,
    @Req() req: Request & { user?: { id: string; companyId?: string; userType?: string } }
  ): Promise<ApplicationResponseDto> {
    const user = req.user;
    if (!user || user.userType !== 'COMPANY' || !user.companyId) {
      throw new UnauthorizedException('Company authentication required');
    }
    return this.applicationService.updateApplicationStatus(applicationId, updateDto, user.companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':applicationId/notes')
  async createApplicationNote(
    @Param('applicationId') applicationId: string,
    @Body() dto: any,
    @Req() req: Request & { user?: { id?: string; userId?: string; [key: string]: any } }
  ) {
    // Accept sub as a possible user id property, even if not typed
    const user = req.user as any;
    const userId = user?.userId || user?.id || user?.sub;
    return this.applicationService.createApplicationNote(applicationId, dto, userId);
  }

  @Get(':applicationId/notes')
  async getApplicationNotes(
    @Param('applicationId') applicationId: string
  ) {
    return this.applicationService.getApplicationNotes(applicationId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':applicationId/notes/:noteId')
  async updateApplicationNote(
    @Param('noteId') noteId: string,
    @Body() dto: any,
    @Req() req: Request & { user?: { id?: string; userId?: string; [key: string]: any } }
  ) {
    // Accept sub as a possible user id property, even if not typed
    const user = req.user as any;
    const userId = user?.userId || user?.id || user?.sub;
    return this.applicationService.updateApplicationNote(noteId, dto, userId);
  }
}
