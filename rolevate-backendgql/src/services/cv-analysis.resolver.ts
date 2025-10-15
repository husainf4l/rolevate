import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OpenaiCvAnalysisService } from './openai-cv-analysis.service';
import { CvParsingService } from './cv-parsing.service';
import { CVAnalysisResult, CandidateInfo } from './cv-analysis.dto';
import { AnalyzeCVInput, ParseCVInput, GenerateRecommendationsInput } from './cv-analysis.input';
import { Job } from '../job/job.entity';

@Resolver()
export class CvAnalysisResolver {
  constructor(
    private readonly openaiCvAnalysisService: OpenaiCvAnalysisService,
    private readonly cvParsingService: CvParsingService,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  @Mutation(() => CVAnalysisResult)
  async analyzeCV(@Args('input') input: AnalyzeCVInput): Promise<CVAnalysisResult> {
    // Get job details
    const job = await this.jobRepository.findOne({
      where: { id: input.jobId },
      relations: ['company'],
    });

    if (!job) {
      throw new Error('Job not found');
    }

    // Convert job entity to plain object for analysis
    const jobData = {
      title: job.title,
      department: job.department,
      location: job.location,
      description: job.description,
      requirements: job.requirements,
      responsibilities: job.responsibilities,
      skills: job.skills,
      experience: job.experience,
      education: job.education,
      jobLevel: job.jobLevel,
      workType: job.workType,
      industry: job.industry,
      company: job.company ? { name: job.company.name } : undefined,
    };

    return await this.openaiCvAnalysisService.analyzeCVWithOpenAI(
      input.resumeUrl,
      input.analysisPrompt || 'Provide comprehensive CV analysis for job matching',
      jobData,
    );
  }

  @Mutation(() => CandidateInfo)
  async parseCV(@Args('input') input: ParseCVInput): Promise<CandidateInfo> {
    return await this.cvParsingService.extractCandidateInfoFromCV(input.cvUrl);
  }

  @Mutation(() => String)
  async generateAIRecommendations(
    @Args('input') input: GenerateRecommendationsInput,
  ): Promise<string> {
    return await this.openaiCvAnalysisService.generateRecommendations(input.prompt);
  }
}
