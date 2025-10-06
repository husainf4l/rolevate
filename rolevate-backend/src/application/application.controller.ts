import { Body, Controller, Post, Get, Patch, Param, Query, Req, UseGuards, UnauthorizedException, UseInterceptors, UploadedFile, BadRequestException, SetMetadata } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicationService } from './application.service';
import { CreateApplicationDto, CreateAnonymousApplicationDto, ApplicationResponseDto, UpdateApplicationStatusDto } from './dto/application.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('applications')
@ApiBearerAuth()
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Create a job application (authenticated candidates)',
    description: 'Allows authenticated candidates to apply for jobs. Requires a complete candidate profile.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Application created successfully',
    type: ApplicationResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Missing candidate profile or invalid data'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid JWT token or not a candidate'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Job not found'
  })
  @ApiBody({ type: CreateApplicationDto })
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
  @ApiOperation({ 
    summary: 'Create anonymous job application with CV upload',
    description: 'Allows anonymous users to apply for jobs by uploading their CV. Creates a temporary candidate account.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ 
    status: 201, 
    description: 'Anonymous application created successfully',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/ApplicationResponseDto' },
        {
          type: 'object',
          properties: {
            candidateCredentials: {
              type: 'object',
              properties: {
                email: { type: 'string', example: 'temp@example.com' },
                password: { type: 'string', example: 'tempPass123' }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid file type, missing CV, or invalid application data'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Job not found'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        cv: {
          type: 'string',
          format: 'binary',
          description: 'CV file (PDF or DOC/DOCX, max 5MB)'
        },
        jobId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        coverLetter: { type: 'string', example: 'I am very interested in this position...' },
        expectedSalary: { type: 'string', example: '$75,000' },
        noticePeriod: { type: 'string', example: '2 weeks' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        phone: { type: 'string', example: '+1-555-0123' },
        portfolioUrl: { type: 'string', example: 'https://johndoe.dev' }
      }
    }
  })
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
  @ApiOperation({ 
    summary: 'Apply for job with CV upload (anonymous)',
    description: 'Alternative endpoint for anonymous job applications with CV upload. Creates a temporary candidate account.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ 
    status: 201, 
    description: 'Application created successfully',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/ApplicationResponseDto' },
        {
          type: 'object',
          properties: {
            candidateCredentials: {
              type: 'object',
              properties: {
                email: { type: 'string', example: 'temp@example.com' },
                password: { type: 'string', example: 'tempPass123' }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid file type, missing CV, or invalid application data'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Job not found'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        cv: {
          type: 'string',
          format: 'binary',
          description: 'CV file (PDF or DOC/DOCX, max 5MB)'
        },
        jobId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        coverLetter: { type: 'string', example: 'I am very interested in this position...' },
        expectedSalary: { type: 'string', example: '$75,000' },
        noticePeriod: { type: 'string', example: '2 weeks' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        phone: { type: 'string', example: '+1-555-0123' },
        portfolioUrl: { type: 'string', example: 'https://johndoe.dev' }
      }
    }
  })
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
  @ApiOperation({ 
    summary: 'Create anonymous application with S3 CV URL',
    description: 'Allows anonymous users to apply for jobs using a pre-uploaded CV from S3. Creates a temporary candidate account.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Anonymous application created successfully',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/ApplicationResponseDto' },
        {
          type: 'object',
          properties: {
            candidateCredentials: {
              type: 'object',
              properties: {
                email: { type: 'string', example: 'temp@example.com' },
                password: { type: 'string', example: 'tempPass123' }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid S3 URL or missing application data'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Job not found'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        jobId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        resumeUrl: { type: 'string', example: 'https://bucket.s3.amazonaws.com/cv.pdf' },
        coverLetter: { type: 'string', example: 'I am very interested in this position...' },
        expectedSalary: { type: 'string', example: '$75,000' },
        noticePeriod: { type: 'string', example: '2 weeks' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        phone: { type: 'string', example: '+1-555-0123' },
        portfolioUrl: { type: 'string', example: 'https://johndoe.dev' }
      },
      required: ['jobId', 'resumeUrl', 'firstName', 'lastName', 'email']
    }
  })
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
  @ApiOperation({ 
    summary: 'Get applications for a specific job',
    description: 'Retrieves all applications for a specific job. Only accessible by company users who own the job.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Applications retrieved successfully',
    type: [ApplicationResponseDto]
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid JWT token or not a company user'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - User does not own this job'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Job not found'
  })
  @ApiParam({ name: 'jobId', description: 'Job ID' })
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
  @ApiOperation({ 
    summary: 'Get company applications',
    description: 'Retrieves applications for a company. Can filter by status, job, or get a specific application by ID.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Applications retrieved successfully',
    type: [ApplicationResponseDto]
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid JWT token or not a company user'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Application or job not found'
  })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by application status' })
  @ApiQuery({ name: 'jobId', required: false, description: 'Filter by specific job ID' })
  @ApiQuery({ name: 'applicationId', required: false, description: 'Get specific application by ID' })
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
  @ApiOperation({ 
    summary: 'Get candidate\'s applications',
    description: 'Retrieves all applications submitted by the authenticated candidate.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Applications retrieved successfully',
    type: [ApplicationResponseDto]
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid JWT token or not a candidate'
  })
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
  @ApiOperation({ 
    summary: 'Get candidate\'s application for specific job',
    description: 'Retrieves the candidate\'s application for a specific job they have applied to.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Application retrieved successfully',
    type: ApplicationResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Candidate has not applied to this job'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid JWT token or not a candidate'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Job not found'
  })
  @ApiParam({ name: 'jobId', description: 'Job ID' })
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
  @ApiOperation({ 
    summary: 'Update application status',
    description: 'Updates the status of a job application. Only accessible by company users who own the job.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Application status updated successfully',
    type: ApplicationResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid status'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid JWT token or not a company user'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - User does not own this application'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Application not found'
  })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiBody({ type: UpdateApplicationStatusDto })
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
  @ApiOperation({ 
    summary: 'Create application note',
    description: 'Creates a note for a job application. Accessible by authenticated users.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Note created successfully'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid JWT token'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Application not found'
  })
  @ApiParam({ name: 'applicationId', description: 'Application ID' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        content: { type: 'string', example: 'This candidate has excellent experience...' },
        type: { type: 'string', example: 'GENERAL', enum: ['GENERAL', 'INTERVIEW', 'REJECTION', 'ACCEPTANCE'] }
      } 
    } 
  })
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
  @ApiOperation({ 
    summary: 'Get application notes',
    description: 'Retrieves all notes for a job application. No authentication required.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Notes retrieved successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Application not found'
  })
  @ApiParam({ name: 'applicationId', description: 'Application ID' })
  async getApplicationNotes(
    @Param('applicationId') applicationId: string
  ) {
    return this.applicationService.getApplicationNotes(applicationId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':applicationId/notes/:noteId')
  @ApiOperation({ 
    summary: 'Update application note',
    description: 'Updates an existing note for a job application. Accessible by authenticated users.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Note updated successfully'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid JWT token'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Note or application not found'
  })
  @ApiParam({ name: 'applicationId', description: 'Application ID' })
  @ApiParam({ name: 'noteId', description: 'Note ID' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        content: { type: 'string', example: 'Updated note content...' },
        type: { type: 'string', example: 'INTERVIEW', enum: ['GENERAL', 'INTERVIEW', 'REJECTION', 'ACCEPTANCE'] }
      } 
    } 
  })
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
