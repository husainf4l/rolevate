import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import * as fs from 'fs-extra';
import {
  CreateBasicCandidateProfileDto,
  CandidateProfileResponseDto,
  CVResponseDto,
  CVStatus
} from './dto/candidate.dto';

@Injectable()
export class CandidateService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async createBasicProfile(createBasicDto: CreateBasicCandidateProfileDto, userId?: string): Promise<CandidateProfileResponseDto> {
    // Check if candidate profile with this email already exists
    const existingProfile = await this.prisma.candidateProfile.findUnique({
      where: { email: createBasicDto.email },
    });

    if (existingProfile) {
      throw new ConflictException('A candidate profile with this email already exists');
    }

    // If userId is provided, check if user already has a candidate profile
    if (userId) {
      const existingUserProfile = await this.prisma.candidateProfile.findUnique({
        where: { userId },
      });

      if (existingUserProfile) {
        throw new ConflictException('User already has a candidate profile');
      }
    }

    // Create candidate profile
    const profile = await this.prisma.candidateProfile.create({
      data: {
        firstName: createBasicDto.firstName,
        lastName: createBasicDto.lastName,
        email: createBasicDto.email,
        phone: createBasicDto.phone,
        currentLocation: createBasicDto.currentLocation,
        isOpenToWork: createBasicDto.isOpenToWork ?? true,
        isProfilePublic: true,
        resumeUrl: createBasicDto.cvUrl, // Store CV URL in resumeUrl field
        userId,
      },
    });

    return this.mapToBasicProfileResponse(profile);
  }

  async findProfileByUserId(userId: string): Promise<CandidateProfileResponseDto | null> {
    console.log('=== findProfileByUserId called ===');
    console.log('userId parameter:', userId);
    
    try {
      const profile = await this.prisma.candidateProfile.findUnique({
        where: { userId },
        include: {
          cvs: {
            where: { isActive: true },
            orderBy: {
              uploadedAt: 'desc'
            }
          }
        }
      });
      
      console.log('📋 Database query result:', profile);
      
      if (profile) {
        const mappedProfile = this.mapToBasicProfileResponse(profile);
        console.log('✅ Mapped profile response:', mappedProfile);
        return mappedProfile;
      } else {
        console.log('❌ No profile found for userId:', userId);
        return null;
      }
    } catch (error) {
      console.error('❌ Error in findProfileByUserId:', error);
      throw error;
    }
  }

  async updateCVUrl(userId: string, cvUrl: string): Promise<CandidateProfileResponseDto> {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Candidate profile not found');
    }

    const updatedProfile = await this.prisma.candidateProfile.update({
      where: { userId },
      data: { resumeUrl: cvUrl },
    });

    return this.mapToBasicProfileResponse(updatedProfile);
  }

  async uploadCV(userId: string, fileName: string, originalFileName: string, fileSize?: number, mimeType?: string): Promise<CVResponseDto> {
    // First ensure the candidate profile exists
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Candidate profile not found');
    }

    // Generate the public URL for the CV
    const appDomain = process.env.APP_DOMAIN || 'http://localhost:4005';
    const publicUrl = `${appDomain}/api/uploads/cvs/${userId}/${fileName}`;

    // Create CV record in database
    const cv = await this.prisma.cV.create({
      data: {
        fileName,
        originalFileName,
        fileUrl: publicUrl,
        fileSize,
        mimeType,
        status: 'UPLOADED',
        isActive: true,
        candidateId: profile.id,
      },
    });

    // Update candidate profile's resumeUrl to the latest CV
    await this.prisma.candidateProfile.update({
      where: { id: profile.id },
      data: { resumeUrl: publicUrl },
    });

    // Clear cache for this user's profile
    await this.cacheService.invalidateUserProfile(userId);

    return {
      id: cv.id,
      fileName: cv.fileName,
      originalFileName: cv.originalFileName,
      fileUrl: cv.fileUrl,
      fileSize: cv.fileSize,
      mimeType: cv.mimeType,
      status: cv.status as CVStatus,
      isActive: cv.isActive,
      candidateId: cv.candidateId,
      uploadedAt: cv.uploadedAt,
      processedAt: cv.processedAt,
      createdAt: cv.createdAt,
      updatedAt: cv.updatedAt,
    };
  }

  async deleteCV(userId: string, cvId: string): Promise<void> {
    // First ensure the candidate profile exists
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      include: { 
        cvs: {
          where: { id: cvId }
        }
      },
    });

    if (!profile) {
      throw new NotFoundException('Candidate profile not found');
    }

    // Find the CV to delete
    const cv = profile.cvs[0];
    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    // Delete the file from filesystem
    try {
      const filePath = `./uploads/cvs/${userId}/${cv.fileName}`;
      await fs.remove(filePath);
    } catch (error) {
      console.warn('Could not delete file from filesystem:', error.message);
    }

    // Delete CV record from database
    await this.prisma.cV.delete({
      where: { id: cvId },
    });

    // If this was the current resumeUrl, update it to the most recent remaining CV
    if (profile.resumeUrl === cv.fileUrl) {
      const remainingCVs = await this.prisma.cV.findMany({
        where: {
          candidateId: profile.id,
          isActive: true,
        },
        orderBy: { uploadedAt: 'desc' },
        take: 1,
      });

      const newResumeUrl = remainingCVs.length > 0 ? remainingCVs[0].fileUrl : null;
      
      await this.prisma.candidateProfile.update({
        where: { id: profile.id },
        data: { resumeUrl: newResumeUrl },
      });
    }

    // Clear cache for this user's profile
    await this.cacheService.invalidateUserProfile(userId);
  }

  async getCVs(userId: string): Promise<CVResponseDto[]> {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        cvs: {
          where: { isActive: true },
          orderBy: { uploadedAt: 'desc' },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Candidate profile not found');
    }

    return profile.cvs.map(cv => ({
      id: cv.id,
      fileName: cv.fileName,
      originalFileName: cv.originalFileName,
      fileUrl: cv.fileUrl,
      fileSize: cv.fileSize,
      mimeType: cv.mimeType,
      status: cv.status as CVStatus,
      isActive: cv.isActive,
      candidateId: cv.candidateId,
      uploadedAt: cv.uploadedAt,
      processedAt: cv.processedAt,
      createdAt: cv.createdAt,
      updatedAt: cv.updatedAt,
    }));
  }

  private mapToBasicProfileResponse(profile: any): CandidateProfileResponseDto {
    return {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      dateOfBirth: profile.dateOfBirth,
      nationality: profile.nationality,
      currentLocation: profile.currentLocation,
      currentJobTitle: profile.currentJobTitle,
      currentCompany: profile.currentCompany,
      experienceLevel: profile.experienceLevel,
      totalExperience: profile.totalExperience,
      expectedSalary: profile.expectedSalary,
      noticePeriod: profile.noticePeriod,
      savedJobs: profile.savedJobs || [],
      highestEducation: profile.highestEducation,
      fieldOfStudy: profile.fieldOfStudy,
      university: profile.university,
      graduationYear: profile.graduationYear,
      skills: profile.skills || [],
      preferredJobTypes: profile.preferredJobTypes || [],
      preferredWorkType: profile.preferredWorkType,
      preferredIndustries: profile.preferredIndustries || [],
      preferredLocations: profile.preferredLocations || [],
      resumeUrl: profile.resumeUrl,
      portfolioUrl: profile.portfolioUrl,
      linkedInUrl: profile.linkedInUrl,
      githubUrl: profile.githubUrl,
      isProfilePublic: profile.isProfilePublic,
      isOpenToWork: profile.isOpenToWork,
      profileSummary: profile.profileSummary,
      userId: profile.userId,
      cvs: profile.cvs ? profile.cvs.map((cv: any) => ({
        id: cv.id,
        fileName: cv.fileName,
        originalFileName: cv.originalFileName,
        fileUrl: cv.fileUrl,
        fileSize: cv.fileSize,
        mimeType: cv.mimeType,
        status: cv.status as CVStatus,
        isActive: cv.isActive,
        candidateId: cv.candidateId,
        uploadedAt: cv.uploadedAt,
        processedAt: cv.processedAt,
        createdAt: cv.createdAt,
        updatedAt: cv.updatedAt,
      })) : [],
      applications: [], // Empty for now
      workExperiences: [], // Empty for now
      educationHistory: [], // Empty for now
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
