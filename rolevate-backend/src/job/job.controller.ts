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
import { JobService } from './job.service';
import { CreateJobDto, JobResponseDto } from './dto/create-job.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JobStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobController {
  constructor(
    private readonly jobService: JobService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
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

  @Get('public/:id')
  @SetMetadata('skipAuth', true)
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

  @Patch(':id/restore')
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
