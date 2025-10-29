import { ObjectType, Field, ID } from '@nestjs/graphql';

/**
 * NotificationSettingsDto
 * GraphQL response type for notification settings
 */
@ObjectType()
export class NotificationSettingsDto {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  // Email Notifications
  @Field()
  emailNotifications: boolean;

  @Field()
  emailApplicationUpdates: boolean;

  @Field()
  emailInterviewReminders: boolean;

  @Field()
  emailJobRecommendations: boolean;

  @Field()
  emailNewsletter: boolean;

  // SMS Notifications
  @Field()
  smsNotifications: boolean;

  @Field()
  smsApplicationUpdates: boolean;

  @Field()
  smsInterviewReminders: boolean;

  // Push Notifications
  @Field()
  pushNotifications: boolean;

  @Field()
  pushApplicationUpdates: boolean;

  @Field()
  pushInterviewReminders: boolean;

  @Field()
  pushNewMessages: boolean;

  // Marketing Preferences
  @Field()
  marketingEmails: boolean;

  @Field()
  partnerOffers: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
