import { supabase } from '@/integrations/supabase/client';

export interface ConvertReservationRequest {
  issueDate?: string;
  notes?: string;
}

export interface ConvertReservationResponse {
  agreementId: string;
  agreementNo: string;
  reservationId: string;
  status: string;
}

export const agreementsApi = {
  async convertReservation(
    reservationId: string, 
    data: ConvertReservationRequest = {},
    idempotencyKey: string
  ): Promise<ConvertReservationResponse> {
    // First check if already converted (idempotency)
    const { data: existingReservation } = await supabase
      .from('reservations')
      .select('converted_agreement_id, agreements:converted_agreement_id(*)')
      .eq('id', reservationId)
      .maybeSingle();

    if (existingReservation?.converted_agreement_id) {
      // Already converted, return existing agreement
      const agreement = existingReservation.agreements;
      return {
        agreementId: agreement.id,
        agreementNo: agreement.agreement_no || `AGR-${agreement.id.slice(0, 8)}`,
        reservationId,
        status: agreement.status,
      };
    }

    // Fetch reservation with details
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .select(`
        *,
        profiles:customer_id (*)
      `)
      .eq('id', reservationId)
      .maybeSingle();

    if (reservationError || !reservation) {
      throw new Error('Reservation not found');
    }

    // Validate reservation eligibility
    if (reservation.converted_agreement_id) {
      throw new Error('Reservation already converted');
    }

    // Generate agreement number
    const { data: agreementNoResult, error: agreementNoError } = await supabase
      .rpc('generate_agreement_no');

    if (agreementNoError) {
      throw new Error('Failed to generate agreement number');
    }

    const agreementNo = agreementNoResult;

    // Create agreement
    const { data: newAgreement, error: agreementError } = await supabase
      .from('agreements')
      .insert({
        agreement_no: agreementNo,
        customer_id: reservation.customer_id,
        vehicle_id: reservation.vehicle_id,
        reservation_id: reservationId,
        agreement_date: data.issueDate || new Date().toISOString().split('T')[0],
        checkout_datetime: reservation.start_datetime,
        return_datetime: reservation.end_datetime,
        total_amount: reservation.total_amount || 0,
        status: 'active',
        notes: data.notes || null,
        rate_overrides: reservation.rate_plan,
        add_ons: reservation.add_ons,
      })
      .select()
      .single();

    if (agreementError) {
      throw agreementError;
    }

    // Create agreement lines (mock for now since we don't have reservation lines in current schema)
    const { error: lineError } = await supabase
      .from('agreement_lines')
      .insert({
        agreement_id: newAgreement.id,
        vehicle_id: reservation.vehicle_id,
        check_out_at: reservation.start_datetime,
        check_in_at: reservation.end_datetime,
        line_net: reservation.total_amount || 0,
        line_total: reservation.total_amount || 0,
      });

    if (lineError) {
      console.warn('Failed to create agreement line:', lineError);
    }

    // Update reservation status
    const { error: updateError } = await supabase
      .from('reservations')
      .update({
        status: 'completed',
        converted_agreement_id: newAgreement.id,
      })
      .eq('id', reservationId);

    if (updateError) {
      console.warn('Failed to update reservation status:', updateError);
    }

    return {
      agreementId: newAgreement.id,
      agreementNo: newAgreement.agreement_no,
      reservationId,
      status: newAgreement.status,
    };
  },

  async getAgreement(id: string) {
    const { data, error } = await supabase
      .from('agreements')
      .select(`
        *,
        profiles:customer_id (
          full_name,
          email,
          phone
        ),
        vehicles (
          make,
          model,
          license_plate,
          year
        ),
        agreement_lines (
          *
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getAgreements() {
    const { data, error } = await supabase
      .from('agreements')
      .select(`
        *,
        profiles:customer_id (
          full_name,
          email
        ),
        vehicles (
          make,
          model,
          license_plate
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};