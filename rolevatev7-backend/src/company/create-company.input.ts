import { InputType, Field } from '@nestjs/graphql';
import { IsPhoneNumber, IsString } from 'class-validator';

@InputType()
export class CreateCompanyInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  email?: string;

  @Field()
  @IsString()
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  phone: string;

  @Field({ nullable: true })
  logo?: string;

  @Field({ nullable: true })
  industry?: string;

  @Field({ nullable: true })
  size?: string;

  @Field({ nullable: true })
  founded?: Date;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  addressId?: string;

  // Address fields for inline creation
  @Field({ nullable: true })
  street?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  country?: string;
}