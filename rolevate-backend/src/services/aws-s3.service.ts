import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AwsS3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_BUCKET_NAME) {
      throw new Error('AWS configuration is missing. Please check your environment variables.');
    }

    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucketName = process.env.AWS_BUCKET_NAME;
  }

  async uploadCV(file: Buffer, originalName: string, candidateId?: string): Promise<string> {
    try {
      // Generate unique filename
      const fileExtension = originalName.split('.').pop() || 'pdf';
      const fileName = `cvs/${candidateId || 'anonymous'}/${uuidv4()}.${fileExtension}`;

      console.log('☁️ Uploading CV to S3:', fileName);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file,
        ContentType: this.getContentType(fileExtension),
        Metadata: {
          originalName,
          candidateId: candidateId || 'anonymous',
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);

      // Return the S3 URL
      const s3Url = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
      console.log('✅ CV uploaded to S3:', s3Url);
      
      return s3Url;
    } catch (error) {
      console.error('❌ Failed to upload CV to S3:', error);
      throw new InternalServerErrorException('Failed to upload CV to S3');
    }
  }

  async uploadFile(file: Buffer, fileName: string, folder: string = 'files'): Promise<string> {
    try {
      const key = `${folder}/${fileName}`;

      console.log('☁️ Uploading file to S3:', key);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        Metadata: {
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);

      // Return the S3 URL
      const s3Url = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      console.log('✅ File uploaded to S3:', s3Url);
      
      return s3Url;
    } catch (error) {
      console.error('❌ Failed to upload file to S3:', error);
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }

  async getFileBuffer(s3Url: string): Promise<Buffer> {
    try {
      // Extract key from S3 URL
      const key = this.extractKeyFromUrl(s3Url);
      
      console.log('📥 Downloading file from S3:', key);

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      
      if (!response.Body) {
        throw new Error('Empty response body');
      }

      // Convert stream to buffer
      const chunks: Buffer[] = [];
      const stream = response.Body as any;
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      
      const buffer = Buffer.concat(chunks);
      console.log('✅ File downloaded from S3, size:', buffer.length, 'bytes');
      
      return buffer;
    } catch (error) {
      console.error('❌ Failed to download file from S3:', error);
      throw new InternalServerErrorException(`Failed to download file from S3: ${error.message}`);
    }
  }

  async generatePresignedUrl(s3Url: string, expiresIn: number = 3600): Promise<string> {
    try {
      const key = this.extractKeyFromUrl(s3Url);

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn, // Default 1 hour
      });

      console.log('🔗 Generated presigned URL for:', key);
      return presignedUrl;
    } catch (error) {
      console.error('❌ Failed to generate presigned URL:', error);
      throw new InternalServerErrorException('Failed to generate presigned URL');
    }
  }

  async deleteFile(s3Url: string): Promise<void> {
    try {
      const key = this.extractKeyFromUrl(s3Url);

      console.log('🗑️ Deleting file from S3:', key);

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      console.log('✅ File deleted from S3:', key);
    } catch (error) {
      console.error('❌ Failed to delete file from S3:', error);
      throw new InternalServerErrorException('Failed to delete file from S3');
    }
  }

  private extractKeyFromUrl(s3Url: string): string {
    // Extract key from S3 URL
    // Format: https://bucket-name.s3.region.amazonaws.com/key
    const url = new URL(s3Url);
    return url.pathname.substring(1); // Remove leading slash
  }

  private getContentType(fileExtension: string): string {
    const extension = fileExtension?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'application/pdf';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'txt':
        return 'text/plain';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      default:
        return 'application/octet-stream';
    }
  }

  isS3Url(url: string): boolean {
    return url.includes('amazonaws.com') || url.includes('s3.');
  }
}
