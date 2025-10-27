import { supabase } from '@/integrations/supabase/client';

export type PaymentType = 'advance' | 'security_deposit' | 'monthly' | 'final' | 'refund';
export type PaymentMethod = 
  | 'credit_card' 
  | 'debit_card' 
  | 'cash' 
  | 'bank_transfer' 
  | 'cheque' 
  | 'corporate_account' 
  | 'digital_wallet'
  | 'credit'           // Account credit
  | 'payment_link'     // Payment link
  | 'customer_wallet'  // Customer wallet balance
  | 'loyalty_points';  // Loyalty points redemption
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';

export interface AgreementPayment {
  id: string;
  agreement_id: string;
  payment_type: PaymentType;
  amount: number;
  payment_method?: PaymentMethod;
  status: PaymentStatus;
  transaction_ref?: string;
  authorization_ref?: string;
  card_last_4?: string;
  card_token?: string;
  receipt_url?: string;
  processed_at?: string;
  refunded_at?: string;
  refund_amount?: number;
  refund_reason?: string;
  notes?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentData {
  agreement_id: string;
  payment_type: PaymentType;
  amount: number;
  payment_method: PaymentMethod;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface ProcessPaymentData {
  transaction_ref: string;
  card_last_4?: string;
  card_token?: string;
  receipt_url?: string;
}

export interface AuthorizeDepositData {
  authorization_ref: string;
  card_token?: string;
}

// Split Payment Interfaces
export interface SplitPaymentItem {
  id?: string;
  method: PaymentMethod;
  amount: number;
  loyaltyPointsUsed?: number;
  pointsValue?: number; // AED value of points
  transactionRef?: string;
  status: 'pending' | 'completed' | 'failed';
  metadata?: {
    cardLast4?: string;
    linkToken?: string;
    walletBalanceBefore?: number;
    walletBalanceAfter?: number;
    [key: string]: any;
  };
}

export interface PaymentAllocation {
  totalAmount: number;
  allocatedAmount: number;
  remainingAmount: number;
  payments: SplitPaymentItem[];
}

// Customer Payment Profile
export interface CustomerPaymentProfile {
  customerId: string;
  walletBalance: number;
  loyaltyPoints: number;
  loyaltyTier?: string;
  creditLimit: number;
  creditUsed: number;
  creditAvailable: number;
}

export const AgreementPaymentsAPI = {
  // List all payments for an agreement
  async listPayments(agreementId: string) {
    const { data, error } = await supabase
      .from('agreement_payments')
      .select('*')
      .eq('agreement_id', agreementId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as AgreementPayment[];
  },

  // Get a single payment
  async getPayment(paymentId: string) {
    const { data, error } = await supabase
      .from('agreement_payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (error) throw error;
    return data as AgreementPayment;
  },

  // Create a payment record
  async createPayment(paymentData: CreatePaymentData) {
    const { data, error } = await supabase
      .from('agreement_payments')
      .insert({
        ...paymentData,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data as AgreementPayment;
  },

  // Process/complete a payment
  async processPayment(paymentId: string, processData: ProcessPaymentData) {
    const { data, error } = await supabase
      .from('agreement_payments')
      .update({
        status: 'completed',
        transaction_ref: processData.transaction_ref,
        card_last_4: processData.card_last_4,
        card_token: processData.card_token,
        receipt_url: processData.receipt_url,
        processed_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return data as AgreementPayment;
  },

  // Authorize security deposit
  async authorizeDeposit(paymentId: string, authData: AuthorizeDepositData) {
    const { data, error } = await supabase
      .from('agreement_payments')
      .update({
        status: 'completed',
        authorization_ref: authData.authorization_ref,
        card_token: authData.card_token,
        processed_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return data as AgreementPayment;
  },

  // Mark payment as failed
  async failPayment(paymentId: string, reason: string) {
    const { data, error } = await supabase
      .from('agreement_payments')
      .update({
        status: 'failed',
        notes: reason,
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return data as AgreementPayment;
  },

  // Get payment summary for an agreement
  async getPaymentSummary(agreementId: string) {
    const payments = await this.listPayments(agreementId);
    
    const totalPaid = payments
      .filter(p => p.status === 'completed' && p.payment_type !== 'security_deposit')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const depositAmount = payments
      .find(p => p.payment_type === 'security_deposit' && p.status === 'completed')
      ?.amount || 0;

    const depositStatus = payments
      .find(p => p.payment_type === 'security_deposit')
      ?.status || 'pending';

    return {
      totalPaid,
      depositAmount,
      depositStatus,
      payments: payments.length,
      hasAdvancePayment: payments.some(p => p.payment_type === 'advance' && p.status === 'completed'),
      hasSecurityDeposit: payments.some(p => p.payment_type === 'security_deposit' && p.status === 'completed'),
    };
  },
};
