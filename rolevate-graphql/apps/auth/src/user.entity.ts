import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Directive } from '@nestjs/graphql';

export enum UserRole {
  CANDIDATE = 'candidate',
  BUSINESS = 'business',
}

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'User role type - candidate or business',
});

@Entity('users')
@ObjectType()
@Directive('@key(fields: "id")')
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ unique: true, length: 255 })
  @Field()
  @Index('IDX_USER_EMAIL')
  email: string;

  @Column({ select: false })
  password: string; // Don't expose password in GraphQL

  @Column({ length: 100 })
  @Field()
  firstName: string;

  @Column({ length: 100 })
  @Field()
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CANDIDATE,
  })
  @Field(() => UserRole)
  @Index('IDX_USER_ROLE')
  role: UserRole;

  @Column({ default: true })
  @Field()
  isActive: boolean;

  @Column({ nullable: true, length: 20 })
  @Field({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true, type: 'text' })
  @Field({ nullable: true })
  profilePicture?: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}