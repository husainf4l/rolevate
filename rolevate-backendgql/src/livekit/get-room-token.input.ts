import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID, IsString, Length } from 'class-validator';

@InputType()
export class GetRoomTokenInput {
  @Field()
  @IsNotEmpty()
  @IsUUID()
  applicationId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  password: string;
}
