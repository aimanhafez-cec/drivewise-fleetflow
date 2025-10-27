import { supabase } from '@/integrations/supabase/client';

export interface CustomerAgreementHistory {
  customerId: string;
  lastAgreements: any[];
  preferences: {
    pickupLocationId?: string;
    dropoffLocationId?: string;
    agreementType?: 'daily' | 'weekly' | 'monthly' | 'long-term';
    rentalPurpose?: 'personal' | 'business' | 'replacement' | 'leisure' | 'test-drive';
    insurancePackage?: 'basic' | 'standard' | 'comprehensive' | 'premium';
    mileagePackage?: 'limited' | 'standard' | 'unlimited' | 'custom';
  };
  patterns: {
    averageDuration?: number; // in days
    preferredPickupTime?: string;
    preferredDropoffTime?: string;
    usuallyInsurance?: boolean;
    typicalExcessAmount?: number;
  };
}

/**
 * Fetch and analyze customer's agreement history
 * Returns the last 3 agreements and extracted preferences
 */
export async function fetchAgreementHistory(
  customerId: string
): Promise<CustomerAgreementHistory | null> {
  if (!customerId) return null;

  try {
    // Fetch last 3 completed or active agreements
    const { data: lastAgreements, error } = await supabase
      .from('agreements')
      .select('*')
      .eq('customer_id', customerId)
      .in('status', ['completed', 'active', 'terminated'])
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('[agreementHistory] Error fetching agreements:', error);
      return null;
    }

    if (!lastAgreements || lastAgreements.length === 0) {
      return {
        customerId,
        lastAgreements: [],
        preferences: {},
        patterns: {},
      };
    }

    // Analyze patterns from the agreements
    const preferences = analyzePreferences(lastAgreements);
    const patterns = analyzePatterns(lastAgreements);

    return {
      customerId,
      lastAgreements,
      preferences,
      patterns,
    };
  } catch (error) {
    console.error('[agreementHistory] Unexpected error:', error);
    return null;
  }
}

/**
 * Extract preferences from agreement history
 * Uses mode (most common) for categorical data
 */
function analyzePreferences(agreements: any[]) {
  const preferences: CustomerAgreementHistory['preferences'] = {};

  // Most common pickup location
  const pickupLocations = agreements.map((a) => a.pickup_location_id).filter(Boolean);
  if (pickupLocations.length > 0) {
    preferences.pickupLocationId = mode(pickupLocations);
  }

  // Most common dropoff location
  const dropoffLocations = agreements.map((a) => a.dropoff_location_id).filter(Boolean);
  if (dropoffLocations.length > 0) {
    preferences.dropoffLocationId = mode(dropoffLocations);
  }

  // Most common agreement type
  const agreementTypes = agreements.map((a) => a.agreement_type).filter(Boolean);
  if (agreementTypes.length > 0) {
    preferences.agreementType = mode(agreementTypes);
  }

  // Most common rental purpose
  const purposes = agreements.map((a) => a.rental_purpose).filter(Boolean);
  if (purposes.length > 0) {
    preferences.rentalPurpose = mode(purposes);
  }

  // Most common insurance package
  const insurancePackages = agreements.map((a) => a.insurance_package).filter(Boolean);
  if (insurancePackages.length > 0) {
    preferences.insurancePackage = mode(insurancePackages);
  }

  // Most common mileage package
  const mileagePackages = agreements.map((a) => a.mileage_package).filter(Boolean);
  if (mileagePackages.length > 0) {
    preferences.mileagePackage = mode(mileagePackages);
  }

  return preferences;
}

/**
 * Extract agreement patterns (averages and tendencies)
 */
function analyzePatterns(agreements: any[]) {
  const patterns: CustomerAgreementHistory['patterns'] = {};

  // Calculate average agreement duration
  const durations = agreements
    .map((a) => {
      if (!a.pickup_datetime || !a.dropoff_datetime) return null;
      const start = new Date(a.pickup_datetime);
      const end = new Date(a.dropoff_datetime);
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
  const pickupTimes = agreements
    .map((a) => {
      if (!a.pickup_datetime) return null;
      const time = new Date(a.pickup_datetime);
      return `${String(time.getHours()).padStart(2, '0')}:${String(
        time.getMinutes()
      ).padStart(2, '0')}`;
    })
    .filter(Boolean);

  if (pickupTimes.length > 0) {
    patterns.preferredPickupTime = mode(pickupTimes);
  }

  // Most common dropoff time
  const dropoffTimes = agreements
    .map((a) => {
      if (!a.dropoff_datetime) return null;
      const time = new Date(a.dropoff_datetime);
      return `${String(time.getHours()).padStart(2, '0')}:${String(
        time.getMinutes()
      ).padStart(2, '0')}`;
    })
    .filter(Boolean);

  if (dropoffTimes.length > 0) {
    patterns.preferredDropoffTime = mode(dropoffTimes);
  }

  // Check if customer usually takes comprehensive insurance
  const insuranceAgreements = agreements.filter(
    (a) => a.insurance_package === 'comprehensive' || a.insurance_package === 'premium'
  );
  patterns.usuallyInsurance = insuranceAgreements.length >= agreements.length / 2;

  // Calculate typical excess amount
  const excessAmounts = agreements
    .map((a) => a.excess_amount)
    .filter((amount): amount is number => typeof amount === 'number' && amount > 0);

  if (excessAmounts.length > 0) {
    patterns.typicalExcessAmount = Math.round(
      excessAmounts.reduce((a, b) => a + b, 0) / excessAmounts.length
    );
  }

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
