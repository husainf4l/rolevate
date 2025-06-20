import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JobPostService } from './jobpost.service';
import { AiJobPostService } from './ai-jobpost.service';
import { CreateJobPostDto, UpdateJobPostDto, JobPostQueryDto } from './dto/jobpost.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionGuard, SubscriptionFeature } from '../auth/guards/subscription.guard';
import { RequireSubscriptionFeature } from '../auth/decorators/subscription-feature.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('jobposts')
export class JobPostController {
  constructor(
    private readonly jobPostService: JobPostService,
    private readonly aiJobPostService: AiJobPostService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @RequireSubscriptionFeature(SubscriptionFeature.CREATE_JOB_POST)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createJobPostDto: CreateJobPostDto,
    @GetUser() user: any,
  ) {
    if (!user.companyId) {
      throw new Error('User must be associated with a company to create job posts');
    }
    return this.jobPostService.create(createJobPostDto, user.id, user.companyId);
  }

  @Post('ai-create')
  @HttpCode(HttpStatus.CREATED)
  async createFromAi(
    @Body() data: any,
  ) {
    console.log('---------- AI JOB POST CREATION START ----------');
    console.log('Received data:', JSON.stringify(data, null, 2));
    console.log('Request timestamp:', new Date().toISOString());

    // Extract and validate data
    const { userId, companyId } = data;
    let jobPostData = data.createJobPostDto;
    
    // Check if jobPostData is directly in the request body instead of nested
    if (!jobPostData && data.title) {
      console.log('Job post data found at root level, restructuring...');
      // Extract job post fields from the root level
      const {
        userId: _, companyId: _ignore, // Ignore these fields
        ...extractedJobPostData
      } = data;
      jobPostData = extractedJobPostData;
    }
    
    if (!userId || !companyId) {
      const error = new Error('User ID and Company ID must be provided');
      console.error('Validation error:', error.message);
      console.log('---------- AI JOB POST CREATION FAILED ----------');
      throw error;
    }
    
    if (!jobPostData || !jobPostData.title) {
      const error = new Error('Job Post data is required and must include a title');
      console.error('Validation error:', error.message);
      console.log('---------- AI JOB POST CREATION FAILED ----------');
      throw error;
    }
    
    console.log('Validated User ID:', userId);
    console.log('Validated Company ID:', companyId);
    
    // Process and validate job post data before sending to service
    // Convert string interview language values to enum values if needed
    if (jobPostData.interviewLanguages) {
      jobPostData.interviewLanguages = jobPostData.interviewLanguages.map(lang => {
        // Handle various string values and convert them to enum
        if (typeof lang === 'string') {
          const normalizedLang = lang.toUpperCase();
          if (normalizedLang === 'ENGLISH' || normalizedLang === 'ARABIC' || normalizedLang === 'BILINGUAL') {
            return normalizedLang;
          } else if (normalizedLang.includes('ENGLISH')) {
            return 'ENGLISH';
          } else if (normalizedLang.includes('ARABIC')) {
            return 'ARABIC';
          } else if (normalizedLang.includes('BILINGUAL')) {
            return 'BILINGUAL';
          }
        }
        // Default to ENGLISH if invalid or unrecognized
        return 'ENGLISH';
      });
    }
    
    // Make interviewLanguages optional by providing a default if it's undefined
    if (!jobPostData.interviewLanguages) {
      jobPostData.interviewLanguages = ['ENGLISH'];
    }
    
    console.log('Validated Job Post Data:', JSON.stringify(jobPostData, null, 2));
    
    try {
      // Find a valid user ID for this company if the provided user ID looks like a test ID
      let validUserId = userId;
      if (userId.startsWith('test-') || userId.startsWith('ai-') || userId === 'AI Job Post Agent') {
        console.log(`User ID ${userId} appears to be a test/AI ID, finding a valid user for company ${companyId}...`);
        validUserId = await this.aiJobPostService.findValidUserForCompany(companyId, userId);
        console.log(`Found valid user ID: ${validUserId}`);
      }
      
      const result = await this.jobPostService.create(jobPostData, validUserId, companyId);
      console.log('Job Post created successfully with ID:', result.id);
      console.log('---------- AI JOB POST CREATION END ----------');
      return result;
    } catch (error) {
      console.error('Error creating job post from AI:', error.message);
      console.error('Error stack:', error.stack);
      console.log('---------- AI JOB POST CREATION FAILED ----------');
      throw error;
    }
  }

  @Get()
  async findAll(@Query() query: JobPostQueryDto) {
    return this.jobPostService.findAll(query);
  }

  @Get('company/:companyId')
  async findByCompany(
    @Param('companyId') companyId: string,
    @Query() query: JobPostQueryDto,
  ) {
    return this.jobPostService.findByCompany(companyId, query);
  }

  @Get('my-company')
  @UseGuards(JwtAuthGuard)
  async findMyCompanyJobs(
    @GetUser() user: any,
    @Query() query: JobPostQueryDto,
  ) {
    if (!user.companyId) {
      throw new Error('User must be associated with a company');
    }
    return this.jobPostService.findByCompany(user.companyId, query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.jobPostService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateJobPostDto: UpdateJobPostDto,
    @GetUser() user: any,
  ) {
    if (!user.companyId) {
      throw new Error('User must be associated with a company');
    }
    return this.jobPostService.update(id, updateJobPostDto, user.id, user.companyId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER)
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @GetUser() user: any,
  ) {
    if (!user.companyId) {
      throw new Error('User must be associated with a company');
    }
    return this.jobPostService.remove(id, user.companyId);
  }

  @Get(':id/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER)
  async getApplications(
    @Param('id') id: string,
    @GetUser() user: any,
  ) {
    if (!user.companyId) {
      throw new Error('User must be associated with a company');
    }
    return this.jobPostService.getApplications(id, user.companyId);
  }
}
