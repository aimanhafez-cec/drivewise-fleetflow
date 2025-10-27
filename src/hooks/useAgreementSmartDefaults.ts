import { useQuery } from '@tanstack/react-query';
import {
  fetchAgreementHistory,
  CustomerAgreementHistory,
} from '@/lib/smartDefaults/agreementHistory';
import { addDays, format } from 'date-fns';

export interface AgreementSmartDefaults {
  // From customer history
  pickupLocationId?: string;
  dropoffLocationId?: string;
  agreementType?: 'daily' | 'weekly' | 'monthly' | 'long-term';
  rentalPurpose?: 'personal' | 'business' | 'replacement' | 'leisure' | 'test-drive';
  insurancePackage?: 'basic' | 'standard' | 'comprehensive' | 'premium';
  mileagePackage?: 'limited' | 'standard' | 'unlimited' | 'custom';
  excessAmount?: number;
  // Calculated from patterns
  pickupDateTime?: string;
  dropoffDateTime?: string;
  // Metadata
  hasHistory: boolean;
  appliedFrom?: 'history' | 'system';
}

/**
 * Hook to fetch and compute smart defaults for a customer agreement
 * Analyzes agreement history and returns pre-filled values
 */
export function useAgreementSmartDefaults(customerId?: string) {
  const { data: history, isLoading } = useQuery({
    queryKey: ['agreement-history', customerId],
    queryFn: () => fetchAgreementHistory(customerId!),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const smartDefaults = computeSmartDefaults(history);

  return {
    smartDefaults,
    history,
    isLoading,
    hasHistory: (history?.lastAgreements?.length ?? 0) > 0,
  };
}

/**
 * Compute smart defaults from customer history
 * Falls back to system defaults if no history available
 */
function computeSmartDefaults(
  history: CustomerAgreementHistory | null | undefined
): AgreementSmartDefaults {
  if (!history || history.lastAgreements.length === 0) {
    return getSystemDefaults();
  }

  const { preferences, patterns } = history;

  // Calculate smart dates based on average duration
  const today = new Date();
  let pickupDateTime: string;
  let dropoffDateTime: string;

  // Default to tomorrow at preferred time
  const pickupDate = addDays(today, 1);
  const pickupTime = patterns.preferredPickupTime || '10:00';
  const [pickupHour, pickupMinute] = pickupTime.split(':').map(Number);
  pickupDate.setHours(pickupHour, pickupMinute, 0, 0);
  pickupDateTime = pickupDate.toISOString();

  // Calculate dropoff based on average duration
  let dropoffDate: Date;
  const dropoffTime = patterns.preferredDropoffTime || '10:00';
  
  if (patterns.averageDuration && patterns.averageDuration > 0) {
    // Use customer's average duration
    dropoffDate = addDays(pickupDate, patterns.averageDuration);
  } else {
    // Default to 7 days
    dropoffDate = addDays(pickupDate, 7);
  }

  const [dropoffHour, dropoffMinute] = dropoffTime.split(':').map(Number);
  dropoffDate.setHours(dropoffHour, dropoffMinute, 0, 0);
  dropoffDateTime = dropoffDate.toISOString();

  return {
    // Customer preferences
    pickupLocationId: preferences.pickupLocationId,
    dropoffLocationId: preferences.dropoffLocationId,
    agreementType: preferences.agreementType,
    rentalPurpose: preferences.rentalPurpose,
    insurancePackage: preferences.insurancePackage,
    mileagePackage: preferences.mileagePackage,
    excessAmount: patterns.typicalExcessAmount,
    // Calculated dates
    pickupDateTime,
    dropoffDateTime,
    // Metadata
    hasHistory: true,
    appliedFrom: 'history',
  };
}

/**
 * System-level defaults when no customer history exists
 */
function getSystemDefaults(): AgreementSmartDefaults {
  const today = new Date();
  
  // Tomorrow at 10:00 AM
  const pickupDate = addDays(today, 1);
  pickupDate.setHours(10, 0, 0, 0);
  const pickupDateTime = pickupDate.toISOString();
  
  // 7 days later at 10:00 AM
  const dropoffDate = addDays(pickupDate, 7);
  dropoffDate.setHours(10, 0, 0, 0);
  const dropoffDateTime = dropoffDate.toISOString();

  return {
    pickupDateTime,
    dropoffDateTime,
    agreementType: 'daily',
    rentalPurpose: 'personal',
    insurancePackage: 'standard',
    mileagePackage: 'standard',
    excessAmount: 1500,
    hasHistory: false,
    appliedFrom: 'system',
  };
}

/**
 * Hook to apply smart defaults to agreement wizard data
 * Returns a function to merge defaults into current wizard state
 */
export function useApplyAgreementSmartDefaults() {
  const applyDefaults = (
    currentData: any,
    smartDefaults: AgreementSmartDefaults,
    options: {
      overwriteExisting?: boolean;
      fieldsToApply?: (keyof AgreementSmartDefaults)[];
    } = {}
  ) => {
    const { overwriteExisting = false, fieldsToApply } = options;
    const updates: any = {};

    // Determine which fields to apply
    const fields: (keyof AgreementSmartDefaults)[] = fieldsToApply || [
      'pickupLocationId',
      'dropoffLocationId',
      'agreementType',
      'rentalPurpose',
      'insurancePackage',
      'mileagePackage',
      'excessAmount',
      'pickupDateTime',
      'dropoffDateTime',
    ];

    fields.forEach((field) => {
      const defaultValue = smartDefaults[field];
      
      // Handle nested step data for agreements
      let currentValue;
      if (field === 'pickupLocationId' || field === 'dropoffLocationId' || 
          field === 'agreementType' || field === 'rentalPurpose' ||
          field === 'pickupDateTime' || field === 'dropoffDateTime' ||
          field === 'mileagePackage') {
        currentValue = currentData.step1?.[field];
      } else if (field === 'insurancePackage' || field === 'excessAmount') {
        currentValue = currentData.step3?.[field];
      } else {
        currentValue = currentData[field];
      }

      // Apply if:
      // 1. Value exists in defaults
      // 2. Either current is empty OR overwrite is enabled
      if (
        defaultValue !== undefined &&
        (!currentValue || overwriteExisting)
      ) {
        // Update the correct step data
        if (field === 'pickupLocationId' || field === 'dropoffLocationId' || 
            field === 'agreementType' || field === 'rentalPurpose' ||
            field === 'pickupDateTime' || field === 'dropoffDateTime' ||
            field === 'mileagePackage') {
          if (!updates.step1) updates.step1 = {};
          updates.step1[field] = defaultValue;
        } else if (field === 'insurancePackage' || field === 'excessAmount') {
          if (!updates.step3) updates.step3 = {};
          updates.step3[field] = defaultValue;
        } else {
          updates[field] = defaultValue;
        }
      }
    });

    return updates;
  };

  return { applyDefaults };
}
