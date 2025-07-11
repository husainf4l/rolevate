import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ensureDirSync } from 'fs-extra';

export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const user = req.user as any;
      const userId = user?.userId;
      
      if (!userId) {
        return cb(new Error('User not authenticated'), '');
      }
      
      const uploadPath = `./uploads/cvs/${userId}`;
      // Ensure directory exists
      ensureDirSync(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const user = req.user as any;
      const userId = user?.userId;
      const uniqueId = uuidv4();
      const fileExtension = extname(file.originalname);
      const filename = `cv_${uniqueId}${fileExtension}`;
      cb(null, filename);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
};

export const createUploadPath = (userId: string): string => {
  return `./uploads/cvs/${userId}`;
};
