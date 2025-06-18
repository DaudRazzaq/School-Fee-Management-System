import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentForm } from '@/components/payment-form';

// Mock the payment actions
jest.mock('@/app/actions/payment-actions', () => ({
  processPayment: jest.fn(),
}));

const mockPayment = {
  id: 1,
  studentId: 'STU001',
  amount: 500,
  title: 'Test Payment',
};

const mockProps = {
  payment: mockPayment,
  onCancel: jest.fn(),
  onSuccess: jest.fn(),
};

describe('Payment Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render payment form with all required fields', () => {
    render(<PaymentForm {...mockProps} />);

    expect(screen.getByLabelText(/payment method/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pay \$500/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should show credit card fields when credit payment is selected', async () => {
    const user = userEvent.setup();
    render(<PaymentForm {...mockProps} />);

    const creditRadio = screen.getByRole('radio', { name: /credit\/debit card/i });
    await user.click(creditRadio);

    await waitFor(() => {
      expect(screen.getByLabelText(/name on card/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/card number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/expiry month/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/expiry year/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cvv/i)).toBeInTheDocument();
    });
  });

  it('should show bank transfer instructions when bank payment is selected', async () => {
    const user = userEvent.setup();
    render(<PaymentForm {...mockProps} />);

    const bankRadio = screen.getByRole('radio', { name: /bank transfer/i });
    await user.click(bankRadio);

    await waitFor(() => {
      expect(screen.getByText(/bank transfer instructions/i)).toBeInTheDocument();
      expect(screen.getByText(/school national bank/i)).toBeInTheDocument();
    });
  });

  it('should validate required fields before submission', async () => {
    const user = userEvent.setup();
    render(<PaymentForm {...mockProps} />);

    const creditRadio = screen.getByRole('radio', { name: /credit\/debit card/i });
    await user.click(creditRadio);

    const submitButton = screen.getByRole('button', { name: /pay \$500/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<PaymentForm {...mockProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
  });
});