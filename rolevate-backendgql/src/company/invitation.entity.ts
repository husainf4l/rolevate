import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { User } from '../user/user.entity';
import { Company } from '../company/company.entity';
import { UserType } from '../user/user.entity';

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(InvitationStatus, {
  name: 'InvitationStatus',
});

@Entity()
@ObjectType()
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  email: string;

  @Column({
    type: 'enum',
    enum: UserType,
  })
  @Field(() => UserType)
  userType: UserType;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  @Field(() => InvitationStatus)
  status: InvitationStatus;

  @Column()
  invitedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'invitedById' })
  @Field(() => User)
  invitedBy: User;

  @Column({ nullable: true })
  companyId?: string;

  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'companyId' })
  @Field(() => Company, { nullable: true })
  company?: Company;

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