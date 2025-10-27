import { useQuery } from '@tanstack/react-query';
import {
  fetchCustomerHistory,
  CustomerBookingHistory,
} from '@/lib/smartDefaults/customerHistory';
import { addDays, format } from 'date-fns';

export interface SmartDefaults {
  // From customer history
  vehicleClassId?: string;
  pickupLocation?: string;
  returnLocation?: string;
  paymentTermsId?: string;
  priceListId?: string;
  insuranceLevelId?: string;
  insuranceGroupId?: string;
  reservationMethodId?: string;
  businessUnitId?: string;
  // Calculated from patterns
  pickupDate?: string;
  pickupTime?: string;
  returnDate?: string;
  returnTime?: string;
  airportPickup?: boolean;
  airportReturn?: boolean;
  // Metadata
  hasHistory: boolean;
  appliedFrom?: 'history' | 'system';
}

/**
 * Hook to fetch and compute smart defaults for a customer
 * Analyzes booking history and returns pre-filled values
 */
export function useSmartDefaults(customerId?: string) {
  const { data: history, isLoading } = useQuery({
    queryKey: ['customer-history', customerId],
    queryFn: () => fetchCustomerHistory(customerId!),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const smartDefaults = computeSmartDefaults(history);

  return {
    smartDefaults,
    history,
    isLoading,
    hasHistory: (history?.lastBookings?.length ?? 0) > 0,
  };
}

/**
 * Compute smart defaults from customer history
 * Falls back to system defaults if no history available
 */
function computeSmartDefaults(
  history: CustomerBookingHistory | null | undefined
): SmartDefaults {
  if (!history || history.lastBookings.length === 0) {
    return getSystemDefaults();
  }

  const { preferences, patterns } = history;

  // Calculate smart dates based on average duration
  const today = new Date();
  const pickupDate = format(addDays(today, 1), 'yyyy-MM-dd'); // Tomorrow by default
  const pickupTime = patterns.preferredPickupTime || '10:00';

  let returnDate: string;
  let returnTime: string;

  if (patterns.averageDuration && patterns.averageDuration > 0) {
    // Use customer's average duration
    returnDate = format(addDays(today, patterns.averageDuration + 1), 'yyyy-MM-dd');
    returnTime = patterns.preferredReturnTime || '10:00';
  } else {
    // Default to 1 week
    returnDate = format(addDays(today, 8), 'yyyy-MM-dd');
    returnTime = patterns.preferredReturnTime || '10:00';
  }

  return {
    // Customer preferences
    vehicleClassId: preferences.vehicleClassId,
    pickupLocation: preferences.pickupLocation,
    returnLocation: preferences.returnLocation,
    paymentTermsId: preferences.paymentTermsId,
    priceListId: preferences.priceListId,
    insuranceLevelId: preferences.insuranceLevelId,
    insuranceGroupId: preferences.insuranceGroupId,
    reservationMethodId: preferences.reservationMethodId,
    businessUnitId: preferences.businessUnitId,
    // Calculated dates
    pickupDate,
    pickupTime,
    returnDate,
    returnTime,
    airportPickup: patterns.usuallyAirport,
    airportReturn: patterns.usuallyAirport,
    // Metadata
    hasHistory: true,
    appliedFrom: 'history',
  };
}

/**
 * System-level defaults when no customer history exists
 */
function getSystemDefaults(): SmartDefaults {
  const today = new Date();
  const pickupDate = format(addDays(today, 1), 'yyyy-MM-dd'); // Tomorrow
  const returnDate = format(addDays(today, 8), 'yyyy-MM-dd'); // 1 week later

  return {
    pickupDate,
    pickupTime: '10:00',
    returnDate,
    returnTime: '10:00',
    hasHistory: false,
    appliedFrom: 'system',
  };
}

/**
 * Hook to apply smart defaults to wizard data
 * Returns a function to merge defaults into current wizard state
 */
export function useApplySmartDefaults() {
  const applyDefaults = (
    currentData: any,
    smartDefaults: SmartDefaults,
    options: {
      overwriteExisting?: boolean;
      fieldsToApply?: (keyof SmartDefaults)[];
    } = {}
  ) => {
    const { overwriteExisting = false, fieldsToApply } = options;
    const updates: any = {};

    // Determine which fields to apply
    const fields: (keyof SmartDefaults)[] = fieldsToApply || [
      'vehicleClassId',
      'pickupLocation',
      'returnLocation',
      'paymentTermsId',
      'priceListId',
      'insuranceLevelId',
      'insuranceGroupId',
      'reservationMethodId',
      'businessUnitId',
      'pickupDate',
      'pickupTime',
      'returnDate',
      'returnTime',
      'airportPickup',
      'airportReturn',
    ];

    fields.forEach((field) => {
      const defaultValue = smartDefaults[field];
      const currentValue = currentData[field];

      // Apply if:
      // 1. Value exists in defaults
      // 2. Either current is empty OR overwrite is enabled
      if (
        defaultValue !== undefined &&
        (!currentValue || overwriteExisting)
      ) {
        updates[field] = defaultValue;
      }
    });

    return updates;
  };

  return { applyDefaults };
}
