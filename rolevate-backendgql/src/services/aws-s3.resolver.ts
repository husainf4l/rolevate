import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AwsS3Service } from './aws-s3.service';
import { S3UploadResponse, S3PresignedUrlResponse } from './aws-s3.dto';
import { GeneratePresignedUrlInput } from './aws-s3.input';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import type { FileUpload } from 'graphql-upload/processRequest.mjs';

@Resolver()
export class AwsS3Resolver {
  constructor(private readonly awsS3Service: AwsS3Service) {}

  @Mutation(() => S3UploadResponse)
  async uploadFileToS3(
    @Args({ name: 'file', type: () => GraphQLUpload })
    file: FileUpload,
    @Args('folder', { nullable: true }) folder?: string,
  ): Promise<S3UploadResponse> {
    const { createReadStream, filename, mimetype } = await file;

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    const stream = createReadStream();

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', async () => {
        const buffer = Buffer.concat(chunks);

        try {
          const url = await this.awsS3Service.uploadFile(buffer, filename, folder);

          // Extract key from URL
          const key = this.awsS3Service.extractKeyFromUrl(url);

          resolve({
            url,
            key,
            bucket: process.env.AWS_BUCKET_NAME,
          });
        } catch (error) {
          reject(error);
        }
      });
      stream.on('error', reject);
    });
  }

  @Mutation(() => S3UploadResponse)
  async uploadCVToS3(
    @Args({ name: 'file', type: () => GraphQLUpload })
    file: FileUpload,
    @Args('candidateId', { nullable: true }) candidateId?: string,
  ): Promise<S3UploadResponse> {
    const { createReadStream, filename } = await file;

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    const stream = createReadStream();

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', async () => {
        const buffer = Buffer.concat(chunks);

        try {
          const url = await this.awsS3Service.uploadCV(buffer, filename, candidateId);

          // Extract key from URL
          const key = this.awsS3Service.extractKeyFromUrl(url);

          resolve({
            url,
            key,
            bucket: process.env.AWS_BUCKET_NAME,
          });
        } catch (error) {
          reject(error);
        }
      });
      stream.on('error', reject);
    });
  }

  @Mutation(() => S3PresignedUrlResponse)
  async generateS3PresignedUrl(
    @Args('input') input: GeneratePresignedUrlInput,
  ): Promise<S3PresignedUrlResponse> {
    const url = await this.awsS3Service.generatePresignedUrl(
      input.s3Url,
      input.expiresIn,
    );

    return {
      url,
      expiresIn: input.expiresIn || 3600,
    };
  }

  @Mutation(() => Boolean)
  async deleteFileFromS3(@Args('s3Url') s3Url: string): Promise<boolean> {
    await this.awsS3Service.deleteFile(s3Url);
    return true;
  }

  @Query(() => Boolean)
  async isS3Url(@Args('url') url: string): Promise<boolean> {
    return this.awsS3Service.isS3Url(url);
  }
}
