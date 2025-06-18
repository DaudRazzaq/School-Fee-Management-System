/**
 * Custom Exception Classes for School Fee Management System
 * These exceptions provide specific error handling for different scenarios
 */

export class SchoolFeeException extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly timestamp: Date;

  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date();
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class PaymentProcessingException extends SchoolFeeException {
  constructor(message: string, code: string = 'PAYMENT_ERROR') {
    super(message, code, 400);
  }
}

export class ValidationException extends SchoolFeeException {
  public readonly field?: string;
  
  constructor(message: string, field?: string, code: string = 'VALIDATION_ERROR') {
    super(message, code, 422);
    this.field = field;
  }
}

export class AuthenticationException extends SchoolFeeException {
  constructor(message: string = 'Authentication failed', code: string = 'AUTH_ERROR') {
    super(message, code, 401);
  }
}

export class AuthorizationException extends SchoolFeeException {
  constructor(message: string = 'Access denied', code: string = 'ACCESS_DENIED') {
    super(message, code, 403);
  }
}

export class ConcurrencyException extends SchoolFeeException {
  constructor(message: string = 'Concurrent operation detected', code: string = 'CONCURRENCY_ERROR') {
    super(message, code, 409);
  }
}

export class NetworkException extends SchoolFeeException {
  constructor(message: string = 'Network error occurred', code: string = 'NETWORK_ERROR') {
    super(message, code, 503);
  }
}

export class DatabaseException extends SchoolFeeException {
  constructor(message: string = 'Database operation failed', code: string = 'DATABASE_ERROR') {
    super(message, code, 500);
  }
}

/**
 * Exception Handler Utility
 */
export class ExceptionHandler {
  static handle(error: unknown): { message: string; code: string; statusCode: number } {
    if (error instanceof SchoolFeeException) {
      return {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        code: 'UNKNOWN_ERROR',
        statusCode: 500,
      };
    }

    return {
      message: 'An unexpected error occurred',
      code: 'UNEXPECTED_ERROR',
      statusCode: 500,
    };
  }

  static log(error: unknown): void {
    const handled = this.handle(error);
    console.error(`[${new Date().toISOString()}] ${handled.code}: ${handled.message}`, error);
  }
}

/**
 * Validation Utilities
 */
export class ValidationUtils {
  static validatePaymentAmount(amount: number): void {
    if (amount <= 0) {
      throw new ValidationException('Payment amount must be greater than zero', 'amount');
    }
    if (amount > 100000) {
      throw new ValidationException('Payment amount exceeds maximum limit', 'amount');
    }
  }

  static validateStudentId(studentId: string): void {
    if (!studentId || studentId.trim().length === 0) {
      throw new ValidationException('Student ID is required', 'studentId');
    }
    if (!/^STU\d{3}$/.test(studentId)) {
      throw new ValidationException('Invalid student ID format. Expected format: STU001', 'studentId');
    }
  }

  static validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationException('Invalid email format', 'email');
    }
  }

  static validateCardNumber(cardNumber: string): void {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cleanNumber)) {
      throw new ValidationException('Card number must be 16 digits', 'cardNumber');
    }
  }

  static validateCVV(cvv: string): void {
    if (!/^\d{3,4}$/.test(cvv)) {
      throw new ValidationException('CVV must be 3 or 4 digits', 'cvv');
    }
  }
}