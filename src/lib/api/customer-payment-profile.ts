import { supabase } from '@/integrations/supabase/client';
import type { CustomerPaymentProfile } from './agreement-payments';

export const CustomerPaymentAPI = {
  /**
   * Get customer payment profile including wallet, loyalty points, and credit info
   */
  async getPaymentProfile(customerId: string): Promise<CustomerPaymentProfile> {
    // Fetch profile with wallet balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', customerId)
      .maybeSingle();

    if (profileError) throw profileError;

    // Fetch loyalty profile
    const { data: loyalty, error: loyaltyError } = await supabase
      .from('customer_loyalty_profile')
      .select('current_points_balance')
      .eq('customer_id', customerId)
      .maybeSingle();

    if (loyaltyError) throw loyaltyError;

    // Fetch customer credit info (assuming customers table has credit fields)
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('credit_limit')
      .eq('id', customerId)
      .maybeSingle();

    if (customerError) throw customerError;

    // Calculate credit used from agreements or invoices
    const creditLimit = customer?.credit_limit || 0;
    const creditUsed = 0; // TODO: Calculate from outstanding invoices/agreements

    return {
      customerId,
      walletBalance: profile?.wallet_balance || 0,
      loyaltyPoints: loyalty?.current_points_balance || 0,
      loyaltyTier: 'bronze', // Default tier, can be enhanced with actual tier logic
      creditLimit,
      creditUsed,
      creditAvailable: creditLimit - creditUsed,
    };
  },

  /**
   * Deduct amount from customer wallet
   */
  async deductWalletBalance(customerId: string, amount: number): Promise<void> {
    // First check if sufficient balance exists
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', customerId)
      .single();

    if (fetchError) throw fetchError;

    const currentBalance = profile.wallet_balance || 0;
    if (currentBalance < amount) {
      throw new Error('Insufficient wallet balance');
    }

    // Deduct the amount
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        wallet_balance: currentBalance - amount 
      })
      .eq('id', customerId);

    if (updateError) throw updateError;
  },

  /**
   * Add amount to customer wallet
   */
  async addWalletBalance(customerId: string, amount: number): Promise<void> {
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', customerId)
      .single();

    if (fetchError) throw fetchError;

    const currentBalance = profile.wallet_balance || 0;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        wallet_balance: currentBalance + amount 
      })
      .eq('id', customerId);

    if (updateError) throw updateError;
  },

  /**
   * Redeem loyalty points
   */
  async redeemLoyaltyPoints(customerId: string, points: number): Promise<void> {
    // Check if customer has enough points
    const { data: loyalty, error: fetchError } = await supabase
      .from('customer_loyalty_profile')
      .select('current_points_balance')
      .eq('customer_id', customerId)
      .single();

    if (fetchError) throw fetchError;

    const currentPoints = loyalty.current_points_balance || 0;
    if (currentPoints < points) {
      throw new Error('Insufficient loyalty points');
    }

    // Deduct points
    const { error: updateError } = await supabase
      .from('customer_loyalty_profile')
      .update({ 
        current_points_balance: currentPoints - points 
      })
      .eq('customer_id', customerId);

    if (updateError) throw updateError;

    // TODO: Record transaction in loyalty_transactions table
  },

  /**
   * Add loyalty points
   */
  async addLoyaltyPoints(customerId: string, points: number, reason: string = 'Refund'): Promise<void> {
    const { data: loyalty, error: fetchError } = await supabase
      .from('customer_loyalty_profile')
      .select('current_points_balance')
      .eq('customer_id', customerId)
      .single();

    if (fetchError) throw fetchError;

    const currentPoints = loyalty.current_points_balance || 0;

    const { error: updateError } = await supabase
      .from('customer_loyalty_profile')
      .update({ 
        current_points_balance: currentPoints + points 
      })
      .eq('customer_id', customerId);

    if (updateError) throw updateError;
  },

  /**
   * Check if customer has sufficient credit available
   */
  async checkCreditAvailability(customerId: string, amount: number): Promise<boolean> {
    const profile = await this.getPaymentProfile(customerId);
    return profile.creditAvailable >= amount;
  },

  /**
   * Use credit limit (record credit usage)
   */
  async useCreditLimit(customerId: string, amount: number): Promise<void> {
    const profile = await this.getPaymentProfile(customerId);
    
    if (profile.creditAvailable < amount) {
      throw new Error('Insufficient credit available');
    }

    // Credit usage is tracked through invoices/agreements
    // This is a placeholder - actual implementation depends on business logic
    // TODO: Create credit transaction record
  },

  /**
   * Get wallet transaction history
   */
  async getWalletTransactions(customerId: string, limit: number = 10) {
    // This would fetch from a wallet_transactions table if it exists
    // For now, return empty array
    // TODO: Implement wallet transactions table and fetch logic
    return [];
  },
};
