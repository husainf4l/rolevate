import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { AiautocompleteService } from './aiautocomplete.service';
import { CompanyDescriptionRequestDto, CompanyDescriptionResponseDto } from './dto/company-description.dto';
import { SalaryRecommendationRequestDto, SalaryRecommendationResponseDto } from './dto/salary-recommendation.dto';
import { JobDescriptionRewriteRequestDto, JobDescriptionRewriteResponseDto } from './dto/job-description-rewrite.dto';
import { RequirementsPolishRequestDto, RequirementsPolishResponseDto } from './dto/requirements-polish.dto';
import { JobTitleRewriteRequestDto, JobTitleRewriteResponseDto } from './dto/job-title-rewrite.dto';
import { BenefitsPolishRequestDto, BenefitsPolishResponseDto } from './dto/benefits-polish.dto';
import { ResponsibilitiesPolishRequestDto, ResponsibilitiesPolishResponseDto } from './dto/responsibilities-polish.dto';
import { AboutCompanyPolishRequestDto, AboutCompanyPolishResponseDto } from './dto/about-company-polish.dto';
import { AIConfigRequestDto, AIConfigResponseDto } from './dto/ai-config.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('aiautocomplete')
@UseGuards(JwtAuthGuard)
export class AiautocompleteController {
  constructor(private readonly aiautocompleteService: AiautocompleteService) {}

  @Post('companydescription')
  async generateCompanyDescription(
    @Body() requestDto: CompanyDescriptionRequestDto,
  ): Promise<CompanyDescriptionResponseDto> {
    return this.aiautocompleteService.generateCompanyDescription(requestDto);
  }

  @Post('job-analysis')
  async generateJobAnalysis(
    @Body() requestDto: SalaryRecommendationRequestDto,
  ): Promise<SalaryRecommendationResponseDto> {
    return this.aiautocompleteService.generateSalaryRecommendation(requestDto);
  }

  @Post('rewrite-job-description')
  async rewriteJobDescription(
    @Body() requestDto: JobDescriptionRewriteRequestDto,
  ): Promise<JobDescriptionRewriteResponseDto> {
    const jobDescription = requestDto.jobDescription || requestDto.description;
    if (!jobDescription) {
      throw new BadRequestException('Either jobDescription or description field is required');
    }
    
    const serviceRequest = {
      jobDescription
    };
    
    return this.aiautocompleteService.rewriteJobDescription(serviceRequest);
  }

  @Post('rewrite-requirements')
  async rewriteRequirements(
    @Body() requestDto: RequirementsPolishRequestDto,
  ): Promise<RequirementsPolishResponseDto> {
    return this.aiautocompleteService.rewriteRequirements(requestDto);
  }

  @Post('rewrite-job-title')
  async rewriteJobTitle(
    @Body() requestDto: JobTitleRewriteRequestDto,
  ): Promise<JobTitleRewriteResponseDto> {
    return this.aiautocompleteService.rewriteJobTitle(requestDto);
  }

  @Post('rewrite-benefits')
  async rewriteBenefits(
    @Body() requestDto: BenefitsPolishRequestDto,
  ): Promise<BenefitsPolishResponseDto> {
    return this.aiautocompleteService.rewriteBenefits(requestDto);
  }

  @Post('rewrite-responsibilities')
  async rewriteResponsibilities(
    @Body() requestDto: ResponsibilitiesPolishRequestDto,
  ): Promise<ResponsibilitiesPolishResponseDto> {
    return this.aiautocompleteService.rewriteResponsibilities(requestDto);
  }

  @Post('rewrite-company-description')
  async rewriteAboutCompany(
    @Body() requestDto: AboutCompanyPolishRequestDto,
  ): Promise<AboutCompanyPolishResponseDto> {
    return this.aiautocompleteService.rewriteAboutCompany(requestDto);
  }

  @Post('generate-ai-config')
  async generateAIConfig(
    @Body() requestDto: AIConfigRequestDto,
  ): Promise<AIConfigResponseDto> {
    return this.aiautocompleteService.generateAIConfig(requestDto);
  }
}