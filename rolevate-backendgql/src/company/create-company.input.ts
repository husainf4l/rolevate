import { InputType, Field } from '@nestjs/graphql';
import { CompanySize } from './company.entity';

@InputType()
export class CreateCompanyInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  logo?: string;

  @Field({ nullable: true })
  industry?: string;

  @Field(() => CompanySize, { nullable: true })
  size?: CompanySize;

  @Field({ nullable: true })
  founded?: Date;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  addressId?: string;
}