import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto, UpdateApplicationDto, ApplicationQueryDto } from './dto/application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createApplicationDto: CreateApplicationDto) {
    if (!createApplicationDto.jobPostId) {
      throw new BadRequestException('jobPostId is required');
    }
    if (!createApplicationDto.candidateId) {
      throw new BadRequestException('candidateId is required');
    }
    return this.applicationService.create(createApplicationDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER)
  async findAll(@Query() query: ApplicationQueryDto) {
    return this.applicationService.findAll(query);
  }

  @Get('my-company')
  @UseGuards(JwtAuthGuard)
  async findMyCompanyApplications(
    @GetUser() user: any,
    @Query() query: ApplicationQueryDto,
  ) {
    if (!user.companyId) {
      throw new Error('User must be associated with a company');
    }
    return this.applicationService.findByCompany(user.companyId, query);
  }

  @Get('candidate/:candidateId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER)
  async getApplicationsByCandidate(@Param('candidateId') candidateId: string) {
    return this.applicationService.getApplicationsByCandidate(candidateId);
  }

  @Get('jobpost/:jobPostId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER)
  async getApplicationsByJobPost(
    @Param('jobPostId') jobPostId: string,
    @GetUser() user: any,
  ) {
    return this.applicationService.getApplicationsByJobPost(
      jobPostId,
      user.companyId,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER)
  async findOne(@Param('id') id: string) {
    return this.applicationService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER)
  async update(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
    @GetUser() user: any,
  ) {
    return this.applicationService.update(
      id,
      updateApplicationDto,
      user.companyId,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN, UserRole.HR_MANAGER)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @GetUser() user: any) {
    return this.applicationService.remove(id, user.companyId);
  }
}
