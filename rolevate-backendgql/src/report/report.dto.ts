import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { ReportType, ReportStatus } from './report.entity';

@ObjectType()
export class ReportDto {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => ReportType)
  type: ReportType;

  @Field()
  userId: string;

  @Field({ nullable: true })
  companyId?: string;

  @Field(() => GraphQLJSONObject)
  config: any;

  @Field(() => GraphQLJSONObject, { nullable: true })
  data?: any;

  @Field({ nullable: true })
  generatedAt?: Date;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field(() => ReportStatus)
  status: ReportStatus;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}