import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SMSService } from './sms.service';
import { SendSMSInput, SendBulkSMSInput, SendOTPSMSInput } from './sms.input';
import { SMSResponse, SMSBalanceResponse, BulkSMSResponse, SMSCostEstimation } from './sms.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BusinessOrApiKeyGuard } from '../auth/business-or-api-key.guard';

/**
 * SMS Resolver
 * 
 * GraphQL mutations and queries for SMS functionality
 */

@Resolver()
export class SMSResolver {
  constructor(private readonly smsService: SMSService) {}

  @Mutation(() => SMSResponse, {
    description: 'Send a single SMS message (OTP or General)',
  })
  @UseGuards(BusinessOrApiKeyGuard)
  async sendSMS(@Args('input') input: SendSMSInput): Promise<SMSResponse> {
    return this.smsService.sendSMS(input);
  }

  @Mutation(() => SMSResponse, {
    description: 'Send an OTP SMS with pre-formatted message',
  })
  @UseGuards(JwtAuthGuard)
  async sendOTPSMS(@Args('input') input: SendOTPSMSInput): Promise<SMSResponse> {
    return this.smsService.sendOTP(input);
  }

  @Mutation(() => BulkSMSResponse, {
    description: 'Send bulk SMS to multiple recipients (max 120)',
  })
  @UseGuards(BusinessOrApiKeyGuard)
  async sendBulkSMS(@Args('input') input: SendBulkSMSInput): Promise<BulkSMSResponse> {
    return this.smsService.sendBulkSMS(input);
  }

  @Query(() => SMSBalanceResponse, {
    description: 'Get SMS account balance',
  })
  @UseGuards(BusinessOrApiKeyGuard)
  async getSMSBalance(): Promise<SMSBalanceResponse> {
    return this.smsService.getBalance();
  }

  @Query(() => SMSCostEstimation, {
    description: 'Estimate SMS cost for a message and recipient count',
  })
  @UseGuards(BusinessOrApiKeyGuard)
  async estimateSMSCost(
    @Args('message') message: string,
    @Args('recipientCount', { defaultValue: 1 }) recipientCount: number,
  ): Promise<SMSCostEstimation> {
    return this.smsService.estimateCost(message, recipientCount);
  }
}
