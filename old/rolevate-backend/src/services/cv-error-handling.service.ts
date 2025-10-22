import { Injectable, Logger } from '@nestjs/common';

export interface CVProcessingError {
  code: string;
  message: string;
  userMessage: string;
  technical: string;
  retryable: boolean;
  suggestions?: string[];
}

export enum CVErrorCodes {
  // File-related errors
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FORMAT = 'INVALID_FORMAT',
  CORRUPTED_FILE = 'CORRUPTED_FILE',
  DOWNLOAD_FAILED = 'DOWNLOAD_FAILED',
  
  // Processing errors
  TEXT_EXTRACTION_FAILED = 'TEXT_EXTRACTION_FAILED',
  INSUFFICIENT_TEXT = 'INSUFFICIENT_TEXT',
  OCR_FAILED = 'OCR_FAILED',
  PARSING_FAILED = 'PARSING_FAILED',
  
  // API errors
  OPENAI_API_ERROR = 'OPENAI_API_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  
  // System errors
  MEMORY_LIMIT_EXCEEDED = 'MEMORY_LIMIT_EXCEEDED',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

@Injectable()
export class CVErrorHandlingService {
  private readonly logger = new Logger(CVErrorHandlingService.name);

  /**
   * Convert technical errors to user-friendly CV processing errors
   */
  handleCVProcessingError(error: any, context?: string): CVProcessingError {
    this.logger.error(`CV Processing Error in ${context || 'unknown context'}:`, error);

    // Analyze error type and provide appropriate response
    if (this.isFileError(error)) {
      return this.handleFileError(error);
    }
    
    if (this.isNetworkError(error)) {
      return this.handleNetworkError(error);
    }
    
    if (this.isProcessingError(error)) {
      return this.handleProcessingError(error);
    }
    
    if (this.isAPIError(error)) {
      return this.handleAPIError(error);
    }
    
    if (this.isMemoryError(error)) {
      return this.handleMemoryError(error);
    }
    
    if (this.isTimeoutError(error)) {
      return this.handleTimeoutError(error);
    }

    // Default unknown error
    return this.createError(
      CVErrorCodes.UNKNOWN_ERROR,
      'An unexpected error occurred during CV processing',
      'We encountered an unexpected issue while processing your CV. Please try again, and if the problem persists, contact support.',
      error.message || 'Unknown error',
      true,
      [
        'Try uploading the CV again',
        'Ensure your CV file is not corrupted',
        'Try a different file format (PDF recommended)',
        'Contact support if the issue continues'
      ]
    );
  }

  /**
   * Check if error is file-related
   */
  private isFileError(error: any): boolean {
    const fileErrorPatterns = [
      /file not found/i,
      /invalid file/i,
      /file too large/i,
      /unsupported file/i,
      /corrupted/i,
      /file is empty/i,
      /no file provided/i
    ];
    
    return fileErrorPatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.toString())
    );
  }

  /**
   * Handle file-related errors
   */
  private handleFileError(error: any): CVProcessingError {
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('file not found')) {
      return this.createError(
        CVErrorCodes.FILE_NOT_FOUND,
        'CV file not found',
        'The CV file could not be found. Please try uploading it again.',
        error.message,
        true,
        ['Re-upload your CV file', 'Check that the file still exists on your device']
      );
    }
    
    if (message.includes('file too large') || message.includes('size')) {
      return this.createError(
        CVErrorCodes.FILE_TOO_LARGE,
        'CV file too large',
        'Your CV file is too large. Please use a file smaller than 25MB or compress your document.',
        error.message,
        false,
        [
          'Compress your CV file to reduce size',
          'Remove unnecessary images or graphics',
          'Save as a lower quality PDF',
          'Use a different file format like DOC or TXT'
        ]
      );
    }
    
    if (message.includes('unsupported') || message.includes('invalid format')) {
      return this.createError(
        CVErrorCodes.INVALID_FORMAT,
        'Unsupported file format',
        'This file format is not supported. Please use PDF, DOC, DOCX, RTF, TXT, ODT, or image formats (JPG, PNG).',
        error.message,
        false,
        [
          'Convert your CV to PDF format',
          'Save your document as DOC or DOCX',
          'If it\'s a scanned CV, use JPG or PNG format'
        ]
      );
    }
    
    if (message.includes('corrupted') || message.includes('empty')) {
      return this.createError(
        CVErrorCodes.CORRUPTED_FILE,
        'CV file appears to be corrupted',
        'Your CV file appears to be corrupted or empty. Please try uploading a different version.',
        error.message,
        true,
        [
          'Try opening your CV file to verify it\'s not corrupted',
          'Re-save or re-export your CV document',
          'Upload a backup copy of your CV if available'
        ]
      );
    }

    return this.createGenericFileError(error);
  }

  /**
   * Check if error is network-related
   */
  private isNetworkError(error: any): boolean {
    const networkErrorPatterns = [
      /network/i,
      /connection/i,
      /timeout/i,
      /enotfound/i,
      /econnreset/i,
      /download.*failed/i
    ];
    
    return networkErrorPatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.code)
    );
  }

  /**
   * Handle network-related errors
   */
  private handleNetworkError(error: any): CVProcessingError {
    return this.createError(
      CVErrorCodes.DOWNLOAD_FAILED,
      'Failed to download CV file',
      'Unable to access your CV file due to a network issue. Please try again.',
      error.message,
      true,
      [
        'Check your internet connection',
        'Try uploading the CV again',
        'Wait a moment and retry the operation'
      ]
    );
  }

  /**
   * Check if error is processing-related
   */
  private isProcessingError(error: any): boolean {
    const processingErrorPatterns = [
      /text.*extract/i,
      /ocr.*failed/i,
      /parsing.*failed/i,
      /insufficient.*text/i,
      /no.*text.*extracted/i
    ];
    
    return processingErrorPatterns.some(pattern => 
      pattern.test(error.message)
    );
  }

  /**
   * Handle processing-related errors
   */
  private handleProcessingError(error: any): CVProcessingError {
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('insufficient text') || message.includes('no text')) {
      return this.createError(
        CVErrorCodes.INSUFFICIENT_TEXT,
        'Unable to extract text from CV',
        'We couldn\'t extract enough readable text from your CV. This may be a scanned document or image. Please try a text-based format.',
        error.message,
        false,
        [
          'If it\'s a scanned CV, ensure the image is clear and high-quality',
          'Try converting to a text-based format like DOC or PDF with selectable text',
          'Re-create your CV in Word or Google Docs and save as PDF',
          'Ensure the document contains actual text, not just images'
        ]
      );
    }
    
    if (message.includes('ocr')) {
      return this.createError(
        CVErrorCodes.OCR_FAILED,
        'Failed to read text from scanned CV',
        'We couldn\'t read the text from your scanned CV image. Please ensure the image is clear and try again.',
        error.message,
        true,
        [
          'Ensure your scanned CV image is high quality and clear',
          'Try scanning at a higher resolution (300 DPI or higher)',
          'Make sure the text is dark and the background is light',
          'Consider using a text-based format instead'
        ]
      );
    }

    return this.createError(
      CVErrorCodes.TEXT_EXTRACTION_FAILED,
      'Failed to process CV content',
      'We encountered an issue while processing your CV content. Please try again or use a different format.',
      error.message,
      true,
      [
        'Try uploading your CV in a different format (PDF recommended)',
        'Ensure your CV file is not password-protected',
        'Try re-saving your document and uploading again'
      ]
    );
  }

  /**
   * Check if error is API-related
   */
  private isAPIError(error: any): boolean {
    return error.status || error.response?.status || 
           error.message?.includes('API') || 
           error.message?.includes('rate limit') ||
           error.message?.includes('quota');
  }

  /**
   * Handle API-related errors
   */
  private handleAPIError(error: any): CVProcessingError {
    if (error.status === 429 || error.message?.includes('rate limit')) {
      return this.createError(
        CVErrorCodes.RATE_LIMIT_EXCEEDED,
        'Rate limit exceeded',
        'Too many requests at the moment. Please wait a few minutes before trying again.',
        error.message,
        true,
        ['Wait 2-3 minutes before trying again', 'Try during off-peak hours']
      );
    }
    
    if (error.message?.includes('quota')) {
      return this.createError(
        CVErrorCodes.QUOTA_EXCEEDED,
        'Service quota exceeded',
        'CV analysis service is temporarily unavailable due to high demand. Please try again later.',
        error.message,
        true,
        ['Try again in a few hours', 'Contact support if this continues']
      );
    }

    return this.createError(
      CVErrorCodes.OPENAI_API_ERROR,
      'CV analysis service error',
      'Our CV analysis service is temporarily experiencing issues. Please try again.',
      error.message,
      true,
      ['Try again in a few minutes', 'Contact support if the problem persists']
    );
  }

  /**
   * Check if error is memory-related
   */
  private isMemoryError(error: any): boolean {
    return error.message?.includes('memory') || 
           error.code === 'ENOMEM';
  }

  /**
   * Handle memory-related errors
   */
  private handleMemoryError(error: any): CVProcessingError {
    return this.createError(
      CVErrorCodes.MEMORY_LIMIT_EXCEEDED,
      'File too complex to process',
      'Your CV file is too complex or large for processing. Please try a simpler format or smaller file.',
      error.message,
      false,
      [
        'Reduce the file size by compressing images',
        'Remove complex formatting or graphics',
        'Save as a simpler format like TXT or basic PDF'
      ]
    );
  }

  /**
   * Check if error is timeout-related
   */
  private isTimeoutError(error: any): boolean {
    return error.code === 'ETIMEDOUT' || 
           error.message?.includes('timeout');
  }

  /**
   * Handle timeout-related errors
   */
  private handleTimeoutError(error: any): CVProcessingError {
    return this.createError(
      CVErrorCodes.TIMEOUT_ERROR,
      'Processing timeout',
      'CV processing is taking longer than expected. Please try again with a simpler document.',
      error.message,
      true,
      [
        'Try again with a smaller or simpler CV file',
        'Remove complex graphics or formatting',
        'Wait a moment and retry the operation'
      ]
    );
  }

  /**
   * Create a generic file error
   */
  private createGenericFileError(error: any): CVProcessingError {
    return this.createError(
      CVErrorCodes.CORRUPTED_FILE,
      'File processing error',
      'There was an issue processing your CV file. Please try uploading it again or use a different format.',
      error.message,
      true,
      [
        'Try uploading your CV again',
        'Use a different file format (PDF recommended)',
        'Ensure the file is not corrupted or password-protected'
      ]
    );
  }

  /**
   * Create a standardized error object
   */
  private createError(
    code: CVErrorCodes,
    message: string,
    userMessage: string,
    technical: string,
    retryable: boolean,
    suggestions: string[] = []
  ): CVProcessingError {
    return {
      code,
      message,
      userMessage,
      technical,
      retryable,
      suggestions
    };
  }

  /**
   * Get user-friendly error message with suggestions
   */
  getFormattedErrorMessage(error: CVProcessingError): string {
    let formatted = error.userMessage;
    
    if (error.suggestions && error.suggestions.length > 0) {
      formatted += '\n\nSuggestions:\n';
      error.suggestions.forEach((suggestion, index) => {
        formatted += `${index + 1}. ${suggestion}\n`;
      });
    }
    
    return formatted;
  }
}