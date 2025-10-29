import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { Report } from './report.entity';
import { User } from '../user/user.entity';
import { ReportShareType, SharePermission } from './report.enums';
import { createId } from '@paralleldrive/cuid2';

@Entity()
@ObjectType()
export class ReportShare {
  @PrimaryColumn()
  @Field(() => ID)
  id: string;

  @Column()
  reportId: string;

  @ManyToOne(() => Report, report => report.shares)
  @JoinColumn({ name: 'reportId' })
  @Field(() => Report)
  report: Report;

  @Column({ length: 255, nullable: true })
  @Field({ nullable: true })
  sharedWith?: string;

  @Column({
    type: 'enum',
    enum: SharePermission,
    default: SharePermission.VIEW_ONLY,
  })
  @Field(() => SharePermission)
  permission: SharePermission;

  @Column({ length: 64, nullable: true, unique: true })
  @Field({ nullable: true })
  accessToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  expiresAt?: Date;

  @Column({ default: false })
  @Field()
  isRevoked: boolean;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  revokedAt?: Date;

  @Column({ default: 0 })
  @Field()
  accessCount: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  maxAccessCount?: number;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  lastAccessed?: Date;

  @Column('text', { array: true, default: [] })
  @Field(() => [String])
  ipRestrictions: string[];

  @Column({ default: false })
  @Field()
  isPublic: boolean;

  @Column({ default: true })
  @Field()
  requireLogin: boolean;

  @Column({ default: true })
  @Field()
  allowDownload: boolean;

  @Column({ length: 255, nullable: true })
  @Field({ nullable: true })
  watermark?: string;

  @Column()
  sharedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sharedBy' })
  @Field(() => User)
  sharer: User;

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  shareNote?: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @BeforeInsert()
  generateId() {
    this.id = createId();
  }
}