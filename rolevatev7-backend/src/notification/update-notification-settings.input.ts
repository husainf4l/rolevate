import { InputType, Field } from '@nestjs/graphql';
import { IsBoolean, IsOptional } from 'class-validator';

/**
 * UpdateNotificationSettingsInput
 * Input for updating user notification preferences
 * All fields are optional - only provided fields will be updated
 */
@InputType()
export class UpdateNotificationSettingsInput {
  // Email Notifications
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  emailApplicationUpdates?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  emailInterviewReminders?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  emailJobRecommendations?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  emailNewsletter?: boolean;

  // SMS Notifications
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  smsApplicationUpdates?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  smsInterviewReminders?: boolean;

  // Push Notifications
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  pushApplicationUpdates?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  pushInterviewReminders?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  pushNewMessages?: boolean;

  // Marketing Preferences
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  marketingEmails?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  partnerOffers?: boolean;
}
