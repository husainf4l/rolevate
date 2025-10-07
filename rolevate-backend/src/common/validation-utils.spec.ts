import { BadRequestException } from '@nestjs/common';
import { ValidationUtils } from './validation-utils';

describe('ValidationUtils', () => {
  describe('validateRequired', () => {
    it('should not throw for non-empty values', () => {
      expect(() => ValidationUtils.validateRequired('test', 'field')).not.toThrow();
      expect(() => ValidationUtils.validateRequired(123, 'field')).not.toThrow();
      expect(() => ValidationUtils.validateRequired({}, 'field')).not.toThrow();
      expect(() => ValidationUtils.validateRequired([], 'field')).not.toThrow();
    });

    it('should throw for null or undefined', () => {
      expect(() => ValidationUtils.validateRequired(null, 'testField')).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateRequired(null, 'testField')).toThrow('testField is required');
      expect(() => ValidationUtils.validateRequired(undefined, 'testField')).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateRequired(undefined, 'testField')).toThrow('testField is required');
    });

    it('should throw for empty string', () => {
      expect(() => ValidationUtils.validateRequired('', 'testField')).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateRequired('', 'testField')).toThrow('testField is required');
    });
  });

  describe('validateStringLength', () => {
    it('should not throw for valid string lengths', () => {
      expect(() => ValidationUtils.validateStringLength('test', 'field', 1, 10)).not.toThrow();
      expect(() => ValidationUtils.validateStringLength('test', 'field', undefined, 10)).not.toThrow();
      expect(() => ValidationUtils.validateStringLength('test', 'field', 1)).not.toThrow();
      expect(() => ValidationUtils.validateStringLength('test', 'field')).not.toThrow();
    });

    it('should throw for string too short', () => {
      expect(() => ValidationUtils.validateStringLength('a', 'testField', 2)).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateStringLength('a', 'testField', 2)).toThrow('testField must be at least 2 characters');
    });

    it('should throw for string too long', () => {
      expect(() => ValidationUtils.validateStringLength('verylongstring', 'testField', undefined, 5)).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateStringLength('verylongstring', 'testField', undefined, 5)).toThrow('testField must be less than 5 characters');
    });
  });

  describe('validateEmailFormat', () => {
    it('should not throw for valid email formats', () => {
      expect(() => ValidationUtils.validateEmailFormat('test@example.com')).not.toThrow();
      expect(() => ValidationUtils.validateEmailFormat('user.name+tag@domain.co.uk')).not.toThrow();
    });

    it('should throw for invalid email formats', () => {
      expect(() => ValidationUtils.validateEmailFormat('invalid-email')).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateEmailFormat('invalid-email')).toThrow('Invalid email format');
      expect(() => ValidationUtils.validateEmailFormat('@domain.com')).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateEmailFormat('user@')).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateEmailFormat('')).toThrow(BadRequestException);
    });
  });

  describe('validatePhoneFormat', () => {
    it('should not throw for valid phone formats', () => {
      expect(() => ValidationUtils.validatePhoneFormat('+1234567890')).not.toThrow();
      expect(() => ValidationUtils.validatePhoneFormat('+44 20 7123 4567')).not.toThrow();
    });

    it('should throw for invalid phone formats', () => {
      expect(() => ValidationUtils.validatePhoneFormat('1234567890')).toThrow(BadRequestException);
      expect(() => ValidationUtils.validatePhoneFormat('1234567890')).toThrow('Invalid phone number format');
      expect(() => ValidationUtils.validatePhoneFormat('+')).toThrow(BadRequestException);
      expect(() => ValidationUtils.validatePhoneFormat('+12')).toThrow(BadRequestException);
      expect(() => ValidationUtils.validatePhoneFormat('')).toThrow(BadRequestException);
    });
  });

  describe('validateUrlFormat', () => {
    it('should not throw for valid URLs', () => {
      expect(() => ValidationUtils.validateUrlFormat('https://example.com')).not.toThrow();
      expect(() => ValidationUtils.validateUrlFormat('http://localhost:3000')).not.toThrow();
      expect(() => ValidationUtils.validateUrlFormat('ftp://ftp.example.com')).not.toThrow();
    });

    it('should throw for invalid URLs', () => {
      expect(() => ValidationUtils.validateUrlFormat('not-a-url')).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateUrlFormat('not-a-url')).toThrow('Invalid URL format');
      expect(() => ValidationUtils.validateUrlFormat('')).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateUrlFormat('http://')).toThrow(BadRequestException);
    });
  });

  describe('validateNumericRange', () => {
    it('should not throw for valid numbers in range', () => {
      expect(() => ValidationUtils.validateNumericRange(5, 'field', 1, 10)).not.toThrow();
      expect(() => ValidationUtils.validateNumericRange(5, 'field', 1)).not.toThrow();
      expect(() => ValidationUtils.validateNumericRange(5, 'field', undefined, 10)).not.toThrow();
      expect(() => ValidationUtils.validateNumericRange(5, 'field')).not.toThrow();
    });

    it('should throw for numbers below minimum', () => {
      expect(() => ValidationUtils.validateNumericRange(0, 'testField', 1, 10)).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateNumericRange(0, 'testField', 1, 10)).toThrow('testField must be at least 1');
    });

    it('should throw for numbers above maximum', () => {
      expect(() => ValidationUtils.validateNumericRange(15, 'testField', 1, 10)).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateNumericRange(15, 'testField', 1, 10)).toThrow('testField must be at most 10');
    });
  });

  describe('validateEnumValue', () => {
    const testEnum = { A: 'a', B: 'b', C: 'c' };

    it('should not throw for valid enum values', () => {
      expect(() => ValidationUtils.validateEnumValue('a', testEnum, 'field')).not.toThrow();
      expect(() => ValidationUtils.validateEnumValue('b', testEnum, 'field')).not.toThrow();
      expect(() => ValidationUtils.validateEnumValue('c', testEnum, 'field')).not.toThrow();
    });

    it('should throw for invalid enum values', () => {
      expect(() => ValidationUtils.validateEnumValue('d', testEnum, 'testField')).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateEnumValue('d', testEnum, 'testField')).toThrow('Invalid testField value');
      expect(() => ValidationUtils.validateEnumValue('', testEnum, 'testField')).toThrow(BadRequestException);
    });
  });

  describe('sanitizePagination', () => {
    it('should return sanitized pagination parameters', () => {
      expect(ValidationUtils.sanitizePagination(10, 5)).toEqual({ limit: 10, offset: 5 });
      expect(ValidationUtils.sanitizePagination()).toEqual({ limit: 20, offset: 0 });
    });

    it('should enforce minimum limit', () => {
      expect(ValidationUtils.sanitizePagination(0, 0)).toEqual({ limit: 1, offset: 0 });
      expect(ValidationUtils.sanitizePagination(-5, 0)).toEqual({ limit: 1, offset: 0 });
    });

    it('should enforce maximum limit', () => {
      expect(ValidationUtils.sanitizePagination(150, 0)).toEqual({ limit: 100, offset: 0 });
    });

    it('should enforce minimum offset', () => {
      expect(ValidationUtils.sanitizePagination(10, -5)).toEqual({ limit: 10, offset: 0 });
    });
  });

  describe('validateJobPostingRules', () => {
    it('should not throw for valid job data', () => {
      const validJobData = {
        title: 'Software Engineer',
        description: 'Great job',
        location: 'Remote',
        deadline: new Date(Date.now() + 86400000), // Tomorrow
        salary: '$50,000 - $70,000',
        status: 'ACTIVE'
      };

      expect(() => ValidationUtils.validateJobPostingRules(validJobData)).not.toThrow();
    });

    it('should throw for deadline in the past', () => {
      const invalidJobData = {
        title: 'Software Engineer',
        description: 'Great job',
        location: 'Remote',
        deadline: new Date(Date.now() - 86400000), // Yesterday
        status: 'ACTIVE'
      };

      expect(() => ValidationUtils.validateJobPostingRules(invalidJobData)).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateJobPostingRules(invalidJobData)).toThrow('Job deadline must be in the future');
    });

    it('should throw for invalid salary format', () => {
      const invalidJobData = {
        title: 'Software Engineer',
        description: 'Great job',
        location: 'Remote',
        deadline: new Date(Date.now() + 86400000),
        salary: 'invalid salary format',
        status: 'ACTIVE'
      };

      expect(() => ValidationUtils.validateJobPostingRules(invalidJobData)).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateJobPostingRules(invalidJobData)).toThrow('Invalid salary format');
    });

    it('should validate required fields for active jobs', () => {
      const invalidJobData = {
        deadline: new Date(Date.now() + 86400000),
        status: 'ACTIVE'
      };

      expect(() => ValidationUtils.validateJobPostingRules(invalidJobData)).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateJobPostingRules(invalidJobData)).toThrow('title is required');
    });
  });

  describe('validateUserRegistrationRules', () => {
    it('should not throw for valid user data', () => {
      const validUserData = {
        email: 'test@example.com',
        name: 'John Doe',
        userType: 'CANDIDATE',
        phone: '+1234567890'
      };

      expect(() => ValidationUtils.validateUserRegistrationRules(validUserData)).not.toThrow();
    });

    it('should throw for admin user type', () => {
      const invalidUserData = {
        email: 'admin@example.com',
        name: 'Admin User',
        userType: 'ADMIN'
      };

      expect(() => ValidationUtils.validateUserRegistrationRules(invalidUserData)).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateUserRegistrationRules(invalidUserData)).toThrow('Admin registration is not allowed through public signup');
    });

    it('should validate email format', () => {
      const invalidUserData = {
        email: 'invalid-email',
        name: 'John Doe',
        userType: 'CANDIDATE'
      };

      expect(() => ValidationUtils.validateUserRegistrationRules(invalidUserData)).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateUserRegistrationRules(invalidUserData)).toThrow('Invalid email format');
    });

    it('should validate name length', () => {
      const invalidUserData = {
        email: 'test@example.com',
        name: 'A',
        userType: 'CANDIDATE'
      };

      expect(() => ValidationUtils.validateUserRegistrationRules(invalidUserData)).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateUserRegistrationRules(invalidUserData)).toThrow('name must be at least 2 characters');
    });

    it('should validate phone format when provided', () => {
      const invalidUserData = {
        email: 'test@example.com',
        name: 'John Doe',
        userType: 'CANDIDATE',
        phone: 'invalid-phone'
      };

      expect(() => ValidationUtils.validateUserRegistrationRules(invalidUserData)).toThrow(BadRequestException);
      expect(() => ValidationUtils.validateUserRegistrationRules(invalidUserData)).toThrow('Invalid phone number format');
    });
  });
});