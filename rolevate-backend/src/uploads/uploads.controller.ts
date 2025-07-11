import { Controller, Get, Param, Res, NotFoundException, Logger } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller('uploads')
export class UploadsController {
  private readonly logger = new Logger(UploadsController.name);

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
}
