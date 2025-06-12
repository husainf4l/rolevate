import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCandidateDto, UpdateCandidateDto, CandidateQueryDto } from './dto/candidate.dto';
import { Candidate, Prisma } from '@prisma/client';

@Injectable()
export class CandidateService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCandidateDto: CreateCandidateDto): Promise<Candidate> {
    // Check if phone number already exists
    const existingCandidate = await this.prisma.candidate.findUnique({
      where: { phoneNumber: createCandidateDto.phoneNumber }
    });

    if (existingCandidate) {
      throw new ConflictException('Phone number already exists');
    }

    return this.prisma.candidate.create({
      data: createCandidateDto,
      include: {
        _count: {
          select: {
            applications: true,
            interviews: true,
            cvAnalyses: true,
          }
        }
      }
    });
  }

  async findAll(query: CandidateQueryDto) {
    const {
      search,
      isActive,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    const skip = (page - 1) * limit;

    const whereConditions: Prisma.CandidateWhereInput[] = [];

    if (isActive !== undefined) {
      whereConditions.push({ isActive });
    }

    if (search) {
      whereConditions.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { phoneNumber: { contains: search } },
        ]
      });
    }

    const where: Prisma.CandidateWhereInput = 
      whereConditions.length > 0 ? { AND: whereConditions } : {};

    const total = await this.prisma.candidate.count({ where });

    const candidates = await this.prisma.candidate.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder
      },
      include: {
        _count: {
          select: {
            applications: true,
            interviews: true,
            cvAnalyses: true,
          }
        }
      }
    });

    return {
      data: candidates,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      }
    };
  }

  async findOne(id: string): Promise<Candidate> {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: {
        applications: {
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
                  }
                }
              }
            },
            cvAnalysis: true,
            fitScore: true,
          },
          orderBy: { appliedAt: 'desc' }
        },
        interviews: {
          include: {
            application: {
              include: {
                jobPost: {
                  select: {
                    id: true,
                    title: true,
                  }
                }
              }
            }
          },
          orderBy: { scheduledAt: 'desc' }
        },
        cvAnalyses: {
          orderBy: { analyzedAt: 'desc' }
        },
        _count: {
          select: {
            applications: true,
            interviews: true,
            cvAnalyses: true,
          }
        }
      }
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return candidate;
  }

  async update(id: string, updateCandidateDto: UpdateCandidateDto): Promise<Candidate> {
    const existingCandidate = await this.prisma.candidate.findUnique({
      where: { id }
    });

    if (!existingCandidate) {
      throw new NotFoundException('Candidate not found');
    }

    return this.prisma.candidate.update({
      where: { id },
      data: updateCandidateDto,
      include: {
        _count: {
          select: {
            applications: true,
            interviews: true,
            cvAnalyses: true,
          }
        }
      }
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    const existingCandidate = await this.prisma.candidate.findUnique({
      where: { id }
    });

    if (!existingCandidate) {
      throw new NotFoundException('Candidate not found');
    }

    // Soft delete
    await this.prisma.candidate.update({
      where: { id },
      data: { isActive: false }
    });

    return { message: 'Candidate deleted successfully' };
  }

  async findByPhone(phoneNumber: string): Promise<Candidate | null> {
    return this.prisma.candidate.findUnique({
      where: { phoneNumber },
      include: {
        _count: {
          select: {
            applications: true,
            interviews: true,
          }
        }
      }
    });
  }

  async getApplications(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id }
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return this.prisma.application.findMany({
      where: { candidateId: id },
      include: {
        jobPost: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                displayName: true,
              }
            }
          }
        },
        cvAnalysis: true,
        fitScore: true,
        interviews: true,
      },
      orderBy: { appliedAt: 'desc' }
    });
  }

  async getInterviews(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id }
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return this.prisma.interview.findMany({
      where: { candidateId: id },
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
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { scheduledAt: 'desc' }
    });
  }
}
