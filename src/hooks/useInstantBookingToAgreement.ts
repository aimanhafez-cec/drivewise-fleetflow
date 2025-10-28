import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { EnhancedWizardData } from '@/types/agreement-wizard';
import { toast } from 'sonner';

interface InstantBookingData {
  id: string;
  ro_number: string;
  booking_type: string;
  instant_booking_score?: number;
  auto_approved?: boolean;
  start_datetime: string;
  end_datetime: string;
  pickup_location?: string;
  return_location?: string;
  total_amount?: number;
  status: string;
  vehicle_id?: string;
  vehicle_class_id?: string;
  make_model?: string;
  rate_plan?: any;
  add_ons?: any[];
  salik_package?: {
    account_no?: string;
    trips?: number;
  };
  darb_package?: {
    account_no?: string;
  };
  fuel_option?: string;
  mileage_package?: {
    type: string;
    included_km?: number;
    excess_rate?: number;
  };
  cross_border_permits?: {
    allowed: boolean;
    countries?: string[];
  };
  special_requests?: string;
  price_list_id?: string;
  insurance_level_id?: string;
  insurance_group_id?: string;
  insurance_provider_id?: string;
  tax_level_id?: string;
  tax_code_id?: string;
  discount_value?: number;
  down_payment_amount?: number;
  down_payment_status?: string;
  down_payment_method?: string;
  down_payment_transaction_id?: string;
  advance_payment?: number;
  security_deposit_paid?: number;
  customer_id?: string;
  bill_to_type?: string;
  bill_to_meta?: any;
  business_unit_id?: string;
  profiles?: {
    full_name: string;
    email: string;
    phone: string;
  };
  vehicles?: {
    registration_number: string;
    make: string;
    model: string;
    year: number;
    color: string;
  };
}

/**
 * Hook to fetch instant booking data by ID using edge function
 */
export const useFetchInstantBooking = (instantBookingId?: string) => {
  return useQuery({
    queryKey: ['instant-booking', instantBookingId],
    queryFn: async () => {
      if (!instantBookingId) return null;

      console.log('[useFetchInstantBooking] Fetching booking via edge function:', instantBookingId);

      const { data, error } = await supabase.functions.invoke('get-instant-booking-by-id', {
        body: { id: instantBookingId },
      });

      if (error) {
        console.error('[useFetchInstantBooking] Error:', error);
        throw new Error(error.message || 'Failed to fetch instant booking');
      }

      if (!data) {
        throw new Error('Instant booking not found');
      }

      console.log('[useFetchInstantBooking] Successfully fetched:', data.ro_number);
      return data as InstantBookingData;
    },
    enabled: !!instantBookingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/**
 * Helper function to derive agreement type from instant booking duration
 */
const deriveAgreementType = (booking: InstantBookingData): 'daily' | 'weekly' | 'monthly' | 'long_term' => {
  const start = new Date(booking.start_datetime);
  const end = new Date(booking.end_datetime);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  if (days >= 90) return 'long_term';
  if (days >= 28) return 'monthly';
  if (days >= 7) return 'weekly';
  return 'daily';
};

/**
 * Helper to derive insurance package from instant booking
 */
const deriveInsurancePackage = (booking: InstantBookingData): 'comprehensive' | 'tpl' => {
  // Check insurance level or default to comprehensive
  if (booking.insurance_level_id) {
    // You can add more logic here based on actual insurance levels
    return 'comprehensive';
  }
  return 'comprehensive';
};

/**
 * Helper to map add-ons from instant booking format to wizard format
 */
const mapAddons = (addOns?: any[]): any[] => {
  if (!addOns || !Array.isArray(addOns)) return [];
  
  return addOns.map(addon => ({
    addonId: addon.id || addon.addonId || '',
    name: addon.name || '',
    category: addon.category || 'other',
    quantity: addon.quantity || 1,
    unitPrice: addon.unit_price || addon.unitPrice || 0,
    pricingModel: addon.pricing_model || addon.pricingModel || 'one_time',
    total: addon.total || (addon.quantity || 1) * (addon.unit_price || addon.unitPrice || 0),
  }));
};

/**
 * Helper to derive pricing breakdown from instant booking
 */
const derivePricingBreakdown = (booking: InstantBookingData): EnhancedWizardData['step3']['pricingBreakdown'] => {
  const baseRate = booking.rate_plan?.base_rate || 0;
  const insurance = booking.rate_plan?.insurance_cost || 0;
  const maintenance = booking.rate_plan?.maintenance_cost || 0;
  const addonsTotal = booking.add_ons?.reduce((sum, addon) => sum + (addon.total || 0), 0) || 0;
  
  const subtotal = baseRate + insurance + maintenance + addonsTotal;
  const discount = booking.discount_value || 0;
  const taxableAmount = subtotal - discount;
  const vat = taxableAmount * 0.05; // 5% VAT for UAE
  const total = taxableAmount + vat;

  return {
    baseRate,
    insurance,
    maintenance,
    addons: addonsTotal,
    subtotal,
    discount,
    taxableAmount,
    vat,
    total,
  };
};

/**
 * Map instant booking data to wizard data structure
 */
export const mapInstantBookingToWizardData = (
  instantBooking: InstantBookingData,
  currentWizardData: EnhancedWizardData
): Partial<EnhancedWizardData> => {
  console.log('[InstantBookingMapper] Mapping instant booking to wizard data:', instantBooking);

  const mappedData: Partial<EnhancedWizardData> = {
    source: 'instant_booking',
    sourceId: instantBooking.id,
    
    step1: {
      ...currentWizardData.step1,
      customerId: instantBooking.customer_id,
      customerVerified: true, // Instant bookings are pre-verified
      agreementType: deriveAgreementType(instantBooking),
      rentalPurpose: 'personal', // Can be derived from booking
      pickupLocationId: instantBooking.pickup_location || '',
      pickupDateTime: instantBooking.start_datetime,
      dropoffLocationId: instantBooking.return_location || '',
      dropoffDateTime: instantBooking.end_datetime,
      mileagePackage: instantBooking.mileage_package?.type === 'limited' ? 'limited' : 'unlimited',
      includedKm: instantBooking.mileage_package?.included_km,
      excessKmRate: instantBooking.mileage_package?.excess_rate,
      crossBorderAllowed: instantBooking.cross_border_permits?.allowed || false,
      crossBorderCountries: instantBooking.cross_border_permits?.countries || [],
      salikAccountNo: instantBooking.salik_package?.account_no,
      darbAccountNo: instantBooking.darb_package?.account_no,
      specialInstructions: instantBooking.special_requests,
      // internalNotes will be new/empty for agreement
    },
    
    step3: {
      ...currentWizardData.step3,
      baseRate: instantBooking.rate_plan?.base_rate || 0,
      insurancePackage: deriveInsurancePackage(instantBooking),
      excessAmount: instantBooking.rate_plan?.excess_amount || 1500,
      maintenanceIncluded: !!instantBooking.rate_plan?.maintenance_cost,
      maintenanceCost: instantBooking.rate_plan?.maintenance_cost,
      discountAmount: instantBooking.discount_value,
      pricingBreakdown: derivePricingBreakdown(instantBooking),
    },
    
    step4: {
      ...currentWizardData.step4,
      selectedAddons: mapAddons(instantBooking.add_ons),
    },
    
    step5: {
      ...currentWizardData.step5,
      billingType: 'same',
      paymentMethod: instantBooking.down_payment_method || '',
      advancePayment: {
        amount: instantBooking.advance_payment || instantBooking.down_payment_amount || 0,
        status: instantBooking.down_payment_status === 'paid' ? 'completed' : 'pending',
        transactionRef: instantBooking.down_payment_transaction_id,
        receiptUrl: undefined,
      },
      securityDeposit: {
        method: 'card_hold',
        amount: instantBooking.security_deposit_paid || 0,
        status: instantBooking.security_deposit_paid && instantBooking.security_deposit_paid > 0 ? 'collected' : 'pending',
        authorizationRef: undefined,
        chequeDetails: undefined,
      },
    },
    
    // Enhanced Phase 10 fields
    businessConfig: {
      businessUnitId: instantBooking.business_unit_id,
    },
    
    enhancedPricing: {
      priceListId: instantBooking.price_list_id,
      insuranceConfig: {
        levelId: instantBooking.insurance_level_id,
        groupId: instantBooking.insurance_group_id,
        providerId: instantBooking.insurance_provider_id,
      },
      discountConfig: {
        amount: instantBooking.discount_value,
      },
    },
    
    enhancedBilling: {
      billToType: (instantBooking.bill_to_type as any) || 'customer',
      billToDetails: instantBooking.bill_to_meta,
      taxConfig: {
        taxLevelId: instantBooking.tax_level_id,
        taxCodeId: instantBooking.tax_code_id,
      },
    },
  };

  console.log('[InstantBookingMapper] Mapped data:', mappedData);
  return mappedData;
};

/**
 * Hook to handle instant booking to agreement conversion
 */
export const useInstantBookingToAgreement = (instantBookingId?: string) => {
  const { data: instantBooking, isLoading, error } = useFetchInstantBooking(instantBookingId);

  const mapToWizardData = (currentWizardData: EnhancedWizardData): Partial<EnhancedWizardData> | null => {
    if (!instantBooking) return null;
    return mapInstantBookingToWizardData(instantBooking, currentWizardData);
  };

  return {
    instantBooking,
    isLoading,
    error,
    mapToWizardData,
  };
};
