import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { WhatsAppTemplateLanguage } from './whatsapp.dto';

@InputType()
export class SendTemplateMessageInput {
  @Field()
  @IsString()
  to: string;

  @Field()
  @IsString()
  templateName: string;

  @Field(() => WhatsAppTemplateLanguage, { nullable: true })
  @IsOptional()
  @IsEnum(WhatsAppTemplateLanguage)
  language?: WhatsAppTemplateLanguage;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  parameters?: string[];
}

@InputType()
export class SendTextMessageInput {
  @Field()
  @IsString()
  to: string;

  @Field()
  @IsString()
  text: string;
}
