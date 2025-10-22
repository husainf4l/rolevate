import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class CreateRoomInput {
  @Field()
  @IsNotEmpty()
  @IsUUID()
  applicationId: string;
}
