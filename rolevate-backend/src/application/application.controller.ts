import { Body, Controller, Post, Get, Patch, Param, Query, Req, UseGuards, UnauthorizedException, UseInterceptors, UploadedFile, BadRequestException, SetMetadata } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApplicationService } from './application.service';
import { CreateApplicationDto, CreateAnonymousApplicationDto, ApplicationResponseDto, UpdateApplicationStatusDto } from './dto/application.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createApplication(
    @Body() createApplicationDto: CreateApplicationDto,
    @Req() req: Request & { user?: { id: string; candidateProfileId?: string; userType?: string } }
  ): Promise<ApplicationResponseDto> {
    // Require JWT and extract candidate profile from user
    const user = req.user;
    
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }
    
    if (user.userType !== 'CANDIDATE') {
      throw new UnauthorizedException('Only candidates can apply for jobs');
    }
    
    if (!user.candidateProfileId) {
      throw new BadRequestException('Candidate profile is required. Please complete your profile first.');
    }
    
    return this.applicationService.createApplication(createApplicationDto, user.candidateProfileId);
  }

  @SetMetadata('skipAuth', true)
  @Post('anonymous')
  @UseInterceptors(FileInterceptor('cv', {
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
  async createAnonymousApplication(
    @UploadedFile() file: Express.Multer.File,
    @Body() createAnonymousApplicationDto: CreateAnonymousApplicationDto
  ): Promise<ApplicationResponseDto & { candidateCredentials?: { email: string; password: string } }> {
    if (!file) {
      throw new BadRequestException('CV file is required for anonymous applications');
    }

    // Upload CV to S3 first
    const resumeUrl = await this.applicationService.uploadCVToS3(file.buffer, file.originalname);

    // Create the full application DTO with the S3 CV URL
    const createApplicationDto: CreateApplicationDto = {
      ...createAnonymousApplicationDto,
      resumeUrl: resumeUrl,
    };

    // Process the anonymous application
    return this.applicationService.createAnonymousApplication(createApplicationDto);
  }

  @SetMetadata('skipAuth', true)
  @Post('apply-with-cv')
  @UseInterceptors(FileInterceptor('cv', {
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
    @Body() applicationData: CreateAnonymousApplicationDto
  ): Promise<ApplicationResponseDto & { candidateCredentials?: { email: string; password: string } }> {
    if (!file) {
      throw new BadRequestException('CV file is required');
    }

    // Upload CV to S3 first
    const resumeUrl = await this.applicationService.uploadCVToS3(file.buffer, file.originalname);

    // Create application DTO with the S3 CV URL
    const createApplicationDto: CreateApplicationDto = {
      ...applicationData,
      resumeUrl: resumeUrl,
    };

    // Process the anonymous application
    return this.applicationService.createAnonymousApplication(createApplicationDto);
  }

  @SetMetadata('skipAuth', true)
  @Post('anonymous/s3')
  async createAnonymousApplicationWithS3URL(
    @Body() createAnonymousApplicationDto: CreateAnonymousApplicationDto & { resumeUrl: string }
  ): Promise<ApplicationResponseDto & { candidateCredentials?: { email: string; password: string } }> {
    if (!createAnonymousApplicationDto.resumeUrl) {
      throw new BadRequestException('Resume URL is required for S3 anonymous applications');
    }

    // Validate that the URL is an S3 URL
    if (!createAnonymousApplicationDto.resumeUrl.includes('amazonaws.com')) {
      throw new BadRequestException('Only S3 URLs are supported');
    }

    // Create application DTO with the provided S3 CV URL
    const createApplicationDto: CreateApplicationDto = {
      ...createAnonymousApplicationDto,
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

  @Get('my-applications')
  @UseGuards(JwtAuthGuard)
  async getCandidateApplications(
    @Req() req: Request & { user?: { id: string; candidateProfileId?: string; userType?: string } }
  ): Promise<ApplicationResponseDto[]> {
    const user = req.user;
    if (!user || user.userType !== 'CANDIDATE' || !user.candidateProfileId) {
      throw new UnauthorizedException('Candidate authentication required');
    }
    return this.applicationService.getApplicationsByCandidate(user.candidateProfileId);
  }

  @Get('my-application/:jobId')
  @UseGuards(JwtAuthGuard)
  async getCandidateApplicationForJob(
    @Param('jobId') jobId: string,
    @Req() req: Request & { user?: { id: string; candidateProfileId?: string; userType?: string } }
  ): Promise<ApplicationResponseDto> {
    const user = req.user;
    if (!user || user.userType !== 'CANDIDATE' || !user.candidateProfileId) {
      throw new UnauthorizedException('Candidate authentication required');
    }
    
    // Find the specific application for this job
    const application = await this.applicationService.getApplicationByJobAndCandidate(jobId, user.candidateProfileId);
    
    if (!application) {
      throw new BadRequestException('You have not applied to this job or the job does not exist');
    }
    
    return application;
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
