import { supabase } from '@/integrations/supabase/client';
import type { 
  PaymentAllocation, 
  SplitPaymentItem, 
  PaymentMethod 
} from './agreement-payments';
import { CustomerPaymentAPI } from './customer-payment-profile';
import { PaymentLinksAPI } from './payment-links';

export interface ProcessSplitPaymentResult {
  success: boolean;
  processedPayments: SplitPaymentItem[];
  failedPayments: SplitPaymentItem[];
  error?: string;
}

export const SplitPaymentsAPI = {
  /**
   * Validate payment allocation
   */
  validateAllocation(allocation: PaymentAllocation): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if total allocated matches total amount
    if (Math.abs(allocation.allocatedAmount - allocation.totalAmount) > 0.01) {
      errors.push('Total allocated amount must equal the total amount due');
    }

    // Check if remaining amount is zero
    if (Math.abs(allocation.remainingAmount) > 0.01) {
      errors.push('There is still remaining amount to allocate');
    }

    // Validate each payment
    allocation.payments.forEach((payment, index) => {
      if (payment.amount <= 0) {
        errors.push(`Payment ${index + 1}: Amount must be greater than 0`);
      }

      if (payment.method === 'loyalty_points') {
        if (!payment.loyaltyPointsUsed || payment.loyaltyPointsUsed < 1000) {
          errors.push(`Payment ${index + 1}: Minimum 1000 loyalty points required`);
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Record split payments in database
   */
  async recordSplitPayments(agreementId: string, payments: SplitPaymentItem[]): Promise<void> {
    const records = payments.map(payment => ({
      agreement_id: agreementId,
      payment_method: payment.method,
      amount: payment.amount,
      loyalty_points_used: payment.loyaltyPointsUsed || 0,
      transaction_ref: payment.transactionRef,
      status: payment.status || 'pending',
      metadata: payment.metadata || {},
    }));

    const { error } = await supabase
      .from('agreement_split_payments')
      .insert(records);

    if (error) throw error;
  },

  /**
   * Process all split payments atomically
   */
  async processSplitPayments(
    agreementId: string,
    customerId: string,
    allocation: PaymentAllocation
  ): Promise<ProcessSplitPaymentResult> {
    // Validate allocation first
    const validation = this.validateAllocation(allocation);
    if (!validation.valid) {
      return {
        success: false,
        processedPayments: [],
        failedPayments: allocation.payments,
        error: validation.errors.join(', '),
      };
    }

    const processedPayments: SplitPaymentItem[] = [];
    const failedPayments: SplitPaymentItem[] = [];

    // Process each payment sequentially
    for (const payment of allocation.payments) {
      try {
        const processedPayment = await this.processSinglePayment(
          agreementId,
          customerId,
          payment
        );
        processedPayments.push(processedPayment);
      } catch (error) {
        console.error(`Failed to process payment:`, error);
        failedPayments.push({
          ...payment,
          status: 'failed',
          metadata: {
            ...payment.metadata,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });

        // Rollback successful payments
        await this.rollbackPayments(customerId, processedPayments);

        return {
          success: false,
          processedPayments: [],
          failedPayments: allocation.payments,
          error: `Payment processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    }

    // Record all payments in database
    await this.recordSplitPayments(agreementId, processedPayments);

    return {
      success: true,
      processedPayments,
      failedPayments: [],
    };
  },

  /**
   * Process a single payment method
   */
  async processSinglePayment(
    agreementId: string,
    customerId: string,
    payment: SplitPaymentItem
  ): Promise<SplitPaymentItem> {
    const transactionRef = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    switch (payment.method) {
      case 'loyalty_points':
        if (!payment.loyaltyPointsUsed) {
          throw new Error('Loyalty points not specified');
        }
        await CustomerPaymentAPI.redeemLoyaltyPoints(customerId, payment.loyaltyPointsUsed);
        return {
          ...payment,
          status: 'completed',
          transactionRef,
        };

      case 'customer_wallet':
        const walletBalanceBefore = (await CustomerPaymentAPI.getPaymentProfile(customerId)).walletBalance;
        await CustomerPaymentAPI.deductWalletBalance(customerId, payment.amount);
        const walletBalanceAfter = walletBalanceBefore - payment.amount;
        return {
          ...payment,
          status: 'completed',
          transactionRef,
          metadata: {
            ...payment.metadata,
            walletBalanceBefore,
            walletBalanceAfter,
          },
        };

      case 'credit':
        await CustomerPaymentAPI.useCreditLimit(customerId, payment.amount);
        return {
          ...payment,
          status: 'completed',
          transactionRef,
        };

      case 'payment_link':
        const linkUrl = await PaymentLinksAPI.createPaymentLink(
          agreementId,
          customerId,
          payment.amount,
          24 // 24 hours expiry
        );
        const linkToken = linkUrl.split('/').pop() || '';
        return {
          ...payment,
          status: 'pending',
          transactionRef,
          metadata: {
            ...payment.metadata,
            linkToken,
            linkUrl,
          },
        };

      case 'credit_card':
      case 'debit_card':
        // Simulate card processing
        // In production, integrate with payment gateway
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          ...payment,
          status: 'completed',
          transactionRef,
          metadata: {
            ...payment.metadata,
            cardLast4: '4242',
          },
        };

      case 'cash':
      case 'bank_transfer':
        // These are manual methods, mark as completed
        return {
          ...payment,
          status: 'completed',
          transactionRef,
        };

      default:
        throw new Error(`Unsupported payment method: ${payment.method}`);
    }
  },

  /**
   * Rollback processed payments in case of failure
   */
  async rollbackPayments(customerId: string, payments: SplitPaymentItem[]): Promise<void> {
    for (const payment of payments) {
      try {
        switch (payment.method) {
          case 'loyalty_points':
            if (payment.loyaltyPointsUsed) {
              await CustomerPaymentAPI.addLoyaltyPoints(
                customerId,
                payment.loyaltyPointsUsed,
                'Rollback - Payment failed'
              );
            }
            break;

          case 'customer_wallet':
            await CustomerPaymentAPI.addWalletBalance(customerId, payment.amount);
            break;

          case 'credit':
            // Rollback credit usage
            // TODO: Implement credit rollback logic
            break;

          case 'payment_link':
            if (payment.metadata?.linkToken) {
              await PaymentLinksAPI.cancelPaymentLink(payment.metadata.linkToken);
            }
            break;

          // Card payments would need to be refunded through payment gateway
          case 'credit_card':
          case 'debit_card':
            // TODO: Implement card refund through payment gateway
            break;
        }
      } catch (rollbackError) {
        console.error(`Failed to rollback payment:`, rollbackError);
      }
    }
  },

  /**
   * Get payment breakdown for an agreement
   */
  async getPaymentBreakdown(agreementId: string): Promise<SplitPaymentItem[]> {
    const { data, error } = await supabase
      .from('agreement_split_payments')
      .select('*')
      .eq('agreement_id', agreementId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data.map(record => ({
      id: record.id,
      method: record.payment_method as PaymentMethod,
      amount: record.amount,
      loyaltyPointsUsed: record.loyalty_points_used || undefined,
      transactionRef: record.transaction_ref || undefined,
      status: record.status as 'pending' | 'completed' | 'failed',
      metadata: (record.metadata || {}) as Record<string, any>,
    }));
  },

  /**
   * Update split payment status
   */
  async updatePaymentStatus(
    paymentId: string,
    status: 'pending' | 'completed' | 'failed',
    transactionRef?: string
  ): Promise<void> {
    const updateData: any = { status };
    if (transactionRef) {
      updateData.transaction_ref = transactionRef;
    }
    if (status === 'completed') {
      updateData.processed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('agreement_split_payments')
      .update(updateData)
      .eq('id', paymentId);

    if (error) throw error;
  },
};
