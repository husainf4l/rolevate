import { ObjectType, Field, ID } from '@nestjs/graphql';
import { AvailabilityStatus } from './candidate-profile.entity';
import { WorkType } from '../job/job.entity';

@ObjectType()
export class CandidateProfileDto {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field(() => [String])
  skills: string[];

  @Field({ nullable: true })
  experience?: string;

  @Field({ nullable: true })
  education?: string;

  @Field({ nullable: true })
  linkedinUrl?: string;

  @Field({ nullable: true })
  githubUrl?: string;

  @Field({ nullable: true })
  portfolioUrl?: string;

  @Field({ nullable: true })
  resumeUrl?: string;

  @Field(() => AvailabilityStatus, { nullable: true })
  availability?: AvailabilityStatus;

  @Field({ nullable: true })
  salaryExpectation?: string;

  @Field(() => WorkType, { nullable: true })
  preferredWorkType?: WorkType;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}