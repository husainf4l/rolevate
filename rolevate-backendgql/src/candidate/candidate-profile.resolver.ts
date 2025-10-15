import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { CandidateProfileService } from './candidate-profile.service';
import { CandidateProfile } from './candidate-profile.entity';
import { CreateCandidateProfileInput } from './create-candidate-profile.input';
import { UpdateCandidateProfileInput } from './update-candidate-profile.input';

@Resolver(() => CandidateProfile)
export class CandidateProfileResolver {
  constructor(private readonly candidateProfileService: CandidateProfileService) {}

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
}