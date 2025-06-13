import { Controller, Post, UploadedFile, UseInterceptors, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

@Controller('apply')
export class ApplyController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @UseInterceptors(FileInterceptor('cv', {
    storage: diskStorage({
      destination: './uploads/cvs',
      filename: (req, file, cb) => {
        const uniqueName = uuidv4() + extname(file.originalname);
        cb(null, uniqueName);
      },
    }),
  }))
  async apply(
    @UploadedFile() file: Express.Multer.File,
    @Body('jobPostId') jobPostId: string,
    @Body('phoneNumber') phoneNumber: string,
    @Body('coverLetter') coverLetter?: string // Optional cover letter
  ) {
    if (!file || !jobPostId || !phoneNumber) {
      throw new BadRequestException('Missing required fields');
    }
    const cvUrl = `${process.env.DOMAIN || 'http://localhost:3000'}/api/upload/${file.filename}`;

    // Find or create candidate
    let candidate = await this.prisma.candidate.findUnique({ where: { phoneNumber } });
    if (!candidate) {
      candidate = await this.prisma.candidate.create({
        data: { phoneNumber, cvUrl },
      });
    } else {
      await this.prisma.candidate.update({
        where: { id: candidate.id },
        data: { cvUrl },
      });
    }

    // Create Apply record
    const apply = await this.prisma.apply.create({
      data: {
        candidateId: candidate.id,
        jobPostId,
        cvUrl,
        // Optionally store coverLetter in Apply if you want
        coverLetter,
      },
    });

    // Create Application record (which is used by cv-analysis)
    const application = await this.prisma.application.create({
      data: {
        candidateId: candidate.id,
        jobPostId,
        cvUrl,
        coverLetter,
        status: 'PENDING',
      },
    });

    // Send to fastabi server (do not block or throw if it fails)
    axios.post(`${process.env.FASTABI_URL || 'http://localhost:8000'}/apply`, {
      applicationId: application.id, // Send the application ID, not the apply ID
      jobPostId,
      candidateId: candidate.id,
      cvUrl,
      coverLetter, // Send cover letter to fastabi as well
    }).catch((err) => {
      // Log the error but do not throw or block the response
      console.error('Failed to notify fastabi server:', err.message);
    });

    return { success: true, apply, application };
  }
}
