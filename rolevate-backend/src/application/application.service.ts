import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { CreateApplicationDto, ApplicationResponseDto, CVAnalysisResultDto, UpdateApplicationStatusDto } from './dto/application.dto';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async createApplication(createApplicationDto: CreateApplicationDto, candidateId: string): Promise<ApplicationResponseDto> {
    // Check if candidate already applied for this job
    const existingApplication = await this.prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId: createApplicationDto.jobId,
          candidateId: candidateId,
        },
      },
    });

    if (existingApplication) {
      throw new ConflictException('You have already applied for this job');
    }

    // Get job details to verify it exists and is active
    const job = await this.prisma.job.findUnique({
      where: { id: createApplicationDto.jobId },
      include: { company: true },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status !== 'ACTIVE') {
      throw new BadRequestException('Job is not accepting applications');
    }

    if (new Date() > job.deadline) {
      throw new BadRequestException('Job application deadline has passed');
    }

    // Get candidate's active CV or use provided resume URL
    let resumeUrl = createApplicationDto.resumeUrl;
    
    if (!resumeUrl) {
      const candidateProfile = await this.prisma.candidateProfile.findUnique({
        where: { id: candidateId },
        include: {
          cvs: {
            where: { isActive: true },
            take: 1,
          },
        },
      });

      if (candidateProfile?.cvs[0]) {
        resumeUrl = candidateProfile.cvs[0].fileUrl;
      }
    }

    // Create the application
    const application = await this.prisma.application.create({
      data: {
        jobId: createApplicationDto.jobId,
        candidateId: candidateId,
        coverLetter: createApplicationDto.coverLetter,
        resumeUrl: resumeUrl,
        expectedSalary: createApplicationDto.expectedSalary,
        noticePeriod: createApplicationDto.noticePeriod,
        status: ApplicationStatus.SUBMITTED,
      },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        candidate: true,
      },
    });

    // Increment job applicants count
    await this.prisma.job.update({
      where: { id: createApplicationDto.jobId },
      data: {
        applicants: {
          increment: 1,
        },
      },
    });

    // Trigger AI CV analysis in the background
    if (resumeUrl && job.cvAnalysisPrompt) {
      this.analyzeCVInBackground(application.id, resumeUrl, job.cvAnalysisPrompt, job);
    }

    // Clear cache
    await this.cacheService.clear(); // Clear all cache since we don't have pattern matching

    return this.mapToApplicationResponse(application);
  }

  async analyzeCVInBackground(applicationId: string, resumeUrl: string, analysisPrompt: string, job: any): Promise<void> {
    try {
      // This would run in the background - you might want to use a queue system like Bull
      setTimeout(async () => {
        try {
          const analysisResult = await this.performAICVAnalysis(resumeUrl, analysisPrompt, job);
          
          await this.prisma.application.update({
            where: { id: applicationId },
            data: {
              cvAnalysisScore: analysisResult.score,
              cvAnalysisResults: analysisResult as any, // Cast to any for JSON field
              analyzedAt: new Date(),
            },
          });

          // Clear cache after analysis
          await this.cacheService.clear();
        } catch (error) {
          console.error('Background CV analysis failed:', error);
        }
      }, 5000); // 5 second delay to simulate processing
    } catch (error) {
      console.error('Failed to start background CV analysis:', error);
    }
  }

  async performAICVAnalysis(resumeUrl: string, analysisPrompt: string, job: any): Promise<CVAnalysisResultDto> {
    // This is a mock implementation - replace with actual AI service
    // In a real implementation, you would:
    // 1. Extract text from the CV PDF
    // 2. Send to OpenAI/Claude with the analysis prompt
    // 3. Parse the AI response
    
    const mockAnalysis: CVAnalysisResultDto = {
      score: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
      summary: `Candidate shows strong potential for the ${job.title} position with relevant experience and skills.`,
      strengths: [
        'Strong technical background',
        'Relevant industry experience',
        'Good educational qualifications',
      ],
      weaknesses: [
        'Could benefit from more leadership experience',
        'Some gaps in required technologies',
      ],
      recommendations: [
        'Consider for technical interview',
        'Assess communication skills',
        'Verify specific technology experience',
      ],
      skillsMatch: {
        matched: job.skills?.slice(0, 3) || ['JavaScript', 'React'],
        missing: job.skills?.slice(3, 5) || ['Node.js'],
        percentage: 75,
      },
      experienceMatch: {
        relevant: true,
        years: Math.floor(Math.random() * 8) + 2,
        details: 'Solid experience in relevant technologies and industry',
      },
      educationMatch: {
        relevant: true,
        details: 'Educational background aligns with job requirements',
      },
      overallFit: Math.random() > 0.3 ? 'Good' : 'Excellent',
    };

    return mockAnalysis;
  }

  async getApplicationsByCandidate(candidateId: string): Promise<ApplicationResponseDto[]> {
    const applications = await this.prisma.application.findMany({
      where: { candidateId },
      include: {
        job: {
          include: {
            company: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return applications.map(app => this.mapToApplicationResponse(app));
  }

  async getApplicationsByJob(jobId: string, companyId: string): Promise<ApplicationResponseDto[]> {
    // Verify job belongs to company
    const job = await this.prisma.job.findFirst({
      where: {
        id: jobId,
        companyId: companyId,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found or access denied');
    }

    const applications = await this.prisma.application.findMany({
      where: { jobId },
      include: {
        candidate: true,
        job: {
          include: {
            company: true,
          },
        },
      },
      orderBy: [
        { cvAnalysisScore: 'desc' }, // Highest scored first
        { createdAt: 'desc' },
      ],
    });

    return applications.map(app => this.mapToApplicationResponse(app));
  }

  async updateApplicationStatus(applicationId: string, updateDto: UpdateApplicationStatusDto, companyId: string): Promise<ApplicationResponseDto> {
    // Verify application belongs to company's job
    const application = await this.prisma.application.findFirst({
      where: {
        id: applicationId,
        job: {
          companyId: companyId,
        },
      },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        candidate: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found or access denied');
    }

    const updatedApplication = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: updateDto.status,
        reviewedAt: updateDto.status === ApplicationStatus.REVIEWING ? new Date() : application.reviewedAt,
        rejectedAt: updateDto.status === ApplicationStatus.REJECTED ? new Date() : application.rejectedAt,
        acceptedAt: updateDto.status === ApplicationStatus.OFFERED ? new Date() : application.acceptedAt,
      },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        candidate: true,
      },
    });

    // Clear cache
    await this.cacheService.clear();

    return this.mapToApplicationResponse(updatedApplication);
  }

  async getApplicationById(applicationId: string): Promise<ApplicationResponseDto> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        candidate: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return this.mapToApplicationResponse(application);
  }

  private mapToApplicationResponse(application: any): ApplicationResponseDto {
    return {
      id: application.id,
      status: application.status,
      jobId: application.jobId,
      candidateId: application.candidateId,
      coverLetter: application.coverLetter,
      resumeUrl: application.resumeUrl,
      expectedSalary: application.expectedSalary,
      noticePeriod: application.noticePeriod,
      cvAnalysisScore: application.cvAnalysisScore,
      cvAnalysisResults: application.cvAnalysisResults as CVAnalysisResultDto,
      analyzedAt: application.analyzedAt,
      companyNotes: application.companyNotes,
      appliedAt: application.appliedAt,
      reviewedAt: application.reviewedAt,
      interviewScheduledAt: application.interviewScheduledAt,
      interviewedAt: application.interviewedAt,
      rejectedAt: application.rejectedAt,
      acceptedAt: application.acceptedAt,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      job: application.job ? {
        id: application.job.id,
        title: application.job.title,
        company: {
          name: application.job.company?.name || 'Unknown Company',
        },
      } : undefined,
      candidate: application.candidate ? {
        id: application.candidate.id,
        firstName: application.candidate.firstName,
        lastName: application.candidate.lastName,
        email: application.candidate.email,
      } : undefined,
    };
  }
}
