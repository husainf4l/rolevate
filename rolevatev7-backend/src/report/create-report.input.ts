import { InputType, Field } from '@nestjs/graphql';
import { ReportType, ReportCategory, ReportFormat, ReportScope, ReportPriority, ReportDataSource } from './report.enums';

@InputType()
export class CreateReportInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => ReportType)
  type: ReportType;

  @Field(() => ReportCategory)
  category: ReportCategory;

  @Field(() => ReportFormat, { nullable: true })
  format?: ReportFormat;

  @Field(() => ReportScope, { nullable: true })
  scope?: ReportScope;

  @Field(() => ReportPriority, { nullable: true })
  priority?: ReportPriority;

  @Field({ nullable: true })
  query?: string;

  @Field(() => ReportDataSource, { nullable: true })
  dataSource?: ReportDataSource;

  @Field({ nullable: true })
  filters?: string; // JSON string

  @Field({ nullable: true })
  parameters?: string; // JSON string

  @Field({ nullable: true })
  config?: string; // JSON string

  @Field({ nullable: true })
  maxExecutionTime?: number;

  @Field({ nullable: true })
  templateId?: string;

  @Field({ nullable: true })
  companyId?: string;

  @Field({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field({ nullable: true })
  autoDelete?: boolean;

  @Field({ nullable: true })
  isPublic?: boolean;

  @Field(() => [String], { nullable: true })
  tags?: string[];
}