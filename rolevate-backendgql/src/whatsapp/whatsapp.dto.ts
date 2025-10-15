import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';

export enum WhatsAppTemplateLanguage {
  EN_US = 'en_US',
  EN = 'en',
  AR = 'ar',
}

registerEnumType(WhatsAppTemplateLanguage, {
  name: 'WhatsAppTemplateLanguage',
});

@ObjectType()
export class WhatsAppTemplate {
  @Field()
  name: string;

  @Field()
  status: string;

  @Field(() => [String], { nullable: true })
  languages?: string[];

  @Field({ nullable: true })
  category?: string;
}

@ObjectType()
export class WhatsAppContact {
  @Field()
  input: string;

  @Field()
  wa_id: string;
}

@ObjectType()
export class WhatsAppMessage {
  @Field()
  id: string;
}

@ObjectType()
export class WhatsAppMessageResponse {
  @Field()
  messaging_product: string;

  @Field(() => [WhatsAppContact])
  contacts: WhatsAppContact[];

  @Field(() => [WhatsAppMessage])
  messages: WhatsAppMessage[];
}

@ObjectType()
export class WhatsAppTemplatesResponse {
  @Field(() => [WhatsAppTemplate])
  data: WhatsAppTemplate[];
}
