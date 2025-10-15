import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Address } from '../address/address.entity';
import { User } from '../user/user.entity';
import { Job } from '../job/job.entity';

export enum CompanySize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  ENTERPRISE = 'ENTERPRISE',
}

registerEnumType(CompanySize, {
  name: 'CompanySize',
});

@Entity()
@ObjectType()
export class Company {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  name: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  website?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  logo?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  industry?: string;

  @Column({
    type: 'enum',
    enum: CompanySize,
    nullable: true,
  })
  @Field(() => CompanySize, { nullable: true })
  size?: CompanySize;

  @Column({ type: 'date', nullable: true })
  @Field({ nullable: true })
  founded?: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  addressId?: string;

  @OneToOne(() => Address, { nullable: true })
  @JoinColumn({ name: 'addressId' })
  @Field(() => Address, { nullable: true })
  address?: Address;

  @OneToMany(() => User, user => user.company)
  @Field(() => [User])
  users: User[];

  @OneToMany(() => Job, job => job.company)
  @Field(() => [Job])
  jobs: Job[];

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}