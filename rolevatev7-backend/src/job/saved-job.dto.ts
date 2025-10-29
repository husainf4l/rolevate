import { ObjectType, Field, ID } from '@nestjs/graphql';
import { JobDto } from './job.dto';

/**
 * SavedJobDto
 * GraphQL response type for saved jobs
 */
@ObjectType()
export class SavedJobDto {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field(() => ID)
  jobId: string;

  @Field(() => JobDto)
  job: JobDto;

  @Field()
  savedAt: Date;

  @Field({ nullable: true })
  notes?: string;
}
