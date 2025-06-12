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
  constructor(private readonly jobPostService: JobPostService) {}

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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER)
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
