import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CandidateProfile } from './candidate-profile.entity';
import { CreateCandidateProfileInput } from './create-candidate-profile.input';
import { UpdateCandidateProfileInput } from './update-candidate-profile.input';

@Injectable()
export class CandidateProfileService {
  constructor(
    @InjectRepository(CandidateProfile)
    private candidateProfileRepository: Repository<CandidateProfile>,
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
    return this.findOne(id);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.candidateProfileRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}