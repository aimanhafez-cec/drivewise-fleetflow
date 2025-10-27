/**
 * Centralized utility exports
 */

// Currency utilities
export { formatNumber, formatCurrency, DEFAULT_CURRENCY } from './currency';

// UAE Business Rules
export {
  calculateFuelCharge,
  calculateExcessKmCharge,
  calculateCleaningFee,
  calculateLateReturnCharge,
  calculateDamageCharge,
  calculateAllDamages,
  calculateVAT,
  calculateTotalCharges,
  calculateDepositRefund,
  VAT_RATE,
  type FuelPolicy,
  type CleaningType,
  type DamageCharge,
  type TotalCharges,
} from './uaeBusinessRules';

// Agreement pricing
export { calculateAgreementLinePricing, calculateAgreementPricing } from './agreementPricing';
