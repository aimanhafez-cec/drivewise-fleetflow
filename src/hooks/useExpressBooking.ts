import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ExpressBookingData {
  customerId: string;
  vehicleClassId: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  pickupLocation: string;
  returnLocation: string;
  downPaymentAmount?: number;
  paymentMethod?: string;
}

export const useExpressBooking = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createExpressBooking = useMutation({
    mutationFn: async (data: ExpressBookingData) => {
      // Generate reservation number
      const { data: reservationNo, error: rpcError } = await supabase.rpc('generate_reservation_no');
      if (rpcError) throw new Error(`Failed to generate reservation number: ${rpcError.message}`);
      if (!reservationNo) throw new Error('Failed to generate reservation number');

      const pickupDateTime = new Date(`${data.pickupDate}T${data.pickupTime}`);
      const returnDateTime = new Date(`${data.returnDate}T${data.returnTime}`);

      // Calculate basic total (this is simplified - in production you'd fetch actual rates)
      const durationDays = Math.ceil(
        (returnDateTime.getTime() - pickupDateTime.getTime()) / (1000 * 60 * 60 * 24)
      );
      const estimatedTotal = durationDays * 50; // $50/day estimate

      // Insert reservation with smart defaults
      const { data: reservation, error } = await supabase
        .from('reservations')
        .insert({
          ro_number: reservationNo,
          customer_id: data.customerId,
          reservation_type: 'vehicle_class',
          vehicle_class_id: data.vehicleClassId,
          start_datetime: pickupDateTime.toISOString(),
          end_datetime: returnDateTime.toISOString(),
          pickup_location: data.pickupLocation,
          return_location: data.returnLocation,
          total_amount: estimatedTotal,
          down_payment_amount: data.downPaymentAmount || 0,
          down_payment_status: data.downPaymentAmount && data.downPaymentAmount > 0 ? 'paid' : 'pending',
          deposit_payment_method: data.paymentMethod || null,
          down_payment_paid_at: data.downPaymentAmount && data.downPaymentAmount > 0 ? new Date().toISOString() : null,
          status: 'confirmed',
        })
        .select()
        .single();

      if (error) throw error;
      return reservation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast({
        title: 'Express Booking Created',
        description: `Reservation ${data.ro_number} created successfully!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Create Booking',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return { createExpressBooking };
};
