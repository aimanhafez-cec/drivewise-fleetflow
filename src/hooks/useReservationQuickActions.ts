import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useReservationQuickActions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: async ({ reservationId, status }: { reservationId: string; status: 'pending' | 'confirmed' | 'checked_out' | 'completed' | 'cancelled' }) => {
      const { data, error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', reservationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast({
        title: 'Status Updated',
        description: 'Reservation status has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Update Status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const quickPayment = useMutation({
    mutationFn: async ({
      reservationId,
      amount,
      method,
    }: {
      reservationId: string;
      amount: number;
      method: string;
    }) => {
      // Update reservation payment status
      const { error: resError } = await supabase
        .from('reservations')
        .update({
          down_payment_status: 'paid',
          down_payment_amount: amount,
          deposit_payment_method: method,
          down_payment_paid_at: new Date().toISOString(),
        })
        .eq('id', reservationId);

      if (resError) throw resError;

      // Record payment
      const { error: payError } = await supabase.from('reservation_payments').insert({
        reservation_id: reservationId,
        payment_type: 'down_payment',
        amount,
        payment_method: method,
        payment_status: 'completed',
        processed_at: new Date().toISOString(),
      });

      if (payError) throw payError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast({
        title: 'Payment Collected',
        description: 'Payment has been recorded successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Process Payment',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const sendEmail = useMutation({
    mutationFn: async ({
      reservationId,
      type,
    }: {
      reservationId: string;
      type: 'confirmation' | 'reminder';
    }) => {
      // This would integrate with your email service
      // For now, just simulate the action
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { reservationId, type };
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Email Sent',
        description: `${variables.type === 'confirmation' ? 'Confirmation' : 'Reminder'} email has been sent to the customer.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Send Email',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    updateStatus,
    quickPayment,
    sendEmail,
  };
};
