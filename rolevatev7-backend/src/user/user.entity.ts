import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Company } from '../company/company.entity';
import { CandidateProfile } from '../candidate/candidate-profile.entity';

export enum UserType {
  SYSTEM = 'SYSTEM',
  CANDIDATE = 'CANDIDATE',
  BUSINESS = 'BUSINESS',
  ADMIN = 'ADMIN',
}

registerEnumType(UserType, {
  name: 'UserType',
});

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({
    type: 'enum',
    enum: UserType,
  })
  @Field(() => UserType)
  userType: UserType;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true, unique: true })
  @Field({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  avatar?: string;

  @Column({ default: true })
  @Field()
  isActive: boolean;

  @Column({ type: 'uuid', nullable: true })
  companyId?: string;

  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'companyId' })
  @Field(() => Company, { nullable: true })
  company?: Company;

  @OneToOne(() => CandidateProfile, (candidateProfile) => candidateProfile.user, { nullable: true })
  @Field(() => CandidateProfile, { nullable: true })
  candidateProfile?: CandidateProfile;

  // Note: Relations will be added when related entities are created
  // refreshTokens, applicationNotes, notifications, reports, etc.

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Field()
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  @Field()
  updatedAt: Date;
}