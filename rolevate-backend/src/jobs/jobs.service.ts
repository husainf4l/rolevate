import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetJobsQueryDto, JobsListResponseDto, JobResponseDto, JobDetailsResponseDto } from './dto/jobs.dto';
import { ApplyToJobDto } from './dto/apply-job.dto';
import { Prisma } from '@prisma/client';
import { readFileSync, createReadStream } from 'fs';
import { extname } from 'path';
import axios from 'axios';

const FormData = require('form-data');

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetJobsQueryDto): Promise<JobsListResponseDto> {
    const {
      search,
      companyId,
      experienceLevel,
      workType,
      location,
      isActive,
      isFeatured,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    // Build where clause
    const where: Prisma.JobPostWhereInput = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { requirements: { contains: search, mode: 'insensitive' } },
          { skills: { hasSome: [search] } },
        ],
      }),
      ...(companyId && { companyId }),
      ...(experienceLevel && { experienceLevel }),
      ...(workType && { workType }),
      ...(location && { location: { contains: location, mode: 'insensitive' } }),
      ...(isActive !== undefined && { isActive }),
      ...(isFeatured !== undefined && { isFeatured }),
      // Only show published and non-expired jobs
      publishedAt: { not: null },
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    };

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.prisma.jobPost.count({ where });

    // Get jobs with relations
    const jobs = await this.prisma.jobPost.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            displayName: true,
            logo: true,
            location: true,
            industry: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    // Transform to DTO
    const jobsDto: JobResponseDto[] = jobs.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      responsibilities: job.responsibilities,
      benefits: job.benefits,
      skills: job.skills,
      experienceLevel: job.experienceLevel,
      location: job.location,
      workType: job.workType,
      salaryMin: job.salaryMin ? Number(job.salaryMin) : null,
      salaryMax: job.salaryMax ? Number(job.salaryMax) : null,
      currency: job.currency,
      isActive: job.isActive,
      isFeatured: job.isFeatured,
      viewCount: job.viewCount,
      applicationCount: job._count.applications,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      expiresAt: job.expiresAt,
      publishedAt: job.publishedAt,
      company: job.company,
      createdBy: job.createdBy,
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      jobs: jobsDto,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

  async findOne(id: string): Promise<JobDetailsResponseDto> {
    const job = await this.prisma.jobPost.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            displayName: true,
            logo: true,
            location: true,
            industry: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        applications: {
          include: {
            candidate: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            appliedAt: 'desc',
          },
          take: 10, // Limit recent applications
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    // Increment view count
    await this.prisma.jobPost.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return {
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      responsibilities: job.responsibilities,
      benefits: job.benefits,
      skills: job.skills,
      experienceLevel: job.experienceLevel,
      location: job.location,
      workType: job.workType,
      salaryMin: job.salaryMin ? Number(job.salaryMin) : null,
      salaryMax: job.salaryMax ? Number(job.salaryMax) : null,
      currency: job.currency,
      isActive: job.isActive,
      isFeatured: job.isFeatured,
      viewCount: job.viewCount + 1, // Include the incremented view count
      applicationCount: job._count.applications,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      expiresAt: job.expiresAt,
      publishedAt: job.publishedAt,
      company: job.company,
      createdBy: job.createdBy,
      technicalQuestions: job.technicalQuestions,
      behavioralQuestions: job.behavioralQuestions,
      enableAiInterview: job.enableAiInterview,
      aiPrompt: null, // This field doesn't exist in schema
      interviewDuration: job.interviewDuration,
      applications: job.applications.map(app => ({
        id: app.id,
        status: app.status,
        appliedAt: app.appliedAt,
        candidate: {
          id: app.candidate.id,
          name: app.candidate.name || '',
          email: app.candidate.email,
        },
      })),
    };
  }

  async findFeatured(limit: number = 6): Promise<JobResponseDto[]> {
    const jobs = await this.prisma.jobPost.findMany({
      where: {
        isFeatured: true,
        isActive: true,
        publishedAt: { not: null },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            displayName: true,
            logo: true,
            location: true,
            industry: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    return jobs.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      responsibilities: job.responsibilities,
      benefits: job.benefits,
      skills: job.skills,
      experienceLevel: job.experienceLevel,
      location: job.location,
      workType: job.workType,
      salaryMin: job.salaryMin ? Number(job.salaryMin) : null,
      salaryMax: job.salaryMax ? Number(job.salaryMax) : null,
      currency: job.currency,
      isActive: job.isActive,
      isFeatured: job.isFeatured,
      viewCount: job.viewCount,
      applicationCount: job._count.applications,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      expiresAt: job.expiresAt,
      publishedAt: job.publishedAt,
      company: job.company,
      createdBy: job.createdBy,
    }));
  }

  async getJobStats() {
    const [
      totalJobs,
      activeJobs,
      featuredJobs,
      totalApplications,
      jobsByExperience,
      jobsByWorkType,
      recentJobs
    ] = await Promise.all([
      this.prisma.jobPost.count(),
      this.prisma.jobPost.count({ where: { isActive: true } }),
      this.prisma.jobPost.count({ where: { isFeatured: true } }),
      this.prisma.application.count(),
      this.prisma.jobPost.groupBy({
        by: ['experienceLevel'],
        _count: { _all: true },
      }),
      this.prisma.jobPost.groupBy({
        by: ['workType'],
        _count: { _all: true },
      }),
      this.prisma.jobPost.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ]);

    return {
      totalJobs,
      activeJobs,
      featuredJobs,
      totalApplications,
      recentJobs,
      distribution: {
        byExperience: jobsByExperience.map(item => ({
          level: item.experienceLevel,
          count: item._count._all,
        })),
        byWorkType: jobsByWorkType.map(item => ({
          type: item.workType,
          count: item._count._all,
        })),
      },
    };
  }

  async applyToJob(jobId: string, applyDto: ApplyToJobDto, cvFile: Express.Multer.File) {
    const { firstName, lastName, email, phoneNumber, coverLetter } = applyDto;

    // Verify job exists and is active
    const job = await this.prisma.jobPost.findUnique({
      where: { id: jobId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    if (!job.isActive) {
      throw new BadRequestException('This job is no longer accepting applications');
    }

    try {
      // Generate CV file URL from uploaded file
      const cvFileName = cvFile.filename;
      const timestamp = cvFileName.split('_')[1].split('.')[0]; // Extract timestamp from filename
      const cvUrl = `/api/jobs/uploads/${phoneNumber}/${timestamp}`;
      const cvFilePath = cvFile.path;

      // Create a unique candidate for this application (no user account needed)
      // This allows multiple applications per job without conflicts
      const uniqueCandidate = await this.prisma.user.create({
        data: {
          email: `candidate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@rolevate.temp`,
          username: `candidate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: `${firstName} ${lastName}`,
          firstName,
          lastName,
          password: 'temp-password',
          phoneNumber,
          role: 'CANDIDATE',
        }
      });

      // Create application with candidate info (no user account required)
      const application = await this.prisma.application.create({
        data: {
          jobPostId: jobId,
          candidateId: uniqueCandidate.id,
          status: 'PENDING',
          cvUrl,
          coverLetter,
        },
        include: {
          jobPost: {
            include: {
              company: true,
            },
          },
        },
      });

      // Read CV file for binary data
      const cvContent = readFileSync(cvFilePath);

      // Prepare form data for binary file upload to N8N
      const formData = new FormData();
      
      // Add CV file as binary stream
      formData.append('cvFile', createReadStream(cvFilePath), {
        filename: cvFile.originalname,
        contentType: cvFile.mimetype,
      });
      
      // Add application metadata as JSON
      const applicationData = {
        applicationId: application.id,
        jobTitle: job.title,
        companyName: job.company.displayName || job.company.name,
        candidate: {
          name: `${firstName} ${lastName}`,
          email,
          phoneNumber,
        },
        cvUrl,
        cvMetadata: {
          filename: cvFile.originalname,
          mimetype: cvFile.mimetype,
          size: cvFile.size,
        },
        coverLetter: coverLetter || '',
        appliedAt: application.appliedAt,
        jobId: job.id,
      };
      
      formData.append('applicationData', JSON.stringify(applicationData));

      // Send to N8N webhook with binary CV file
      try {
        await axios.post('https://n8n.widd.ai/webhook-test/rovate2', formData, {
          headers: {
            ...formData.getHeaders(),
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 second timeout
        });
        console.log('Successfully sent CV file to N8N webhook');
      } catch (webhookError) {
        console.error('Failed to send to N8N webhook:', webhookError?.response?.data || webhookError.message);
        // Don't fail the application if webhook fails
      }

      // Update job application count
      await this.prisma.jobPost.update({
        where: { id: jobId },
        data: {
          applicationCount: {
            increment: 1,
          },
        },
      });

      return {
        success: true,
        message: 'Application submitted successfully',
        applicationId: application.id,
        candidate: {
          name: `${firstName} ${lastName}`,
          email,
          phoneNumber,
        },
        job: {
          title: job.title,
          company: job.company.displayName || job.company.name,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      console.error('Failed to create application:', error);
      throw new BadRequestException('Failed to submit application');
    }
  }
}
