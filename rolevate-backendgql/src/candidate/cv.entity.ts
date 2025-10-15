import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { CandidateProfile } from './candidate-profile.entity';

@Entity()
@ObjectType()
export class CV {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  candidateProfileId: string;

  @ManyToOne(() => CandidateProfile, candidateProfile => candidateProfile.cvs)
  @JoinColumn({ name: 'candidateProfileId' })
  @Field(() => CandidateProfile)
  candidateProfile: CandidateProfile;

  @Column()
  @Field()
  fileName: string;

  @Column()
  @Field()
  fileUrl: string;

  @Column({ type: 'int', nullable: true })
  @Field({ nullable: true })
  fileSize?: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  mimeType?: string;

  @Column({ default: false })
  @Field()
  isPrimary: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Field()
  uploadedAt: Date;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}