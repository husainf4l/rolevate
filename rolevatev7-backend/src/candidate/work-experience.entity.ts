import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { CandidateProfile } from './candidate-profile.entity';

@Entity()
@ObjectType()
export class WorkExperience {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  candidateProfileId: string;

  @ManyToOne(() => CandidateProfile, candidateProfile => candidateProfile.workExperiences)
  @JoinColumn({ name: 'candidateProfileId' })
  @Field(() => CandidateProfile)
  candidateProfile: CandidateProfile;

  @Column()
  @Field()
  company: string;

  @Column()
  @Field()
  position: string;

  @Column({ type: 'date' })
  @Field()
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  @Field({ nullable: true })
  endDate?: Date;

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  description?: string;

  @Column({ default: false })
  @Field()
  isCurrent: boolean;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}