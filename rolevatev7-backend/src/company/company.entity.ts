import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Address } from '../address/address.entity';
import { User } from '../user/user.entity';
import { Job } from '../job/job.entity';

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
  email?: string;

  @Column()
  @Field()
  phone: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  logo?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  industry?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  size?: string;

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