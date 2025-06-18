import { processPayment, getPayments, generateReport } from '@/app/actions/payment-actions';

// Mock the revalidatePath function
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Payment Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processPayment', () => {
    it('should process valid payment successfully', async () => {
      const formData = new FormData();
      formData.append('studentId', 'STU001');
      formData.append('amount', '500');
      formData.append('method', 'credit');

      const result = await processPayment(formData);

      expect(result.success).toBe(true);
      expect(result.paymentId).toBeDefined();
      expect(result.message).toBe('Payment processed successfully');
    });

    it('should reject invalid student ID', async () => {
      const formData = new FormData();
      formData.append('studentId', 'INVALID');
      formData.append('amount', '500');
      formData.append('method', 'credit');

      const result = await processPayment(formData);

      expect(result.success).toBe(false);
      expect(result.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid payment amount', async () => {
      const formData = new FormData();
      formData.append('studentId', 'STU001');
      formData.append('amount', '0');
      formData.append('method', 'credit');

      const result = await processPayment(formData);

      expect(result.success).toBe(false);
      expect(result.code).toBe('VALIDATION_ERROR');
    });

    it('should reject missing payment method', async () => {
      const formData = new FormData();
      formData.append('studentId', 'STU001');
      formData.append('amount', '500');
      formData.append('method', '');

      const result = await processPayment(formData);

      expect(result.success).toBe(false);
      expect(result.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('getPayments', () => {
    it('should return payments array', async () => {
      const payments = await getPayments();
      expect(Array.isArray(payments)).toBe(true);
    });
  });

  describe('generateReport', () => {
    it('should generate report successfully', async () => {
      const report = await generateReport('monthly');

      expect(report.reportType).toBe('monthly');
      expect(report.generatedAt).toBeDefined();
      expect(typeof report.totalPayments).toBe('number');
      expect(typeof report.totalAmount).toBe('number');
      expect(typeof report.paymentsByMethod).toBe('object');
    });

    it('should reject empty report type', async () => {
      await expect(generateReport('')).rejects.toThrow();
    });
  });
});