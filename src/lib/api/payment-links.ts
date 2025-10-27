import { supabase } from '@/integrations/supabase/client';

export interface PaymentLink {
  id: string;
  agreement_id: string | null;
  customer_id: string | null;
  amount: number;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  link_token: string;
  expires_at: string | null;
  paid_at: string | null;
  payment_method: string | null;
  transaction_ref: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentLinkData {
  agreementId?: string;
  customerId?: string;
  amount: number;
  expiresInHours: number;
}

export const PaymentLinksAPI = {
  /**
   * Generate a new payment link
   */
  async createPaymentLink(
    agreementId: string,
    customerId: string,
    amount: number,
    expiresInHours: number = 24
  ): Promise<string> {
    // Generate unique token
    const linkToken = `pay_${Math.random().toString(36).substring(2, 15)}${Date.now().toString(36)}`;
    
    // Calculate expiry time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    // Create payment link record
    const { data, error } = await supabase
      .from('payment_links')
      .insert({
        agreement_id: agreementId,
        customer_id: customerId,
        amount,
        status: 'pending',
        link_token: linkToken,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Return the full URL
    return `${window.location.origin}/payment/${linkToken}`;
  },

  /**
   * Verify and get payment link details
   */
  async verifyPaymentLink(linkToken: string): Promise<PaymentLink> {
    const { data, error } = await supabase
      .from('payment_links')
      .select('*')
      .eq('link_token', linkToken)
      .single();

    if (error) throw error;

    // Check if expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      // Update status to expired
      await this.updateLinkStatus(linkToken, 'expired');
      throw new Error('Payment link has expired');
    }

    // Check if already paid
    if (data.status === 'paid') {
      throw new Error('Payment link has already been used');
    }

    return data as PaymentLink;
  },

  /**
   * Process payment via link
   */
  async processLinkPayment(
    linkToken: string,
    paymentMethod: string,
    transactionRef: string
  ): Promise<void> {
    // Verify link is still valid
    await this.verifyPaymentLink(linkToken);

    // Update link status to paid
    const { error } = await supabase
      .from('payment_links')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_method: paymentMethod,
        transaction_ref: transactionRef,
      })
      .eq('link_token', linkToken);

    if (error) throw error;
  },

  /**
   * Get link status
   */
  async getLinkStatus(linkToken: string): Promise<'pending' | 'paid' | 'expired' | 'cancelled'> {
    const { data, error } = await supabase
      .from('payment_links')
      .select('status, expires_at')
      .eq('link_token', linkToken)
      .single();

    if (error) throw error;

    // Check if expired
    if (data.expires_at && new Date(data.expires_at) < new Date() && data.status === 'pending') {
      await this.updateLinkStatus(linkToken, 'expired');
      return 'expired';
    }

    return data.status as 'pending' | 'paid' | 'expired' | 'cancelled';
  },

  /**
   * Update link status
   */
  async updateLinkStatus(
    linkToken: string,
    status: 'pending' | 'paid' | 'expired' | 'cancelled'
  ): Promise<void> {
    const { error } = await supabase
      .from('payment_links')
      .update({ status })
      .eq('link_token', linkToken);

    if (error) throw error;
  },

  /**
   * Cancel payment link
   */
  async cancelPaymentLink(linkToken: string): Promise<void> {
    await this.updateLinkStatus(linkToken, 'cancelled');
  },

  /**
   * Get all payment links for an agreement
   */
  async getAgreementPaymentLinks(agreementId: string): Promise<PaymentLink[]> {
    const { data, error } = await supabase
      .from('payment_links')
      .select('*')
      .eq('agreement_id', agreementId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data as PaymentLink[];
  },

  /**
   * Get all payment links for a customer
   */
  async getCustomerPaymentLinks(customerId: string): Promise<PaymentLink[]> {
    const { data, error } = await supabase
      .from('payment_links')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data as PaymentLink[];
  },

  /**
   * Resend payment link via email/SMS
   */
  async resendPaymentLink(linkToken: string, method: 'email' | 'sms'): Promise<void> {
    // Verify link exists and is valid
    const link = await this.verifyPaymentLink(linkToken);

    // TODO: Integrate with email/SMS service
    // For now, just log
    console.log(`Resending payment link via ${method}:`, link);
  },
};
