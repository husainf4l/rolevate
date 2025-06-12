import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCvAnalysisDto, UpdateCvAnalysisDto, CvAnalysisQueryDto } from './dto/cv-analysis.dto';
import { CvAnalysis, Prisma } from '@prisma/client';

@Injectable()
export class CvAnalysisService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCvAnalysisDto: CreateCvAnalysisDto): Promise<CvAnalysis> {
    // Verify candidate exists
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: createCvAnalysisDto.candidateId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    // Verify application exists
    const application = await this.prisma.application.findUnique({
      where: { id: createCvAnalysisDto.applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Verify the application belongs to the candidate
    if (application.candidateId !== createCvAnalysisDto.candidateId) {
      throw new ForbiddenException('Application does not belong to the candidate');
    }

    return this.prisma.cvAnalysis.create({
      data: {
        cvUrl: createCvAnalysisDto.cvUrl,
        extractedText: createCvAnalysisDto.extractedText,
        overallScore: createCvAnalysisDto.overallScore,
        skillsScore: createCvAnalysisDto.skillsScore,
        experienceScore: createCvAnalysisDto.experienceScore,
        educationScore: createCvAnalysisDto.educationScore,
        languageScore: createCvAnalysisDto.languageScore,
        certificationScore: createCvAnalysisDto.certificationScore,
        summary: createCvAnalysisDto.summary,
        strengths: createCvAnalysisDto.strengths || [],
        weaknesses: createCvAnalysisDto.weaknesses || [],
        suggestedImprovements: createCvAnalysisDto.suggestedImprovements || [],
        skills: createCvAnalysisDto.skills || [],
        experience: createCvAnalysisDto.experience,
        education: createCvAnalysisDto.education,
        certifications: createCvAnalysisDto.certifications || [],
        languages: createCvAnalysisDto.languages,
        aiModel: createCvAnalysisDto.aiModel,
        processingTime: createCvAnalysisDto.processingTime,
        candidateId: createCvAnalysisDto.candidateId,
        applicationId: createCvAnalysisDto.applicationId,
      },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
        application: {
          include: {
            jobPost: {
              select: {
                id: true,
                title: true,
                company: {
                  select: {
                    id: true,
                    name: true,
                    displayName: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findAll(query: CvAnalysisQueryDto) {
    const {
      search,
      candidateId,
      applicationId,
      minScore,
      maxScore,
      page = 1,
      limit = 10,
      sortBy = 'analyzedAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const whereConditions: Prisma.CvAnalysisWhereInput[] = [];

    if (candidateId) {
      whereConditions.push({ candidateId });
    }

    if (applicationId) {
      whereConditions.push({ applicationId });
    }

    if (minScore !== undefined) {
      whereConditions.push({ overallScore: { gte: minScore } });
    }

    if (maxScore !== undefined) {
      whereConditions.push({ overallScore: { lte: maxScore } });
    }

    if (search) {
      whereConditions.push({
        OR: [
          { extractedText: { contains: search, mode: 'insensitive' } },
          { summary: { contains: search, mode: 'insensitive' } },
          { skills: { has: search } },
          { certifications: { has: search } },
          {
            candidate: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        ],
      });
    }

    const where: Prisma.CvAnalysisWhereInput =
      whereConditions.length > 0 ? { AND: whereConditions } : {};

    const total = await this.prisma.cvAnalysis.count({ where });

    const cvAnalyses = await this.prisma.cvAnalysis.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            profileImage: true,
          },
        },
        application: {
          include: {
            jobPost: {
              select: {
                id: true,
                title: true,
                company: {
                  select: {
                    id: true,
                    name: true,
                    displayName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      data: cvAnalyses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async findByCompany(companyId: string, query: CvAnalysisQueryDto) {
    const {
      search,
      candidateId,
      applicationId,
      minScore,
      maxScore,
      page = 1,
      limit = 10,
      sortBy = 'analyzedAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const whereConditions: Prisma.CvAnalysisWhereInput[] = [
      {
        application: {
          jobPost: {
            companyId,
          },
        },
      },
    ];

    if (candidateId) {
      whereConditions.push({ candidateId });
    }

    if (applicationId) {
      whereConditions.push({ applicationId });
    }

    if (minScore !== undefined) {
      whereConditions.push({ overallScore: { gte: minScore } });
    }

    if (maxScore !== undefined) {
      whereConditions.push({ overallScore: { lte: maxScore } });
    }

    if (search) {
      whereConditions.push({
        OR: [
          { extractedText: { contains: search, mode: 'insensitive' } },
          { summary: { contains: search, mode: 'insensitive' } },
          { skills: { has: search } },
          { certifications: { has: search } },
          {
            candidate: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        ],
      });
    }

    const where: Prisma.CvAnalysisWhereInput = { AND: whereConditions };

    const total = await this.prisma.cvAnalysis.count({ where });

    const cvAnalyses = await this.prisma.cvAnalysis.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            profileImage: true,
          },
        },
        application: {
          include: {
            jobPost: {
              select: {
                id: true,
                title: true,
                company: {
                  select: {
                    id: true,
                    name: true,
                    displayName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      data: cvAnalyses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<CvAnalysis> {
    const cvAnalysis = await this.prisma.cvAnalysis.findUnique({
      where: { id },
      include: {
        candidate: {
          include: {
            _count: {
              select: {
                applications: true,
                interviews: true,
                cvAnalyses: true,
              },
            },
          },
        },
        application: {
          include: {
            jobPost: {
              include: {
                company: {
                  select: {
                    id: true,
                    name: true,
                    displayName: true,
                    industry: true,
                    location: true,
                    logo: true,
                  },
                },
              },
            },
            interviews: {
              orderBy: { scheduledAt: 'desc' },
            },
          },
        },
      },
    });

    if (!cvAnalysis) {
      throw new NotFoundException('CV Analysis not found');
    }

    return cvAnalysis;
  }

  async update(id: string, updateCvAnalysisDto: UpdateCvAnalysisDto, companyId?: string): Promise<CvAnalysis> {
    const existingCvAnalysis = await this.prisma.cvAnalysis.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            jobPost: true,
          },
        },
      },
    });

    if (!existingCvAnalysis) {
      throw new NotFoundException('CV Analysis not found');
    }

    // If companyId is provided, verify the CV analysis belongs to the company
    if (companyId && existingCvAnalysis.application?.jobPost.companyId !== companyId) {
      throw new ForbiddenException('Access denied to this CV analysis');
    }

    return this.prisma.cvAnalysis.update({
      where: { id },
      data: updateCvAnalysisDto,
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
        application: {
          include: {
            jobPost: {
              select: {
                id: true,
                title: true,
                company: {
                  select: {
                    id: true,
                    name: true,
                    displayName: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string, companyId?: string): Promise<{ message: string }> {
    const existingCvAnalysis = await this.prisma.cvAnalysis.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            jobPost: true,
          },
        },
      },
    });

    if (!existingCvAnalysis) {
      throw new NotFoundException('CV Analysis not found');
    }

    // If companyId is provided, verify the CV analysis belongs to the company
    if (companyId && existingCvAnalysis.application?.jobPost.companyId !== companyId) {
      throw new ForbiddenException('Access denied to this CV analysis');
    }

    await this.prisma.cvAnalysis.delete({
      where: { id },
    });

    return { message: 'CV Analysis deleted successfully' };
  }

  async getAnalysesByCandidate(candidateId: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return this.prisma.cvAnalysis.findMany({
      where: { candidateId },
      include: {
        application: {
          include: {
            jobPost: {
              select: {
                id: true,
                title: true,
                company: {
                  select: {
                    id: true,
                    name: true,
                    displayName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { analyzedAt: 'desc' },
    });
  }

  async getAnalysesByApplication(applicationId: string, companyId?: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        jobPost: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // If companyId is provided, verify the application belongs to the company
    if (companyId && application.jobPost.companyId !== companyId) {
      throw new ForbiddenException('Access denied to this application');
    }

    return this.prisma.cvAnalysis.findMany({
      where: { applicationId },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            profileImage: true,
          },
        },
      },
      orderBy: { analyzedAt: 'desc' },
    });
  }
}
