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
} from '@nestjs/common';
import { CvAnalysisService } from './cv-analysis.service';
import { CreateCvAnalysisDto, UpdateCvAnalysisDto, CvAnalysisQueryDto } from './dto/cv-analysis.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('cv-analysis')
export class CvAnalysisController {
  constructor(private readonly cvAnalysisService: CvAnalysisService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCvAnalysisDto: CreateCvAnalysisDto) {
    return this.cvAnalysisService.create(createCvAnalysisDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER)
  async findAll(@Query() query: CvAnalysisQueryDto) {
    return this.cvAnalysisService.findAll(query);
  }

  @Get('my-company')
  @UseGuards(JwtAuthGuard)
  async findMyCompanyAnalyses(
    @GetUser() user: any,
    @Query() query: CvAnalysisQueryDto,
  ) {
    if (!user.companyId) {
      throw new Error('User must be associated with a company');
    }
    return this.cvAnalysisService.findByCompany(user.companyId, query);
  }

  @Get('candidate/:candidateId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER)
  async getAnalysesByCandidate(@Param('candidateId') candidateId: string) {
    return this.cvAnalysisService.getAnalysesByCandidate(candidateId);
  }

  @Get('application/:applicationId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER)
  async getAnalysesByApplication(
    @Param('applicationId') applicationId: string,
    @GetUser() user: any,
  ) {
    return this.cvAnalysisService.getAnalysesByApplication(
      applicationId,
      user.companyId,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER)
  async findOne(@Param('id') id: string) {
    return this.cvAnalysisService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER)
  async update(
    @Param('id') id: string,
    @Body() updateCvAnalysisDto: UpdateCvAnalysisDto,
    @GetUser() user: any,
  ) {
    return this.cvAnalysisService.update(
      id,
      updateCvAnalysisDto,
      user.companyId,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN, UserRole.HR_MANAGER)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @GetUser() user: any) {
    return this.cvAnalysisService.remove(id, user.companyId);
  }
}
