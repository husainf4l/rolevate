import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsArray } from 'class-validator';

export enum SMSMessageType {
  OTP = 'OTP',
  GENERAL = 'GENERAL',
  BULK = 'BULK',
}

// Register the enum with GraphQL
registerEnumType(SMSMessageType, {
  name: 'SMSMessageType',
  description: 'Type of SMS message',
});

@InputType()
export class SendSMSInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  message: string;

  @Field(() => SMSMessageType, { nullable: true, defaultValue: SMSMessageType.GENERAL })
  @IsOptional()
  @IsEnum(SMSMessageType)
  type?: SMSMessageType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  messageId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  senderId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  candidateId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  companyId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  jobId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  applicationId?: string;
}

@InputType()
export class SendBulkSMSInput {
  @Field(() => [String])
  @IsNotEmpty()
  @IsArray()
  phoneNumbers: string[];

  @Field()
  @IsNotEmpty()
  @IsString()
  message: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  messageId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  senderId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  companyId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  jobId?: string;
}

@InputType()
export class SendOTPSMSInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  otpCode: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  messageTemplate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  candidateId?: string;
}
