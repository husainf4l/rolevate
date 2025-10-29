import { InputType, Field } from '@nestjs/graphql';
import { CommunicationType, CommunicationDirection } from './communication.entity';

@InputType()
export class CreateCommunicationInput {
  @Field({ nullable: true })
  candidateId?: string;

  @Field({ nullable: true })
  companyId?: string;

  @Field({ nullable: true })
  jobId?: string;

  @Field({ nullable: true })
  applicationId?: string;

  @Field(() => CommunicationType)
  type: CommunicationType;

  @Field(() => CommunicationDirection)
  direction: CommunicationDirection;

  @Field()
  content: string;

  @Field({ nullable: true })
  phoneNumber?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  templateName?: string;

  @Field(() => [String], { nullable: true })
  templateParams?: string[];
}