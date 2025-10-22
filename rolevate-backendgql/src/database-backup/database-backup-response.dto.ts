import { ObjectType, Field } from '@nestjs/graphql';
import { DatabaseBackup } from './database-backup.entity';

@ObjectType()
export class BackupOperationResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => DatabaseBackup, { nullable: true })
  backup?: DatabaseBackup;
}

@ObjectType()
export class RestoreOperationResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field({ nullable: true })
  restoredDatabase?: string;
}

@ObjectType()
export class BackupStatsResponse {
  @Field()
  totalBackups: number;

  @Field()
  totalSize: number;

  @Field()
  oldestBackup: Date;

  @Field()
  latestBackup: Date;

  @Field()
  completedBackups: number;

  @Field()
  failedBackups: number;
}
