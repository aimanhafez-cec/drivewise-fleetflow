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
