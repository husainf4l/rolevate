import {
  Controller,
  Get,
  Param,
  Res,
  Logger,
  HttpException,
  HttpStatus,
  Post,
  Body,
} from '@nestjs/common';
import { Response } from 'express';
import { TextToSpeechService } from './text-to-speech.service';
import { SynthesizeSpeechDto } from './dto/audio.dto';
import * as fs from 'fs';
import * as path from 'path';

@Controller('audio')
export class AudioController {
  private readonly logger = new Logger(AudioController.name);
  private readonly audioOutputDir = './audio-output';

  constructor(private readonly textToSpeechService: TextToSpeechService) {}

  @Post('synthesize')
  async synthesizeSpeech(@Body() data: SynthesizeSpeechDto) {
    try {
      const { text, voice = 'nova' } = data;
      
      this.logger.log(`Synthesizing speech for text: ${text.substring(0, 50)}...`);
      
      const audioPath = await this.textToSpeechService.textToSpeech(
        text,
        voice as any,
      );
      
      // Get just the filename from the path
      const filename = path.basename(audioPath);
      
      return {
        audioUrl: `/audio/file/${filename}`,
        message: 'Speech synthesized successfully',
      };
    } catch (error) {
      this.logger.error(`Error synthesizing speech: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to synthesize speech',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('file/:filename')
  async getAudioFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    try {
      const filePath = path.join(this.audioOutputDir, filename);
      
      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        throw new HttpException('Audio file not found', HttpStatus.NOT_FOUND);
      }
      
      // Stream the file to the response
      const fileStream = fs.createReadStream(filePath);
      res.setHeader('Content-Type', 'audio/mpeg');
      fileStream.pipe(res);
    } catch (error) {
      this.logger.error(`Error serving audio file: ${error.message}`, error.stack);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to serve audio file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('cleanup')
  async cleanupAudioFiles() {
    try {
      this.textToSpeechService.cleanupOldAudioFiles();
      return { message: 'Audio files cleanup initiated' };
    } catch (error) {
      this.logger.error(`Error cleaning up audio files: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to clean up audio files',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
