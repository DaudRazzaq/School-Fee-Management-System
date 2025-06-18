import {
  SchoolFeeException,
  PaymentProcessingException,
  ValidationException,
  AuthenticationException,
  AuthorizationException,
  ConcurrencyException,
  NetworkException,
  DatabaseException,
  ExceptionHandler,
  ValidationUtils,
} from '@/lib/exceptions';

describe('Exception Classes', () => {
  describe('SchoolFeeException', () => {
    it('should create exception with correct properties', () => {
      const exception = new SchoolFeeException('Test message', 'TEST_CODE', 400);
      
      expect(exception.message).toBe('Test message');
      expect(exception.code).toBe('TEST_CODE');
      expect(exception.statusCode).toBe(400);
      expect(exception.timestamp).toBeInstanceOf(Date);
      expect(exception.name).toBe('SchoolFeeException');
    });

    it('should use default status code 500', () => {
      const exception = new SchoolFeeException('Test message', 'TEST_CODE');
      expect(exception.statusCode).toBe(500);
    });
  });

  describe('PaymentProcessingException', () => {
    it('should create payment exception with correct defaults', () => {
      const exception = new PaymentProcessingException('Payment failed');
      
      expect(exception.message).toBe('Payment failed');
      expect(exception.code).toBe('PAYMENT_ERROR');
      expect(exception.statusCode).toBe(400);
    });
  });

  describe('ValidationException', () => {
    it('should create validation exception with field', () => {
      const exception = new ValidationException('Invalid email', 'email');
      
      expect(exception.message).toBe('Invalid email');
      expect(exception.field).toBe('email');
      expect(exception.code).toBe('VALIDATION_ERROR');
      expect(exception.statusCode).toBe(422);
    });
  });

  describe('AuthenticationException', () => {
    it('should create auth exception with defaults', () => {
      const exception = new AuthenticationException();
      
      expect(exception.message).toBe('Authentication failed');
      expect(exception.code).toBe('AUTH_ERROR');
      expect(exception.statusCode).toBe(401);
    });
  });
});

describe('ExceptionHandler', () => {
  describe('handle', () => {
    it('should handle SchoolFeeException correctly', () => {
      const exception = new PaymentProcessingException('Payment failed');
      const result = ExceptionHandler.handle(exception);
      
      expect(result).toEqual({
        message: 'Payment failed',
        code: 'PAYMENT_ERROR',
        statusCode: 400,
      });
    });

    it('should handle generic Error', () => {
      const error = new Error('Generic error');
      const result = ExceptionHandler.handle(error);
      
      expect(result).toEqual({
        message: 'Generic error',
        code: 'UNKNOWN_ERROR',
        statusCode: 500,
      });
    });

    it('should handle unknown error types', () => {
      const result = ExceptionHandler.handle('string error');
      
      expect(result).toEqual({
        message: 'An unexpected error occurred',
        code: 'UNEXPECTED_ERROR',
        statusCode: 500,
      });
    });
  });

  describe('log', () => {
    it('should log error without throwing', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const exception = new ValidationException('Test error');
      
      expect(() => ExceptionHandler.log(exception)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
});

describe('ValidationUtils', () => {
  describe('validatePaymentAmount', () => {
    it('should pass for valid amounts', () => {
      expect(() => ValidationUtils.validatePaymentAmount(100)).not.toThrow();
      expect(() => ValidationUtils.validatePaymentAmount(50000)).not.toThrow();
    });

    it('should throw for zero or negative amounts', () => {
      expect(() => ValidationUtils.validatePaymentAmount(0)).toThrow(ValidationException);
      expect(() => ValidationUtils.validatePaymentAmount(-100)).toThrow(ValidationException);
    });

    it('should throw for amounts exceeding limit', () => {
      expect(() => ValidationUtils.validatePaymentAmount(150000)).toThrow(ValidationException);
    });
  });

  describe('validateStudentId', () => {
    it('should pass for valid student IDs', () => {
      expect(() => ValidationUtils.validateStudentId('STU001')).not.toThrow();
      expect(() => ValidationUtils.validateStudentId('STU999')).not.toThrow();
    });

    it('should throw for invalid formats', () => {
      expect(() => ValidationUtils.validateStudentId('')).toThrow(ValidationException);
      expect(() => ValidationUtils.validateStudentId('STUDENT001')).toThrow(ValidationException);
      expect(() => ValidationUtils.validateStudentId('STU1')).toThrow(ValidationException);
    });
  });

  describe('validateEmail', () => {
    it('should pass for valid emails', () => {
      expect(() => ValidationUtils.validateEmail('test@example.com')).not.toThrow();
      expect(() => ValidationUtils.validateEmail('user.name@domain.co.uk')).not.toThrow();
    });

    it('should throw for invalid emails', () => {
      expect(() => ValidationUtils.validateEmail('invalid-email')).toThrow(ValidationException);
      expect(() => ValidationUtils.validateEmail('test@')).toThrow(ValidationException);
      expect(() => ValidationUtils.validateEmail('@example.com')).toThrow(ValidationException);
    });
  });

  describe('validateCardNumber', () => {
    it('should pass for valid card numbers', () => {
      expect(() => ValidationUtils.validateCardNumber('1234567890123456')).not.toThrow();
      expect(() => ValidationUtils.validateCardNumber('1234 5678 9012 3456')).not.toThrow();
    });

    it('should throw for invalid card numbers', () => {
      expect(() => ValidationUtils.validateCardNumber('123456789012345')).toThrow(ValidationException);
      expect(() => ValidationUtils.validateCardNumber('12345678901234567')).toThrow(ValidationException);
      expect(() => ValidationUtils.validateCardNumber('abcd5678901234567')).toThrow(ValidationException);
    });
  });

  describe('validateCVV', () => {
    it('should pass for valid CVVs', () => {
      expect(() => ValidationUtils.validateCVV('123')).not.toThrow();
      expect(() => ValidationUtils.validateCVV('1234')).not.toThrow();
    });

    it('should throw for invalid CVVs', () => {
      expect(() => ValidationUtils.validateCVV('12')).toThrow(ValidationException);
      expect(() => ValidationUtils.validateCVV('12345')).toThrow(ValidationException);
      expect(() => ValidationUtils.validateCVV('abc')).toThrow(ValidationException);
    });
  });
});