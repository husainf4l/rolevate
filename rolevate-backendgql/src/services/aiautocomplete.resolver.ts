import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { AiautocompleteService } from './aiautocomplete.service';
import {
  CompanyDescriptionRequestDto,
  CompanyDescriptionResponseDto,
} from './dto/company-description.dto';
import {
  SalaryRecommendationRequestDto,
  SalaryRecommendationResponseDto,
} from './dto/salary-recommendation.dto';
import {
  RequirementsPolishRequestDto,
  RequirementsPolishResponseDto,
} from './dto/requirements-polish.dto';
import {
  JobTitleRewriteRequestDto,
  JobTitleRewriteResponseDto,
} from './dto/job-title-rewrite.dto';
import {
  BenefitsPolishRequestDto,
  BenefitsPolishResponseDto,
} from './dto/benefits-polish.dto';
import {
  ResponsibilitiesPolishRequestDto,
  ResponsibilitiesPolishResponseDto,
} from './dto/responsibilities-polish.dto';
import {
  AboutCompanyPolishRequestDto,
  AboutCompanyPolishResponseDto,
} from './dto/about-company-polish.dto';
import {
  JobDescriptionRewriteInput,
  JobDescriptionRewriteResponse,
} from './dto/job-description-rewrite.dto';

@Resolver()
export class AiautocompleteResolver {
  constructor(private readonly aiautocompleteService: AiautocompleteService) {}

  @Query(() => String)
  async healthCheck(): Promise<string> {
    return 'AI Autocomplete service is healthy';
  }

  @Mutation(() => CompanyDescriptionResponseDto)
  async generateCompanyDescription(
    @Args('input') input: CompanyDescriptionRequestDto,
  ): Promise<CompanyDescriptionResponseDto> {
    return await this.aiautocompleteService.generateCompanyDescription(input);
  }

  @Mutation(() => SalaryRecommendationResponseDto)
  async generateSalaryRecommendation(
    @Args('input') input: SalaryRecommendationRequestDto,
  ): Promise<SalaryRecommendationResponseDto> {
    return await this.aiautocompleteService.generateSalaryRecommendation(input);
  }

  @Mutation(() => JobTitleRewriteResponseDto)
  async rewriteJobTitle(
    @Args('input') input: JobTitleRewriteRequestDto,
  ): Promise<JobTitleRewriteResponseDto> {
    return await this.aiautocompleteService.rewriteJobTitle(input);
  }

  @Mutation(() => JobDescriptionRewriteResponse)
  async rewriteJobDescription(
    @Args('input') input: JobDescriptionRewriteInput,
  ): Promise<JobDescriptionRewriteResponse> {
    return await this.aiautocompleteService.rewriteJobDescription(input);
  }

  @Mutation(() => RequirementsPolishResponseDto)
  async polishRequirements(
    @Args('input') input: RequirementsPolishRequestDto,
  ): Promise<RequirementsPolishResponseDto> {
    return await this.aiautocompleteService.rewriteRequirements(input);
  }

  @Mutation(() => BenefitsPolishResponseDto)
  async polishBenefits(
    @Args('input') input: BenefitsPolishRequestDto,
  ): Promise<BenefitsPolishResponseDto> {
    return await this.aiautocompleteService.rewriteBenefits(input);
  }

  @Mutation(() => ResponsibilitiesPolishResponseDto)
  async polishResponsibilities(
    @Args('input') input: ResponsibilitiesPolishRequestDto,
  ): Promise<ResponsibilitiesPolishResponseDto> {
    return await this.aiautocompleteService.rewriteResponsibilities(input);
  }

  @Mutation(() => AboutCompanyPolishResponseDto)
  async polishAboutCompany(
    @Args('input') input: AboutCompanyPolishRequestDto,
  ): Promise<AboutCompanyPolishResponseDto> {
    return await this.aiautocompleteService.rewriteAboutCompany(input);
  }
}
