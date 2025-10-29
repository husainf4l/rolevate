import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateReportInput } from './create-report.input';
import { ReportType, ReportCategory, ReportFormat, ReportStatus, ReportScope, ReportPriority, ReportDataSource, ExecutionStatus } from './report.enums';

@InputType()
export class UpdateReportInput extends PartialType(CreateReportInput) {
  @Field(() => ReportType, { nullable: true })
  type?: ReportType;

  @Field(() => ReportCategory, { nullable: true })
  category?: ReportCategory;

  @Field(() => ReportFormat, { nullable: true })
  format?: ReportFormat;

  @Field(() => ReportStatus, { nullable: true })
  status?: ReportStatus;

  @Field(() => ReportScope, { nullable: true })
  scope?: ReportScope;

  @Field(() => ReportPriority, { nullable: true })
  priority?: ReportPriority;

  @Field(() => ReportDataSource, { nullable: true })
  dataSource?: ReportDataSource;

  @Field(() => ExecutionStatus, { nullable: true })
  executionStatus?: ExecutionStatus;
}