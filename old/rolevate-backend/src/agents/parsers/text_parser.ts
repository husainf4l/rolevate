import * as mammoth from 'mammoth';
import { Logger } from '@nestjs/common';

export class TextParser {
  private readonly logger = new Logger(TextParser.name);

  /**
   * Parse DOCX file to text
   */
  async parseDocx(buffer: Buffer): Promise<string> {
    this.logger.log('Parsing DOCX file');

    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value;

      this.logger.log(`Extracted ${text.length} characters from DOCX`);
      return text;
    } catch (error) {
      this.logger.error('Error parsing DOCX:', error);
      throw new Error('Failed to parse DOCX file');
    }
  }

  /**
   * Parse plain text
   */
  parseText(buffer: Buffer): string {
    return buffer.toString('utf-8');
  }
}
