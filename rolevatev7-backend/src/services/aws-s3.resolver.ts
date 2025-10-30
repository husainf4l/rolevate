import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AwsS3Service } from './aws-s3.service';
import { S3UploadResponse, S3PresignedUrlResponse } from './aws-s3.dto';
import { GeneratePresignedUrlInput } from './aws-s3.input';

/**
 * BEST PRACTICE FOR APOLLO SERVER 5:
 * Use base64 encoding instead of multipart uploads.
 * 
 * Why? Apollo Server 4+ removed built-in file upload support.
 * Base64 encoding is:
 * - Simpler and more reliable
 * - Works with all GraphQL implementations
 * - No multipart complexity
 * - Industry standard for modern GraphQL APIs
 */

@Resolver()
export class AwsS3Resolver {
  constructor(private readonly awsS3Service: AwsS3Service) {}

  @Mutation(() => S3UploadResponse, {
    description: 'Upload a file to S3 using base64 encoding. The file should be sent as a base64-encoded string along with filename and mimetype.'
  })
  async uploadFileToS3(
    @Args('base64File', { description: 'Base64 encoded file content' }) base64File: string,
    @Args('filename', { description: 'Original filename with extension' }) filename: string,
    @Args('mimetype', { description: 'File MIME type (e.g., application/pdf, image/jpeg)' }) mimetype: string,
    @Args('folder', { nullable: true, description: 'Optional S3 folder path' }) folder?: string,
  ): Promise<S3UploadResponse> {
    try {
      // Decode base64 to buffer
      const buffer = Buffer.from(base64File, 'base64');
      
      // Upload to S3
      const url = await this.awsS3Service.uploadFile(buffer, filename, folder);
      const key = this.awsS3Service.extractKeyFromUrl(url);

      return {
        url,
        key,
        bucket: process.env.AWS_BUCKET_NAME,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`File upload failed: ${errorMessage}`);
    }
  }

  @Mutation(() => S3UploadResponse, {
    description: 'Upload a CV/resume to S3 using base64 encoding. Files are stored in cvs/{candidateId}/ folder.'
  })
  async uploadCVToS3(
    @Args('base64File', { description: 'Base64 encoded file content' }) base64File: string,
    @Args('filename', { description: 'Original filename with extension' }) filename: string,
    @Args('mimetype', { description: 'File MIME type' }) mimetype: string,
    @Args('candidateId', { nullable: true, description: 'Candidate ID for organizing CVs' }) candidateId?: string,
  ): Promise<S3UploadResponse> {
    try {
      // Decode base64 to buffer
      const buffer = Buffer.from(base64File, 'base64');
      
      // Upload to S3
      const url = await this.awsS3Service.uploadCV(buffer, filename, candidateId);
      const key = this.awsS3Service.extractKeyFromUrl(url);

      return {
        url,
        key,
        bucket: process.env.AWS_BUCKET_NAME,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`CV upload failed: ${errorMessage}`);
    }
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
