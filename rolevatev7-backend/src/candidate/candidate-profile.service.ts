import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CandidateProfile } from './candidate-profile.entity';
import { CV } from './cv.entity';
import { CreateCandidateProfileInput } from './create-candidate-profile.input';
import { UpdateCandidateProfileInput } from './update-candidate-profile.input';

@Injectable()
export class CandidateProfileService {
  constructor(
    @InjectRepository(CandidateProfile)
    private candidateProfileRepository: Repository<CandidateProfile>,
    @InjectRepository(CV)
    private cvRepository: Repository<CV>,
  ) {}

  async create(createCandidateProfileInput: CreateCandidateProfileInput): Promise<CandidateProfile> {
    const candidateProfile = this.candidateProfileRepository.create({
      ...createCandidateProfileInput,
      skills: createCandidateProfileInput.skills || [],
    });
    return this.candidateProfileRepository.save(candidateProfile);
  }

  async findAll(): Promise<CandidateProfile[]> {
    return this.candidateProfileRepository.find({
      relations: ['user', 'workExperiences', 'educations', 'cvs'],
    });
  }

  async findOne(id: string): Promise<CandidateProfile | null> {
    return this.candidateProfileRepository.findOne({
      where: { id },
      relations: ['user', 'workExperiences', 'educations', 'cvs'],
    });
  }

  async findByUserId(userId: string): Promise<CandidateProfile | null> {
    return this.candidateProfileRepository.findOne({
      where: { userId },
      relations: ['user', 'workExperiences', 'educations', 'cvs'],
    });
  }

  async update(id: string, updateCandidateProfileInput: UpdateCandidateProfileInput): Promise<CandidateProfile | null> {
    await this.candidateProfileRepository.update(id, updateCandidateProfileInput);
    
    // If resumeUrl is being set, create a CV record
    if (updateCandidateProfileInput.resumeUrl) {
      try {
        // Check if a CV record already exists for this resume URL
        const existingCV = await this.cvRepository.findOne({
          where: {
            candidateProfileId: id,
            fileUrl: updateCandidateProfileInput.resumeUrl,
          },
        });

        if (!existingCV) {
          // Extract filename from URL
          const urlParts = updateCandidateProfileInput.resumeUrl.split('/');
          const fileName = urlParts[urlParts.length - 1] || 'resume.pdf';

          // Create CV record
          const cv = this.cvRepository.create({
            candidateProfileId: id,
            fileName: fileName,
            fileUrl: updateCandidateProfileInput.resumeUrl,
            isPrimary: false, // User can activate it later
          });
          await this.cvRepository.save(cv);
        }
      } catch (error) {
        console.error(`Failed to create CV record for profile ${id}:`, error);
        // Don't throw - profile update was successful, CV record creation is secondary
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.candidateProfileRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}