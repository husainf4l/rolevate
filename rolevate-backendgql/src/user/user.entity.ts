import { Entity, Column, PrimaryColumn, BeforeInsert, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { createId } from '@paralleldrive/cuid2';
import { Company } from '../company/company.entity';

export enum UserType {
  SYSTEM = 'SYSTEM',
  COMPANY = 'COMPANY',
  CANDIDATE = 'CANDIDATE',
  ADMIN = 'ADMIN',
}

registerEnumType(UserType, {
  name: 'UserType',
});

@Entity()
@ObjectType()
export class User {
  @PrimaryColumn()
  @Field()
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

  @Column({ nullable: true })
  companyId?: string;

  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'companyId' })
  @Field(() => Company, { nullable: true })
  company?: Company;

  // Note: Relations will be added when related entities are created
  // refreshTokens, candidateProfile, applicationNotes, notifications, reports, etc.

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Field()
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  @Field()
  updatedAt: Date;

  @BeforeInsert()
  generateId() {
    this.id = createId();
  }
}