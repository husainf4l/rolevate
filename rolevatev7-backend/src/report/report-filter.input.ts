import { InputType, Field } from '@nestjs/graphql';
import { ReportType, ReportCategory, ReportStatus, ReportScope, ReportPriority, ReportDataSource, ExecutionStatus } from './report.enums';

@InputType()
export class ReportFilterInput {
  @Field(() => ReportType, { nullable: true })
  type?: ReportType;

  @Field(() => ReportCategory, { nullable: true })
  category?: ReportCategory;

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

  @Field({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  companyId?: string;

  @Field({ nullable: true })
  templateId?: string;

  @Field({ nullable: true })
  generatedBy?: string;

  @Field({ nullable: true })
  isPublic?: boolean;

  @Field({ nullable: true })
  isArchived?: boolean;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field({ nullable: true })
  search?: string; // For name or description search
}
