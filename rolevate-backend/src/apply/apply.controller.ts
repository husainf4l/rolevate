import { Controller, Post, UploadedFile, UseInterceptors, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
// Fix FormData import
const FormData = require('form-data');

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
    // Use the /api/upload path (singular) to match the static file serving configuration
    const cvUrl = `${process.env.DOMAIN || 'http://localhost:4005'}/api/upload/${file.filename}`;

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
      
      // Also update cvUrl in any existing CV analyses for this candidate
      await this.prisma.cvAnalysis.updateMany({
        where: { candidateId: candidate.id },
        data: { cvUrl }
      });
      
      // Update cvUrl in all applications for this candidate
      await this.prisma.application.updateMany({
        where: { candidateId: candidate.id },
        data: { cvUrl }
      });
    }

    // Create Apply record - this can have multiple entries for the same candidate/job
    const apply = await this.prisma.apply.create({
      data: {
        candidateId: candidate.id,
        jobPostId,
        cvUrl,
        // Optionally store coverLetter in Apply if you want
        coverLetter,
      },
    });

    // Find existing application or create a new one
    const application = await this.prisma.application.upsert({
      where: {
        // Composite unique identifier
        jobPostId_candidateId: {
          jobPostId,
          candidateId: candidate.id,
        }
      },
      update: {
        // Update existing application with new CV and data
        cvUrl,
        coverLetter,
        updatedAt: new Date(),
      },
      create: {
        candidateId: candidate.id,
        jobPostId,
        cvUrl,
        coverLetter,
        status: 'PENDING',
      },
    });

    // Send to fastabi server (do not block or throw if it fails)
    try {
      // Create a new FormData instance with proper options
      const formData = new FormData();
      
      // Add the required fields for the FastAPI endpoint
      // Keep only snake_case versions as that's FastAPI's common convention
      formData.append('candidate_id', candidate.id);
      formData.append('job_post_id', jobPostId);
      formData.append('candidate_phone', phoneNumber); // Changed to match FastAPI expectation
      
      // Read the file from disk and append it to the form data
      const filePath = join(process.cwd(), 'uploads', 'cvs', file.filename);
      
      // Create a new stream for the file - don't reuse streams as they can only be consumed once
      const fileStream = fs.createReadStream(filePath);
      
      // Properly format the file attachment with the appropriate metadata
      // Use cv_file to match exactly what FastAPI is expecting
      formData.append('cv_file', fileStream, {
        filename: file.originalname,
        contentType: file.mimetype
      });
      
      // Optional: Add application ID and other metadata if needed
      formData.append('application_id', application.id);
      if (coverLetter) {
        formData.append('cover_letter', coverLetter);
      }
      
      // Debug what fields we're sending
      console.log('Sending fields to FastAPI:', {
        candidate_id: candidate.id,
        job_post_id: jobPostId,
        candidate_phone: phoneNumber,  // Updated to match FastAPI expectation
        application_id: application.id,
        cover_letter: coverLetter || 'none',
        cv_file: 'File stream attached' // Updated to match FastAPI expectation
      });
      
      // Get the headers that will be sent
      const headers = formData.getHeaders();
      console.log('Headers being sent:', headers);
      
      // Ensure we're using the right URL for the FastAPI server
      const fastApiUrl = process.env.FASTABI_URL || 'http://localhost:8000';
      console.log(`Sending request to: ${fastApiUrl}/apply`);
      
      // Send the multipart/form-data request to FastAPI
      await axios.post(
        `${fastApiUrl}/apply`, 
        formData, 
        { headers }
      );
      
      console.log('Successfully sent application to FastAPI server');
    } catch (err) {
      // Log the error but don't block the response
      console.error('Failed to notify fastabi server:', err.message);
      
      // Log more detailed error information if available
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('FastAPI server error data:', err.response.data);
        console.error('FastAPI server error status:', err.response.status);
        console.error('FastAPI server error headers:', err.response.headers);
      } else if (err.request) {
        // The request was made but no response was received
        console.error('FastAPI server no response, request details:', err.request);
      }
    }

    return { success: true, apply, application };
  }
}
