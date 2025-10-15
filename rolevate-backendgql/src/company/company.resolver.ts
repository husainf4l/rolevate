import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { CompanyService } from './company.service';
import { Company } from './company.entity';
import { CompanyDto } from './company.dto';
import { CreateCompanyInput } from './create-company.input';
import { UpdateCompanyInput } from './update-company.input';

@Resolver(() => Company)
export class CompanyResolver {
  constructor(private readonly companyService: CompanyService) {}

  @Mutation(() => Company)
  async createCompany(@Args('input') createCompanyInput: CreateCompanyInput): Promise<Company> {
    return this.companyService.create(createCompanyInput);
  }

  @Query(() => [Company], { name: 'companies' })
  async findAll(): Promise<Company[]> {
    return this.companyService.findAll();
  }

  @Query(() => Company, { name: 'company', nullable: true })
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<Company | null> {
    return this.companyService.findOne(id);
  }

  @Mutation(() => Company, { nullable: true })
  async updateCompany(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateCompanyInput: UpdateCompanyInput,
  ): Promise<Company | null> {
    return this.companyService.update(id, updateCompanyInput);
  }

  @Mutation(() => Boolean)
  async removeCompany(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.companyService.remove(id);
  }

  @Query(() => [Company], { name: 'companiesByUser' })
  async findByUserId(@Args('userId', { type: () => ID }) userId: string): Promise<Company[]> {
    return this.companyService.findByUserId(userId);
  }
}