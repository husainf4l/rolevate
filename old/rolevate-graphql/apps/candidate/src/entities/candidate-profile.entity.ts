import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Directive } from '@nestjs/graphql';

@Entity('candidate_profiles')
@ObjectType()
@Directive('@key(fields: "id")')
export class CandidateProfile {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ type: 'uuid', unique: true })
  @Field(() => ID)
  @Index('IDX_CANDIDATE_USER')
  userId: string; // Reference to User from auth service

  @Column({ length: 255, nullable: true })
  @Field({ nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  bio?: string;

  @Column({ type: 'simple-array', nullable: true })
  @Field(() => [String], { nullable: true })
  skills?: string[];

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  resume?: string; // URL to resume file

  @Column({ length: 255, nullable: true })
  @Field({ nullable: true })
  portfolio?: string;

  @Column({ length: 255, nullable: true })
  @Field({ nullable: true })
  linkedin?: string;

  @Column({ length: 255, nullable: true })
  @Field({ nullable: true })
  github?: string;

  @Column({ length: 255, nullable: true })
  @Field({ nullable: true })
  location?: string;

  @Column({ type: 'boolean', default: false })
  @Field()
  isOpenToWork: boolean;

  @Column({ type: 'simple-array', nullable: true })
  @Field(() => [String], { nullable: true })
  preferredJobTypes?: string[];

  @Column({ type: 'int', nullable: true })
  @Field({ nullable: true })
  yearsOfExperience?: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
