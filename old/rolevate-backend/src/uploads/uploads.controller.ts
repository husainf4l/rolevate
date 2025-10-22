import { Controller, Get, Post, Param, Res, NotFoundException, Logger, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';
import { extname } from 'path';
import { Public } from '../auth/public.decorator';
import { AwsS3Service } from '../services/aws-s3.service';
import { FileValidationService } from '../services/file-validation.service';

@Controller('uploads')
export class UploadsController {
  private readonly logger = new Logger(UploadsController.name);

  constructor(
    private readonly awsS3Service: AwsS3Service,
    private readonly fileValidationService: FileValidationService,
  ) {}

  @Post('cvs')
  @UseInterceptors(FileInterceptor('cv', {
    storage: multer.memoryStorage(),
  }))
  async uploadAnonymousCV(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ cvUrl: string; message: string }> {
    // Validate file using our enhanced validation service
    const validationOptions = this.fileValidationService.getCVValidationOptions();
    const validatedFile = this.fileValidationService.validateFile(file, validationOptions);

    try {
      // Upload to S3 directly using validated file
      const s3Url = await this.awsS3Service.uploadCV(
        validatedFile.buffer,
        validatedFile.sanitizedFilename || validatedFile.originalname,
        'anonymous'
      );
      
      this.logger.log(`Anonymous CV uploaded to S3 successfully: ${s3Url}`);
      
      return {
        cvUrl: s3Url,
        message: 'CV uploaded to S3 successfully. You can now apply for jobs using this CV.'
      };
    } catch (error) {
      this.logger.error('Failed to upload CV to S3:', error);
      throw new BadRequestException('Failed to upload CV to S3');
    }
  }



  @Public()
  @Get('cvs/:userId/:filename')
  async serveCV(
    @Param('userId') userId: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    try {
      // Generate S3 presigned URL for the CV
      const s3Key = `cvs/${userId}/${filename}`;
      const s3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
      const presignedUrl = await this.awsS3Service.generatePresignedUrl(s3Url);
      
      this.logger.log(`Redirecting to S3 presigned URL for: ${filename}`);
      return res.redirect(presignedUrl);
    } catch {
      this.logger.error(`CV not found in S3: ${filename}`);
      throw new NotFoundException(`CV file not found: ${filename}`);
    }
  }

  @Public()
  @Get('cvs/anonymous/:filename')
  async serveAnonymousCV(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    try {
      // Generate S3 presigned URL for anonymous CV
      const s3Key = `cvs/anonymous/${filename}`;
      const s3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
      const presignedUrl = await this.awsS3Service.generatePresignedUrl(s3Url);
      
      this.logger.log(`Redirecting to S3 presigned URL for anonymous CV: ${filename}`);
      return res.redirect(presignedUrl);
    } catch {
      this.logger.error(`Anonymous CV not found in S3: ${filename}`);
      throw new NotFoundException(`CV file not found: ${filename}`);
    }
  }

  @Public()
  @Get('logos/:filename')
  async getLogo(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', 'logos', filename);
    
    if (!existsSync(filePath)) {
      this.logger.error(`Logo not found: ${filePath}`);
      throw new NotFoundException(`Logo file not found: ${filename}`);
    }

    // Determine content type based on file extension
    const ext = extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
    } else if (ext === '.webp') {
      contentType = 'image/webp';
    }

    // Set CORS headers for images
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    
    this.logger.log(`Successfully serving logo: ${filename}`);
    return res.sendFile(filePath);
  }

  @Public()
  @Get('avatars/:filename')
  async getAvatar(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', 'avatars', filename);
    
    if (!existsSync(filePath)) {
      this.logger.error(`Avatar not found: ${filePath}`);
      throw new NotFoundException(`Avatar file not found: ${filename}`);
    }

    // Determine content type based on file extension
    const ext = extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
    } else if (ext === '.webp') {
      contentType = 'image/webp';
    }

    // Set CORS headers for images
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    
    this.logger.log(`Successfully serving avatar: ${filename}`);
    return res.sendFile(filePath);
  }
}
