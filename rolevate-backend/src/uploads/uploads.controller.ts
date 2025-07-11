import { Controller, Get, Post, Param, Res, NotFoundException, Logger, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

@Controller('uploads')
export class UploadsController {
  private readonly logger = new Logger(UploadsController.name);

  @Post('cvs')
  @UseInterceptors(FileInterceptor('cv', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        // Create temp directory for anonymous uploads
        const uploadDir = join(process.cwd(), 'uploads', 'cvs', 'anonymous');
        if (!existsSync(uploadDir)) {
          mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const fileExtension = extname(file.originalname);
        const fileName = `cv_${uuidv4()}${fileExtension}`;
        cb(null, fileName);
      },
    }),
    fileFilter: (req, file, cb) => {
      // Accept only PDF and DOC files
      const allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only PDF and DOC/DOCX files are allowed'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  }))
  async uploadAnonymousCV(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ cvUrl: string; message: string }> {
    if (!file) {
      throw new BadRequestException('No CV file uploaded');
    }

    // Generate the file URL that can be used in anonymous applications
    const cvUrl = `/uploads/cvs/anonymous/${file.filename}`;
    
    this.logger.log(`Anonymous CV uploaded successfully: ${file.filename}`);
    
    return {
      cvUrl,
      message: 'CV uploaded successfully. You can now apply for jobs using this CV.'
    };
  }

  @Get('cvs/:userId/:filename')
  async serveCV(
    @Param('userId') userId: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = join(process.cwd(), 'uploads', 'cvs', userId, filename);
    
    this.logger.log(`Attempting to serve file: ${filePath}`);
    
    if (!existsSync(filePath)) {
      this.logger.error(`File not found: ${filePath}`);
      throw new NotFoundException(`File not found: ${filename}`);
    }

    // Set appropriate headers for PDF files
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    this.logger.log(`Successfully serving file: ${filename}`);
    return res.sendFile(filePath);
  }

  @Get('cvs/anonymous/:filename')
  async serveAnonymousCV(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = join(process.cwd(), 'uploads', 'cvs', 'anonymous', filename);
    
    this.logger.log(`Attempting to serve anonymous CV: ${filePath}`);
    
    if (!existsSync(filePath)) {
      this.logger.error(`Anonymous CV not found: ${filePath}`);
      throw new NotFoundException(`CV file not found: ${filename}`);
    }

    // Determine content type based on file extension
    const ext = extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.doc') {
      contentType = 'application/msword';
    } else if (ext === '.docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    this.logger.log(`Successfully serving anonymous CV: ${filename}`);
    return res.sendFile(filePath);
  }
}
