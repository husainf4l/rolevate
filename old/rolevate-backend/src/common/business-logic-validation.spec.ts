import { Test, TestingModule } from '@nestjs/testing';
import { ValidationUtils } from './validation-utils';
import { BadRequestException } from '@nestjs/common';

describe('Business Logic Validation Tests', () => {
  beforeEach(async () => {
    const _module: TestingModule = await Test.createTestingModule({
      providers: [ValidationUtils],
    }).compile();
  });

  describe('User Registration Logic Validation', () => {
    it('should validate email format', () => {
      expect(() => ValidationUtils.validateEmailFormat('invalid')).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateEmailFormat('invalid@')).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateEmailFormat('@invalid.com')).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateEmailFormat('test@example.com')).not.toThrow();
    });

    it('should validate required fields', () => {
      expect(() => ValidationUtils.validateRequired('', 'email')).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateRequired(null, 'name')).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateRequired(undefined, 'password')).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateRequired('valid@example.com', 'email')).not.toThrow();
    });

    it('should validate string length constraints', () => {
      expect(() => ValidationUtils.validateStringLength('a', 'name', 2, 100)).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateStringLength('this is a very long string that exceeds the maximum length allowed for this field', 'description', 2, 50)).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateStringLength('John Doe', 'name', 2, 100)).not.toThrow();
    });

    it('should validate phone format when provided', () => {
      expect(() => ValidationUtils.validatePhoneFormat('1234567890')).toThrow(BadRequestException);
      expect(() => ValidationUtils.validatePhoneFormat('+12345678901')).not.toThrow();
    });

    it('should validate URL format', () => {
      expect(() => ValidationUtils.validateUrlFormat('not-a-url')).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateUrlFormat('https://example.com')).not.toThrow();
      expect(() => ValidationUtils.validateUrlFormat('http://example.com')).not.toThrow();
    });
  });

  describe('Job Posting Logic Validation', () => {
    it('should validate numeric ranges for salary', () => {
      expect(() => ValidationUtils.validateNumericRange(-1000, 'salary', 0, 1000000)).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateNumericRange(50000, 'salary', 0, 1000000)).not.toThrow();
    });

    it('should validate job posting business rules', () => {
      const pastDeadline = new Date(Date.now() - 86400000).toISOString(); // Yesterday
      const futureDeadline = new Date(Date.now() + 86400000).toISOString(); // Tomorrow

      expect(() => ValidationUtils.validateJobPostingRules({
        deadline: pastDeadline,
        status: 'ACTIVE',
        title: 'Test Job',
        description: 'Test Description',
        location: 'Test Location'
      })).toThrow(BadRequestException);

      expect(() => ValidationUtils.validateJobPostingRules({
        deadline: futureDeadline,
        status: 'ACTIVE',
        title: 'Test Job',
        description: 'Test Description',
        location: 'Test Location'
      })).not.toThrow();
    });

    it('should validate required fields for active jobs', () => {
      expect(() => ValidationUtils.validateJobPostingRules({
        deadline: new Date(Date.now() + 86400000).toISOString(),
        status: 'ACTIVE',
        title: '',
        description: 'Test Description',
        location: 'Test Location'
      })).toThrow(BadRequestException);

      expect(() => ValidationUtils.validateJobPostingRules({
        deadline: new Date(Date.now() + 86400000).toISOString(),
        status: 'ACTIVE',
        title: 'Test Job',
        description: '',
        location: 'Test Location'
      })).toThrow(BadRequestException);
    });
  });

  describe('User Registration Business Rules', () => {
    it('should prevent admin registration through public signup', () => {
      expect(() => ValidationUtils.validateUserRegistrationRules({
        userType: 'ADMIN',
        email: 'admin@example.com',
        name: 'Admin User'
      })).toThrow(BadRequestException);
    });

    it('should validate user registration data', () => {
      expect(() => ValidationUtils.validateUserRegistrationRules({
        userType: 'CANDIDATE',
        email: 'invalid-email',
        name: 'John Doe'
      })).toThrow(BadRequestException);

      expect(() => ValidationUtils.validateUserRegistrationRules({
        userType: 'CANDIDATE',
        email: 'john@example.com',
        name: 'a' // Too short
      })).toThrow(BadRequestException);

      expect(() => ValidationUtils.validateUserRegistrationRules({
        userType: 'CANDIDATE',
        email: 'john@example.com',
        name: 'John Doe'
      })).not.toThrow();
    });
  });

  describe('Data Integrity and General Validation', () => {
    it('should validate enum values', () => {
      enum JobLevel {
        JUNIOR = 'JUNIOR',
        MID = 'MID',
        SENIOR = 'SENIOR'
      }

      expect(() => ValidationUtils.validateEnumValue('INVALID', JobLevel, 'jobLevel')).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateEnumValue('JUNIOR', JobLevel, 'jobLevel')).not.toThrow();
      expect(() => ValidationUtils.validateEnumValue('SENIOR', JobLevel, 'jobLevel')).not.toThrow();
    });

    it('should sanitize pagination parameters', () => {
      const result1 = ValidationUtils.sanitizePagination(150, -5);
      expect(result1.limit).toBe(100); // Max limit
      expect(result1.offset).toBe(0); // Min offset

      const result2 = ValidationUtils.sanitizePagination(10, 20);
      expect(result2.limit).toBe(10);
      expect(result2.offset).toBe(20);

      const result3 = ValidationUtils.sanitizePagination(); // Default values
      expect(result3.limit).toBe(20);
      expect(result3.offset).toBe(0);
    });
  });
});