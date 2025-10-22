import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Company } from './entities/company.entity';
import { Job } from './entities/job.entity';

@Resolver(() => Company)
export class CompanyResolver {
  @Query(() => String)
  async companyHello(): Promise<string> {
    return 'Hello from Business Service - Companies!';
  }

  @Query(() => [Company])
  async companies(): Promise<Company[]> {
    // TODO: Implement actual query
    return [];
  }

  @Query(() => Company, { nullable: true })
  async company(@Args('id') id: string): Promise<Company | null> {
    // TODO: Implement actual query
    return null;
  }
}

@Resolver(() => Job)
export class JobResolver {
  @Query(() => String)
  async jobHello(): Promise<string> {
    return 'Hello from Business Service - Jobs!';
  }

  @Query(() => [Job])
  async jobs(): Promise<Job[]> {
    // TODO: Implement actual query
    return [];
  }

  @Query(() => Job, { nullable: true })
  async job(@Args('id') id: string): Promise<Job | null> {
    // TODO: Implement actual query
    return null;
  }
}
