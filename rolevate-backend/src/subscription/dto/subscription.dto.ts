import { IsString, IsOptional, IsEnum, IsBoolean, IsDecimal, IsDate, IsUUID, IsInt, Min, Max } from 'class-validator';
import { SubscriptionPlan, SubscriptionStatus, BillingCycle } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateSubscriptionDto {
  @IsUUID()
  companyId: string;

  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;

  @IsOptional()
  @IsDecimal()
  @Type(() => Number)
  priceAmount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  jobPostLimit?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  candidateLimit?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  interviewLimit?: number;

  // Stripe fields
  @IsOptional()
  @IsString()
  stripeCustomerId?: string;

  @IsOptional()
  @IsString()
  stripeSubscriptionId?: string;

  @IsOptional()
  @IsString()
  stripePriceId?: string;
}

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsEnum(SubscriptionPlan)
  plan?: SubscriptionPlan;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  renewsAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  cancelledAt?: Date;

  @IsOptional()
  @IsDecimal()
  @Type(() => Number)
  priceAmount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  jobPostLimit?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  candidateLimit?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  interviewLimit?: number;

  // Stripe fields
  @IsOptional()
  @IsString()
  stripeCustomerId?: string;

  @IsOptional()
  @IsString()
  stripeSubscriptionId?: string;

  @IsOptional()
  @IsString()
  stripePriceId?: string;
}

export class SubscriptionQueryDto {
  @IsOptional()
  @IsEnum(SubscriptionPlan)
  plan?: SubscriptionPlan;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDateFrom?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDateTo?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDateFrom?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDateTo?: Date;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
