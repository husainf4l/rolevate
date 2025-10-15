import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UploadFileInput {
  @Field()
  fileName: string;

  @Field({ nullable: true })
  folder?: string;

  @Field()
  contentType: string;
}

@InputType()
export class GeneratePresignedUrlInput {
  @Field()
  s3Url: string;

  @Field({ nullable: true })
  expiresIn?: number;
}
