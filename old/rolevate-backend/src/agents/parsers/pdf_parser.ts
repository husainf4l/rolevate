import * as pdf from 'pdf-parse';
import { Logger } from '@nestjs/common';

export class PdfParser {
  private readonly logger = new Logger(PdfParser.name);

  async parse(buffer: Buffer): Promise<string> {
    this.logger.log('Parsing PDF file');

    try {
      const data = await pdf(buffer);
      const text = data.text;

      this.logger.log(`Extracted ${text.length} characters from PDF`);
      return text;
    } catch (error) {
      this.logger.error('Error parsing PDF:', error);
      throw new Error('Failed to parse PDF file');
    }
  }
}
