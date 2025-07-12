import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { OpenaiCvAnalysisService } from '../services/openai-cv-analysis.service';
import { CvParsingService } from '../services/cv-parsing.service';
import { NotificationService } from '../notification/notification.service';
import { CreateApplicationDto, ApplicationResponseDto, CVAnalysisResultDto, UpdateApplicationStatusDto } from './dto/application.dto';
import { ApplicationStatus, UserType } from '@prisma/client';
import { NotificationType, NotificationCategory } from '../notification/dto/notification.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ApplicationService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
    private openaiCvAnalysisService: OpenaiCvAnalysisService,
    private cvParsingService: CvParsingService,
    private notificationService: NotificationService,
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

    // Create notification for company about new application
    try {
      await this.notificationService.create({
        type: NotificationType.INFO,
        category: NotificationCategory.APPLICATION,
        title: 'New Application Received',
        message: `New application received for ${job.title} from ${application.candidate.firstName} ${application.candidate.lastName}`,
        companyId: job.companyId,
        metadata: {
          candidateName: `${application.candidate.firstName} ${application.candidate.lastName}`,
          jobTitle: job.title,
          applicationId: application.id,
        },
      });
    } catch (error) {
      console.error('Failed to create application notification:', error);
    }

    // Trigger AI CV analysis in the background
    if (resumeUrl && job.cvAnalysisPrompt) {
      this.analyzeCVInBackground(application.id, resumeUrl, job.cvAnalysisPrompt, job);
    }

    // Clear cache
    await this.cacheService.clear(); // Clear all cache since we don't have pattern matching

    return this.mapToApplicationResponse(application);
  }

  async createAnonymousApplication(
    createApplicationDto: CreateApplicationDto
  ): Promise<ApplicationResponseDto & { candidateCredentials?: { email: string; password: string } }> {
    console.log('🔄 Processing anonymous application...');
    
    // Validate that resumeUrl is provided for anonymous applications
    if (!createApplicationDto.resumeUrl) {
      throw new BadRequestException('Resume URL is required for anonymous applications');
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

    // Extract candidate information from CV
    console.log('📄 Extracting candidate information from CV...');
    const candidateInfo = await this.cvParsingService.extractCandidateInfoFromCV(createApplicationDto.resumeUrl);

    // Check if user already exists with this email
    let existingUser = await this.prisma.user.findUnique({
      where: { email: candidateInfo.email },
      include: { candidateProfile: true }
    });

    let candidateId: string;
    let candidateCredentials: { email: string; password: string } | undefined;

    if (existingUser) {
      console.log('👤 Found existing user with email:', candidateInfo.email);
      
      if (!existingUser.candidateProfile) {
        throw new BadRequestException('User exists but is not a candidate');
      }

      candidateId = existingUser.candidateProfile.id;
      
      // Check if already applied
      const existingApplication = await this.prisma.application.findUnique({
        where: {
          jobId_candidateId: {
            jobId: createApplicationDto.jobId,
            candidateId: candidateId,
          },
        },
      });

      if (existingApplication) {
        throw new ConflictException('This candidate has already applied for this job');
      }
    } else {
      console.log('🆕 Creating new candidate account...');
      
      // Generate random password
      const randomPassword = this.generateRandomPassword();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      // Create user and candidate profile
      const result = await this.createCandidateFromCV(candidateInfo, hashedPassword, createApplicationDto.resumeUrl);
      candidateId = result.candidateProfile.id;
      
      candidateCredentials = {
        email: candidateInfo.email,
        password: randomPassword
      };

      console.log('✅ Created new candidate account for:', candidateInfo.email);
    }

    // Create the application
    const application = await this.prisma.application.create({
      data: {
        jobId: createApplicationDto.jobId,
        candidateId: candidateId,
        coverLetter: createApplicationDto.coverLetter,
        resumeUrl: createApplicationDto.resumeUrl,
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

    // Create notification for company about new application
    try {
      await this.notificationService.create({
        type: NotificationType.INFO,
        category: NotificationCategory.APPLICATION,
        title: 'New Application Received',
        message: `New application received for ${job.title} from ${application.candidate.firstName} ${application.candidate.lastName}`,
        companyId: job.companyId,
        metadata: {
          candidateName: `${application.candidate.firstName} ${application.candidate.lastName}`,
          jobTitle: job.title,
          applicationId: application.id,
        },
      });
    } catch (error) {
      console.error('Failed to create application notification:', error);
    }

    // Trigger AI CV analysis in the background
    if (createApplicationDto.resumeUrl && job.cvAnalysisPrompt) {
      this.analyzeCVInBackground(application.id, createApplicationDto.resumeUrl, job.cvAnalysisPrompt, job);
    }

    // Clear cache
    await this.cacheService.clear();

    const result = this.mapToApplicationResponse(application);
    
    // Include credentials for new accounts
    if (candidateCredentials) {
      return {
        ...result,
        candidateCredentials
      };
    }

    return result;
  }

  private async createCandidateFromCV(
    candidateInfo: any, 
    hashedPassword: string, 
    resumeUrl: string
  ) {
    console.log('🏗️ Creating user and candidate profile from CV data...');
    
    return await this.prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: candidateInfo.email,
          name: `${candidateInfo.firstName} ${candidateInfo.lastName}`,
          password: hashedPassword,
          userType: UserType.CANDIDATE,
          isActive: true,
        },
      });

      // Create candidate profile
      const candidateProfile = await tx.candidateProfile.create({
        data: {
          userId: user.id,
          firstName: candidateInfo.firstName,
          lastName: candidateInfo.lastName,
          email: candidateInfo.email,
          phone: candidateInfo.phone,
          currentJobTitle: candidateInfo.currentJobTitle,
          currentCompany: candidateInfo.currentCompany,
          totalExperience: candidateInfo.totalExperience,
          skills: candidateInfo.skills || [],
          resumeUrl: resumeUrl,
          profileSummary: candidateInfo.summary,
          isOpenToWork: true,
          isProfilePublic: true,
        },
      });

      return {
        user,
        candidateProfile
      };
    });
  }

  private generateRandomPassword(): string {
    const length = 12;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
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
    // Use OpenAI GPT-4o for real CV analysis with text extraction
    return await this.openaiCvAnalysisService.analyzeCVWithOpenAI(resumeUrl, analysisPrompt, job);
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

    // Create notification for candidate about status update
    try {
      let notificationTitle = '';
      let notificationMessage = '';
      let notificationType = NotificationType.INFO;

      switch (updateDto.status) {
        case ApplicationStatus.REVIEWING:
          notificationTitle = 'Application Under Review';
          notificationMessage = `Your application for ${application.job.title} is now under review.`;
          notificationType = NotificationType.INFO;
          break;
        case ApplicationStatus.INTERVIEW_SCHEDULED:
          notificationTitle = 'Interview Scheduled';
          notificationMessage = `An interview has been scheduled for your application to ${application.job.title}.`;
          notificationType = NotificationType.SUCCESS;
          break;
        case ApplicationStatus.INTERVIEWED:
          notificationTitle = 'Interview Completed';
          notificationMessage = `Your interview for ${application.job.title} has been completed.`;
          notificationType = NotificationType.INFO;
          break;
        case ApplicationStatus.OFFERED:
          notificationTitle = 'Job Offer Received';
          notificationMessage = `Congratulations! You have received an offer for ${application.job.title}.`;
          notificationType = NotificationType.SUCCESS;
          break;
        case ApplicationStatus.REJECTED:
          notificationTitle = 'Application Update';
          notificationMessage = `Thank you for your interest in ${application.job.title}. We have decided to move forward with other candidates.`;
          notificationType = NotificationType.INFO;
          break;
        case ApplicationStatus.WITHDRAWN:
          notificationTitle = 'Application Withdrawn';
          notificationMessage = `Your application for ${application.job.title} has been withdrawn.`;
          notificationType = NotificationType.INFO;
          break;
      }

      if (notificationTitle && application.candidate.userId) {
        await this.notificationService.create({
          type: notificationType,
          category: NotificationCategory.APPLICATION,
          title: notificationTitle,
          message: notificationMessage,
          userId: application.candidate.userId,
          metadata: {
            applicationId: application.id,
            jobTitle: application.job.title,
            candidateName: `${application.candidate.firstName} ${application.candidate.lastName}`,
          },
        });
      }
    } catch (error) {
      console.error('Failed to create status update notification:', error);
    }

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

  async getApplicationByIdForCompany(applicationId: string, companyId: string): Promise<ApplicationResponseDto> {
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

    // Verify that the application belongs to a job from this company
    if (application.job.companyId !== companyId) {
      throw new NotFoundException('Application not found');
    }

    return this.mapToApplicationResponse(application);
  }

  async getAllApplicationsForCompany(companyId: string, status?: string): Promise<ApplicationResponseDto[]> {
    // Find all jobs for this company
    const jobs = await this.prisma.job.findMany({
      where: { companyId },
      select: { id: true },
    });
    const jobIds = jobs.map(j => j.id);
    if (jobIds.length === 0) return [];

    // Find all applications for these jobs, optionally filter by status
    const where: any = { jobId: { in: jobIds } };
    if (status) where.status = status;

    const applications = await this.prisma.application.findMany({
      where,
      include: {
        candidate: true,
        job: { include: { company: true } },
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
    });
    return applications.map(app => this.mapToApplicationResponse(app));
  }

  // --- Application Notes CRUD ---
  async createApplicationNote(applicationId: string, dto: any, userId?: string) {
    let finalUserId: string | null = null;
    if (dto.source === 'USER') {
      // Always use the authenticated userId for USER notes, never from client
      if (!userId) throw new Error('Authenticated user required for USER note');
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');
      finalUserId = user.id;
    } else if (dto.userId) {
      // For SYSTEM/AI notes, allow userId if provided (e.g., for system attribution)
      finalUserId = dto.userId;
    }
    const note = await this.prisma.applicationNote.create({
      data: {
        applicationId,
        text: dto.text,
        source: dto.source,
        userId: finalUserId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return note;
  }

  async getApplicationNotes(applicationId: string) {
    return this.prisma.applicationNote.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async updateApplicationNote(noteId: string, dto: any, userId?: string) {
    let finalUserId: string | null = null;
    if (dto.source === 'USER') {
      if (!userId) throw new Error('Authenticated user required for USER note');
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');
      finalUserId = user.id;
    }
    const note = await this.prisma.applicationNote.update({
      where: { id: noteId },
      data: {
        text: dto.text,
        source: dto.source,
        userId: finalUserId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return note;
  }
  // ...existing code...

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
