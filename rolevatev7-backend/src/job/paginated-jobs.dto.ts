import { ObjectType, Field, Int } from '@nestjs/graphql';
import { JobDto } from './job.dto';

@ObjectType()
export class PaginationMeta {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;

  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;
}

@ObjectType()
export class PaginatedJobs {
  @Field(() => [JobDto])
  data: JobDto[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}
