import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync } from 'fs';
import { JobsService } from './jobs.service';
import { GetJobsQueryDto, JobsListResponseDto, JobDetailsResponseDto, JobResponseDto } from './dto/jobs.dto';
import { ApplyToJobDto, CVFile } from './dto/apply-job.dto';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  /**
   * Get all available jobs with filtering, pagination, and search
   * Public endpoint - no authentication required
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: GetJobsQueryDto): Promise<JobsListResponseDto> {
    return this.jobsService.findAll(query);
  }

  /**
   * Get featured jobs for homepage/highlights
   * Public endpoint - no authentication required
   */
  @Get('featured')
  @HttpCode(HttpStatus.OK)
  async findFeatured(@Query('limit') limit?: number): Promise<JobResponseDto[]> {
    const parsedLimit = limit ? parseInt(limit.toString()) : 6;
    return this.jobsService.findFeatured(parsedLimit);
  }

  /**
   * Get job statistics and analytics
   * Public endpoint - basic stats can be public
   */
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getJobStats() {
    return this.jobsService.getJobStats();
  }

  /**
   * Get job details by ID
   * Public endpoint - no authentication required
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<JobDetailsResponseDto> {
    return this.jobsService.findOne(id);
  }

  /**
   * Apply to a job with phone number and CV file upload
   * Public endpoint - no authentication required
   */
  @Post(':id/apply')
  @UseInterceptors(
    FileInterceptor('cv', {
      storage: diskStorage({
        destination: './uploads/cvs',
        filename: (req, file, callback) => {
          // Use timestamp for unique filename, we'll get phone number later
          const timestamp = Date.now();
          const ext = extname(file.originalname);
          const filename = `cv_${timestamp}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(pdf|doc|docx)$/)) {
          return callback(new BadRequestException('Only PDF, DOC, and DOCX files are allowed!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async applyToJob(
    @Param('id') jobId: string,
    @Body() applyDto: ApplyToJobDto,
    @UploadedFile() cvFile: Express.Multer.File,
  ) {
    if (!cvFile) {
      throw new BadRequestException('CV file is required');
    }

    return this.jobsService.applyToJob(jobId, applyDto, cvFile);
  }

  /**
   * Serve CV files
   * GET /api/jobs/uploads/:phoneNumber/:timestamp
   */
  @Get('uploads/:phoneNumber/:timestamp')
  async serveCVFile(
    @Param('phoneNumber') phoneNumber: string,
    @Param('timestamp') timestamp: string,
    @Res() res: Response,
  ) {
    // Find the file with the timestamp pattern
    const uploadsDir = './uploads/cvs';
    const filePattern = `cv_${timestamp}`;
    
    // Common CV file extensions
    const extensions = ['.pdf', '.doc', '.docx'];
    let filePath: string | null = null;
    
    for (const ext of extensions) {
      const possiblePath = join(uploadsDir, `${filePattern}${ext}`);
      if (existsSync(possiblePath)) {
        filePath = possiblePath;
        break;
      }
    }
    
    if (!filePath) {
      throw new NotFoundException('CV file not found');
    }
    
    return res.sendFile(join(process.cwd(), filePath));
  }
}
