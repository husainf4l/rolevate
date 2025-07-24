import { memoryStorage } from 'multer';

export const multerConfig = {
  storage: memoryStorage(), // Use memory storage for S3 uploads
  fileFilter: (req, file, cb) => {
    // Allow PDF, DOC, and DOCX files
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOC/DOCX files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
};

export const createS3UploadPath = (userId: string): string => {
  return `cvs/${userId}`;
};
