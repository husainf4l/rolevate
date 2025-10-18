import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class RoomAccess {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  token?: string;

  @Field({ nullable: true })
  roomName?: string;

  @Field({ nullable: true })
  liveKitUrl?: string;

  @Field({ nullable: true })
  error?: string;
}
