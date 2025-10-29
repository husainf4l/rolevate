import { ObjectType, Field } from '@nestjs/graphql';
import { Application } from './application.entity';

@ObjectType()
export class CandidateCredentials {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  token: string;
}

@ObjectType()
export class ApplicationResponse {
  @Field(() => Application)
  application: Application;

  @Field(() => CandidateCredentials, { nullable: true })
  candidateCredentials?: CandidateCredentials;

  @Field({ nullable: true })
  message?: string;
}
