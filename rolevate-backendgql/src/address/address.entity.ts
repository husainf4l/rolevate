import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Company } from '../company/company.entity';

@Entity()
@ObjectType()
export class Address {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  street?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  zipCode?: string;

  @Column({ type: 'float', nullable: true })
  @Field({ nullable: true })
  latitude?: number;

  @Column({ type: 'float', nullable: true })
  @Field({ nullable: true })
  longitude?: number;

  @OneToOne(() => Company, company => company.address)
  @Field(() => Company, { nullable: true })
  company?: Company;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}