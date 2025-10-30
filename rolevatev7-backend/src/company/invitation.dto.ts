import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsEnum, IsInt, IsString, Min, Max } from 'class-validator';
import { InvitationStatus } from './invitation.entity';
import { UserType } from '../user/user.entity';

@ObjectType()
export class InvitationDto {
  @Field(() => ID)
  id: string;

  @Field()
  code: string;

  @Field({ nullable: true })
  email?: string;

  @Field(() => UserType)
  userType: UserType;

  @Field(() => InvitationStatus)
  status: InvitationStatus;

  @Field()
  invitedById: string;

  @Field({ nullable: true })
  companyId?: string;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field({ nullable: true })
  usedAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  invitationLink: string; // Full invitation link URL
}

@InputType()
export class CreateInvitationInput {
  @Field({ nullable: true, description: 'Optional: Pre-assign invitation to specific email' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field(() => UserType, { 
    description: 'Type of user being invited (typically BUSINESS for company team members)',
    defaultValue: UserType.BUSINESS 
  })
  @IsEnum(UserType)
  @IsOptional()
  userType?: UserType;

  @Field({ nullable: true, description: 'Expiration time in hours (default: 168 hours = 7 days)' })
  @IsInt()
  @Min(1)
  @Max(8760) // Max 1 year
  @IsOptional()
  expiresInHours?: number;
}

@InputType()
export class AcceptInvitationInput {
  @Field({ description: 'Invitation code from the link' })
  @IsString()
  code: string;

  @Field({ description: 'Email of the user accepting the invitation' })
  @IsEmail()
  email: string;

  @Field({ description: 'Name of the user' })
  @IsString()
  name: string;

  @Field({ description: 'Password for the new user account' })
  @IsString()
  password: string;
}
