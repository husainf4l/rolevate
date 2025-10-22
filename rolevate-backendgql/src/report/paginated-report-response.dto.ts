import { ObjectType, Field } from '@nestjs/graphql';
import { ReportDto } from './report.dto';
import { PaginationMeta } from '../common/pagination.dto';

@ObjectType()
export class PaginatedReportResponse {
  @Field(() => [ReportDto], { description: 'List of reports' })
  data: ReportDto[];

  @Field(() => PaginationMeta, { description: 'Pagination metadata' })
  meta: PaginationMeta;
}
