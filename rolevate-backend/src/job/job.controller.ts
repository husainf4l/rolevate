import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Put,
  UseGuards, 
  Request,
  Query,
  HttpStatus,
  HttpCode,
  BadRequestException,
  SetMetadata,
  ParseIntPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JobService } from './job.service';
import { CreateJobDto, JobResponseDto } from './dto/create-job.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JobStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('jobs')
@ApiBearerAuth()
@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobController {
  constructor(
    private readonly jobService: JobService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new job posting',
    description: 'Creates a new job posting for the authenticated user\'s company. Requires company association.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Job created successfully',
    type: JobResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - User not found or not associated with company'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token'
  })
  @ApiBody({ type: CreateJobDto })
  async create(
    @Body() createJobDto: CreateJobDto,
    @Request() req: any,
  ): Promise<JobResponseDto> {
    const userId = req.user.userId;
    
    // Fetch user with company information
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.companyId || !user.company) {
      throw new BadRequestException('User must be associated with a company to create jobs');
    }

    return this.jobService.create(createJobDto, user.companyId);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all jobs for user\'s company',
    description: 'Retrieves all jobs for the authenticated user\'s company, or for a specific company if companyId is provided.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Jobs retrieved successfully',
    type: [JobResponseDto]
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - User not associated with company'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token'
  })
  @ApiQuery({ name: 'companyId', required: false, description: 'Optional company ID to filter jobs' })
  async findAll(
    @Request() req: any,
    @Query('companyId') companyId?: string,
  ): Promise<JobResponseDto[]> {
    // If user has a company, filter by their company unless they're querying for a specific company
    const userId = req.user.userId;
    
    if (companyId) {
      // If a specific company is requested, use that
      return this.jobService.findAll(companyId);
    }
    
    // Otherwise, get user's company
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    });

    if (!user || !user.companyId) {
      throw new BadRequestException('User must be associated with a company to view jobs');
    }

    return this.jobService.findAll(user.companyId);
  }

  @Get('company/all')
  @ApiOperation({ 
    summary: 'Get paginated jobs for user\'s company',
    description: 'Retrieves paginated jobs for the authenticated user\'s company with optional search functionality.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Jobs retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        jobs: { type: 'array', items: { $ref: '#/components/schemas/JobResponseDto' } },
        total: { type: 'number' },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            offset: { type: 'number' },
            totalPages: { type: 'number' },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' },
            nextPage: { type: 'number', nullable: true },
            prevPage: { type: 'number', nullable: true }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid pagination parameters or user not associated with company'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token'
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of jobs per page (1-100, default: 10)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of jobs to skip (default: 0)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term to filter jobs' })
  async findAllCompanyJobs(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('page') page?: string,
    @Query('search') search?: string,
  ): Promise<{ jobs: JobResponseDto[]; total: number; pagination: any }> {
    const userId = req.user.userId;
    
    // Get user's company
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    });

    if (!user || !user.companyId) {
      throw new BadRequestException('User must be associated with a company to view company jobs');
    }

    // Parse pagination parameters
    const limitNum = limit ? parseInt(limit, 10) : 10; // Default limit of 10
    const pageNum = page ? parseInt(page, 10) : 1; // Default page 1
    const offsetNum = offset ? parseInt(offset, 10) : (pageNum - 1) * limitNum;

    // Validate pagination parameters
    if (limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }
    if (pageNum < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }
    if (offsetNum < 0) {
      throw new BadRequestException('Offset must be greater than or equal to 0');
    }

    // Get paginated jobs and total count
    const [jobs, total] = await Promise.all([
      this.jobService.findAllPaginated(user.companyId, limitNum, offsetNum, search),
      this.jobService.countJobs(user.companyId, search)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    return {
      jobs,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        offset: offsetNum,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? pageNum + 1 : null,
        prevPage: hasPrevPage ? pageNum - 1 : null,
      }
    };
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get a specific job by ID',
    description: 'Retrieves a specific job by ID for the authenticated user\'s company.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Job retrieved successfully',
    type: JobResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - User not associated with company'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Job not found'
  })
  @ApiParam({ name: 'id', description: 'Job ID' })
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<JobResponseDto> {
    const userId = req.user.userId;
    
    // Get user's company for access control
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    });

    if (!user || !user.companyId) {
      throw new BadRequestException('User must be associated with a company to view jobs');
    }

    return this.jobService.findOne(id, user.companyId);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update a job posting',
    description: 'Updates an existing job posting for the authenticated user\'s company.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Job updated successfully',
    type: JobResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - User not associated with company'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Job not found'
  })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiBody({ type: CreateJobDto, description: 'Partial job data to update' })
  async update(
    @Param('id') id: string,
    @Body() updateJobDto: Partial<CreateJobDto>,
    @Request() req: any,
  ): Promise<JobResponseDto> {
    const userId = req.user.userId;
    
    // Get user's company for access control
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    });

    if (!user || !user.companyId) {
      throw new BadRequestException('User must be associated with a company to update jobs');
    }

    return this.jobService.update(id, updateJobDto, user.companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Soft delete a job posting',
    description: 'Soft deletes a job posting for the authenticated user\'s company. The job can be restored later.'
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Job deleted successfully'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - User not associated with company'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Job not found'
  })
  @ApiParam({ name: 'id', description: 'Job ID' })
  async remove(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<void> {
    const userId = req.user.userId;
    
    // Get user's company for access control
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    });

    if (!user || !user.companyId) {
      throw new BadRequestException('User must be associated with a company to delete jobs');
    }

    return this.jobService.remove(id, user.companyId);
  }

  @Patch(':id/status')
  @ApiOperation({ 
    summary: 'Update job status',
    description: 'Updates the status of a job posting for the authenticated user\'s company.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Job status updated successfully',
    type: JobResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - User not associated with company or invalid status'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Job not found'
  })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        status: { 
          type: 'string', 
          enum: ['ACTIVE', 'INACTIVE', 'DRAFT', 'CLOSED', 'DELETED'],
          example: 'ACTIVE'
        } 
      } 
    } 
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: JobStatus },
    @Request() req: any,
  ): Promise<JobResponseDto> {
    const userId = req.user.userId;
    
    // Get user's company for access control
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    });

    if (!user || !user.companyId) {
      throw new BadRequestException('User must be associated with a company to update job status');
    }

    return this.jobService.updateStatus(id, body.status, user.companyId);
  }

  @Patch(':id/featured')
  @ApiOperation({ 
    summary: 'Toggle job featured status',
    description: 'Toggles the featured status of a job posting for the authenticated user\'s company.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Job featured status updated successfully',
    type: JobResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - User not associated with company'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Job not found'
  })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        featured: { 
          type: 'boolean', 
          example: true 
        } 
      } 
    } 
  })
  async toggleFeatured(
    @Param('id') id: string,
    @Body() body: { featured: boolean },
    @Request() req: any,
  ): Promise<JobResponseDto> {
    const userId = req.user.userId;
    
    // Get user's company for access control
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    });

    if (!user || !user.companyId) {
      throw new BadRequestException('User must be associated with a company to update featured status');
    }

    return this.jobService.toggleFeatured(id, body.featured, user.companyId);
  }

  @Get('public/featured')
  @SetMetadata('skipAuth', true)
  @ApiOperation({ 
    summary: 'Get featured jobs (public)',
    description: 'Retrieves featured job postings publicly without authentication.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Featured jobs retrieved successfully',
    type: [JobResponseDto]
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of jobs to return (1-50, default: 10)' })
  async findFeaturedJobs(
    @Query('limit') limit?: string,
  ): Promise<JobResponseDto[]> {
    const limitNum = limit ? parseInt(limit, 10) : 10; // Default limit of 10
    
    // Validate limit parameter
    if (limitNum < 1 || limitNum > 50) {
      throw new BadRequestException('Limit must be between 1 and 50');
    }

    return this.jobService.findFeaturedJobs(limitNum);
  }

  @Get('public/all')
  @SetMetadata('skipAuth', true)
  @ApiOperation({ 
    summary: 'Get all public jobs with pagination',
    description: 'Retrieves all public job postings with pagination and optional search functionality.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Public jobs retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        jobs: { type: 'array', items: { $ref: '#/components/schemas/JobResponseDto' } },
        total: { type: 'number' },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            offset: { type: 'number' },
            totalPages: { type: 'number' },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' },
            nextPage: { type: 'number', nullable: true },
            prevPage: { type: 'number', nullable: true }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid pagination parameters'
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of jobs per page (1-100, default: 10)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of jobs to skip (default: 0)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term to filter jobs' })
  async findAllPublicJobs(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('page') page?: string,
    @Query('search') search?: string,
  ): Promise<{ jobs: JobResponseDto[]; total: number; pagination: any }> {
    // Parse pagination parameters
    const limitNum = limit ? parseInt(limit, 10) : 10; // Default limit of 10
    const pageNum = page ? parseInt(page, 10) : 1; // Default page 1
    const offsetNum = offset ? parseInt(offset, 10) : (pageNum - 1) * limitNum;

    // Validate pagination parameters
    if (limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }
    if (pageNum < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }
    if (offsetNum < 0) {
      throw new BadRequestException('Offset must be greater than or equal to 0');
    }

    // Get paginated jobs and total count
    const [jobs, total] = await Promise.all([
      this.jobService.findAllPublicPaginated(limitNum, offsetNum, search),
      this.jobService.countPublicJobs(search)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    return {
      jobs,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        offset: offsetNum,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? pageNum + 1 : null,
        prevPage: hasPrevPage ? pageNum - 1 : null,
      }
    };
  }

  @Get('public/simple')
  @SetMetadata('skipAuth', true)
  @ApiOperation({ 
    summary: 'Get public jobs (simplified)',
    description: 'Retrieves public job postings with simplified data for better performance.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Public jobs retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        jobs: { type: 'array', items: { type: 'object' } },
        total: { type: 'number' },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            offset: { type: 'number' },
            totalPages: { type: 'number' },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' },
            nextPage: { type: 'number', nullable: true },
            prevPage: { type: 'number', nullable: true }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid pagination parameters'
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of jobs per page (1-50, default: 20)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  async findAllPublicJobsSimple(
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ): Promise<{ jobs: any[]; total: number; pagination: any }> {
    // Parse pagination parameters
    const limitNum = limit ? parseInt(limit, 10) : 20; // Higher default for simple endpoint
    const pageNum = page ? parseInt(page, 10) : 1;
    const offsetNum = (pageNum - 1) * limitNum;

    // Validate pagination parameters
    if (limitNum < 1 || limitNum > 50) {
      throw new BadRequestException('Limit must be between 1 and 50');
    }
    if (pageNum < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }

    // Get lightweight job data
    const [jobs, total] = await Promise.all([
      this.jobService.findAllPublicSimple(limitNum, offsetNum),
      this.jobService.countPublicJobs()
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    return {
      jobs,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        offset: offsetNum,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? pageNum + 1 : null,
        prevPage: hasPrevPage ? pageNum - 1 : null,
      }
    };
  }

  @Get('public/:id')
  @SetMetadata('skipAuth', true)
  @ApiOperation({ 
    summary: 'Get a specific public job by ID',
    description: 'Retrieves a specific public job posting by ID without authentication. Tracks view count.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Job retrieved successfully',
    type: JobResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Job not found'
  })
  @ApiParam({ name: 'id', description: 'Job ID' })
  async findOnePublicJob(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<JobResponseDto> {
    // Extract IP address from request
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
                     (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                     req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.headers['x-real-ip'] || 
                     '127.0.0.1';
    
    // Get a specific job for public viewing (no authentication required)
    return this.jobService.findOnePublic(id, ipAddress);
  }

  @Get('candidate/:id')
  @ApiOperation({ 
    summary: 'Get job details for candidate',
    description: 'Retrieves job details for authenticated candidates who have applied to the job.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Job details retrieved successfully',
    type: JobResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - User is not a candidate or has not applied to this job'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Job not found'
  })
  @ApiParam({ name: 'id', description: 'Job ID' })
  async findOneJobForCandidate(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<JobResponseDto> {
    const userId = req.user.userId;
    
    // Verify user is a candidate
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { candidateProfile: true }
    });

    if (!user || user.userType !== 'CANDIDATE') {
      throw new BadRequestException('This endpoint is only for candidates');
    }

    if (!user.candidateProfile) {
      throw new BadRequestException('User must have a candidate profile');
    }

    // Check if candidate has applied to this job
    const application = await this.prisma.application.findFirst({
      where: {
        jobId: id,
        candidateId: user.candidateProfile.id,
      },
    });

    if (!application) {
      throw new BadRequestException('You can only view details of jobs you have applied to');
    }

    // Extract IP address from request for view tracking (but don't increment for applied jobs)
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
                     (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                     req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.headers['x-real-ip'] || 
                     '127.0.0.1';
    
    // Get job details using the public method (since candidates should see public jobs)
    return this.jobService.findOnePublic(id, ipAddress);
  }

  @Get('my-application/:jobId')
  @ApiOperation({ 
    summary: 'Get job application details for candidate',
    description: 'Retrieves job details along with application status and CV analysis results for authenticated candidates.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Job application details retrieved successfully',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/JobResponseDto' },
        {
          type: 'object',
          properties: {
            applicationStatus: { type: 'string' },
            appliedAt: { type: 'string', format: 'date-time' },
            cvAnalysisResults: { type: 'object' },
            cvAnalysisScore: { type: 'number' }
          }
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - User is not a candidate or has not applied to this job'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Job or application not found'
  })
  @ApiParam({ name: 'jobId', description: 'Job ID' })
  async findJobApplicationDetails(
    @Param('jobId') jobId: string,
    @Request() req: any,
  ): Promise<JobResponseDto & { applicationStatus?: string; appliedAt?: Date; cvAnalysisResults?: any; cvAnalysisScore?: number }> {
    const userId = req.user.userId;
    
    // Verify user is a candidate
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { candidateProfile: true }
    });

    if (!user || user.userType !== 'CANDIDATE' || !user.candidateProfile) {
      throw new BadRequestException('This endpoint is only for candidates with profiles');
    }

    // Find the application and job details
    const application = await this.prisma.application.findFirst({
      where: {
        jobId: jobId,
        candidateId: user.candidateProfile.id
      },
      include: {
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
      throw new BadRequestException('You have not applied to this job or the job does not exist');
    }

    // Map the job to the response format using a type assertion since the method is private
    const jobService = this.jobService as any;
    const jobResponse = jobService.mapToJobResponse(application.job);

    // Add application-specific information
    return {
      ...jobResponse,
      applicationStatus: application.status,
      appliedAt: application.appliedAt,
      cvAnalysisResults: application.cvAnalysisResults,
      cvAnalysisScore: application.cvAnalysisScore
    };
  }

  @Patch(':id/restore')
  @ApiOperation({ 
    summary: 'Restore a soft-deleted job',
    description: 'Restores a previously soft-deleted job posting for the authenticated user\'s company.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Job restored successfully',
    type: JobResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - User not associated with company'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Job not found'
  })
  @ApiParam({ name: 'id', description: 'Job ID' })
  async restore(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<JobResponseDto> {
    const userId = req.user.userId;
    
    // Get user's company for access control
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    });

    if (!user || !user.companyId) {
      throw new BadRequestException('User must be associated with a company to restore jobs');
    }

    return this.jobService.restore(id, user.companyId);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Permanently delete a job',
    description: 'Permanently deletes a job posting for the authenticated user\'s company. This action cannot be undone.'
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Job permanently deleted successfully'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - User not associated with company'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Job not found'
  })
  @ApiParam({ name: 'id', description: 'Job ID' })
  async permanentlyDelete(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<void> {
    const userId = req.user.userId;
    
    // Get user's company for access control
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    });

    if (!user || !user.companyId) {
      throw new BadRequestException('User must be associated with a company to permanently delete jobs');
    }

    return this.jobService.permanentlyDelete(id, user.companyId);
  }

  @Get('deleted/all')
  @ApiOperation({ 
    summary: 'Get all soft-deleted jobs',
    description: 'Retrieves all soft-deleted jobs for the authenticated user\'s company.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Deleted jobs retrieved successfully',
    type: [JobResponseDto]
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - User not associated with company'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token'
  })
  async findAllDeleted(
    @Request() req: any,
  ): Promise<JobResponseDto[]> {
    const userId = req.user.userId;
    
    // Get user's company for access control
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    });

    if (!user || !user.companyId) {
      throw new BadRequestException('User must be associated with a company to view deleted jobs');
    }

    return this.jobService.findAllDeleted(user.companyId);
  }

  @Put(':id/toggle-featured')
  @ApiOperation({ 
    summary: 'Toggle job featured status (PUT)',
    description: 'Toggles the featured status of a job posting for the authenticated user\'s company using PUT method.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Job featured status toggled successfully',
    type: JobResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - User not associated with company or job not found'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token'
  })
  @ApiParam({ name: 'id', description: 'Job ID' })
  async toggleFeaturedStatus(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<JobResponseDto> {
    const userId = req.user.userId;
    
    // Get user's company for access control
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    });

    if (!user || !user.companyId) {
      throw new BadRequestException('User must be associated with a company to toggle job featured status');
    }

    // Get current job to determine current featured status
    const currentJob = await this.prisma.job.findFirst({
      where: {
        id,
        companyId: user.companyId,
      },
    });

    if (!currentJob) {
      throw new BadRequestException('Job not found or you do not have permission to modify it');
    }

    // Toggle the featured status
    return this.jobService.toggleFeatured(id, !currentJob.featured, user.companyId);
  }
}
