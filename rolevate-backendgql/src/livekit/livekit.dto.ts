import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class CreateRoomResponse {
  @Field()
  roomName: string;

  @Field()
  message: string;

  @Field({ nullable: true })
  token?: string;
}

@ObjectType()
export class RoomTokenResponse {
  @Field()
  token: string;

  @Field()
  roomName: string;
}
