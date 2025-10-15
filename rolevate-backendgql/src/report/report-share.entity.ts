import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Report } from './report.entity';
import { User } from '../user/user.entity';

export enum ReportPermission {
  VIEW = 'VIEW',
  EDIT = 'EDIT',
  ADMIN = 'ADMIN',
}

registerEnumType(ReportPermission, {
  name: 'ReportPermission',
});

@Entity()
@ObjectType()
export class ReportShare {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  reportId: string;

  @ManyToOne(() => Report, report => report.shares)
  @JoinColumn({ name: 'reportId' })
  @Field(() => Report)
  report: Report;

  @Column()
  sharedWithId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sharedWithId' })
  @Field(() => User)
  sharedWith: User;

  @Column()
  sharedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sharedById' })
  @Field(() => User)
  sharedBy: User;

  @Column({
    type: 'enum',
    enum: ReportPermission,
    default: ReportPermission.VIEW,
  })
  @Field(() => ReportPermission)
  permissions: ReportPermission;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  expiresAt?: Date;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}