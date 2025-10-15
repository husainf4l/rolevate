import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { User } from '../user/user.entity';
import { WorkExperience } from './work-experience.entity';
import { Education } from './education.entity';
import { CV } from './cv.entity';
import { WorkType } from '../job/job.entity';

export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  LOOKING = 'LOOKING',
}

registerEnumType(AvailabilityStatus, {
  name: 'AvailabilityStatus',
});

@Entity()
@ObjectType()
export class CandidateProfile {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ unique: true })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  @Field(() => User)
  user: User;

  @Column({ nullable: true })
  @Field({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  location?: string;

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  bio?: string;

  @Column('text', { array: true, default: [] })
  @Field(() => [String])
  skills: string[];

  @Column({ nullable: true })
  @Field({ nullable: true })
  experience?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  education?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  linkedinUrl?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  githubUrl?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  portfolioUrl?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  resumeUrl?: string;

  @Column({
    type: 'enum',
    enum: AvailabilityStatus,
    nullable: true,
  })
  @Field(() => AvailabilityStatus, { nullable: true })
  availability?: AvailabilityStatus;

  @Column({ nullable: true })
  @Field({ nullable: true })
  salaryExpectation?: string;

  @Column({
    type: 'enum',
    enum: WorkType,
    nullable: true,
  })
  @Field(() => WorkType, { nullable: true })
  preferredWorkType?: WorkType;

  @OneToMany(() => WorkExperience, workExperience => workExperience.candidateProfile)
  @Field(() => [WorkExperience])
  workExperiences: WorkExperience[];

  @OneToMany(() => Education, education => education.candidateProfile)
  @Field(() => [Education])
  educations: Education[];

  @OneToMany(() => CV, cv => cv.candidateProfile)
  @Field(() => [CV])
  cvs: CV[];

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}