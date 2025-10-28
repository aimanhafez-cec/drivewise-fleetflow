import { supabase } from '@/integrations/supabase/client';
import type { EnhancedWizardData } from '@/types/agreement-wizard';

interface CreateAgreementResult {
  success: boolean;
  agreementId?: string;
  agreementNo?: string;
  error?: string;
}

/**
 * Create an agreement from the enhanced wizard data
 * Handles instant booking conversion, reservation linking, and direct agreements
 */
export async function createAgreementFromWizard(
  wizardData: EnhancedWizardData
): Promise<CreateAgreementResult> {
  try {
    console.log('[CreateAgreement] Starting agreement creation:', {
      source: wizardData.source,
      sourceId: wizardData.sourceId,
    });

    // Validate required data
    if (!wizardData.step1?.customerId) {
      return { success: false, error: 'Customer is required' };
    }

    // Start transaction-like operations
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Step 1: Create the agreement record
    const agreementData = {
      // Source tracking
      source_type: wizardData.source,
      source_id: wizardData.sourceId || null,
      reservation_id: wizardData.source === 'reservation' ? wizardData.sourceId : null,
      
      // Basic info
      customer_id: wizardData.step1.customerId,
      vehicle_id: null, // Will be assigned during vehicle selection
      created_by: user.id,
      
      // Agreement terms
      agreement_type: wizardData.step1.agreementType,
      rental_purpose: wizardData.step1.rentalPurpose,
      checkout_datetime: wizardData.step1.pickupDateTime,
      return_datetime: wizardData.step1.dropoffDateTime,
      
      // Mileage & borders
      mileage_package: wizardData.step1.mileagePackage,
      included_km: wizardData.step1.includedKm,
      excess_km_rate: wizardData.step1.excessKmRate,
      cross_border_allowed: wizardData.step1.crossBorderAllowed,
      cross_border_countries: wizardData.step1.crossBorderCountries,
      salik_account_no: wizardData.step1.salikAccountNo,
      darb_account_no: wizardData.step1.darbAccountNo,
      
      // Pricing
      total_amount: wizardData.step3.pricingBreakdown.total,
      base_vehicle_rate_per_month: wizardData.step3.baseRate,
      insurance_package_type: wizardData.step3.insurancePackage,
      rate_overrides: wizardData.step3.rateOverride ? {
        amount: wizardData.step3.rateOverride.amount,
        reason: wizardData.step3.rateOverride.reason,
      } : null,
      
      // Add-ons
      add_ons: wizardData.step4.selectedAddons as any,
      
      // Notes
      notes: [
        wizardData.step1.specialInstructions,
        wizardData.step1.internalNotes,
      ].filter(Boolean).join('\n\n'),
      
      // Status
      status: 'pending_return' as const, // Initial status
      agreement_date: new Date().toISOString(),
    };

    console.log('[CreateAgreement] Creating agreement with data:', agreementData);

    const { data: agreement, error: agreementError } = await supabase
      .from('agreements')
      .insert([agreementData])
      .select()
      .single();

    if (agreementError) {
      console.error('[CreateAgreement] Error creating agreement:', agreementError);
      return { 
        success: false, 
        error: `Failed to create agreement: ${agreementError.message}` 
      };
    }

    console.log('[CreateAgreement] Agreement created:', agreement);

    // Step 2: If from instant booking or reservation, update the source record
    if (wizardData.sourceId) {
      if (wizardData.source === 'instant_booking' || wizardData.source === 'reservation') {
        const { error: updateError } = await supabase
          .from('reservations')
          .update({
            converted_agreement_id: agreement.id,
            status: 'completed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', wizardData.sourceId);

        if (updateError) {
          console.error('[CreateAgreement] Warning: Failed to update source reservation:', updateError);
          // Don't fail the whole operation, just log the warning
        } else {
          console.log('[CreateAgreement] Source reservation updated with agreement link');
        }
      }
    }

    // Step 3: Create agreement lines (if needed for detailed line items)
    if (wizardData.step4.selectedAddons.length > 0) {
      const lineItems = wizardData.step4.selectedAddons.map((addon, index) => ({
        agreement_id: agreement.id,
        line_number: index + 1,
        addon_id: addon.addonId,
        description: addon.name,
        quantity: addon.quantity,
        unit_price: addon.unitPrice,
        total_amount: addon.total,
        created_by: user.id,
      }));

      // Note: Assuming agreement_lines table exists
      // If it doesn't, this can be handled differently
      const { error: linesError } = await supabase
        .from('agreement_lines')
        .insert(lineItems);

      if (linesError) {
        console.error('[CreateAgreement] Warning: Failed to create agreement lines:', linesError);
        // Don't fail, lines might be stored in add_ons JSON instead
      }
    }

    // Step 4: Link payment records if from instant booking
    if (wizardData.source === 'instant_booking' && wizardData.sourceId) {
      // Link existing reservation payments to the new agreement
      const { error: paymentUpdateError } = await supabase
        .from('reservation_payments')
        .update({
          agreement_id: agreement.id,
          updated_at: new Date().toISOString(),
        })
        .eq('reservation_id', wizardData.sourceId);

      if (paymentUpdateError) {
        console.error('[CreateAgreement] Warning: Failed to link payments:', paymentUpdateError);
      } else {
        console.log('[CreateAgreement] Payment records linked to agreement');
      }
    }

    // Step 5: Create initial agreement payment record for new payments
    if (wizardData.step5.advancePayment.status === 'completed') {
      const { error: paymentError } = await supabase
        .from('agreement_payments')
        .insert({
          agreement_id: agreement.id,
          payment_type: 'advance',
          amount: wizardData.step5.advancePayment.amount,
          payment_method: wizardData.step5.paymentMethod,
          payment_status: 'completed',
          transaction_reference: wizardData.step5.advancePayment.transactionRef,
          payment_date: new Date().toISOString(),
          created_by: user.id,
        });

      if (paymentError) {
        console.error('[CreateAgreement] Warning: Failed to create payment record:', paymentError);
      }
    }

    // Step 6: Create document records if any were uploaded
    if (wizardData.step6?.documents && wizardData.step6.documents.length > 0) {
      const documentRecords = wizardData.step6.documents.map(doc => ({
        agreement_id: agreement.id,
        document_type: doc.type,
        document_side: doc.side,
        file_url: doc.url,
        verification_status: doc.verificationStatus,
        uploaded_at: doc.uploadedAt,
        created_by: user.id,
      }));

      const { error: docsError } = await supabase
        .from('agreement_documents')
        .insert(documentRecords);

      if (docsError) {
        console.error('[CreateAgreement] Warning: Failed to create document records:', docsError);
      }
    }

    console.log('[CreateAgreement] Agreement creation completed successfully:', {
      agreementId: agreement.id,
      agreementNo: agreement.agreement_no,
    });

    return {
      success: true,
      agreementId: agreement.id,
      agreementNo: agreement.agreement_no,
    };

  } catch (error) {
    console.error('[CreateAgreement] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Validate instant booking eligibility for conversion
 */
export async function validateInstantBookingForConversion(
  instantBookingId: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const { data: booking, error } = await supabase
      .from('reservations')
      .select('id, status, booking_type, converted_agreement_id')
      .eq('id', instantBookingId)
      .single();

    if (error || !booking) {
      return { valid: false, error: 'Instant booking not found' };
    }

    if (booking.booking_type !== 'INSTANT') {
      return { valid: false, error: 'Selected reservation is not an instant booking' };
    }

    if (booking.converted_agreement_id) {
      return { valid: false, error: 'This instant booking has already been converted to an agreement' };
    }

    if (booking.status !== 'confirmed') {
      return { valid: false, error: `Instant booking status must be 'confirmed', current status: ${booking.status}` };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Validation error',
    };
  }
}
