// Enhanced Agreement Wizard Types for Phase 3

export type AgreementSource = 'reservation' | 'instant_booking' | 'direct';
export type AgreementType = 'daily' | 'weekly' | 'monthly' | 'long_term';
export type RentalPurpose = 'business' | 'personal' | 'tourism';
export type MileagePackage = 'unlimited' | 'limited';
export type InsurancePackage = 'comprehensive' | 'tpl';
export type BillingType = 'same' | 'different' | 'corporate';
export type PaymentSchedule = 'upfront' | 'monthly' | 'postpaid';
export type DepositMethod = 'card_hold' | 'cash' | 'cheque';
export type DamageSeverity = 'minor' | 'moderate' | 'major';
export type VehicleView = 'front' | 'rear' | 'left' | 'right' | 'top';

export interface PreHandoverChecklist {
  vehicleCleaned: boolean;
  vehicleFueled: boolean;
  documentsReady: boolean;
  keysAvailable: boolean;
  warningLightsOk: boolean;
}

export interface DamageMarker {
  id: string;
  view?: VehicleView; // Optional for backward compatibility
  x: number; // percentage position (0-1)
  y: number; // percentage position (0-1)
  worldPosition?: { // 3D world coordinates
    x: number;
    y: number;
    z: number;
  };
  surfaceNormal?: { // Optional: For marker orientation
    x: number;
    y: number;
    z: number;
  };
  severity: DamageSeverity;
  type: string;
  photos: string[];
  notes: string;
  side?: string; // For compatibility
  event?: 'checkout' | 'checkin'; // Track when damage was recorded
  estimatedCost?: number; // Cost to repair this damage
  repairDescription?: string; // What repair is needed
}

// Enhanced inspection data structure for checkout/checkin
export interface InspectionData {
  timestamp: string;
  inspectorId?: string;
  inspectorName: string;
  preHandoverChecklist: PreHandoverChecklist;
  fuelLevel: number;
  odometerReading: number;
  odometerPhoto?: string;
  fuelGaugePhoto?: string;
  damageMarkers: DamageMarker[];
  photos: InspectionPhotos;
  inspectionChecklist: Record<string, boolean>;
  notes?: string;
}

// Comparison of damages between checkout and checkin
export interface DamageComparisonItem {
  id: string;
  damageType: string;
  severity: DamageSeverity;
  location: string;
  side: VehicleView;
  existedAtCheckout: boolean;
  photos: {
    checkout?: string[];
    checkin: string[];
  };
  estimatedCost: number;
  repairDescription: string;
  chargeable: boolean;
  chargeableAmount: number;
  notes: string;
}

// Additional charges beyond damages
export interface AdditionalCharge {
  type: 'fuel' | 'excess_km' | 'cleaning' | 'late_return' | 'salik' | 'other';
  description: string;
  calculation?: string;
  amount: number;
}

// Comprehensive comparison report
export interface ComparisonReport {
  newDamages: DamageComparisonItem[];
  totalNewDamages: number;
  totalEstimatedCost: number;
  totalChargeableAmount: number;
  fuelDifference: number;
  fuelCharge: number;
  odometerDifference: number;
  excessKmCharge: number;
  cleaningRequired: boolean;
  cleaningCharge: number;
  additionalCharges: AdditionalCharge[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  grandTotal: number;
  securityDepositHeld: number;
  additionalPaymentRequired: number;
  reportGeneratedAt: string;
  reportGeneratedBy: string;
  managerApprovalRequired: boolean;
  managerApprovedBy?: string;
  managerApprovedAt?: string;
  customerAcknowledged: boolean;
  customerAcknowledgedAt?: string;
}

export interface InspectionPhotos {
  exterior: string[]; // 8 angles
  interior: string[]; // 4 photos
  documents: string[]; // 2 photos
  damages: string[]; // all damage photos
}

export interface PricingBreakdown {
  baseRate: number;
  insurance: number;
  maintenance: number;
  addons: number;
  subtotal: number;
  discount: number;
  taxableAmount: number;
  vat: number;
  total: number;
}

export interface SelectedAddon {
  addonId: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  pricingModel: 'daily' | 'weekly' | 'monthly' | 'one_time';
  total: number;
}

export interface BillingInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  taxRegNo?: string; // TRN for UAE companies
}

export interface AdvancePayment {
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionRef?: string;
  receiptUrl?: string;
}

export interface SecurityDeposit {
  method: DepositMethod;
  amount: number;
  status: 'pending' | 'authorized' | 'collected';
  authorizationRef?: string;
  chequeDetails?: {
    bankName: string;
    chequeNo: string;
    chequeDate: string;
  };
}

export interface DocumentUpload {
  type: 'emirates_id' | 'passport' | 'license' | 'visa' | 'additional_driver';
  side?: 'front' | 'back';
  url: string;
  uploadedAt: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  extractedData?: {
    name?: string;
    idNumber?: string;
    expiryDate?: string;
    nationality?: string;
  };
}

export interface CustomerSignature {
  data: string;
  signerName: string;
  signedAt: string;
  ipAddress: string;
  deviceInfo: string;
}

export interface DistributionMethods {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  print: boolean;
}

export interface EnhancedWizardData {
  // Step 0: Source Selection
  source: AgreementSource;
  sourceId?: string; // reservation_id or instant_booking_id
  
  // Step 1: Agreement Terms
  step1: {
    customerId?: string;
    customerVerified: boolean;
    agreementType: AgreementType;
    rentalPurpose: RentalPurpose;
    pickupLocationId: string;
    pickupDateTime: string;
    dropoffLocationId: string;
    dropoffDateTime: string;
    mileagePackage: MileagePackage;
    includedKm?: number;
    excessKmRate?: number;
    crossBorderAllowed: boolean;
    crossBorderCountries?: string[];
    salikAccountNo?: string;
    darbAccountNo?: string;
    specialInstructions?: string;
    internalNotes?: string;
  };
  
  // Step 2: Vehicle Condition & Inspection (Enhanced with checkout/checkin)
  step2: {
    // Legacy single inspection (for backward compatibility)
    preHandoverChecklist: PreHandoverChecklist;
    inspectionChecklist: Record<string, boolean>;
    fuelLevel: number;
    odometerReading: number;
    odometerPhoto?: string;
    fuelGaugePhoto?: string;
    damageMarkers: DamageMarker[];
    photos: InspectionPhotos;
    notes?: string;
    
    // New enhanced inspection structure
    inspectionMode: 'single' | 'checkout_checkin'; // Toggle between legacy and new mode
    activeTab?: 'checkout' | 'checkin' | 'comparison'; // Current active tab
    checkOutInspection?: InspectionData; // Inspection when vehicle leaves
    checkInInspection?: InspectionData; // Inspection when vehicle returns
    comparisonReport?: ComparisonReport; // Calculated comparison and charges
  };
  
  // Step 3: Pricing
  step3: {
    baseRate: number;
    rateOverride?: {
      amount: number;
      reason: string;
      approvedBy?: string;
    };
    insurancePackage: InsurancePackage;
    excessAmount: number;
    additionalCoverages: string[];
    maintenanceIncluded: boolean;
    maintenanceCost?: number;
    discountCode?: string;
    discountAmount?: number;
    discountReason?: string;
    pricingBreakdown: PricingBreakdown;
  };
  
  // Step 4: Add-ons
  step4: {
    selectedAddons: SelectedAddon[];
    recommendedAddons?: string[];
  };
  
  // Step 5: Billing & Payment
  step5: {
    billingType: BillingType;
    billingInfo?: BillingInfo;
    paymentMethod: string;
    paymentSchedule: PaymentSchedule;
    advancePayment: AdvancePayment;
    securityDeposit: SecurityDeposit;
    autoChargeAuthorized: boolean;
    cardToken?: string;
  };
  
  // Step 6: Documents
  step6: {
    documents: DocumentUpload[];
    emiratesIdVerified: boolean;
    licenseVerified: boolean;
    blackPointsChecked: boolean;
    blackPointsCount?: number;
    eligibilityStatus: 'eligible' | 'ineligible' | 'review_required';
  };
  
  // Step 7: Terms & Signature
  step7: {
    termsLanguage: 'en' | 'ar';
    termsAccepted: boolean;
    keyTermsAcknowledged: {
      fuelPolicy: boolean;
      insuranceCoverage: boolean;
      tollsFinesLiability: boolean;
      returnPolicy: boolean;
      damageLiability: boolean;
    };
    customerSignature?: CustomerSignature;
    witnessSignature?: CustomerSignature;
    customerDeclarations: {
      vehicleConditionConfirmed: boolean;
      keysDocumentsReceived: boolean;
      termsUnderstood: boolean;
    };
  };
  
  // Step 8: Final Review
  step8: {
    reviewCompleted: boolean;
    distributionMethods: DistributionMethods;
    finalNotes?: string;
  };

  // Step 9: Financial Settlement
  step9: {
    cleaningRequired: boolean;
    cleaningCharge?: number;
    lateReturnHours?: number;
    lateReturnCharge?: number;
    salikTrips?: number;
    salikCharge?: number;
    paymentMethod?: 'card' | 'cash' | 'transfer' | '';
    disputeRaised?: boolean;
    overrideReason?: string;
    overrideNotes?: string;
    managerAuthCode?: string;
    overrideApplied?: boolean;
    inspectorName?: string;
    inspectorDate?: string;
    managerName?: string;
    managerDate?: string;
    customerName?: string;
    customerDate?: string;
    securityDepositHeld?: number;
    settlementCompleted?: boolean;
    // Split payment support
    splitPayments?: Array<{
      id?: string;
      method: string;
      amount: number;
      loyaltyPointsUsed?: number;
      pointsValue?: number;
      transactionRef?: string;
      status?: string;
      metadata?: Record<string, any>;
    }>;
    paymentAllocation?: {
      totalAmount: number;
      allocatedAmount: number;
      remainingAmount: number;
    };
  };

  // Phase 10: Business Configuration (Optional)
  businessConfig?: {
    businessUnitId?: string;
    paymentTermsId?: string;
    reservationMethodId?: string;
  };

  // Phase 10: Enhanced Pricing (Optional)
  enhancedPricing?: {
    priceListId?: string;
    insuranceConfig?: {
      levelId?: string;
      groupId?: string;
      providerId?: string;
      coverageType?: string;
      excess?: number;
      additionalCoverages?: string[];
    };
    maintenancePackageId?: string;
    discountConfig?: {
      code?: string;
      amount?: number;
      percentage?: number;
      reason?: string;
    };
  };

  // Phase 10: Enhanced Billing (Optional)
  enhancedBilling?: {
    billToType?: 'customer' | 'corporate' | 'insurance' | 'agency';
    billToDetails?: {
      customerId?: string;
      corporateId?: string;
      insuranceId?: string;
      agencyId?: string;
      poNumber?: string;
      claimNumber?: string;
      policyNumber?: string;
      voucherNumber?: string;
    };
    taxConfig?: {
      taxLevelId?: string;
      taxCodeId?: string;
    };
  };
}

// Step status for progress tracking
export type StepStatus = 'complete' | 'incomplete' | 'has-errors' | 'not-visited';

// Validation schemas for each step
export interface StepValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Wizard progress tracking
export interface WizardProgress {
  currentStep: number;
  completedSteps: number[];
  canProceed: boolean;
  lastSaved?: string;
  stepValidationStatus: Record<number, StepStatus>;
  visitedSteps: number[];
  skippedSteps: number[];
  lastModifiedStep?: number;
  lastModifiedAt?: string;
}
