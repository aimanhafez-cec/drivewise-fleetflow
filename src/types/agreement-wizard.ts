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
  
  // Step 2: Inspection
  step2: {
    preHandoverChecklist: PreHandoverChecklist;
    damageMarkers: DamageMarker[];
    inspectionChecklist: Record<string, boolean>; // 23 checkpoints
    fuelLevel: number; // 0-1 (percentage)
    odometerReading: number;
    odometerPhoto?: string;
    fuelGaugePhoto?: string;
    photos: InspectionPhotos;
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
