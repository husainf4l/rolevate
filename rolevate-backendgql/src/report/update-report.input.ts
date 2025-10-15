import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateReportInput } from './create-report.input';
import { ReportType, ReportStatus } from './report.entity';

@InputType()
export class UpdateReportInput extends PartialType(CreateReportInput) {
  @Field(() => ReportType, { nullable: true })
  type?: ReportType;

  @Field(() => ReportStatus, { nullable: true })
  status?: ReportStatus;
}