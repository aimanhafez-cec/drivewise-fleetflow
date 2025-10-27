import { supabase } from '@/integrations/supabase/client';

export interface CustomerBookingHistory {
  customerId: string;
  lastBookings: any[];
  preferences: {
    vehicleClassId?: string;
    pickupLocation?: string;
    returnLocation?: string;
    paymentTermsId?: string;
    priceListId?: string;
    insuranceLevelId?: string;
    insuranceGroupId?: string;
    reservationMethodId?: string;
    businessUnitId?: string;
  };
  patterns: {
    averageDuration?: number; // in days
    preferredPickupTime?: string;
    preferredReturnTime?: string;
    usuallyAirport?: boolean;
  };
}

/**
 * Fetch and analyze customer's booking history
 * Returns the last 3 bookings and extracted preferences
 */
export async function fetchCustomerHistory(
  customerId: string
): Promise<CustomerBookingHistory | null> {
  if (!customerId) return null;

  try {
    // Fetch last 3 completed or confirmed reservations
    const { data: lastBookings, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('customer_id', customerId)
      .in('status', ['completed', 'confirmed', 'checked_out'])
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('[customerHistory] Error fetching bookings:', error);
      return null;
    }

    if (!lastBookings || lastBookings.length === 0) {
      return {
        customerId,
        lastBookings: [],
        preferences: {},
        patterns: {},
      };
    }

    // Analyze patterns from the bookings
    const preferences = analyzePreferences(lastBookings);
    const patterns = analyzePatterns(lastBookings);

    return {
      customerId,
      lastBookings,
      preferences,
      patterns,
    };
  } catch (error) {
    console.error('[customerHistory] Unexpected error:', error);
    return null;
  }
}

/**
 * Extract preferences from booking history
 * Uses mode (most common) for categorical data
 */
function analyzePreferences(bookings: any[]) {
  const preferences: CustomerBookingHistory['preferences'] = {};

  // Find most common vehicle class
  const vehicleClasses = bookings
    .map((b) => b.vehicle_class_id)
    .filter(Boolean);
  if (vehicleClasses.length > 0) {
    preferences.vehicleClassId = mode(vehicleClasses);
  }

  // Most common locations
  const pickupLocations = bookings.map((b) => b.pickup_location).filter(Boolean);
  if (pickupLocations.length > 0) {
    preferences.pickupLocation = mode(pickupLocations);
  }

  const returnLocations = bookings.map((b) => b.return_location).filter(Boolean);
  if (returnLocations.length > 0) {
    preferences.returnLocation = mode(returnLocations);
  }

  // Most common payment terms
  const paymentTerms = bookings.map((b) => b.payment_terms_id).filter(Boolean);
  if (paymentTerms.length > 0) {
    preferences.paymentTermsId = mode(paymentTerms);
  }

  // Most common price list
  const priceLists = bookings.map((b) => b.price_list_id).filter(Boolean);
  if (priceLists.length > 0) {
    preferences.priceListId = mode(priceLists);
  }

  // Most common insurance level
  const insuranceLevels = bookings
    .map((b) => b.insurance_level_id)
    .filter(Boolean);
  if (insuranceLevels.length > 0) {
    preferences.insuranceLevelId = mode(insuranceLevels);
  }

  // Most common insurance group
  const insuranceGroups = bookings
    .map((b) => b.insurance_group_id)
    .filter(Boolean);
  if (insuranceGroups.length > 0) {
    preferences.insuranceGroupId = mode(insuranceGroups);
  }

  // Most common reservation method
  const methods = bookings.map((b) => b.reservation_method_id).filter(Boolean);
  if (methods.length > 0) {
    preferences.reservationMethodId = mode(methods);
  }

  // Most common business unit
  const units = bookings.map((b) => b.business_unit_id).filter(Boolean);
  if (units.length > 0) {
    preferences.businessUnitId = mode(units);
  }

  return preferences;
}

/**
 * Extract booking patterns (averages and tendencies)
 */
function analyzePatterns(bookings: any[]) {
  const patterns: CustomerBookingHistory['patterns'] = {};

  // Calculate average rental duration
  const durations = bookings
    .map((b) => {
      if (!b.start_datetime || !b.end_datetime) return null;
      const start = new Date(b.start_datetime);
      const end = new Date(b.end_datetime);
      const durationMs = end.getTime() - start.getTime();
      return durationMs / (1000 * 60 * 60 * 24); // Convert to days
    })
    .filter((d): d is number => d !== null);

  if (durations.length > 0) {
    patterns.averageDuration = Math.round(
      durations.reduce((a, b) => a + b, 0) / durations.length
    );
  }

  // Most common pickup time
  const pickupTimes = bookings
    .map((b) => {
      if (!b.start_datetime) return null;
      const time = new Date(b.start_datetime);
      return `${String(time.getHours()).padStart(2, '0')}:${String(
        time.getMinutes()
      ).padStart(2, '0')}`;
    })
    .filter(Boolean);

  if (pickupTimes.length > 0) {
    patterns.preferredPickupTime = mode(pickupTimes);
  }

  // Most common return time
  const returnTimes = bookings
    .map((b) => {
      if (!b.end_datetime) return null;
      const time = new Date(b.end_datetime);
      return `${String(time.getHours()).padStart(2, '0')}:${String(
        time.getMinutes()
      ).padStart(2, '0')}`;
    })
    .filter(Boolean);

  if (returnTimes.length > 0) {
    patterns.preferredReturnTime = mode(returnTimes);
  }

  // Check if customer usually books with airport
  const airportBookings = bookings.filter(
    (b) => b.airport_pickup || b.airport_return
  );
  patterns.usuallyAirport = airportBookings.length >= bookings.length / 2;

  return patterns;
}

/**
 * Find the most common value in an array (mode)
 */
function mode<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;

  const frequency: Record<string, { value: T; count: number }> = {};

  arr.forEach((item) => {
    const key = String(item);
    if (!frequency[key]) {
      frequency[key] = { value: item, count: 0 };
    }
    frequency[key].count++;
  });

  let maxCount = 0;
  let modeValue: T | undefined;

  Object.values(frequency).forEach(({ value, count }) => {
    if (count > maxCount) {
      maxCount = count;
      modeValue = value;
    }
  });

  return modeValue;
}
