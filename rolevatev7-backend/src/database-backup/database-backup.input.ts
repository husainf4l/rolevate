import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateBackupInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}

@InputType()
export class RestoreBackupInput {
  @Field()
  @IsString()
  backupId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  targetDatabaseName?: string;
}
