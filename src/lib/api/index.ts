/**
 * Centralized API exports
 */

// Inspection API
export {
  saveCheckoutInspection,
  updateCheckoutInspection,
  saveCheckinInspection,
  updateCheckinInspection,
  getComparisonReport,
  submitForApproval,
  getInspectionById,
  getInspectionsByAgreement,
  type CheckoutInspectionRequest,
  type CheckinInspectionRequest,
  type ComparisonRequest,
  type ApprovalRequest,
} from './inspections';

// Damage markers API (existing)
export {
  createDamageMarker,
  updateDamageMarker,
  deleteDamageMarker,
  getDamageMarkers,
  uploadDamagePhoto,
} from './damage-markers';

// Agreement Payments API
export {
  AgreementPaymentsAPI,
  type PaymentType,
  type PaymentMethod,
  type PaymentStatus,
  type AgreementPayment,
  type CreatePaymentData,
  type ProcessPaymentData,
  type AuthorizeDepositData,
  type SplitPaymentItem,
  type PaymentAllocation,
  type CustomerPaymentProfile,
} from './agreement-payments';

// Customer Payment Profile API
export { CustomerPaymentAPI } from './customer-payment-profile';

// Payment Links API
export { 
  PaymentLinksAPI,
  type PaymentLink,
  type CreatePaymentLinkData,
} from './payment-links';

// Split Payments API
export { 
  SplitPaymentsAPI,
  type ProcessSplitPaymentResult,
} from './split-payments';

// Payment Validation
export {
  PaymentValidator,
  validatePaymentAllocation,
  requiresProfile,
  formatValidationErrors,
  type ValidationResult,
  type PaymentValidationRules,
} from './payment-validation';
