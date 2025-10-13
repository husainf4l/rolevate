import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { NotificationService } from '../notification/notification.service';
import { AwsS3Service } from '../services/aws-s3.service';
import { CvParsingService } from '../services/cv-parsing.service';
import { NotificationType, NotificationCategory } from '../notification/dto/notification.dto';
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
    private notificationService: NotificationService,
    private awsS3Service: AwsS3Service,
    private cvParsingService: CvParsingService,
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

  async uploadCV(userId: string, fileBuffer: Buffer, originalFileName: string, fileSize?: number, mimeType?: string): Promise<CVResponseDto> {
    // First ensure the candidate profile exists
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Candidate profile not found');
    }

    // Upload file to S3
    const s3Url = await this.awsS3Service.uploadCV(fileBuffer, originalFileName, profile.id);

    // Use transaction to ensure only one CV is active
    const cv = await this.prisma.$transaction(async (prisma) => {
      // First, deactivate all existing CVs for this candidate
      await prisma.cV.updateMany({
        where: {
          candidateId: profile.id,
        },
        data: {
          isActive: false,
        },
      });

      // Create new CV record as active
      const newCV = await prisma.cV.create({
        data: {
          fileName: originalFileName,
          originalFileName,
          fileUrl: s3Url,
          fileSize,
          mimeType,
          status: 'UPLOADED',
          isActive: true,
          candidateId: profile.id,
        },
      });

      // Update candidate profile's resumeUrl to the latest CV
      await prisma.candidateProfile.update({
        where: { id: profile.id },
        data: { resumeUrl: s3Url },
      });

      return newCV;
    });

    // Create notification for successful CV upload
    try {
      await this.notificationService.create({
        type: NotificationType.SUCCESS,
        category: NotificationCategory.CANDIDATE,
        title: 'CV Uploaded Successfully',
        message: `Your CV "${originalFileName}" has been uploaded successfully and is now active.`,
        userId: userId,
        metadata: {
          fileName: originalFileName,
          cvId: cv.id,
        },
      });
    } catch (error) {
      console.error('Failed to create CV upload notification:', error);
    }

    // Clear cache for this user's profile
    await this.cacheService.invalidateUserProfile(userId);

    // Trigger CV parsing in the background
    this.processCVInBackground(cv.id, cv.fileUrl, profile.id);

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

  async updateCVStatus(userId: string, cvId: string, status: CVStatus): Promise<CVResponseDto> {
    // First verify the CV belongs to the user
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      include: { cvs: true }
    });

    if (!profile) {
      throw new NotFoundException('Candidate profile not found');
    }

    const cv = profile.cvs.find(cv => cv.id === cvId);
    if (!cv) {
      throw new NotFoundException('CV not found or does not belong to this user');
    }

    // Update the CV status
    const updatedCV = await this.prisma.cV.update({
      where: { id: cvId },
      data: { 
        status,
        processedAt: status === 'PROCESSED' ? new Date() : cv.processedAt
      }
    });

    return {
      id: updatedCV.id,
      fileName: updatedCV.fileName,
      originalFileName: updatedCV.originalFileName,
      fileUrl: updatedCV.fileUrl,
      fileSize: updatedCV.fileSize,
      mimeType: updatedCV.mimeType,
      status: updatedCV.status as CVStatus,
      isActive: updatedCV.isActive,
      candidateId: updatedCV.candidateId,
      uploadedAt: updatedCV.uploadedAt,
      processedAt: updatedCV.processedAt,
      createdAt: updatedCV.createdAt,
      updatedAt: updatedCV.updatedAt,
    };
  }

  async activateCV(userId: string, cvId: string): Promise<CVResponseDto> {
    // First verify the CV belongs to the user
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      include: { cvs: true }
    });

    if (!profile) {
      throw new NotFoundException('Candidate profile not found');
    }

    const cv = profile.cvs.find(cv => cv.id === cvId);
    if (!cv) {
      throw new NotFoundException('CV not found or does not belong to this user');
    }

    // Use a transaction to ensure data consistency
    await this.prisma.$transaction(async (prisma) => {
      // First, deactivate all CVs for this candidate
      await prisma.cV.updateMany({
        where: {
          candidateId: profile.id,
        },
        data: {
          isActive: false,
        },
      });

      // Then activate the selected CV
      await prisma.cV.update({
        where: { id: cvId },
        data: {
          isActive: true,
        },
      });

      // Update the candidate profile's resumeUrl to this CV
      await prisma.candidateProfile.update({
        where: { id: profile.id },
        data: { resumeUrl: cv.fileUrl },
      });
    });

    // Get the updated CV
    const updatedCV = await this.prisma.cV.findUnique({
      where: { id: cvId },
    });

    if (!updatedCV) {
      throw new NotFoundException('CV not found after update');
    }

    // Clear cache for this user's profile
    await this.cacheService.invalidateUserProfile(userId);

    return {
      id: updatedCV.id,
      fileName: updatedCV.fileName,
      originalFileName: updatedCV.originalFileName,
      fileUrl: updatedCV.fileUrl,
      fileSize: updatedCV.fileSize,
      mimeType: updatedCV.mimeType,
      status: updatedCV.status as CVStatus,
      isActive: updatedCV.isActive,
      candidateId: updatedCV.candidateId,
      uploadedAt: updatedCV.uploadedAt,
      processedAt: updatedCV.processedAt,
      createdAt: updatedCV.createdAt,
      updatedAt: updatedCV.updatedAt,
    };
  }

  async saveJob(userId: string, jobId: string): Promise<CandidateProfileResponseDto> {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Candidate profile not found');
    }

    // Check if job is already saved
    const currentSavedJobs = profile.savedJobs || [];
    if (currentSavedJobs.includes(jobId)) {
      throw new ConflictException('Job is already saved');
    }

    // Add job to saved jobs
    const updatedProfile = await this.prisma.candidateProfile.update({
      where: { userId },
      data: {
        savedJobs: [...currentSavedJobs, jobId],
      },
      include: {
        cvs: {
          where: { isActive: true },
          orderBy: { uploadedAt: 'desc' }
        }
      }
    });

    // Clear cache for this user's profile
    await this.cacheService.invalidateUserProfile(userId);

    return this.mapToBasicProfileResponse(updatedProfile);
  }

  async unsaveJob(userId: string, jobId: string): Promise<CandidateProfileResponseDto> {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Candidate profile not found');
    }

    // Check if job is saved
    const currentSavedJobs = profile.savedJobs || [];
    if (!currentSavedJobs.includes(jobId)) {
      throw new NotFoundException('Job is not in saved jobs');
    }

    // Remove job from saved jobs
    const updatedProfile = await this.prisma.candidateProfile.update({
      where: { userId },
      data: {
        savedJobs: currentSavedJobs.filter(id => id !== jobId),
      },
      include: {
        cvs: {
          where: { isActive: true },
          orderBy: { uploadedAt: 'desc' }
        }
      }
    });

    // Clear cache for this user's profile
    await this.cacheService.invalidateUserProfile(userId);

    return this.mapToBasicProfileResponse(updatedProfile);
  }

  async getSavedJobs(userId: string): Promise<string[]> {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      select: { savedJobs: true }
    });

    if (!profile) {
      throw new NotFoundException('Candidate profile not found');
    }

    return profile.savedJobs || [];
  }

  async getSavedJobsDetails(userId: string): Promise<any[]> {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      select: { savedJobs: true }
    });

    if (!profile) {
      throw new NotFoundException('Candidate profile not found');
    }

    const savedJobIds = profile.savedJobs || [];
    
    if (savedJobIds.length === 0) {
      return [];
    }

    // Get full job details for all saved jobs
    const savedJobs = await this.prisma.job.findMany({
      where: {
        id: { in: savedJobIds },
        status: { not: 'DELETED' } // Exclude deleted jobs
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            numberOfEmployees: true,
            address: {
              select: {
                city: true,
                country: true
              }
            }
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Return jobs in the same order as they were saved
    const orderedJobs = savedJobIds
      .map(jobId => savedJobs.find(job => job.id === jobId))
      .filter(job => job !== undefined); // Filter out any jobs that weren't found (deleted, etc.)

    return orderedJobs;
  }

  private async processCVInBackground(cvId: string, cvUrl: string, candidateId: string): Promise<void> {
    try {
      console.log('🔄 Starting background CV processing for CV:', cvId);
      
      // Update CV status to PROCESSING
      await this.prisma.cV.update({
        where: { id: cvId },
        data: { status: 'PROCESSING' },
      });

      // Process CV immediately (remove setTimeout for more reliable processing)
      try {
        console.log('📄 Extracting candidate information from CV...');
        const extractedData = await this.cvParsingService.extractCandidateInfoFromCV(cvUrl);
        
        console.log('✅ CV processing completed, updating records...');
        
        // Update CV record with extracted data
        await this.prisma.cV.update({
          where: { id: cvId },
          data: {
            status: 'PROCESSED',
            extractedData: extractedData as any,
            processedAt: new Date(),
          },
        });

        // Update candidate profile with extracted information
        await this.updateCandidateProfileWithExtractedData(candidateId, extractedData);
        
        console.log('✅ CV processing and profile update completed for CV:', cvId);
        
        // Clear cache after processing
        const profile = await this.prisma.candidateProfile.findUnique({
          where: { id: candidateId },
          select: { userId: true },
        });
        if (profile?.userId) {
          await this.cacheService.invalidateUserProfile(profile.userId);
        }

      } catch (processingError) {
        console.error('❌ CV processing failed:', processingError);
        
        // Update CV status to ERROR
        await this.prisma.cV.update({
          where: { id: cvId },
          data: { 
            status: 'ERROR',
            extractedData: {
              error: processingError.message,
              processedAt: new Date().toISOString()
            } as any
          },
        });
      }
    } catch (error) {
      console.error('❌ Failed to start background CV processing:', error);
    }
  }

  private async updateCandidateProfileWithExtractedData(candidateId: string, extractedData: any): Promise<void> {
    try {
      console.log('🔄 Updating candidate profile with extracted data...');
      
      // Get current profile data
      const existingProfile = await this.prisma.candidateProfile.findUnique({
        where: { id: candidateId },
        select: {
          currentJobTitle: true,
          currentCompany: true,
          totalExperience: true,
          skills: true,
          highestEducation: true,
          fieldOfStudy: true,
          university: true,
          graduationYear: true,
          profileSummary: true,
        },
      });
      
      if (!existingProfile) {
        console.error('❌ Candidate profile not found for update');
        return;
      }
      
      const updateData: any = {};
      
      // Update fields if they are not already set or if extracted data is more complete
      if (extractedData.currentJobTitle && !existingProfile.currentJobTitle) {
        updateData.currentJobTitle = extractedData.currentJobTitle;
      }
      
      if (extractedData.currentCompany && !existingProfile.currentCompany) {
        updateData.currentCompany = extractedData.currentCompany;
      }
      
      if (extractedData.totalExperience !== null && extractedData.totalExperience !== undefined && existingProfile.totalExperience === null) {
        updateData.totalExperience = extractedData.totalExperience;
      }
      
      if (extractedData.skills && extractedData.skills.length > 0) {
        // Merge with existing skills if any
        const existingSkills = existingProfile.skills || [];
        const newSkills = [...new Set([...existingSkills, ...extractedData.skills])];
        // Only update if we have new skills
        if (newSkills.length > existingSkills.length) {
          updateData.skills = newSkills;
        }
      }
      
      // Handle education - parse into enum and details
      if (extractedData.education && !existingProfile.highestEducation) {
        const educationData = this.parseEducation(extractedData.education);
        if (educationData.level) {
          updateData.highestEducation = educationData.level;
        }
        if (educationData.fieldOfStudy && !existingProfile.fieldOfStudy) {
          updateData.fieldOfStudy = educationData.fieldOfStudy;
        }
        if (educationData.university && !existingProfile.university) {
          updateData.university = educationData.university;
        }
        if (educationData.graduationYear && !existingProfile.graduationYear) {
          updateData.graduationYear = educationData.graduationYear;
        }
      }
      
      if (extractedData.summary && !existingProfile.profileSummary) {
        updateData.profileSummary = extractedData.summary;
      }
      
      // Only update if there are fields to update
      if (Object.keys(updateData).length > 0) {
        await this.prisma.candidateProfile.update({
          where: { id: candidateId },
          data: updateData,
        });
        
        console.log('✅ Candidate profile updated with extracted data:', updateData);
      } else {
        console.log('ℹ️ No profile updates needed - all fields already populated');
      }
      
    } catch (error) {
      console.error('❌ Failed to update candidate profile with extracted data:', error);
      throw error;
    }
  }

  /**
   * Parse education string into structured data with enum level
   */
  private parseEducation(educationString: string): {
    level?: 'HIGH_SCHOOL' | 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'PHD' | 'PROFESSIONAL_CERTIFICATION';
    fieldOfStudy?: string;
    university?: string;
    graduationYear?: number;
  } {
    const result: any = {};
    
    if (!educationString || typeof educationString !== 'string') {
      return result;
    }
    
    const text = educationString.toLowerCase();
    
    // Determine education level
    if (text.includes('phd') || text.includes('ph.d') || text.includes('doctorate')) {
      result.level = 'PHD';
    } else if (text.includes('master') || text.includes('mba') || text.includes('msc') || text.includes('m.s') || text.includes('ma')) {
      result.level = 'MASTER';
    } else if (text.includes('bachelor') || text.includes('bba') || text.includes('bsc') || text.includes('b.s') || text.includes('ba') || text.includes('degree')) {
      result.level = 'BACHELOR';
    } else if (text.includes('diploma') || text.includes('associate')) {
      result.level = 'DIPLOMA';
    } else if (text.includes('high school') || text.includes('secondary')) {
      result.level = 'HIGH_SCHOOL';
    } else if (text.includes('certificate') || text.includes('certification')) {
      result.level = 'PROFESSIONAL_CERTIFICATION';
    } else {
      // Default to BACHELOR if it mentions a degree
      result.level = 'BACHELOR';
    }
    
    // Extract field of study (text between "in" and "from" or university name)
    const fieldMatch = educationString.match(/in ([^(from)]+?)(?:from|at|\(|\d{4}|$)/i);
    if (fieldMatch && fieldMatch[1]) {
      result.fieldOfStudy = fieldMatch[1].trim();
    }
    
    // Extract university name (text after "from" or "at")
    const uniMatch = educationString.match(/(?:from|at) ([^(]+?)(?:\(|\d{4}|$)/i);
    if (uniMatch && uniMatch[1]) {
      result.university = uniMatch[1].trim();
    }
    
    // Extract graduation year (4-digit number)
    const yearMatch = educationString.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      const year = parseInt(yearMatch[0]);
      if (year >= 1950 && year <= 2030) {
        result.graduationYear = year;
      }
    }
    
    return result;
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
      highestEducation: profile.highestEducation,
      fieldOfStudy: profile.fieldOfStudy,
      university: profile.university,
      graduationYear: profile.graduationYear,
      skills: profile.skills || [],
      preferredJobTypes: profile.preferredJobTypes || [],
      preferredWorkType: profile.preferredWorkType,
      preferredIndustries: profile.preferredIndustries || [],
      preferredLocations: profile.preferredLocations || [],
      savedJobs: profile.savedJobs || [],
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
