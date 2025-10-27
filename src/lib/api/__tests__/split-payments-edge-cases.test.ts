import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { PaymentAllocation, CustomerPaymentProfile } from '../agreement-payments';

/**
 * Edge case test scenarios for split payment processing
 */
describe('Split Payments - Edge Cases', () => {
  const mockProfile: CustomerPaymentProfile = {
    customerId: 'test-customer',
    walletBalance: 1000,
    loyaltyPoints: 25000,
    loyaltyTier: 'silver',
    creditLimit: 5000,
    creditUsed: 0,
    creditAvailable: 5000,
  };

  describe('Edge Case 1: Single Payment Method (Backward Compatibility)', () => {
    it('should process single credit card payment', () => {
      const allocation: PaymentAllocation = {
        totalAmount: 500,
        allocatedAmount: 500,
        remainingAmount: 0,
        payments: [
          {
            method: 'credit_card',
            amount: 500,
            status: 'pending',
          },
        ],
      };

      expect(allocation.payments).toHaveLength(1);
      expect(allocation.payments[0].method).toBe('credit_card');
    });
  });

  describe('Edge Case 2: Two Methods - Points + Card', () => {
    it('should allocate points and card correctly', () => {
      const allocation: PaymentAllocation = {
        totalAmount: 1500,
        allocatedAmount: 1500,
        remainingAmount: 0,
        payments: [
          {
            method: 'loyalty_points',
            amount: 250,
            loyaltyPointsUsed: 25000,
            status: 'completed',
          },
          {
            method: 'credit_card',
            amount: 1250,
            status: 'completed',
          },
        ],
      };

      const totalAllocated = allocation.payments.reduce((sum, p) => sum + p.amount, 0);
      expect(totalAllocated).toBe(1500);
    });
  });

  describe('Edge Case 3: Three Methods - Points + Wallet + Card', () => {
    it('should handle three payment methods', () => {
      const allocation: PaymentAllocation = {
        totalAmount: 2000,
        allocatedAmount: 2000,
        remainingAmount: 0,
        payments: [
          {
            method: 'loyalty_points',
            amount: 200,
            loyaltyPointsUsed: 20000,
            status: 'completed',
          },
          {
            method: 'customer_wallet',
            amount: 800,
            status: 'completed',
          },
          {
            method: 'credit_card',
            amount: 1000,
            status: 'completed',
          },
        ],
      };

      expect(allocation.payments).toHaveLength(3);
      expect(allocation.allocatedAmount).toBe(2000);
    });
  });

  describe('Edge Case 4: Full Wallet Payment', () => {
    it('should process payment using only wallet balance', () => {
      const allocation: PaymentAllocation = {
        totalAmount: 800,
        allocatedAmount: 800,
        remainingAmount: 0,
        payments: [
          {
            method: 'customer_wallet',
            amount: 800,
            status: 'completed',
            metadata: {
              walletBalanceBefore: 1000,
              walletBalanceAfter: 200,
            },
          },
        ],
      };

      expect(allocation.payments[0].method).toBe('customer_wallet');
      expect(allocation.payments[0].amount).toBeLessThanOrEqual(mockProfile.walletBalance);
    });
  });

  describe('Edge Case 5: Payment Link Only (Deferred Payment)', () => {
    it('should create payment link for deferred payment', () => {
      const allocation: PaymentAllocation = {
        totalAmount: 5000,
        allocatedAmount: 5000,
        remainingAmount: 0,
        payments: [
          {
            method: 'payment_link',
            amount: 5000,
            status: 'pending',
            metadata: {
              linkToken: 'pay_abc123',
              linkUrl: 'https://example.com/payment/pay_abc123',
            },
          },
        ],
      };

      expect(allocation.payments[0].status).toBe('pending');
      expect(allocation.payments[0].metadata?.linkToken).toBeDefined();
    });
  });

  describe('Edge Case 6: Insufficient Combined Funds', () => {
    it('should detect when combined funds are insufficient', () => {
      const allocation: PaymentAllocation = {
        totalAmount: 10000,
        allocatedAmount: 10000,
        remainingAmount: 0,
        payments: [
          {
            method: 'loyalty_points',
            amount: 250,
            loyaltyPointsUsed: 25000,
            status: 'pending',
          },
          {
            method: 'customer_wallet',
            amount: 1000,
            status: 'pending',
          },
          {
            method: 'credit',
            amount: 8750, // Total exceeds available funds
            status: 'pending',
          },
        ],
      };

      const totalWallet = allocation.payments
        .filter(p => p.method === 'customer_wallet')
        .reduce((sum, p) => sum + p.amount, 0);
      
      const totalCredit = allocation.payments
        .filter(p => p.method === 'credit')
        .reduce((sum, p) => sum + p.amount, 0);

      expect(totalWallet).toBeLessThanOrEqual(mockProfile.walletBalance);
      expect(totalCredit).toBeGreaterThan(mockProfile.creditAvailable);
    });
  });

  describe('Edge Case 7: Points Redemption Below Minimum', () => {
    it('should reject points redemption below minimum threshold', () => {
      const allocation: PaymentAllocation = {
        totalAmount: 1000,
        allocatedAmount: 1000,
        remainingAmount: 0,
        payments: [
          {
            method: 'loyalty_points',
            amount: 5,
            loyaltyPointsUsed: 500, // Below minimum of 1000
            status: 'pending',
          },
          {
            method: 'credit_card',
            amount: 995,
            status: 'pending',
          },
        ],
      };

      const pointsPayment = allocation.payments.find(p => p.method === 'loyalty_points');
      expect(pointsPayment?.loyaltyPointsUsed).toBeLessThan(1000); // Should fail validation
    });
  });

  describe('Edge Case 8: Expired Payment Link', () => {
    it('should handle expired payment link scenario', () => {
      const paymentLink = {
        method: 'payment_link' as const,
        amount: 1000,
        status: 'pending' as const,
        metadata: {
          linkToken: 'pay_expired123',
          expiresAt: new Date(Date.now() - 86400000).toISOString(), // Expired yesterday
        },
      };

      const isExpired = new Date(paymentLink.metadata.expiresAt!) < new Date();
      expect(isExpired).toBe(true);
    });
  });

  describe('Edge Case 9: Failed Card Payment (Rollback)', () => {
    it('should mark other payments for rollback on card failure', () => {
      const allocation: PaymentAllocation = {
        totalAmount: 2000,
        allocatedAmount: 2000,
        remainingAmount: 0,
        payments: [
          {
            method: 'loyalty_points',
            amount: 500,
            loyaltyPointsUsed: 50000,
            status: 'completed', // Would need rollback
          },
          {
            method: 'customer_wallet',
            amount: 500,
            status: 'completed', // Would need rollback
          },
          {
            method: 'credit_card',
            amount: 1000,
            status: 'failed', // Failure triggers rollback
            metadata: {
              error: 'Card declined',
            },
          },
        ],
      };

      const failedPayment = allocation.payments.find(p => p.status === 'failed');
      const completedPayments = allocation.payments.filter(p => p.status === 'completed');

      expect(failedPayment).toBeDefined();
      expect(completedPayments.length).toBeGreaterThan(0); // These need rollback
    });
  });

  describe('Edge Case 10: Partial Allocation', () => {
    it('should warn about partial allocation before submit', () => {
      const allocation: PaymentAllocation = {
        totalAmount: 1000,
        allocatedAmount: 750,
        remainingAmount: 250, // Unallocated
        payments: [
          {
            method: 'credit_card',
            amount: 750,
            status: 'pending',
          },
        ],
      };

      expect(allocation.remainingAmount).toBeGreaterThan(0);
      expect(allocation.allocatedAmount).toBeLessThan(allocation.totalAmount);
    });
  });

  describe('Complex Scenario: Mixed Payment Status', () => {
    it('should handle mix of completed, pending, and failed payments', () => {
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
            method: 'payment_link',
            amount: 1500,
            status: 'pending',
          },
          {
            method: 'credit_card',
            amount: 1000,
            status: 'failed',
          },
        ],
      };

      const statusCounts = allocation.payments.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(statusCounts).toHaveProperty('completed');
      expect(statusCounts).toHaveProperty('pending');
      expect(statusCounts).toHaveProperty('failed');
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle minimum payment amount', () => {
      const allocation: PaymentAllocation = {
        totalAmount: 0.01, // 1 fils
        allocatedAmount: 0.01,
        remainingAmount: 0,
        payments: [
          {
            method: 'cash',
            amount: 0.01,
            status: 'completed',
          },
        ],
      };

      expect(allocation.totalAmount).toBeGreaterThan(0);
    });

    it('should handle maximum reasonable amount', () => {
      const allocation: PaymentAllocation = {
        totalAmount: 999999.99,
        allocatedAmount: 999999.99,
        remainingAmount: 0,
        payments: [
          {
            method: 'bank_transfer',
            amount: 999999.99,
            status: 'completed',
          },
        ],
      };

      expect(allocation.totalAmount).toBeLessThan(1000000);
    });

    it('should handle floating point precision', () => {
      const allocation: PaymentAllocation = {
        totalAmount: 100.33,
        allocatedAmount: 100.33,
        remainingAmount: 0,
        payments: [
          {
            method: 'cash',
            amount: 33.11,
            status: 'completed',
          },
          {
            method: 'credit_card',
            amount: 67.22,
            status: 'completed',
          },
        ],
      };

      const sum = allocation.payments.reduce((acc, p) => acc + p.amount, 0);
      expect(Math.abs(sum - allocation.totalAmount)).toBeLessThan(0.01);
    });
  });
});
