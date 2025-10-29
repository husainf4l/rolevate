import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { CandidateProfile } from './candidate-profile.entity';

@Entity()
@ObjectType()
export class Education {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  candidateProfileId: string;

  @ManyToOne(() => CandidateProfile, candidateProfile => candidateProfile.educations)
  @JoinColumn({ name: 'candidateProfileId' })
  @Field(() => CandidateProfile)
  candidateProfile: CandidateProfile;

  @Column()
  @Field()
  institution: string;

  @Column()
  @Field()
  degree: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  fieldOfStudy?: string;

  @Column({ type: 'date', nullable: true })
  @Field({ nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  @Field({ nullable: true })
  endDate?: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  grade?: string;

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  description?: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}