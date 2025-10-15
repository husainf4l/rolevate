import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { CommunicationService } from './communication.service';
import { Communication } from './communication.entity';
import { CreateCommunicationInput } from './create-communication.input';
import { UpdateCommunicationInput } from './update-communication.input';

@Resolver(() => Communication)
export class CommunicationResolver {
  constructor(private readonly communicationService: CommunicationService) {}

  @Mutation(() => Communication)
  async createCommunication(@Args('input') createCommunicationInput: CreateCommunicationInput): Promise<Communication> {
    return this.communicationService.create(createCommunicationInput);
  }

  @Query(() => [Communication], { name: 'communications' })
  async findAll(): Promise<Communication[]> {
    return this.communicationService.findAll();
  }

  @Query(() => Communication, { name: 'communication', nullable: true })
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<Communication | null> {
    return this.communicationService.findOne(id);
  }

  @Query(() => [Communication], { name: 'communicationsByApplication' })
  async findByApplicationId(@Args('applicationId', { type: () => ID }) applicationId: string): Promise<Communication[]> {
    return this.communicationService.findByApplicationId(applicationId);
  }

  @Query(() => [Communication], { name: 'communicationsByUser' })
  async findByUserId(@Args('userId', { type: () => ID }) userId: string): Promise<Communication[]> {
    return this.communicationService.findByUserId(userId);
  }

  @Mutation(() => Communication, { nullable: true })
  async updateCommunication(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateCommunicationInput: UpdateCommunicationInput,
  ): Promise<Communication | null> {
    return this.communicationService.update(id, updateCommunicationInput);
  }

  @Mutation(() => Boolean)
  async removeCommunication(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.communicationService.remove(id);
  }

  @Mutation(() => Communication, { nullable: true })
  async markCommunicationAsRead(@Args('id', { type: () => ID }) id: string): Promise<Communication | null> {
    return this.communicationService.markAsRead(id);
  }
}