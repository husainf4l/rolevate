import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional } from 'class-validator';

@InputType()
export class CreateApiKeyInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;
}