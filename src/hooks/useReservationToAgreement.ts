import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ConversionResult {
  success: boolean;
  agreementId?: string;
  error?: any;
}

export const useReservationToAgreement = () => {
  const [isConverting, setIsConverting] = useState(false);

  const convertToAgreement = async (reservationId: string): Promise<ConversionResult> => {
    setIsConverting(true);
    try {
      // 1. Fetch reservation details
      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .select('*')
        .eq('id', reservationId)
        .single();

      if (reservationError) throw reservationError;

      if (!reservation) {
        throw new Error('Reservation not found');
      }

      // 2. Validate reservation status
      if (reservation.status !== 'confirmed') {
        throw new Error('Only confirmed reservations can be converted to agreements');
      }

      if (reservation.down_payment_status !== 'paid') {
        throw new Error('Down payment must be completed before conversion');
      }

      if (reservation.converted_agreement_id) {
        throw new Error('This reservation has already been converted to an agreement');
      }

      // 3. Generate agreement number
      const { data: agreementNo, error: agreementNoError } = await supabase
        .rpc('generate_agreement_no');

      if (agreementNoError) throw agreementNoError;

      // 4. Create agreement
      const agreementData = {
        agreement_no: agreementNo,
        reservation_id: reservationId,
        customer_id: reservation.customer_id,
        vehicle_id: reservation.vehicle_id,
        agreement_date: new Date().toISOString(),
        status: 'active' as const,
        total_amount: reservation.total_amount,
        add_ons: reservation.add_ons,
        notes: reservation.special_requests,
      };

      const { data: agreement, error: agreementError } = await supabase
        .from('agreements')
        .insert([agreementData])
        .select()
        .single();

      if (agreementError) throw agreementError;

      // 5. Update reservation to mark as converted
      const { error: updateError } = await supabase
        .from('reservations')
        .update({
          status: 'completed' as const,
          converted_agreement_id: agreement.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reservationId);

      if (updateError) throw updateError;

      toast({
        title: 'Conversion Successful',
        description: `Reservation ${reservation.ro_number} has been converted to Agreement ${agreementNo}`,
      });

      return { success: true, agreementId: agreement.id };
    } catch (error: any) {
      console.error('Conversion error:', error);
      toast({
        title: 'Conversion Failed',
        description: error.message || 'Failed to convert reservation to agreement',
        variant: 'destructive',
      });
      return { success: false, error };
    } finally {
      setIsConverting(false);
    }
  };

  const canConvert = (reservation: any): { canConvert: boolean; reason?: string } => {
    if (!reservation) {
      return { canConvert: false, reason: 'Reservation not found' };
    }

    if (reservation.converted_agreement_id) {
      return { canConvert: false, reason: 'Already converted to an agreement' };
    }

    if (reservation.status !== 'confirmed') {
      return { canConvert: false, reason: 'Reservation must be confirmed first' };
    }

    if (reservation.down_payment_status !== 'paid') {
      return { canConvert: false, reason: 'Down payment must be completed' };
    }

    return { canConvert: true };
  };

  return {
    convertToAgreement,
    canConvert,
    isConverting,
  };
};
