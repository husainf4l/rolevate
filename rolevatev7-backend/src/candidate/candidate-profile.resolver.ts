import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CandidateProfileService } from './candidate-profile.service';
import { CandidateProfile } from './candidate-profile.entity';
import { CreateCandidateProfileInput } from './create-candidate-profile.input';
import { UpdateCandidateProfileInput } from './update-candidate-profile.input';
import { CV } from './cv.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Resolver(() => CandidateProfile)
export class CandidateProfileResolver {
  constructor(
    private readonly candidateProfileService: CandidateProfileService,
    @InjectRepository(CV)
    private cvRepository: Repository<CV>,
  ) {}

  @Mutation(() => CandidateProfile)
  async createCandidateProfile(@Args('input') createCandidateProfileInput: CreateCandidateProfileInput): Promise<CandidateProfile> {
    return this.candidateProfileService.create(createCandidateProfileInput);
  }

  @Query(() => [CandidateProfile], { name: 'candidateProfiles' })
  async findAll(): Promise<CandidateProfile[]> {
    return this.candidateProfileService.findAll();
  }

  @Query(() => CandidateProfile, { name: 'candidateProfile', nullable: true })
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<CandidateProfile | null> {
    return this.candidateProfileService.findOne(id);
  }

  @Query(() => CandidateProfile, { name: 'candidateProfileByUser', nullable: true })
  async findByUserId(@Args('userId', { type: () => ID }) userId: string): Promise<CandidateProfile | null> {
    return this.candidateProfileService.findByUserId(userId);
  }

  @Mutation(() => CandidateProfile, { nullable: true })
  async updateCandidateProfile(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateCandidateProfileInput: UpdateCandidateProfileInput,
  ): Promise<CandidateProfile | null> {
    return this.candidateProfileService.update(id, updateCandidateProfileInput);
  }

    @Mutation(() => Boolean)
  async removeCandidateProfile(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.candidateProfileService.remove(id);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteCV(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.req?.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Find the CV
    const cv = await this.cvRepository.findOne({
      where: { id },
      relations: ['candidateProfile'],
    });

    if (!cv) {
      throw new Error('CV not found');
    }

    // Verify that the CV belongs to the user
    const candidateProfile = await this.candidateProfileService.findByUserId(userId);
    if (!candidateProfile || cv.candidateProfileId !== candidateProfile.id) {
      throw new Error('Unauthorized: You do not own this CV');
    }

    // Delete the CV
    await this.cvRepository.remove(cv);
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async activateCV(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.req?.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Find the CV
    const cv = await this.cvRepository.findOne({
      where: { id },
      relations: ['candidateProfile'],
    });

    if (!cv) {
      throw new Error('CV not found');
    }

    // Verify that the CV belongs to the user
    const candidateProfile = await this.candidateProfileService.findByUserId(userId);
    if (!candidateProfile || cv.candidateProfileId !== candidateProfile.id) {
      throw new Error('Unauthorized: You do not own this CV');
    }

    // Deactivate all CVs for this candidate profile
    await this.cvRepository.update(
      { candidateProfileId: candidateProfile.id },
      { isPrimary: false },
    );

    // Activate the selected CV
    await this.cvRepository.update({ id }, { isPrimary: true });
    return true;
  }
}
