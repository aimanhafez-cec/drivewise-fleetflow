import { describe, it, expect } from 'vitest';
import { PaymentValidator, validatePaymentAllocation } from '../payment-validation';
import type { PaymentAllocation, CustomerPaymentProfile, SplitPaymentItem } from '../agreement-payments';

describe('PaymentValidator', () => {
  const validator = new PaymentValidator();

  const mockProfile: CustomerPaymentProfile = {
    customerId: 'test-customer',
    walletBalance: 2000,
    loyaltyPoints: 50000,
    loyaltyTier: 'gold',
    creditLimit: 5000,
    creditUsed: 1000,
    creditAvailable: 4000,
  };

  describe('validateAllocation', () => {
    it('should validate correct allocation', () => {
      const allocation: PaymentAllocation = {
        totalAmount: 1000,
        allocatedAmount: 1000,
        remainingAmount: 0,
        payments: [
          {
            method: 'credit_card',
            amount: 1000,
            status: 'pending',
          },
        ],
      };

      const result = validator.validateAllocation(allocation);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect over-allocation', () => {
      const allocation: PaymentAllocation = {
        totalAmount: 1000,
        allocatedAmount: 1100,
        remainingAmount: -100,
        payments: [
          {
            method: 'credit_card',
            amount: 1100,
            status: 'pending',
          },
        ],
      };

      const result = validator.validateAllocation(allocation);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Over-allocated'));
    });

    it('should detect remaining amount', () => {
      const allocation: PaymentAllocation = {
        totalAmount: 1000,
        allocatedAmount: 900,
        remainingAmount: 100,
        payments: [
          {
            method: 'credit_card',
            amount: 900,
            status: 'pending',
          },
        ],
      };

      const result = validator.validateAllocation(allocation);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Remaining amount'));
    });

    it('should detect zero or negative amounts', () => {
      const allocation: PaymentAllocation = {
        totalAmount: 1000,
        allocatedAmount: 0,
        remainingAmount: 1000,
        payments: [
          {
            method: 'credit_card',
            amount: 0,
            status: 'pending',
          },
        ],
      };

      const result = validator.validateAllocation(allocation);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('must be greater than 0'));
    });
  });

  describe('validatePayment', () => {
    it('should validate loyalty points payment', () => {
      const payment: SplitPaymentItem = {
        method: 'loyalty_points',
        amount: 500,
        loyaltyPointsUsed: 50000,
        status: 'pending',
      };

      const result = validator.validatePayment(payment);
      expect(result.valid).toBe(true);
    });

    it('should detect insufficient loyalty points minimum', () => {
      const payment: SplitPaymentItem = {
        method: 'loyalty_points',
        amount: 5,
        loyaltyPointsUsed: 500, // Below minimum of 1000
        status: 'pending',
      };

      const result = validator.validatePayment(payment);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Minimum 1000 loyalty points'));
    });

    it('should detect loyalty points conversion mismatch', () => {
      const payment: SplitPaymentItem = {
        method: 'loyalty_points',
        amount: 100,
        loyaltyPointsUsed: 5000, // Should be 10000 for 100 AED
        status: 'pending',
      };

      const result = validator.validatePayment(payment);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('conversion mismatch'));
    });
  });

  describe('validateWithProfile', () => {
    it('should validate wallet payment with sufficient balance', () => {
      const allocation: PaymentAllocation = {
        totalAmount: 1000,
        allocatedAmount: 1000,
        remainingAmount: 0,
        payments: [
          {
            method: 'customer_wallet',
            amount: 1000,
            status: 'pending',
          },
        ],
      };

      const result = validator.validateWithProfile(allocation, mockProfile);
      expect(result.valid).toBe(true);
    });

    it('should detect insufficient wallet balance', () => {
      const allocation: PaymentAllocation = {
        totalAmount: 3000,
        allocatedAmount: 3000,
        remainingAmount: 0,
        payments: [
          {
            method: 'customer_wallet',
            amount: 3000, // Exceeds wallet balance of 2000
            status: 'pending',
          },
        ],
      };

      const result = validator.validateWithProfile(allocation, mockProfile);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Insufficient wallet balance'));
    });

    it('should detect insufficient loyalty points', () => {
      const allocation: PaymentAllocation = {
        totalAmount: 1000,
        allocatedAmount: 1000,
        remainingAmount: 0,
        payments: [
          {
            method: 'loyalty_points',
            amount: 1000,
            loyaltyPointsUsed: 100000, // Exceeds available 50000
            status: 'pending',
          },
        ],
      };

      const result = validator.validateWithProfile(allocation, mockProfile);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Insufficient loyalty points'));
    });

    it('should detect insufficient credit', () => {
      const allocation: PaymentAllocation = {
        totalAmount: 5000,
        allocatedAmount: 5000,
        remainingAmount: 0,
        payments: [
          {
            method: 'credit',
            amount: 5000, // Exceeds available credit of 4000
            status: 'pending',
          },
        ],
      };

      const result = validator.validateWithProfile(allocation, mockProfile);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Insufficient credit'));
    });

    it('should warn on high credit usage', () => {
      const allocation: PaymentAllocation = {
        totalAmount: 4500,
        allocatedAmount: 4500,
        remainingAmount: 0,
        payments: [
          {
            method: 'credit',
            amount: 4500, // 90% of credit limit
            status: 'pending',
          },
        ],
      };

      const result = validator.validateWithProfile(allocation, mockProfile);
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain(expect.stringContaining('High credit usage'));
    });
  });

  describe('checkEdgeCases', () => {
    it('should warn about all pending payments', () => {
      const allocation: PaymentAllocation = {
        totalAmount: 1000,
        allocatedAmount: 1000,
        remainingAmount: 0,
        payments: [
          {
            method: 'payment_link',
            amount: 1000,
            status: 'pending',
          },
        ],
      };

      const result = validator.checkEdgeCases(allocation);
      expect(result.warnings).toContain(expect.stringContaining('All payments are pending'));
    });

    it('should warn about very small amounts', () => {
      const allocation: PaymentAllocation = {
        totalAmount: 0.5,
        allocatedAmount: 0.5,
        remainingAmount: 0,
        payments: [
          {
            method: 'cash',
            amount: 0.5,
            status: 'completed',
          },
        ],
      };

      const result = validator.checkEdgeCases(allocation);
      expect(result.warnings).toContain(expect.stringContaining('Very small payment amount'));
    });

    it('should warn about many payment methods', () => {
      const allocation: PaymentAllocation = {
        totalAmount: 1000,
        allocatedAmount: 1000,
        remainingAmount: 0,
        payments: Array(6).fill(null).map((_, i) => ({
          method: 'cash' as const,
          amount: 1000 / 6,
          status: 'completed' as const,
        })),
      };

      const result = validator.checkEdgeCases(allocation);
      expect(result.warnings).toContain(expect.stringContaining('payment methods'));
    });

    it('should warn about using entire wallet balance', () => {
      const allocation: PaymentAllocation = {
        totalAmount: 2000,
        allocatedAmount: 2000,
        remainingAmount: 0,
        payments: [
          {
            method: 'customer_wallet',
            amount: 2000,
            status: 'pending',
          },
        ],
      };

      const result = validator.checkEdgeCases(allocation, mockProfile);
      expect(result.warnings).toContain(expect.stringContaining('entire wallet balance'));
    });

    it('should warn about redeeming most loyalty points', () => {
      const allocation: PaymentAllocation = {
        totalAmount: 480,
        allocatedAmount: 480,
        remainingAmount: 0,
        payments: [
          {
            method: 'loyalty_points',
            amount: 480,
            loyaltyPointsUsed: 48000, // 96% of available points
            status: 'pending',
          },
        ],
      };

      const result = validator.checkEdgeCases(allocation, mockProfile);
      expect(result.warnings).toContain(expect.stringContaining('Redeeming'));
    });
  });

  describe('Integration scenarios', () => {
    it('should handle split payment scenario', () => {
      const allocation: PaymentAllocation = {
        totalAmount: 3000,
        allocatedAmount: 3000,
        remainingAmount: 0,
        payments: [
          {
            method: 'loyalty_points',
            amount: 500,
            loyaltyPointsUsed: 50000,
            status: 'completed',
          },
          {
            method: 'customer_wallet',
            amount: 1500,
            status: 'completed',
          },
          {
            method: 'credit_card',
            amount: 1000,
            status: 'completed',
          },
        ],
      };

      const result = validatePaymentAllocation(allocation, mockProfile);
      expect(result.valid).toBe(true);
    });

    it('should detect combined insufficient funds', () => {
      const allocation: PaymentAllocation = {
        totalAmount: 10000,
        allocatedAmount: 10000,
        remainingAmount: 0,
        payments: [
          {
            method: 'loyalty_points',
            amount: 500,
            loyaltyPointsUsed: 50000,
            status: 'completed',
          },
          {
            method: 'customer_wallet',
            amount: 2000,
            status: 'completed',
          },
          {
            method: 'credit',
            amount: 7500, // Exceeds available credit
            status: 'completed',
          },
        ],
      };

      const result = validatePaymentAllocation(allocation, mockProfile);
      expect(result.valid).toBe(false);
    });
  });
});
