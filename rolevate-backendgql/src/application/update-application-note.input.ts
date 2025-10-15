import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

@InputType()
export class UpdateApplicationNoteInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  note?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
