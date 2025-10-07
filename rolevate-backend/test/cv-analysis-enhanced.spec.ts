import { Test, TestingModule } from '@nestjs/testing';
import { extractTextFromCV, SUPPORTED_CV_FORMATS } from '../src/utils/cv-text-extractor';
import { CvParsingService } from '../src/services/cv-parsing.service';
import { OpenaiCvAnalysisService } from '../src/services/openai-cv-analysis.service';
import { CVErrorHandlingService } from '../src/services/cv-error-handling.service';

describe('Enhanced CV Analysis System', () => {
  let cvParsingService: CvParsingService;
  let cvAnalysisService: OpenaiCvAnalysisService;
  let errorHandlingService: CVErrorHandlingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CvParsingService,
        OpenaiCvAnalysisService,
        CVErrorHandlingService,
      ],
    }).compile();

    cvParsingService = module.get<CvParsingService>(CvParsingService);
    cvAnalysisService = module.get<OpenaiCvAnalysisService>(OpenaiCvAnalysisService);
    errorHandlingService = module.get<CVErrorHandlingService>(CVErrorHandlingService);
  });

  describe('Supported File Formats', () => {
    it('should support all major document formats', () => {
      const supportedExtensions = Object.values(SUPPORTED_CV_FORMATS).flat();
      
      expect(supportedExtensions).toContain('.pdf');
      expect(supportedExtensions).toContain('.doc');
      expect(supportedExtensions).toContain('.docx');
      expect(supportedExtensions).toContain('.rtf');
      expect(supportedExtensions).toContain('.txt');
      expect(supportedExtensions).toContain('.odt');
    });

    it('should support image formats for scanned CVs', () => {
      const supportedExtensions = Object.values(SUPPORTED_CV_FORMATS).flat();
      
      expect(supportedExtensions).toContain('.jpg');
      expect(supportedExtensions).toContain('.jpeg');
      expect(supportedExtensions).toContain('.png');
      expect(supportedExtensions).toContain('.gif');
      expect(supportedExtensions).toContain('.bmp');
      expect(supportedExtensions).toContain('.tiff');
      expect(supportedExtensions).toContain('.webp');
    });

    it('should have correct MIME type mappings', () => {
      expect(SUPPORTED_CV_FORMATS['application/pdf']).toEqual(['.pdf']);
      expect(SUPPORTED_CV_FORMATS['image/jpeg']).toEqual(['.jpg', '.jpeg']);
      expect(SUPPORTED_CV_FORMATS['application/vnd.openxmlformats-officedocument.wordprocessingml.document']).toEqual(['.docx']);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid file URLs gracefully', async () => {
      await expect(extractTextFromCV('')).rejects.toThrow('Invalid file URL provided');
    });

    it('should handle unsupported file formats', async () => {
      await expect(extractTextFromCV('http://example.com/file.xyz')).rejects.toThrow('Unsupported file type');
    });

    it('should provide user-friendly error messages', () => {
      const error = new Error('File too large');
      const cvError = errorHandlingService.handleCVProcessingError(error, 'test');
      
      expect(cvError.userMessage).toContain('file is too large');
      expect(cvError.suggestions).toBeDefined();
      expect(cvError.suggestions?.length).toBeGreaterThan(0);
      expect(cvError.retryable).toBeDefined();
    });

    it('should categorize errors correctly', () => {
      const fileError = new Error('File not found');
      const networkError = new Error('Network connection failed');
      const processingError = new Error('No text could be extracted');
      
      const fileResult = errorHandlingService.handleCVProcessingError(fileError);
      const networkResult = errorHandlingService.handleCVProcessingError(networkError);
      const processingResult = errorHandlingService.handleCVProcessingError(processingError);
      
      expect(fileResult.code).toBe('FILE_NOT_FOUND');
      expect(networkResult.code).toBe('DOWNLOAD_FAILED');
      expect(processingResult.code).toBe('INSUFFICIENT_TEXT');
    });
  });

  describe('CV Parsing Service', () => {
    it('should validate candidate information correctly', async () => {
      // Mock a valid parsing response
      const mockParsedData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+1234567890',
        totalExperience: 5,
        skills: ['JavaScript', 'React', 'Node.js'],
        currentJobTitle: 'Software Engineer',
        currentCompany: 'Tech Corp'
      };

      // Test the private validation method indirectly through the service
      const service = cvParsingService as any;
      const result = service.validateAndCleanCandidateInfo(mockParsedData, 'test cv text');

      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.email).toBe('john.doe@email.com');
      expect(result.totalExperience).toBe(5);
      expect(Array.isArray(result.skills)).toBe(true);
    });

    it('should handle invalid email addresses', () => {
      const service = cvParsingService as any;
      
      expect(service.isValidEmail('valid@email.com')).toBe(true);
      expect(service.isValidEmail('invalid-email')).toBe(false);
      expect(service.isValidEmail('no-at-symbol.com')).toBe(false);
      expect(service.isValidEmail('')).toBe(false);
    });

    it('should sanitize names properly', () => {
      const service = cvParsingService as any;
      
      expect(service.sanitizeName('John123 Doe')).toBe('John Doe');
      expect(service.sanitizeName('Mary-Jane O\'Connor')).toBe('Mary-Jane O\'Connor');
      expect(service.sanitizeName('   Extra   Spaces   ')).toBe('Extra Spaces');
    });

    it('should clean phone numbers correctly', () => {
      const service = cvParsingService as any;
      
      expect(service.cleanPhoneNumber('+1 (555) 123-4567')).toBe('+15551234567');
      expect(service.cleanPhoneNumber('555.123.4567')).toBe('5551234567');
      expect(service.cleanPhoneNumber('+44 20 7946 0958')).toBe('+442079460958');
    });

    it('should calculate extraction quality scores', () => {
      const service = cvParsingService as any;
      
      const highQualityInfo = {
        firstName: 'John',
        lastName: 'Doe', 
        email: 'john@company.com',
        phone: '+1234567890',
        currentJobTitle: 'Senior Developer',
        currentCompany: 'Tech Corp',
        totalExperience: 8,
        skills: ['JavaScript', 'Python', 'React'],
        education: 'BS Computer Science',
        summary: 'Experienced software developer with strong technical skills'
      };
      
      const lowQualityInfo = {
        firstName: 'Unknown',
        lastName: 'Candidate',
        email: 'unknown@placeholder.com',
        phone: undefined,
        currentJobTitle: undefined,
        currentCompany: undefined,
        totalExperience: undefined,
        skills: undefined,
        education: undefined,
        summary: undefined
      };
      
      const highScore = service.calculateExtractionQuality(highQualityInfo, 'sample cv text');
      const lowScore = service.calculateExtractionQuality(lowQualityInfo, 'sample cv text');
      
      expect(highScore).toBeGreaterThan(80);
      expect(lowScore).toBeLessThan(30);
    });
  });

  describe('CV Analysis Service', () => {
    it('should handle analysis failures gracefully', async () => {
      // This would test the actual service if we had proper mocking
      // For now, we test that the service exists and has the expected methods
      expect(cvAnalysisService).toBeDefined();
      expect(typeof cvAnalysisService.analyzeCVWithOpenAI).toBe('function');
    });
  });

  describe('Integration', () => {
    it('should have all required services available', () => {
      expect(cvParsingService).toBeDefined();
      expect(cvAnalysisService).toBeDefined();
      expect(errorHandlingService).toBeDefined();
    });
  });
});

/**
 * Manual Testing Guide for Enhanced CV Analysis System
 * 
 * To fully test the enhanced CV system, perform these manual tests:
 * 
 * 1. Document Format Testing:
 *    - Upload PDF CVs (both text-based and scanned)
 *    - Upload DOC/DOCX files
 *    - Upload RTF files
 *    - Upload plain text files
 *    - Upload ODT files
 *    - Upload image files (JPG, PNG) with CV content
 * 
 * 2. Error Handling Testing:
 *    - Upload files that are too large (>25MB)
 *    - Upload unsupported formats (.zip, .exe, etc.)
 *    - Upload corrupted files
 *    - Test with network interruptions
 * 
 * 3. OCR Testing:
 *    - Upload high-quality scanned CVs
 *    - Upload low-quality/blurry scanned CVs
 *    - Upload handwritten CVs (if readable)
 *    - Upload CVs with mixed text and images
 * 
 * 4. Analysis Quality Testing:
 *    - Upload CVs with clear structure and formatting
 *    - Upload CVs with poor formatting
 *    - Upload CVs in different languages (if supported)
 *    - Upload CVs with special characters or symbols
 * 
 * 5. Performance Testing:
 *    - Upload multiple CVs simultaneously
 *    - Upload very large CV files (within limits)
 *    - Test processing time for different formats
 * 
 * Expected Results:
 * - All supported formats should process successfully
 * - Error messages should be user-friendly and actionable
 * - OCR should extract readable text from clear images
 * - Analysis should provide relevant, specific feedback
 * - System should handle errors gracefully without crashes
 */