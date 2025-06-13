import { Controller, Get, Param, Res } from '@nestjs/common';
import { join } from 'path';
import { Response } from 'express';
import * as fs from 'fs';

@Controller('upload')
export class UploadsController {
  @Get(':filename')
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', 'cvs', filename);
    
    // Check if the file exists
    if (fs.existsSync(filePath)) {
      // Return the file
      return res.sendFile(filePath);
    } else {
      // Return a 404 if the file doesn't exist
      return res.status(404).json({
        statusCode: 404,
        message: `File ${filename} not found`,
      });
    }
  }
}
