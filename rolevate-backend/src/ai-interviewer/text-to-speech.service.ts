import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TextToSpeechService {
  private readonly logger = new Logger(TextToSpeechService.name);
  private readonly openai: OpenAI;
  private readonly audioOutputDir = './audio-output';

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    if (!apiKey) {
      this.logger.error('OpenAI API key is missing. Please check your .env file.');
    }
    
    this.openai = new OpenAI({
      apiKey,
    });
    
    // Ensure the audio output directory exists
    if (!fs.existsSync(this.audioOutputDir)) {
      fs.mkdirSync(this.audioOutputDir, { recursive: true });
    }
    
    this.logger.log('Text-to-Speech service initialized');
  }

  /**
   * Convert text to speech using OpenAI TTS API
   * @param text The text to convert to speech
   * @param voiceId The voice ID to use for TTS (default: 'alloy')
   * @returns Promise resolving to the path of the saved audio file
   */
  async textToSpeech(
    text: string,
    voiceId: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'nova',
  ): Promise<string> {
    try {
      // Generate a unique filename
      const filename = `tts-${Date.now()}-${Math.round(Math.random() * 1e9)}.mp3`;
      const outputPath = path.join(this.audioOutputDir, filename);

      // Call OpenAI's TTS API
      const mp3 = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: voiceId,
        input: text,
      });

      // Convert the response to a buffer
      const buffer = Buffer.from(await mp3.arrayBuffer());
      
      // Write the buffer to a file
      fs.writeFileSync(outputPath, buffer);
      
      this.logger.log(`Text-to-speech conversion complete: ${outputPath}`);
      
      return outputPath;
    } catch (error) {
      this.logger.error(`Error in text-to-speech conversion: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Clean up old audio files
   * @param maxAge Maximum age of files in milliseconds (default: 1 hour)
   */
  cleanupOldAudioFiles(maxAge: number = 3600000): void {
    try {
      const files = fs.readdirSync(this.audioOutputDir);
      const now = Date.now();
      
      for (const file of files) {
        const filePath = path.join(this.audioOutputDir, file);
        const stats = fs.statSync(filePath);
        
        // If the file is older than maxAge, delete it
        if (now - stats.mtimeMs > maxAge) {
          fs.unlinkSync(filePath);
          this.logger.log(`Deleted old audio file: ${filePath}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error cleaning up audio files: ${error.message}`, error.stack);
    }
  }
}
