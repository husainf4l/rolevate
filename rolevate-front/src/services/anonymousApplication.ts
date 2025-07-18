import { API_CONFIG } from '@/lib/config';

export interface AnonymousApplicationData {
  jobId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  coverLetter?: string;
  expectedSalary?: string;
  noticePeriod?: string;
}

export interface AnonymousApplicationResponse {
  success: boolean;
  message: string;
  applicationId: string;
  candidateId: string;
  email: string;
  temporaryPassword?: string; // Only for new accounts
  isNewAccount: boolean;
}

export interface CVUploadResponse {
  success: boolean;
  resumeUrl: string;
  message: string;
}

export class AnonymousApplicationService {
  
  /**
   * Apply with CV upload (multipart form)
   * This handles the complete flow: upload CV + create application
   */
  static async applyWithCV(
    jobId: string,
    cvFile: File,
    firstName?: string,
    lastName?: string,
    email?: string,
    phone?: string,
    portfolioUrl?: string,
    coverLetter?: string,
    expectedSalary?: string,
    noticePeriod?: string
  ): Promise<AnonymousApplicationResponse> {
    try {
      const formData = new FormData();
      formData.append('cv', cvFile);
      formData.append('jobId', jobId);
      
      if (firstName) {
        formData.append('firstName', firstName);
      }
      if (lastName) {
        formData.append('lastName', lastName);
      }
      if (email) {
        formData.append('email', email);
      }
      if (phone) {
        formData.append('phone', phone);
      }
      if (portfolioUrl) {
        formData.append('portfolioUrl', portfolioUrl);
      }
      if (coverLetter) {
        formData.append('coverLetter', coverLetter);
      }
      if (expectedSalary) {
        formData.append('expectedSalary', expectedSalary);
      }
      if (noticePeriod) {
        formData.append('noticePeriod', noticePeriod);
      }

      const response = await fetch(`${API_CONFIG.API_BASE_URL}/applications/anonymous`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header for FormData - browser will set it automatically with boundary
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: 'Failed to submit application' 
        }));
        throw new Error(error.message || 'Failed to submit application');
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting application with CV:', error);
      throw error;
    }
  }

  /**
   * Apply with existing resume URL (JSON)
   * This is for cases where CV was uploaded separately
   */
  static async applyAnonymous(data: AnonymousApplicationData): Promise<AnonymousApplicationResponse> {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/applications/anonymous`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: 'Failed to submit application' 
        }));
        throw new Error(error.message || 'Failed to submit application');
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting anonymous application:', error);
      throw error;
    }
  }

  /**
   * Upload CV file only (without creating application)
   * Useful for preview or separate upload step
   */
  static async uploadCV(cvFile: File): Promise<CVUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('cv', cvFile);

      const response = await fetch(`${API_CONFIG.API_BASE_URL}/applications/upload-cv`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: 'Failed to upload CV' 
        }));
        throw new Error(error.message || 'Failed to upload CV');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading CV:', error);
      throw error;
    }
  }

  /**
   * Validate file before upload
   */
  static validateCVFile(file: File): { isValid: boolean; error?: string } {
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 5MB'
      };
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'File must be PDF, DOC, or DOCX format'
      };
    }

    return { isValid: true };
  }

  /**
   * Get supported file types for display
   */
  static getSupportedFileTypes(): string[] {
    return ['PDF', 'DOC', 'DOCX'];
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default AnonymousApplicationService;
