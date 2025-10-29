import { ObjectType, Field, ID } from '@nestjs/graphql';
import { JobDto } from '../job/job.dto';

@ObjectType()
export class SavedJobDto {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field(() => ID)
  jobId: string;

  @Field(() => JobDto, { nullable: true })
  job?: JobDto;

  @Field()
  savedAt: Date;
}
