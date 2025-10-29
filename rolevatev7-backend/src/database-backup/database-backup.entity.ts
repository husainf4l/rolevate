import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum BackupStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  DELETED = 'DELETED',
}

export enum BackupType {
  MANUAL = 'MANUAL',
  SCHEDULED_DAILY = 'SCHEDULED_DAILY',
  SCHEDULED_WEEKLY = 'SCHEDULED_WEEKLY',
  SCHEDULED_MONTHLY = 'SCHEDULED_MONTHLY',
}

registerEnumType(BackupStatus, { name: 'BackupStatus' });
registerEnumType(BackupType, { name: 'BackupType' });

@ObjectType()
@Entity('database_backups')
export class DatabaseBackup {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  fileName: string;

  @Field()
  @Column()
  s3Key: string;

  @Field()
  @Column()
  s3Url: string;

  @Field()
  @Column({ type: 'bigint' })
  fileSize: number;

  @Field(() => BackupStatus)
  @Column({
    type: 'enum',
    enum: BackupStatus,
    default: BackupStatus.PENDING,
  })
  status: BackupStatus;

  @Field(() => BackupType)
  @Column({
    type: 'enum',
    enum: BackupType,
    default: BackupType.MANUAL,
  })
  type: BackupType;

  @Field({ nullable: true })
  @Column({ nullable: true })
  databaseName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  databaseSize?: string;

  @Field({ nullable: true })
  @Column({ type: 'int', nullable: true })
  executionTime?: number;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Field(() => ID, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  createdBy?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
