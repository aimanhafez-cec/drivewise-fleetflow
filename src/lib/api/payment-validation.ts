import type { 
  PaymentAllocation, 
  SplitPaymentItem, 
  CustomerPaymentProfile,
  PaymentMethod 
} from './agreement-payments';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PaymentValidationRules {
  minLoyaltyPoints: number;
  maxAllocationDifference: number; // Maximum difference between allocated and total (AED)
  loyaltyPointsConversionRate: number; // points per AED
}

const DEFAULT_RULES: PaymentValidationRules = {
  minLoyaltyPoints: 1000,
  maxAllocationDifference: 0.01, // 1 fils tolerance
  loyaltyPointsConversionRate: 100,
};

export class PaymentValidator {
  private rules: PaymentValidationRules;

  constructor(rules: Partial<PaymentValidationRules> = {}) {
    this.rules = { ...DEFAULT_RULES, ...rules };
  }

  /**
   * Validate complete payment allocation
   */
  validateAllocation(allocation: PaymentAllocation): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check total allocation matches amount due
    const difference = Math.abs(allocation.allocatedAmount - allocation.totalAmount);
    if (difference > this.rules.maxAllocationDifference) {
      errors.push(
        `Total allocated (${allocation.allocatedAmount.toFixed(2)} AED) does not match amount due (${allocation.totalAmount.toFixed(2)} AED)`
      );
    }

    // Check for remaining amount
    if (allocation.remainingAmount > this.rules.maxAllocationDifference) {
      errors.push(
        `Remaining amount (${allocation.remainingAmount.toFixed(2)} AED) must be allocated`
      );
    }

    // Check for over-allocation
    if (allocation.allocatedAmount > allocation.totalAmount) {
      errors.push(
        `Over-allocated by ${(allocation.allocatedAmount - allocation.totalAmount).toFixed(2)} AED`
      );
    }

    // Validate each payment
    allocation.payments.forEach((payment, index) => {
      const paymentResult = this.validatePayment(payment, index + 1);
      errors.push(...paymentResult.errors);
      warnings.push(...paymentResult.warnings);
    });

    // Check for duplicate payment methods (warning only)
    const methodCounts = allocation.payments.reduce((acc, p) => {
      acc[p.method] = (acc[p.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(methodCounts).forEach(([method, count]) => {
      if (count > 1 && method !== 'credit_card' && method !== 'debit_card') {
        warnings.push(`Payment method "${method}" used ${count} times`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate individual payment
   */
  validatePayment(payment: SplitPaymentItem, paymentNumber?: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const prefix = paymentNumber ? `Payment ${paymentNumber}` : 'Payment';

    // Check amount is positive
    if (payment.amount <= 0) {
      errors.push(`${prefix}: Amount must be greater than 0`);
    }

    // Check amount is reasonable (not too large)
    if (payment.amount > 1000000) {
      warnings.push(`${prefix}: Very large amount (${payment.amount.toFixed(2)} AED)`);
    }

    // Validate loyalty points
    if (payment.method === 'loyalty_points') {
      if (!payment.loyaltyPointsUsed) {
        errors.push(`${prefix}: Loyalty points not specified`);
      } else if (payment.loyaltyPointsUsed < this.rules.minLoyaltyPoints) {
        errors.push(
          `${prefix}: Minimum ${this.rules.minLoyaltyPoints} loyalty points required`
        );
      }

      // Check points-to-AED conversion
      if (payment.loyaltyPointsUsed && payment.amount) {
        const expectedAmount = payment.loyaltyPointsUsed / this.rules.loyaltyPointsConversionRate;
        if (Math.abs(expectedAmount - payment.amount) > 0.01) {
          errors.push(
            `${prefix}: Points conversion mismatch. ${payment.loyaltyPointsUsed} points should equal ${expectedAmount.toFixed(2)} AED`
          );
        }
      }
    }

    // Validate status
    if (payment.status && !['pending', 'completed', 'failed'].includes(payment.status)) {
      errors.push(`${prefix}: Invalid status "${payment.status}"`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate payment against customer profile
   */
  validateWithProfile(
    allocation: PaymentAllocation,
    profile: CustomerPaymentProfile
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    allocation.payments.forEach((payment, index) => {
      const prefix = `Payment ${index + 1}`;

      switch (payment.method) {
        case 'loyalty_points':
          if (payment.loyaltyPointsUsed && payment.loyaltyPointsUsed > profile.loyaltyPoints) {
            errors.push(
              `${prefix}: Insufficient loyalty points. Available: ${profile.loyaltyPoints}, Required: ${payment.loyaltyPointsUsed}`
            );
          }
          break;

        case 'customer_wallet':
          if (payment.amount > profile.walletBalance) {
            errors.push(
              `${prefix}: Insufficient wallet balance. Available: ${profile.walletBalance.toFixed(2)} AED, Required: ${payment.amount.toFixed(2)} AED`
            );
          }
          break;

        case 'credit':
          if (payment.amount > profile.creditAvailable) {
            errors.push(
              `${prefix}: Insufficient credit. Available: ${profile.creditAvailable.toFixed(2)} AED, Required: ${payment.amount.toFixed(2)} AED`
            );
          }
          
          // Warning if using high percentage of credit
          const creditUsagePercentage = (payment.amount / profile.creditLimit) * 100;
          if (creditUsagePercentage > 80) {
            warnings.push(
              `${prefix}: High credit usage (${creditUsagePercentage.toFixed(0)}% of limit)`
            );
          }
          break;
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check for common edge cases
   */
  checkEdgeCases(allocation: PaymentAllocation, profile?: CustomerPaymentProfile): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Edge case: All payments are pending (payment link only)
    const allPending = allocation.payments.every(p => 
      p.status === 'pending' || p.method === 'payment_link'
    );
    if (allPending && allocation.payments.length > 0) {
      warnings.push('All payments are pending. No immediate payment will be processed.');
    }

    // Edge case: Very small amounts
    if (allocation.totalAmount < 1) {
      warnings.push('Very small payment amount. Consider waiving the charge.');
    }

    // Edge case: Many payment methods
    if (allocation.payments.length > 5) {
      warnings.push(`Using ${allocation.payments.length} payment methods. Consider consolidating.`);
    }

    // Edge case: Mixing deferred and immediate payments
    const hasDeferredPayment = allocation.payments.some(p => p.method === 'payment_link');
    const hasImmediatePayment = allocation.payments.some(p => 
      p.method !== 'payment_link' && p.status !== 'pending'
    );
    if (hasDeferredPayment && hasImmediatePayment) {
      warnings.push('Mixing immediate and deferred payments. Ensure proper tracking.');
    }

    // Edge case: Profile checks
    if (profile) {
      // Warn if using all available funds
      const walletPayments = allocation.payments.filter(p => p.method === 'customer_wallet');
      const totalWalletUsed = walletPayments.reduce((sum, p) => sum + p.amount, 0);
      if (totalWalletUsed === profile.walletBalance && profile.walletBalance > 0) {
        warnings.push('Using entire wallet balance. Customer will have zero balance remaining.');
      }

      // Warn if redeeming most loyalty points
      const pointsPayments = allocation.payments.filter(p => p.method === 'loyalty_points');
      const totalPointsUsed = pointsPayments.reduce((sum, p) => sum + (p.loyaltyPointsUsed || 0), 0);
      const pointsPercentage = (totalPointsUsed / profile.loyaltyPoints) * 100;
      if (pointsPercentage > 90 && profile.loyaltyPoints > 0) {
        warnings.push(`Redeeming ${pointsPercentage.toFixed(0)}% of loyalty points. Customer will have minimal points remaining.`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Comprehensive validation
   */
  validate(
    allocation: PaymentAllocation,
    profile?: CustomerPaymentProfile
  ): ValidationResult {
    const allocationResult = this.validateAllocation(allocation);
    const profileResult = profile 
      ? this.validateWithProfile(allocation, profile) 
      : { valid: true, errors: [], warnings: [] };
    const edgeCaseResult = this.checkEdgeCases(allocation, profile);

    return {
      valid: allocationResult.valid && profileResult.valid && edgeCaseResult.valid,
      errors: [
        ...allocationResult.errors,
        ...profileResult.errors,
        ...edgeCaseResult.errors,
      ],
      warnings: [
        ...allocationResult.warnings,
        ...profileResult.warnings,
        ...edgeCaseResult.warnings,
      ],
    };
  }
}

// Export singleton instance
export const paymentValidator = new PaymentValidator();

/**
 * Quick validation helper
 */
export function validatePaymentAllocation(
  allocation: PaymentAllocation,
  profile?: CustomerPaymentProfile
): ValidationResult {
  return paymentValidator.validate(allocation, profile);
}

/**
 * Check if payment method requires customer profile
 */
export function requiresProfile(method: PaymentMethod): boolean {
  return ['loyalty_points', 'customer_wallet', 'credit'].includes(method);
}

/**
 * Get human-readable error messages
 */
export function formatValidationErrors(result: ValidationResult): string {
  const messages: string[] = [];
  
  if (result.errors.length > 0) {
    messages.push('Errors:', ...result.errors.map(e => `  • ${e}`));
  }
  
  if (result.warnings.length > 0) {
    messages.push('', 'Warnings:', ...result.warnings.map(w => `  ⚠ ${w}`));
  }
  
  return messages.join('\n');
}
