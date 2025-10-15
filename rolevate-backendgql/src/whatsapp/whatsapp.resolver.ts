import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppTemplatesResponse, WhatsAppMessageResponse } from './whatsapp.dto';
import { SendTemplateMessageInput, SendTextMessageInput } from './whatsapp.input';

@Resolver()
export class WhatsAppResolver {
  constructor(private readonly whatsAppService: WhatsAppService) {}

  @Query(() => WhatsAppTemplatesResponse)
  async listWhatsAppTemplates(): Promise<WhatsAppTemplatesResponse> {
    const templates = await this.whatsAppService.listTemplates();
    return templates;
  }

  @Mutation(() => WhatsAppMessageResponse)
  async sendWhatsAppTemplateMessage(
    @Args('input') input: SendTemplateMessageInput,
  ): Promise<WhatsAppMessageResponse> {
    return await this.whatsAppService.sendTemplateMessage(
      input.to,
      input.templateName,
      input.language,
      input.parameters,
    );
  }

  @Mutation(() => WhatsAppMessageResponse)
  async sendWhatsAppTextMessage(
    @Args('input') input: SendTextMessageInput,
  ): Promise<WhatsAppMessageResponse> {
    return await this.whatsAppService.sendTextMessage(input.to, input.text);
  }
}
