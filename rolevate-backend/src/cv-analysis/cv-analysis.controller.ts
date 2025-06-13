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
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCvAnalysisDto: CreateCvAnalysisDto) {
    console.log('Creating CV Analysis:', createCvAnalysisDto);
    
    // If candidateName is not provided but can be extracted from data, add it to the DTO
    if (!createCvAnalysisDto.candidateName) {
      createCvAnalysisDto.candidateName = this.extractCandidateName(createCvAnalysisDto);
    }
    
    const result = await this.cvAnalysisService.create(createCvAnalysisDto);
    console.log('CV Analysis created:', result);
    
    // Update candidate record if we have a name
    try {
      if (createCvAnalysisDto.candidateName) {
        const prisma = this.cvAnalysisService['prisma']; // Access prisma instance
        const candidateId = createCvAnalysisDto.candidateId;
        
        // Update candidate record with name
        await prisma.candidate.update({
          where: { id: candidateId },
          data: {
            name: createCvAnalysisDto.candidateName,
            // If name contains a space, update firstName and lastName
            ...(createCvAnalysisDto.candidateName.includes(' ') && {
              firstName: createCvAnalysisDto.candidateName.split(' ')[0],
              lastName: createCvAnalysisDto.candidateName.split(' ').slice(1).join(' ')
            })
          }
        });
        
        console.log(`Updated candidate name to: ${createCvAnalysisDto.candidateName}`);
      }
    } catch (error) {
      // Log error but don't block the response
      console.error('Failed to update candidate name:', error.message);
    }
    
    return result;
  }
  
  // Helper method to extract candidate name from CV analysis data
  private extractCandidateName(cvData: CreateCvAnalysisDto): string | undefined {
    // Try to extract from experience data if available
    if (cvData.experience && typeof cvData.experience === 'object') {
      try {
        const expData = JSON.parse(JSON.stringify(cvData.experience));
        if (expData.name) return expData.name;
        if (expData.candidateName) return expData.candidateName;
        if (expData.fullName) return expData.fullName;
      } catch (e) {}
    }
    
    // Try to extract from extracted text (first line might be name)
    if (cvData.extractedText) {
      const firstLine = cvData.extractedText.split('\n')[0].trim();
      // If first line is short (less than 50 chars), it might be a name
      if (firstLine.length > 0 && firstLine.length < 50) {
        return firstLine;
      }
    }
    
    // Try to extract from education data
    if (cvData.education && typeof cvData.education === 'object') {
      try {
        const eduData = JSON.parse(JSON.stringify(cvData.education));
        if (eduData.name) return eduData.name;
        if (eduData.candidateName) return eduData.candidateName;
        if (eduData.studentName) return eduData.studentName;
      } catch (e) {}
    }
    
    return undefined;
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
