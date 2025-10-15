import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Report } from './report.entity';
import { User } from '../user/user.entity';

export enum ReportAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
  VIEWED = 'VIEWED',
  SHARED = 'SHARED',
  DOWNLOADED = 'DOWNLOADED',
  EXPORTED = 'EXPORTED',
}

registerEnumType(ReportAction, {
  name: 'ReportAction',
});

@Entity()
@ObjectType()
export class ReportAuditLog {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  reportId: string;

  @ManyToOne(() => Report, report => report.auditLogs)
  @JoinColumn({ name: 'reportId' })
  @Field(() => Report)
  report: Report;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  @Field(() => User)
  user: User;

  @Column({
    type: 'enum',
    enum: ReportAction,
  })
  @Field(() => ReportAction)
  action: ReportAction;

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  details?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  ipAddress?: string;

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  userAgent?: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;
}