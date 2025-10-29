import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class S3UploadResponse {
  @Field()
  url: string;

  @Field()
  key: string;

  @Field({ nullable: true })
  bucket?: string;
}

@ObjectType()
export class S3PresignedUrlResponse {
  @Field()
  url: string;

  @Field()
  expiresIn: number;
}
