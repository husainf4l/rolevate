import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AwsS3Service } from '../services/aws-s3.service';
import { CvParsingService } from '../services/cv-parsing.service';
import { AvailableCandidateResponseDto, JobMatchResponseDto } from './dto/jobfit.dto';

@Injectable()
export class JobFitService {
  constructor(
    private prisma: PrismaService,
    private awsS3Service: AwsS3Service,
    private cvParsingService: CvParsingService,
  ) {}

  async uploadAndAnalyzeCV(
    file: Express.Multer.File
  ): Promise<AvailableCandidateResponseDto> {
    console.log('🎯 Processing JobFit CV upload and analysis...');

    // Step 1: Upload CV to S3
    console.log('☁️ Uploading CV to S3...');
    const s3Url = await this.awsS3Service.uploadFile(file.buffer, file.originalname, 'jobfit-cvs');
    console.log('✅ CV uploaded to S3:', s3Url);

    // Step 2: Extract CV information using AI
    console.log('🤖 Analyzing CV with AI...');
    const cvAnalysis = await this.cvParsingService.extractCandidateInfoFromCV(s3Url);
    
    // Step 3: Use all data from CV analysis
    const candidateInfo = {
      firstName: cvAnalysis.firstName || 'Unknown',
      lastName: cvAnalysis.lastName || 'Candidate',
      email: cvAnalysis.email || null,
      phone: cvAnalysis.phone || null,
      currentJobTitle: cvAnalysis.currentJobTitle || 'Not specified',
      currentCompany: cvAnalysis.currentCompany || 'Not specified',
      totalExperience: cvAnalysis.totalExperience || 0,
      skills: cvAnalysis.skills || [],
      education: cvAnalysis.education || 'Not specified',
      location: 'Not specified', // Will be extracted from CV text if available
      expectedSalary: 'Not specified',
      profileSummary: cvAnalysis.summary || 'No summary available',
    };

    // Step 4: Generate AI analysis for job matching
    const aiAnalysis = await this.generateJobFitAnalysis(candidateInfo, cvAnalysis);

    // Step 5: Check if candidate already exists (by email)
    let existingCandidate: any = null;
    if (candidateInfo.email) {
      existingCandidate = await this.prisma.availableCandidate.findUnique({
        where: { email: candidateInfo.email }
      });
    }

    // Step 6: Create or update available candidate
    let availableCandidate;
    if (existingCandidate) {
      console.log('📝 Updating existing candidate...');
      availableCandidate = await this.prisma.availableCandidate.update({
        where: { id: existingCandidate.id },
        data: {
          firstName: candidateInfo.firstName,
          lastName: candidateInfo.lastName,
          phone: candidateInfo.phone,
          cvUrl: s3Url,
          cvFileName: file.originalname,
          currentJobTitle: candidateInfo.currentJobTitle,
          currentCompany: candidateInfo.currentCompany,
          totalExperience: candidateInfo.totalExperience,
          skills: candidateInfo.skills,
          education: candidateInfo.education,
          location: candidateInfo.location,
          expectedSalary: candidateInfo.expectedSalary,
          profileSummary: candidateInfo.profileSummary,
          keyStrengths: aiAnalysis.keyStrengths,
          industryExperience: aiAnalysis.industryExperience,
          isActive: true,
          isOpenToWork: true,
        },
      });
    } else {
      console.log('🆕 Creating new available candidate...');
      availableCandidate = await this.prisma.availableCandidate.create({
        data: {
          firstName: candidateInfo.firstName,
          lastName: candidateInfo.lastName,
          email: candidateInfo.email,
          phone: candidateInfo.phone,
          cvUrl: s3Url,
          cvFileName: file.originalname,
          currentJobTitle: candidateInfo.currentJobTitle,
          currentCompany: candidateInfo.currentCompany,
          totalExperience: candidateInfo.totalExperience,
          skills: candidateInfo.skills,
          education: candidateInfo.education,
          location: candidateInfo.location,
          expectedSalary: candidateInfo.expectedSalary,
          profileSummary: candidateInfo.profileSummary,
          keyStrengths: aiAnalysis.keyStrengths,
          industryExperience: aiAnalysis.industryExperience,
          isActive: true,
          isOpenToWork: true,
        },
      });
    }

    console.log('✅ JobFit analysis completed for:', candidateInfo.firstName, candidateInfo.lastName);

    return this.mapToResponseDto(availableCandidate);
  }

  async findCandidatesForJob(filters?: {
    skills?: string[];
    experienceRange?: { min: number; max: number };
    location?: string;
    jobTitle?: string;
    page?: number;
    limit?: number;
  }): Promise<JobMatchResponseDto> {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100); // Max 100 candidates per request
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true,
      isOpenToWork: true,
    };

    if (filters?.skills && filters.skills.length > 0) {
      where.skills = {
        hasSome: filters.skills,
      };
    }

    if (filters?.experienceRange) {
      where.totalExperience = {
        gte: filters.experienceRange.min,
        lte: filters.experienceRange.max,
      };
    }

    if (filters?.location) {
      where.location = {
        contains: filters.location,
        mode: 'insensitive',
      };
    }

    if (filters?.jobTitle) {
      where.currentJobTitle = {
        contains: filters.jobTitle,
        mode: 'insensitive',
      };
    }

    // Get candidates and total count
    const [candidates, totalCount] = await Promise.all([
      this.prisma.availableCandidate.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { totalExperience: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      this.prisma.availableCandidate.count({ where }),
    ]);

    return {
      candidates: candidates.map(candidate => this.mapToResponseDto(candidate)),
      totalCount,
      page,
      limit,
      filters,
    };
  }

  async getAllAvailableCandidates(page = 1, limit = 20): Promise<JobMatchResponseDto> {
    return this.findCandidatesForJob({ page, limit });
  }

  async getCandidateById(id: string): Promise<AvailableCandidateResponseDto | null> {
    const candidate = await this.prisma.availableCandidate.findUnique({
      where: { id },
    });

    return candidate ? this.mapToResponseDto(candidate) : null;
  }

  async deactivateCandidate(id: string): Promise<void> {
    await this.prisma.availableCandidate.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private async generateJobFitAnalysis(candidateInfo: any, _cvAnalysis: any): Promise<{
    keyStrengths: string[];
    industryExperience: string[];
  }> {
    // Extract key strengths from skills and experience
    const keyStrengths: string[] = [];
    
    // Add top skills as strengths
    if (candidateInfo.skills && candidateInfo.skills.length > 0) {
      keyStrengths.push(...candidateInfo.skills.slice(0, 5)); // Top 5 skills
    }
    
    // Add experience level as strength
    if (candidateInfo.totalExperience) {
      if (candidateInfo.totalExperience >= 10) {
        keyStrengths.push('Senior Professional');
      } else if (candidateInfo.totalExperience >= 5) {
        keyStrengths.push('Mid-Level Professional');
      } else if (candidateInfo.totalExperience >= 2) {
        keyStrengths.push('Junior Professional');
      } else {
        keyStrengths.push('Entry Level');
      }
    }

    // Add current position as strength
    if (candidateInfo.currentJobTitle) {
      keyStrengths.push(candidateInfo.currentJobTitle);
    }

    // Extract industry experience (simplified)
    const industryExperience: string[] = [];
    
    // Based on current company and job title, infer industries
    const title = candidateInfo.currentJobTitle?.toLowerCase() || '';
    const _company = candidateInfo.currentCompany?.toLowerCase() || '';
    
    if (title.includes('software') || title.includes('developer') || title.includes('engineer')) {
      industryExperience.push('Technology');
    }
    if (title.includes('data') || title.includes('analyst')) {
      industryExperience.push('Data Analytics');
    }
    if (title.includes('product') || title.includes('manager')) {
      industryExperience.push('Product Management');
    }
    if (title.includes('marketing') || title.includes('digital')) {
      industryExperience.push('Marketing');
    }
    if (title.includes('sales') || title.includes('business')) {
      industryExperience.push('Sales & Business Development');
    }
    if (title.includes('finance') || title.includes('accounting')) {
      industryExperience.push('Finance');
    }
    if (title.includes('hr') || title.includes('human')) {
      industryExperience.push('Human Resources');
    }

    // If no specific industry found, add general
    if (industryExperience.length === 0) {
      industryExperience.push('General Business');
    }

    return {
      keyStrengths: [...new Set(keyStrengths)], // Remove duplicates
      industryExperience: [...new Set(industryExperience)], // Remove duplicates
    };
  }

  private mapToResponseDto(candidate: any): AvailableCandidateResponseDto {
    return {
      id: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      phone: candidate.phone,
      cvUrl: candidate.cvUrl,
      cvFileName: candidate.cvFileName,
      currentJobTitle: candidate.currentJobTitle,
      currentCompany: candidate.currentCompany,
      totalExperience: candidate.totalExperience,
      skills: candidate.skills || [],
      education: candidate.education,
      location: candidate.location,
      expectedSalary: candidate.expectedSalary,
      profileSummary: candidate.profileSummary,
      keyStrengths: candidate.keyStrengths || [],
      industryExperience: candidate.industryExperience || [],
      isActive: candidate.isActive,
      isOpenToWork: candidate.isOpenToWork,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
    };
  }
}
