import { InputType, Field } from '@nestjs/graphql';
import { WhatsAppTemplateLanguage } from './whatsapp.dto';

@InputType()
export class SendTemplateMessageInput {
  @Field()
  to: string;

  @Field()
  templateName: string;

  @Field(() => WhatsAppTemplateLanguage, { nullable: true })
  language?: WhatsAppTemplateLanguage;

  @Field(() => [String], { nullable: true })
  parameters?: string[];
}

@InputType()
export class SendTextMessageInput {
  @Field()
  to: string;

  @Field()
  text: string;
}
