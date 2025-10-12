// Static dropdown options for Financial Section (Quote Wizard Step 4)

export const BILLING_PLANS = [
  { id: 'monthly', label: 'Monthly', value: 'monthly' },
  { id: 'quarterly', label: 'Quarterly', value: 'quarterly' },
  { id: 'semi-annual', label: 'Semi-Annual', value: 'semi-annual' },
  { id: 'annual', label: 'Annual', value: 'annual' },
] as const;

export const PRORATION_RULES = [
  { id: 'none', label: 'No Proration (Full Month Billing)', value: 'none' },
  { id: 'first-only', label: 'First Period Only', value: 'first-only' },
  { id: 'first-last', label: 'First & Last Periods', value: 'first-last' },
] as const;

export const VAT_RATES = [
  { id: 'vat-0', label: '0% (Exempt)', value: 0, rate: 0 },
  { id: 'vat-5', label: '5% (UAE Standard)', value: 5, rate: 0.05 },
  { id: 'vat-10', label: '10%', value: 10, rate: 0.10 },
  { id: 'vat-15', label: '15%', value: 15, rate: 0.15 },
  { id: 'vat-20', label: '20%', value: 20, rate: 0.20 },
] as const;

export const DEPOSIT_TYPES = [
  { id: 'refundable', label: 'Refundable Deposit', value: 'refundable' },
  { id: 'non-refundable', label: 'Non-Refundable Deposit', value: 'non-refundable' },
  { id: 'bank-guarantee', label: 'Bank Guarantee', value: 'bank-guarantee' },
] as const;

export const PAYMENT_METHODS = [
  { id: 'bank-transfer', label: 'Bank Transfer', value: 'bank-transfer' },
  { id: 'credit-card', label: 'Credit Card', value: 'credit-card' },
  { id: 'cheque', label: 'Cheque', value: 'cheque' },
  { id: 'direct-debit', label: 'Direct Debit', value: 'direct-debit' },
  { id: 'cash', label: 'Cash', value: 'cash' },
] as const;

export const FX_RATE_TYPES = [
  { id: 'corporate', label: 'Corporate Rate', value: 'corporate' },
  { id: 'spot', label: 'Spot Rate', value: 'spot' },
  { id: 'fixed', label: 'Fixed Rate', value: 'fixed' },
  { id: 'market', label: 'Market Rate', value: 'market' },
] as const;

export const CURRENCIES = [
  { id: 'aed', label: 'AED - UAE Dirham', value: 'AED', symbol: 'AED' },
  { id: 'usd', label: 'USD - US Dollar', value: 'USD', symbol: '$' },
  { id: 'eur', label: 'EUR - Euro', value: 'EUR', symbol: '€' },
  { id: 'gbp', label: 'GBP - British Pound', value: 'GBP', symbol: '£' },
  { id: 'sar', label: 'SAR - Saudi Riyal', value: 'SAR', symbol: 'SAR' },
] as const;

export const INITIAL_FEE_TYPES = [
  { id: 'registration', label: 'Registration / Admin Handling Fee', value: 'registration' },
  { id: 'delivery', label: 'Delivery / Logistics Fee', value: 'delivery' },
  { id: 'processing', label: 'Processing Fee', value: 'processing' },
  { id: 'documentation', label: 'Documentation Fee', value: 'documentation' },
  { id: 'setup', label: 'Setup Fee', value: 'setup' },
  { id: 'onboarding', label: 'Onboarding / Training Fee', value: 'onboarding' },
  { id: 'other', label: 'Other Fee', value: 'other' },
] as const;

export type BillingPlan = typeof BILLING_PLANS[number]['value'];
export type ProrationRule = typeof PRORATION_RULES[number]['value'];
export type DepositType = typeof DEPOSIT_TYPES[number]['value'];
export type PaymentMethod = typeof PAYMENT_METHODS[number]['value'];
export type FxRateType = typeof FX_RATE_TYPES[number]['value'];
export type CurrencyCode = typeof CURRENCIES[number]['value'];
export type InitialFeeType = typeof INITIAL_FEE_TYPES[number]['value'];
