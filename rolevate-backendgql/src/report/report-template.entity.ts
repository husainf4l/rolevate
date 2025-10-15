import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, BeforeInsert } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { ReportType, ReportCategory, ReportFormat, ReportScope, ReportDataSource } from './report.enums';
import { User } from '../user/user.entity';
import { Company } from '../company/company.entity';
import { Report } from './report.entity';
import { createId } from '@paralleldrive/cuid2';

@Entity()
@ObjectType()
export class ReportTemplate {
  @PrimaryColumn()
  @Field(() => ID)
  id: string;

  @Column({ length: 255 })
  @Field()
  name: string;

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ReportType,
  })
  @Field(() => ReportType)
  type: ReportType;

  @Column({
    type: 'enum',
    enum: ReportCategory,
  })
  @Field(() => ReportCategory)
  category: ReportCategory;

  @Column({
    type: 'enum',
    enum: ReportFormat,
    default: 'PDF',
  })
  @Field(() => ReportFormat)
  format: ReportFormat;

  @Column({
    type: 'enum',
    enum: ReportScope,
    default: 'COMPANY',
  })
  @Field(() => ReportScope)
  scope: ReportScope;

  @Column({
    type: 'enum',
    enum: ReportDataSource,
    default: 'MIXED',
  })
  @Field(() => ReportDataSource)
  dataSource: ReportDataSource;

  @Column('text')
  @Field()
  queryTemplate: string;

  @Column('json', { nullable: true })
  @Field(() => GraphQLJSONObject, { nullable: true })
  defaultFilters?: Record<string, any>;

  @Column('json', { nullable: true })
  @Field(() => GraphQLJSONObject, { nullable: true })
  defaultParameters?: Record<string, any>;

  @Column('json', { nullable: true })
  @Field(() => GraphQLJSONObject, { nullable: true })
  config?: Record<string, any>;

  @Column({ default: false })
  @Field()
  isValidated: boolean;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  validatedAt?: Date;

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  validationError?: string;

  @Column({ length: 10, default: '1.0' })
  @Field()
  version: string;

  @Column({ default: false })
  @Field()
  isSystem: boolean;

  @Column({ default: true })
  @Field()
  isActive: boolean;

  @Column({ default: 0 })
  @Field()
  usageCount: number;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  lastUsed?: Date;

  @Column({ default: false })
  @Field()
  isPublic: boolean;

  @OneToMany(() => Report, reports => reports.template)
  @Field(() => [Report])
  reports: Report[];

  @Column({ nullable: true })
  companyId?: string;

  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'companyId' })
  @Field(() => Company, { nullable: true })
  company?: Company;

  @Column({ nullable: true })
  createdBy?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  @Field(() => User, { nullable: true })
  creator?: User;

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