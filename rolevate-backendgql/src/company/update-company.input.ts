import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateCompanyInput } from './create-company.input';
import { CompanySize } from './company.entity';

@InputType()
export class UpdateCompanyInput extends PartialType(CreateCompanyInput) {
  @Field(() => CompanySize, { nullable: true })
  size?: CompanySize;
}