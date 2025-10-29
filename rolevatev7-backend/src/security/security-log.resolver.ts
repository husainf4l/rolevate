import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { SecurityLogService } from './security-log.service';
import { SecurityLog } from './security-log.entity';
import { CreateSecurityLogInput } from './create-security-log.input';

@Resolver(() => SecurityLog)
export class SecurityLogResolver {
  constructor(private readonly securityLogService: SecurityLogService) {}

  @Mutation(() => SecurityLog)
  async createSecurityLog(@Args('input') createSecurityLogInput: CreateSecurityLogInput): Promise<SecurityLog> {
    return this.securityLogService.create(createSecurityLogInput);
  }

  @Query(() => [SecurityLog], { name: 'securityLogs' })
  async findAll(): Promise<SecurityLog[]> {
    return this.securityLogService.findAll();
  }

  @Query(() => SecurityLog, { name: 'securityLog', nullable: true })
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<SecurityLog | null> {
    return this.securityLogService.findOne(id);
  }

  @Query(() => [SecurityLog], { name: 'securityLogsByUser' })
  async findByUserId(@Args('userId', { type: () => ID }) userId: string): Promise<SecurityLog[]> {
    return this.securityLogService.findByUserId(userId);
  }

  @Query(() => [SecurityLog], { name: 'securityLogsByType' })
  async findByType(@Args('type') type: string): Promise<SecurityLog[]> {
    return this.securityLogService.findByType(type);
  }

  @Query(() => [SecurityLog], { name: 'securityLogsBySeverity' })
  async findBySeverity(@Args('severity') severity: string): Promise<SecurityLog[]> {
    return this.securityLogService.findBySeverity(severity);
  }

  @Mutation(() => Boolean)
  async removeSecurityLog(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.securityLogService.remove(id);
  }
}