import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

@InputType()
export class CreateApplicationNoteInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  applicationId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  note: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}

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
