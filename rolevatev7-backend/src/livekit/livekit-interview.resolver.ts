import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { LiveKitInterviewService } from './livekit-interview.service';
import { CreateRoomInput } from './create-room.input';
import { GetRoomTokenInput } from './get-room-token.input';
import { CreateRoomResponse, RoomTokenResponse } from './livekit.dto';

@Resolver()
export class LiveKitInterviewResolver {
  constructor(private readonly liveKitInterviewService: LiveKitInterviewService) {}

  @Mutation(() => CreateRoomResponse)
  async createInterviewRoom(
    @Args('createRoomInput') createRoomInput: CreateRoomInput,
  ): Promise<CreateRoomResponse> {
    return this.liveKitInterviewService.createInterviewRoom(createRoomInput.applicationId);
  }

  @Mutation(() => RoomTokenResponse)
  async getRoomToken(
    @Args('getRoomTokenInput') getRoomTokenInput: GetRoomTokenInput,
  ): Promise<RoomTokenResponse> {
    return this.liveKitInterviewService.getRoomToken(
      getRoomTokenInput.applicationId,
      getRoomTokenInput.password,
    );
  }
}
