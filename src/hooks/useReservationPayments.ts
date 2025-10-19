import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface PaymentData {
  reservationId: string;
  amount: number;
  paymentType: 'down_payment' | 'balance' | 'full';
  paymentMethod: string;
  transactionId?: string;
  notes?: string;
}

export const useReservationPayments = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const recordPayment = async (paymentData: PaymentData) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase
        .from('reservation_payments')
        .insert({
          reservation_id: paymentData.reservationId,
          amount: paymentData.amount,
          payment_type: paymentData.paymentType,
          payment_method: paymentData.paymentMethod,
          transaction_id: paymentData.transactionId,
          notes: paymentData.notes,
          payment_status: 'completed',
          payment_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Payment Recorded',
        description: `Payment of ${paymentData.amount} AED has been successfully recorded.`,
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('Payment recording error:', error);
      toast({
        title: 'Payment Failed',
        description: error.message || 'Failed to record payment',
        variant: 'destructive',
      });
      return { success: false, error };
    } finally {
      setIsProcessing(false);
    }
  };

  const getReservationPayments = async (reservationId: string) => {
    try {
      const { data, error } = await supabase
        .from('reservation_payments')
        .select('*')
        .eq('reservation_id', reservationId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      return { success: false, error };
    }
  };

  const calculatePaymentStatus = async (reservationId: string, totalAmount: number, downPaymentRequired: number) => {
    const result = await getReservationPayments(reservationId);
    
    if (!result.success || !result.data) {
      return { status: 'pending', totalPaid: 0, balanceDue: totalAmount };
    }

    const totalPaid = result.data
      .filter(p => p.payment_status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const balanceDue = totalAmount - totalPaid;

    let status: 'pending' | 'partial' | 'paid' = 'pending';
    if (totalPaid >= totalAmount) {
      status = 'paid';
    } else if (totalPaid >= downPaymentRequired) {
      status = 'partial';
    }

    return { status, totalPaid, balanceDue };
  };

  return {
    recordPayment,
    getReservationPayments,
    calculatePaymentStatus,
    isProcessing,
  };
};
