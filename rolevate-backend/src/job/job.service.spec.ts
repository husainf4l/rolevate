import { Test, TestingModule } from '@nestjs/testing';
import { JobService } from './job.service';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { ViewTrackingService } from './view-tracking.service';
import { NotificationService } from '../notification/notification.service';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JobType, JobLevel, WorkType, JobStatus } from '@prisma/client';
import { InterviewLanguage } from './dto/create-job.dto';

describe('JobService', () => {
  let service: JobService;
  let prismaService: jest.Mocked<PrismaService>;
  let cacheService: jest.Mocked<CacheService>;
  let viewTrackingService: jest.Mocked<ViewTrackingService>;
  let notificationService: jest.Mocked<NotificationService>;

  const mockCompany = {
    id: 'company-1',
    name: 'Test Company',
    description: 'A test company description',
    email: 'test@company.com',
    website: 'https://testcompany.com',
    industry: 'Technology',
    employeeCount: '51-200',
    subscriptionStatus: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockJob = {
    id: 'job-1',
    title: 'Software Engineer',
    department: 'Engineering',
    location: 'New York',
    salary: '100000-120000',
    type: JobType.FULL_TIME,
    deadline: new Date('2024-12-31'),
    description: 'Job description',
    shortDescription: 'Short description',
    responsibilities: 'Job responsibilities',
    requirements: 'Job requirements',
    benefits: 'Job benefits',
    skills: ['JavaScript', 'TypeScript'],
    experience: '3-5 years',
    education: 'Bachelor\'s degree',
    jobLevel: JobLevel.MID,
    workType: WorkType.REMOTE,
    industry: 'Technology',
    companyDescription: 'A test company description',
    interviewLanguage: InterviewLanguage.ENGLISH,
    aiSecondInterviewPrompt: null,
    status: JobStatus.ACTIVE,
    featured: false,
    companyId: 'company-1',
    createdAt: new Date('2025-10-06T22:12:29.765Z'),
    updatedAt: new Date('2025-10-06T22:12:29.765Z'),
    company: {
      id: 'company-1',
      name: 'Test Company',
      logo: undefined,
      address: undefined,
    },
    cvAnalysisPrompt: undefined,
    interviewPrompt: undefined,
    applicants: undefined,
    views: undefined,
  };

  const mockJobResponse = {
    id: 'job-1',
    title: 'Software Engineer',
    department: 'Engineering',
    location: 'New York',
    salary: '100000-120000',
    type: 'FULL_TIME',
    deadline: new Date('2024-12-31'),
    description: 'Job description',
    shortDescription: 'Short description',
    responsibilities: 'Job responsibilities',
    requirements: 'Job requirements',
    benefits: 'Job benefits',
    skills: ['JavaScript', 'TypeScript'],
    experience: '3-5 years',
    education: 'Bachelor\'s degree',
    jobLevel: 'MID',
    workType: 'REMOTE',
    industry: 'Technology',
    companyDescription: 'A test company description',
    companyLogo: undefined,
    interviewLanguage: 'english',
    status: 'ACTIVE',
    companyId: 'company-1',
    company: {
      id: 'company-1',
      name: 'Test Company',
      logo: undefined,
      address: undefined,
    },
    cvAnalysisPrompt: undefined,
    interviewPrompt: undefined,
    aiSecondInterviewPrompt: null,
    featured: false,
    applicants: undefined,
    views: undefined,
    createdAt: new Date('2025-10-06T22:12:29.765Z'),
    updatedAt: new Date('2025-10-06T22:12:29.765Z'),
  };

  const mockCreateJobDto = {
    title: 'Software Engineer',
    department: 'Engineering',
    location: 'New York',
    salary: '100000-120000',
    type: 'FULL_TIME',
    deadline: '2024-12-31',
    description: 'Job description',
    shortDescription: 'Short description',
    responsibilities: 'Job responsibilities',
    requirements: 'Job requirements',
    benefits: 'Job benefits',
    skills: ['JavaScript', 'TypeScript'],
    experience: '3-5 years',
    education: 'Bachelor\'s degree',
    jobLevel: 'MID',
    workType: 'REMOTE',
    industry: 'Technology',
    companyDescription: 'Company description',
    interviewLanguage: InterviewLanguage.ENGLISH,
    aiSecondInterviewPrompt: undefined,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      company: {
        findUnique: jest.fn(),
      },
      job: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      getOrSet: jest.fn(),
      getWithFallback: jest.fn(),
      invalidatePattern: jest.fn(),
      generateJobKey: jest.fn(),
      generateCompanyJobsKey: jest.fn(),
      generateJobCountKey: jest.fn(),
      invalidateCompanyJobsCache: jest.fn(),
      invalidatePublicJobsCache: jest.fn(),
      getSmartTTL: jest.fn(),
    };

    const mockViewTrackingService = {
      shouldIncrementView: jest.fn(),
    };

    const mockNotificationService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        {
          provide: ViewTrackingService,
          useValue: mockViewTrackingService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<JobService>(JobService);
    prismaService = module.get(PrismaService);
    cacheService = module.get(CacheService);
    viewTrackingService = module.get(ViewTrackingService);
    notificationService = module.get(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a job successfully', async () => {
      (prismaService.company.findUnique as jest.Mock).mockResolvedValue(mockCompany);
      (prismaService.job.create as jest.Mock).mockResolvedValue(mockJob);

      const result = await service.create(mockCreateJobDto, 'company-1');

      expect(prismaService.company.findUnique).toHaveBeenCalledWith({
        where: { id: 'company-1' },
        select: { description: true },
      });
      expect(prismaService.job.create).toHaveBeenCalled();
      expect(result).toEqual(mockJobResponse);
    });

    it('should throw BadRequestException if company not found', async () => {
      (prismaService.company.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.create(mockCreateJobDto, 'company-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all jobs for a company', async () => {
      const mockJobs = [mockJob];
      (prismaService.job.findMany as jest.Mock).mockResolvedValue(mockJobs);

      const result = await service.findAll('company-1');

      expect(prismaService.job.findMany).toHaveBeenCalledWith({
        where: { companyId: 'company-1', status: { not: JobStatus.DELETED } },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([mockJobResponse]);
    });
  });

  describe('findOne', () => {
    it('should return a job by id', async () => {
      (cacheService.generateJobKey as jest.Mock).mockReturnValue('job:job-1');
      (cacheService.get as jest.Mock).mockResolvedValue(null); // Cache miss
      (prismaService.job.findFirst as jest.Mock).mockResolvedValue(mockJob);

      const result = await service.findOne('job-1', 'company-1');

      expect(cacheService.generateJobKey).toHaveBeenCalledWith('job-1');
      expect(result).toEqual(mockJobResponse);
    });

    it('should throw NotFoundException if job not found', async () => {
      (cacheService.generateJobKey as jest.Mock).mockReturnValue('job:job-1');
      (cacheService.get as jest.Mock).mockResolvedValue(null);
      (prismaService.job.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('job-1', 'company-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllPublic', () => {
    it('should return all public active jobs', async () => {
      const mockJobs = [mockJob];
      (prismaService.job.findMany as jest.Mock).mockResolvedValue(mockJobs);

      const result = await service.findAllPublic();

      expect(prismaService.job.findMany).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
          deadline: {
            gt: expect.any(Date),
          },
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual([mockJobResponse]);
    });
  });

  describe('findOnePublic', () => {
    it('should return a public job and track view', async () => {
      const mockJobWithViews = { ...mockJob, views: 0 };
      (cacheService.generateJobKey as jest.Mock).mockReturnValue('job:public:job-1');
      (cacheService.get as jest.Mock).mockResolvedValue(null);
      (prismaService.job.findFirst as jest.Mock).mockResolvedValue(mockJobWithViews);
      (viewTrackingService.shouldIncrementView as jest.Mock).mockResolvedValue(true);

      const result = await service.findOnePublic('job-1', '127.0.0.1');

      expect(viewTrackingService.shouldIncrementView).toHaveBeenCalledWith('job-1', '127.0.0.1');
      expect(result.views).toBe(1); // Should be incremented
    });
  });

  describe('findAllPaginated', () => {
    it('should return paginated jobs with search', async () => {
      const mockJobs = [mockJobResponse];
      (cacheService.generateCompanyJobsKey as jest.Mock).mockReturnValue('jobs:company-1:limit-10:offset-0:search-engineer');
      (cacheService.getOrSet as jest.Mock).mockResolvedValue(mockJobs);
      (cacheService.getSmartTTL as jest.Mock).mockReturnValue(300000);

      const result = await service.findAllPaginated('company-1', 10, 0, 'engineer');

      expect(cacheService.generateCompanyJobsKey).toHaveBeenCalledWith('company-1', 10, 0, 'engineer');
      expect(cacheService.getOrSet).toHaveBeenCalledWith(
        'jobs:company-1:limit-10:offset-0:search-engineer',
        expect.any(Function),
        300000, // 5 minutes
      );
      expect(result).toEqual(mockJobs);
    });
  });

  describe('countJobs', () => {
    it('should return job count with search', async () => {
      (cacheService.generateJobCountKey as jest.Mock).mockReturnValue('jobs:count:company-1:search-engineer');
      (cacheService.getOrSet as jest.Mock).mockResolvedValue(5);
      (cacheService.getSmartTTL as jest.Mock).mockReturnValue(300000);

      const result = await service.countJobs('company-1', 'engineer');

      expect(cacheService.generateJobCountKey).toHaveBeenCalledWith('company-1', 'engineer');
      expect(cacheService.getOrSet).toHaveBeenCalledWith(
        'jobs:count:company-1:search-engineer',
        expect.any(Function),
        300000,
      );
      expect(result).toBe(5);
    });
  });
});