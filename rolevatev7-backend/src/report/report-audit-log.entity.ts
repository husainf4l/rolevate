import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { Report } from './report.entity';
import { User } from '../user/user.entity';
import { AuditAction } from './report.enums';
import { createId } from '@paralleldrive/cuid2';

@Entity()
@ObjectType()
export class ReportAuditLog {
  @PrimaryColumn()
  @Field(() => ID)
  id: string;

  @Column()
  reportId: string;

  @ManyToOne(() => Report, report => report.auditLogs)
  @JoinColumn({ name: 'reportId' })
  @Field(() => Report)
  report: Report;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  @Field(() => AuditAction)
  action: AuditAction;

  @Column('json', { nullable: true })
  @Field(() => GraphQLJSONObject, { nullable: true })
  details?: Record<string, any>;

  @Column({ default: true })
  @Field()
  success: boolean;

  @Column({ length: 30, nullable: true })
  @Field({ nullable: true })
  userId?: string;

  @Column({ length: 50, nullable: true })
  @Field({ nullable: true })
  sessionId?: string;

  @Column({ length: 45, nullable: true })
  @Field({ nullable: true })
  ipAddress?: string;

  @Column({ length: 500, nullable: true })
  @Field({ nullable: true })
  userAgent?: string;

  @Column({ length: 50, nullable: true })
  @Field({ nullable: true })
  requestId?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  duration?: number;

  @Column('json', { nullable: true })
  @Field(() => GraphQLJSONObject, { nullable: true })
  oldValues?: Record<string, any>;

  @Column('json', { nullable: true })
  @Field(() => GraphQLJSONObject, { nullable: true })
  newValues?: Record<string, any>;

  @Column({ length: 10, default: 'LOW' })
  @Field()
  riskLevel: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @BeforeInsert()
  generateId() {
    this.id = createId();
  }
}