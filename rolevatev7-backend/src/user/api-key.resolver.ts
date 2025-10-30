import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { ApiKeyDto } from './api-key.dto';
import { CreateApiKeyInput } from './create-api-key.input';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Resolver(() => ApiKeyDto)
export class ApiKeyResolver {
  constructor(private apiKeyService: ApiKeyService) {}

  @Mutation(() => ApiKeyDto)
  @UseGuards(JwtAuthGuard)
  async generateApiKey(
    @Args('input') input: CreateApiKeyInput,
    @Context() context: any,
  ): Promise<ApiKeyDto> {
    const userId = context.request.user.id; // From user object
    return this.apiKeyService.generateApiKey(userId, input);
  }

  @Query(() => [ApiKeyDto])
  @UseGuards(JwtAuthGuard)
  async myApiKeys(@Context() context: any): Promise<ApiKeyDto[]> {
    const userId = context.request.user.id;
    return this.apiKeyService.findAllByUser(userId);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async revokeApiKey(
    @Args('keyId') keyId: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.request.user.id;
    return this.apiKeyService.revokeApiKey(userId, keyId);
  }
}