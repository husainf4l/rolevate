import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationService } from './application.service';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { OpenaiCvAnalysisService } from '../services/openai-cv-analysis.service';
import { CvParsingService } from '../services/cv-parsing.service';
import { NotificationService } from '../notification/notification.service';
import { LiveKitService } from '../livekit/livekit.service';
import { CommunicationService } from '../communication/communication.service';
import { AwsS3Service } from '../services/aws-s3.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';

describe('ApplicationService', () => {
  let service: ApplicationService;
  let prismaService: jest.Mocked<PrismaService>;
  let _cacheService: jest.Mocked<CacheService>;
  let _openaiCvAnalysisService: jest.Mocked<OpenaiCvAnalysisService>;
  let _cvParsingService: jest.Mocked<CvParsingService>;
  let _notificationService: jest.Mocked<NotificationService>;
  let _liveKitService: jest.Mocked<LiveKitService>;
  let _communicationService: jest.Mocked<CommunicationService>;
  let _awsS3Service: jest.Mocked<AwsS3Service>;

  const mockApplication = {
    id: 'application-1',
    jobId: 'job-1',
    candidateId: 'candidate-1',
    status: ApplicationStatus.SUBMITTED,
    resumeUrl: 'https://s3.amazonaws.com/resume.pdf',
    coverLetter: 'Cover letter text',
    expectedSalary: undefined,
    noticePeriod: undefined,
    cvAnalysisScore: undefined,
    cvAnalysisResults: undefined,
    analyzedAt: undefined,
    aiCvRecommendations: undefined,
    aiInterviewRecommendations: undefined,
    aiSecondInterviewRecommendations: undefined,
    recommendationsGeneratedAt: undefined,
    companyNotes: undefined,
    appliedAt: undefined,
    reviewedAt: undefined,
    interviewScheduledAt: undefined,
    interviewedAt: undefined,
    rejectedAt: undefined,
    acceptedAt: undefined,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
    job: {
      id: 'job-1',
      title: 'Software Engineer',
      status: 'ACTIVE',
      deadline: new Date('2025-12-31'),
      company: {
        id: 'company-1',
        name: 'Test Company',
      },
    },
    candidate: {
      id: 'candidate-1',
      firstName: undefined,
      lastName: undefined,
      email: undefined,
    },
  };

  const mockApplicationResponse = {
    id: 'application-1',
    status: 'SUBMITTED',
    jobId: 'job-1',
    candidateId: 'candidate-1',
    coverLetter: 'Cover letter text',
    resumeUrl: 'https://s3.amazonaws.com/resume.pdf',
    expectedSalary: undefined,
    noticePeriod: undefined,
    cvAnalysisScore: undefined,
    cvAnalysisResults: undefined,
    analyzedAt: undefined,
    aiCvRecommendations: undefined,
    aiInterviewRecommendations: undefined,
    aiSecondInterviewRecommendations: undefined,
    recommendationsGeneratedAt: undefined,
    companyNotes: undefined,
    appliedAt: undefined,
    reviewedAt: undefined,
    interviewScheduledAt: undefined,
    interviewedAt: undefined,
    rejectedAt: undefined,
    acceptedAt: undefined,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
    job: {
      id: 'job-1',
      title: 'Software Engineer',
      company: {
        name: 'Test Company',
      },
    },
    candidate: {
      id: 'candidate-1',
      firstName: undefined,
      lastName: undefined,
      email: undefined,
    },
  };

  beforeEach(async () => {
    const mockPrismaService = {
      application: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      job: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      candidate: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      user: {
        create: jest.fn(),
      },
      applicationNote: {
        create: jest.fn(),
      },
    };

    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      getOrSet: jest.fn(),
      clear: jest.fn(),
    };

    const mockOpenaiCvAnalysisService = {
      analyzeCV: jest.fn(),
    };

    const mockCvParsingService = {
      parseCV: jest.fn(),
    };

    const mockNotificationService = {
      createNotification: jest.fn(),
    };

    const mockLiveKitService = {
      createRoom: jest.fn(),
    };

    const mockCommunicationService = {
      createCommunication: jest.fn(),
    };

    const mockAwsS3Service = {
      uploadFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        {
          provide: OpenaiCvAnalysisService,
          useValue: mockOpenaiCvAnalysisService,
        },
        {
          provide: CvParsingService,
          useValue: mockCvParsingService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        {
          provide: LiveKitService,
          useValue: mockLiveKitService,
        },
        {
          provide: CommunicationService,
          useValue: mockCommunicationService,
        },
        {
          provide: AwsS3Service,
          useValue: mockAwsS3Service,
        },
      ],
    }).compile();

    service = module.get<ApplicationService>(ApplicationService);
    prismaService = module.get(PrismaService);
    _cacheService = module.get(CacheService);
    _openaiCvAnalysisService = module.get(OpenaiCvAnalysisService);
    _cvParsingService = module.get(CvParsingService);
    _notificationService = module.get(NotificationService);
    _liveKitService = module.get(LiveKitService);
    _communicationService = module.get(CommunicationService);
    _awsS3Service = module.get(AwsS3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createApplication', () => {
    it('should create an application successfully', async () => {
      const createApplicationDto = {
        jobId: 'job-1',
        resumeUrl: 'https://s3.amazonaws.com/resume.pdf',
        coverLetter: 'Cover letter text',
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        linkedinUrl: 'https://linkedin.com/in/johndoe',
        portfolioUrl: 'https://portfolio.com',
        additionalInfo: 'Additional info',
      };

      (prismaService.application.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.job.findUnique as jest.Mock).mockResolvedValue(mockApplication.job);
      (prismaService.job.update as jest.Mock).mockResolvedValue(mockApplication.job);
      (prismaService.application.create as jest.Mock).mockResolvedValue(mockApplication);

      const result = await service.createApplication(createApplicationDto, 'candidate-1');

      expect(prismaService.application.findUnique).toHaveBeenCalledWith({
        where: {
          jobId_candidateId: {
            jobId: 'job-1',
            candidateId: 'candidate-1',
          },
        },
      });
      expect(result).toEqual(mockApplicationResponse);
    });

    it('should throw ConflictException if application already exists', async () => {
      const createApplicationDto = {
        jobId: 'job-1',
        resumeUrl: 'https://s3.amazonaws.com/resume.pdf',
      };

      (prismaService.application.findUnique as jest.Mock).mockResolvedValue(mockApplication);

      await expect(service.createApplication(createApplicationDto, 'candidate-1')).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if job not found', async () => {
      const createApplicationDto = {
        jobId: 'job-1',
        resumeUrl: 'https://s3.amazonaws.com/resume.pdf',
      };

      (prismaService.application.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.job.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.createApplication(createApplicationDto, 'candidate-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getApplicationsByCandidate', () => {
    it('should return applications for a candidate', async () => {
      const mockApplications = [mockApplication];
      (prismaService.application.findMany as jest.Mock).mockResolvedValue(mockApplications);

      const result = await service.getApplicationsByCandidate('candidate-1');

      expect(prismaService.application.findMany).toHaveBeenCalledWith({
        where: { candidateId: 'candidate-1' },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([mockApplicationResponse]);
    });
  });

  describe('getApplicationsByJob', () => {
    it('should return applications for a job', async () => {
      const mockApplications = [mockApplication];
      (prismaService.job.findFirst as jest.Mock).mockResolvedValue(mockApplication.job);
      (prismaService.application.findMany as jest.Mock).mockResolvedValue(mockApplications);

      const result = await service.getApplicationsByJob('job-1', 'company-1');

      expect(prismaService.job.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'job-1',
          companyId: 'company-1',
        },
      });
      expect(result).toEqual([mockApplicationResponse]);
    });
  });

  describe('updateApplicationStatus', () => {
    it('should update application status successfully', async () => {
      const updateDto = { status: ApplicationStatus.INTERVIEWED };
      const updatedApplication = { ...mockApplication, status: ApplicationStatus.INTERVIEWED };

      (prismaService.application.findFirst as jest.Mock).mockResolvedValue(mockApplication);
      (prismaService.application.update as jest.Mock).mockResolvedValue(updatedApplication);

      const result = await service.updateApplicationStatus('application-1', updateDto, 'company-1');

      expect(prismaService.application.update).toHaveBeenCalledWith({
        where: { id: 'application-1' },
        data: { status: ApplicationStatus.INTERVIEWED },
        include: expect.any(Object),
      });
      expect(result.status).toBe('INTERVIEWED');
    });

    it('should throw NotFoundException if application not found', async () => {
      const updateDto = { status: ApplicationStatus.INTERVIEWED };

      (prismaService.application.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.updateApplicationStatus('application-1', updateDto, 'company-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getApplicationById', () => {
    it('should return application by id', async () => {
      (prismaService.application.findUnique as jest.Mock).mockResolvedValue(mockApplication);

      const result = await service.getApplicationById('application-1');

      expect(prismaService.application.findUnique).toHaveBeenCalledWith({
        where: { id: 'application-1' },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockApplicationResponse);
    });

    it('should throw NotFoundException if application not found', async () => {
      (prismaService.application.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getApplicationById('application-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllApplicationsForCompany', () => {
    it('should return all applications for company', async () => {
      const mockJobs = [{ id: 'job-1' }];
      const mockApplications = [mockApplication];
      (prismaService.job.findMany as jest.Mock).mockResolvedValue(mockJobs);
      (prismaService.application.findMany as jest.Mock).mockResolvedValue(mockApplications);

      const result = await service.getAllApplicationsForCompany('company-1');

      expect(prismaService.job.findMany).toHaveBeenCalledWith({
        where: { companyId: 'company-1' },
        select: { id: true },
      });
      expect(result).toEqual([mockApplicationResponse]);
    });

    it('should filter by status when provided', async () => {
      const mockJobs = [{ id: 'job-1' }];
      const mockApplications = [mockApplication];
      (prismaService.job.findMany as jest.Mock).mockResolvedValue(mockJobs);
      (prismaService.application.findMany as jest.Mock).mockResolvedValue(mockApplications);

      const result = await service.getAllApplicationsForCompany('company-1', 'SUBMITTED');

      expect(prismaService.application.findMany).toHaveBeenCalledWith({
        where: {
          jobId: { in: ['job-1'] },
          status: 'SUBMITTED',
        },
        include: {
          candidate: true,
          job: {
            include: {
              company: true,
            },
          },
        },
        orderBy: [{ createdAt: 'desc' }],
      });
      expect(result).toEqual([mockApplicationResponse]);
    });
  });
});