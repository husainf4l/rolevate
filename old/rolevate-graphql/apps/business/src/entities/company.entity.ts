import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Directive } from '@nestjs/graphql';

@Entity('companies')
@ObjectType()
@Directive('@key(fields: "id")')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ type: 'uuid' })
  @Field(() => ID)
  @Index('IDX_COMPANY_USER')
  userId: string; // Reference to User from auth service

  @Column({ length: 255 })
  @Field()
  name: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  description?: string;

  @Column({ length: 255, nullable: true })
  @Field({ nullable: true })
  industry?: string;

  @Column({ length: 255, nullable: true })
  @Field({ nullable: true })
  website?: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  logo?: string;

  @Column({ length: 255, nullable: true })
  @Field({ nullable: true })
  location?: string;

  @Column({ type: 'int', nullable: true })
  @Field({ nullable: true })
  companySize?: number;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  benefits?: string;

  @Column({ default: true })
  @Field()
  isActive: boolean;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
