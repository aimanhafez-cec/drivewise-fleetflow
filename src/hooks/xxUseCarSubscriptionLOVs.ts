import { useLOV, useLOVById } from './useLOV';

// Car Subscription specific LOV hooks
export interface CarSubscription {
  id: string;
  subscription_id: string;
  customer_id: string;
  status: string;
  plan: string;
  monthly_fee: number;
  start_date: string;
  label: string;
}

export const useCarSubscriptions = (status?: string) => {
  return useLOV<CarSubscription>(
    'car_subscriptions',
    `id, subscription_id, customer_id, status, plan, monthly_fee, start_date, 
     (subscription_id || ' - ' || plan || ' - AED ' || monthly_fee::text) as label`,
    {
      dependencies: status ? { status } : undefined,
      orderBy: 'created_at desc'
    }
  );
};

export const useCarSubscriptionById = (id?: string) => {
  return useLOVById<CarSubscription>(
    'car_subscriptions',
    `id, subscription_id, customer_id, status, plan, monthly_fee, start_date,
     (subscription_id || ' - ' || plan || ' - AED ' || monthly_fee::text) as label`,
    id
  );
};

// Static LOV options for Car Subscriptions
export const SUBSCRIPTION_MODELS = [
  { id: 'By Class', label: 'By Class' },
  { id: 'By Specific VIN', label: 'By Specific VIN' }
];

export const RENEWAL_CYCLES = [
  { id: 'Monthly (anniversary)', label: 'Monthly (anniversary)' },
  { id: '3-Monthly', label: '3-Monthly' }
];

export const MINIMUM_COMMITMENTS = [
  { id: 'None', label: 'None' },
  { id: '1', label: '1 month' },
  { id: '3', label: '3 months' },
  { id: '6', label: '6 months' }
];

export const CANCELLATION_NOTICES = [
  { id: '0', label: '0 days' },
  { id: '7', label: '7 days' },
  { id: '14', label: '14 days' },
  { id: '30', label: '30 days' }
];

export const SUBSCRIPTION_PLANS = [
  { id: 'Essential', label: 'Essential' },
  { id: 'Standard', label: 'Standard' },
  { id: 'Premium', label: 'Premium' },
  { id: 'Custom', label: 'Custom' }
];

export const SWAP_FREQUENCIES = [
  { id: '1 per month', label: '1 per month' },
  { id: '1 per quarter', label: '1 per quarter' },
  { id: 'None', label: 'None' }
];

export const INSURANCE_TYPES = [
  { id: 'Comprehensive', label: 'Comprehensive' },
  { id: 'Basic', label: 'Basic' },
  { id: "Customer's Own", label: "Customer's Own" }
];

export const MAINTENANCE_INCLUSIONS = [
  { id: 'Included', label: 'Included' },
  { id: 'Excluded', label: 'Excluded' }
];

export const BILLING_DAY_TYPES = [
  { id: 'Anniversary', label: 'Anniversary' },
  { id: '1st', label: '1st of month' },
  { id: '15th', label: '15th of month' }
];

export const SALIK_HANDLING_OPTIONS = [
  { id: 'Rebill Actual', label: 'Rebill Actual' },
  { id: 'Included Allowance', label: 'Included Allowance (cap/month)' }
];

export const PAYMENT_METHOD_TYPES = [
  { id: 'Card Autopay', label: 'Card Autopay' },
  { id: 'Direct Debit', label: 'Direct Debit' },
  { id: 'Invoice (Corporate)', label: 'Invoice (Corporate)' }
];

export const GEO_RESTRICTIONS = [
  { id: 'UAE-only', label: 'UAE-only' },
  { id: 'GCC Allowed', label: 'GCC Allowed' },
  { id: 'Off-road Prohibited', label: 'Off-road Prohibited' }
];

export const VEHICLE_SWAP_RULES = [
  { id: 'Same class', label: 'Same class' },
  { id: 'Up to +1 class (fee)', label: 'Up to +1 class (fee)' }
];

export const EARLY_CANCELLATION_FEE_TYPES = [
  { id: 'None', label: 'None' },
  { id: 'Fixed AED', label: 'Fixed AED' },
  { id: '% of remaining month', label: '% of remaining month' }
];

export const MAINTENANCE_TRIGGERS = [
  { id: 'Every X km', label: 'Every X km' },
  { id: 'Every Y months', label: 'Every Y months' },
  { id: 'Both (first due)', label: 'Both (first due)' }
];

export const PREFERRED_WORKSHOPS = [
  { id: 'OEM', label: 'OEM' },
  { id: 'In-house', label: 'In-house' },
  { id: 'Partner', label: 'Partner' }
];

export const CONDITION_REPORT_CADENCES = [
  { id: 'On start', label: 'On start' },
  { id: 'On swap', label: 'On swap' },
  { id: 'Monthly', label: 'Monthly' },
  { id: 'On start and swap', label: 'On start and swap' }
];

export const SWAP_REQUEST_FLOWS = [
  { id: 'Self-service App', label: 'Self-service App' },
  { id: 'Call Center', label: 'Call Center' },
  { id: 'Branch', label: 'Branch' }
];

export const FINAL_BILLING_TYPES = [
  { id: 'Pro-rata', label: 'Pro-rata' },
  { id: 'Full month', label: 'Full month' }
];

export const SECURITY_DEPOSIT_OPTIONS = [
  { id: 'Waived', label: 'Waived' },
  { id: 'Fixed Amount', label: 'Fixed Amount' }
];

export const FUEL_LEVELS = [
  { id: 'Empty', label: 'Empty' },
  { id: '1/4', label: '1/4' },
  { id: '1/2', label: '1/2' },
  { id: '3/4', label: '3/4' },
  { id: 'Full', label: 'Full' }
];