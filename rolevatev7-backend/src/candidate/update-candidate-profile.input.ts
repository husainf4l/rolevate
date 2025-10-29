import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateCandidateProfileInput } from './create-candidate-profile.input';
import { AvailabilityStatus } from './candidate-profile.entity';
import { WorkType } from '../job/job.entity';

@InputType()
export class UpdateCandidateProfileInput extends PartialType(CreateCandidateProfileInput) {
  @Field(() => AvailabilityStatus, { nullable: true })
  availability?: AvailabilityStatus;

  @Field(() => WorkType, { nullable: true })
  preferredWorkType?: WorkType;
}