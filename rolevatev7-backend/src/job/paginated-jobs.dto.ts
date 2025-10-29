import { ObjectType, Field } from '@nestjs/graphql';
import { JobDto } from './job.dto';
import { PaginationMeta } from '../common/pagination.dto';

@ObjectType()
export class PaginatedJobsResponse {
  @Field(() => [JobDto], { description: 'List of jobs' })
  data: JobDto[];

  @Field(() => PaginationMeta, { description: 'Pagination metadata' })
  meta: PaginationMeta;
}
