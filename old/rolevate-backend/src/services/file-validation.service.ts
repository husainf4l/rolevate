import { Injectable, BadRequestException } from '@nestjs/common';
import { extname } from 'path';

export interface FileValidationOptions {
  allowedMimeTypes: string[];
  maxSize: number; // in bytes
  allowedExtensions?: string[];
  sanitizeFilename?: boolean;
}

export interface ValidatedFile extends Express.Multer.File {
  sanitizedFilename?: string;
  isValid: boolean;
}

@Injectable()
export class FileValidationService {
  private readonly dangerousExtensions = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar', '.php', '.asp', '.jsp'
  ];

  /**
   * Validates a file against security and business rules
   */
  validateFile(file: Express.Multer.File, options: FileValidationOptions): ValidatedFile {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Check file size
    if (file.size > options.maxSize) {
      throw new BadRequestException(
        `File size ${this.formatBytes(file.size)} exceeds maximum allowed size of ${this.formatBytes(options.maxSize)}`
      );
    }

    // Check MIME type
    if (!options.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${options.allowedMimeTypes.join(', ')}`
      );
    }

    // Check file extension if specified
    if (options.allowedExtensions) {
      const fileExt = extname(file.originalname).toLowerCase();
      if (!options.allowedExtensions.includes(fileExt)) {
        throw new BadRequestException(
          `File extension ${fileExt} is not allowed. Allowed extensions: ${options.allowedExtensions.join(', ')}`
        );
      }
    }

    // Check for dangerous extensions
    const fileExt = extname(file.originalname).toLowerCase();
    if (this.dangerousExtensions.includes(fileExt)) {
      throw new BadRequestException(`File extension ${fileExt} is not allowed for security reasons`);
    }

    // Sanitize filename if requested
    let sanitizedFilename = file.originalname;
    if (options.sanitizeFilename) {
      sanitizedFilename = this.sanitizeFilename(file.originalname);
    }

    // Basic content validation for known file types
    this.validateFileContent(file);

    return {
      ...file,
      sanitizedFilename,
      isValid: true
    };
  }

  /**
   * Sanitizes filename to prevent path traversal and other attacks
   */
  private sanitizeFilename(filename: string): string {
    // Remove path separators and dangerous characters
    let sanitized = filename
      .replace(/[/\\:*?"<>|]/g, '') // Remove path separators and dangerous chars
      .replace(/\.\./g, '') // Remove directory traversal attempts
      .replace(/^\.+/, '') // Remove leading dots
      .replace(/\.+$/, '') // Remove trailing dots
      .trim();

    // Ensure filename is not empty and has reasonable length
    if (!sanitized || sanitized.length > 255) {
      sanitized = `file_${Date.now()}`;
    }

    return sanitized;
  }

  /**
   * Basic content validation for known file types
   */
  private validateFileContent(file: Express.Multer.File): void {
    const buffer = file.buffer;

    // Check for PDF files
    if (file.mimetype === 'application/pdf') {
      if (!buffer || buffer.length < 4) {
        throw new BadRequestException('Invalid PDF file');
      }
      // PDF files start with %PDF-
      const pdfHeader = buffer.subarray(0, 5).toString();
      if (pdfHeader !== '%PDF-') {
        throw new BadRequestException('Invalid PDF file format');
      }
    }

    // Check for image files (basic validation)
    if (file.mimetype.startsWith('image/')) {
      if (!buffer || buffer.length < 10) {
        throw new BadRequestException('Invalid image file');
      }
    }

    // Check for MS Word documents
    if (file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      if (!buffer || buffer.length < 8) {
        throw new BadRequestException('Invalid document file');
      }
    }
  }

  /**
   * Creates validation options for CV uploads with comprehensive format support
   */
  getCVValidationOptions(): FileValidationOptions {
    return {
      allowedMimeTypes: [
        // Document formats
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/rtf',
        'text/plain',
        'application/vnd.oasis.opendocument.text',
        // Image formats (for scanned CVs)
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/tiff',
        'image/webp'
      ],
      allowedExtensions: [
        // Document extensions
        '.pdf', '.doc', '.docx', '.rtf', '.txt', '.odt',
        // Image extensions
        '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.webp'
      ],
      maxSize: 25 * 1024 * 1024, // Increased to 25MB to accommodate high-resolution scanned documents
      sanitizeFilename: true
    };
  }

  /**
   * Creates validation options for image uploads
   */
  getImageValidationOptions(): FileValidationOptions {
    return {
      allowedMimeTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
      ],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      maxSize: 5 * 1024 * 1024, // 5MB
      sanitizeFilename: true
    };
  }

  /**
   * Creates validation options for avatar uploads
   */
  getAvatarValidationOptions(): FileValidationOptions {
    return {
      allowedMimeTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp'
      ],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
      maxSize: 2 * 1024 * 1024, // 2MB (smaller for avatars)
      sanitizeFilename: true
    };
  }

  /**
   * Formats bytes into human readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}