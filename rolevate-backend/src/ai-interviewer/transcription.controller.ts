import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AiService } from './ai.service';
import * as path from 'path';
import * as fs from 'fs';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

@Controller('transcription')
export class TranscriptionController {
  private readonly logger = new Logger(TranscriptionController.name);
  private readonly openai: OpenAI;

  constructor(
    private readonly aiService: AiService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.error('OpenAI API key is missing');
      throw new Error('OpenAI API key is required');
    }
    this.openai = new OpenAI({ apiKey });
  }

  @Post('audio')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async transcribeAudio(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`Transcribing audio file: ${file.filename}`);

      // Ensure the uploads directory exists
      if (!fs.existsSync('./uploads')) {
        fs.mkdirSync('./uploads', { recursive: true });
      }

      // Transcribe the audio using OpenAI's Whisper API
      const transcript = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(file.path),
        model: 'whisper-1',
      });

      // Clean up the file after transcription
      fs.unlinkSync(file.path);

      return {
        transcript: transcript.text,
      };
    } catch (error) {
      this.logger.error(`Error transcribing audio: ${error.message}`, error.stack);
      
      // Clean up the file if it exists
      if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      throw new HttpException(
        'Failed to transcribe audio',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
