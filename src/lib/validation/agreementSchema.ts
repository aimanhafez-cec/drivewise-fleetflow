import { z } from 'zod';
import type { 
  AgreementSource, 
  AgreementType, 
  RentalPurpose,
  MileagePackage,
  InsurancePackage,
  BillingType,
  PaymentSchedule,
  DepositMethod,
  DamageSeverity
} from '@/types/agreement-wizard';

// Utility types
export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    path: string;
    message: string;
    suggestion?: string;
  }>;
  warnings: Array<{
    path: string;
    message: string;
    suggestion?: string;
  }>;
}

// Step 0: Source Selection Validation
export const sourceValidationSchema = z.object({
  source: z.enum(['reservation', 'instant_booking', 'direct']),
  sourceId: z.string().optional(),
}).superRefine((data, ctx) => {
  // If source is reservation or instant_booking, sourceId is required
  if ((data.source === 'reservation' || data.source === 'instant_booking') && !data.sourceId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['sourceId'],
      message: `Source ID is required when source is ${data.source}`,
    });
  }
});

// Step 1: Agreement Terms Validation
export const step1ValidationSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  customerVerified: z.boolean().refine(val => val === true, {
    message: 'Customer must be verified before proceeding',
  }),
  agreementType: z.enum(['daily', 'weekly', 'monthly', 'long_term']),
  rentalPurpose: z.enum(['business', 'personal', 'tourism']),
  pickupLocationId: z.string().min(1, 'Pickup location is required'),
  pickupDateTime: z.string().min(1, 'Pickup date/time is required'),
  dropoffLocationId: z.string().min(1, 'Drop-off location is required'),
  dropoffDateTime: z.string().min(1, 'Drop-off date/time is required'),
  mileagePackage: z.enum(['unlimited', 'limited']),
  includedKm: z.number().optional(),
  excessKmRate: z.number().optional(),
  crossBorderAllowed: z.boolean(),
  crossBorderCountries: z.array(z.string()).optional(),
  salikAccountNo: z.string().optional(),
  darbAccountNo: z.string().optional(),
  specialInstructions: z.string().max(500, 'Special instructions must be less than 500 characters').optional(),
  internalNotes: z.string().max(1000, 'Internal notes must be less than 1000 characters').optional(),
}).superRefine((data, ctx) => {
  // Validate dates
  const pickup = new Date(data.pickupDateTime);
  const dropoff = new Date(data.dropoffDateTime);
  
  if (isNaN(pickup.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['pickupDateTime'],
      message: 'Invalid pickup date/time format',
    });
  }
  
  if (isNaN(dropoff.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['dropoffDateTime'],
      message: 'Invalid drop-off date/time format',
    });
  }
  
  if (pickup >= dropoff) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['dropoffDateTime'],
      message: 'Drop-off date/time must be after pickup date/time',
    });
  }
  
  // Validate mileage package
  if (data.mileagePackage === 'limited') {
    if (!data.includedKm || data.includedKm <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['includedKm'],
        message: 'Included kilometers must be specified for limited mileage package',
      });
    }
    if (!data.excessKmRate || data.excessKmRate <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['excessKmRate'],
        message: 'Excess kilometer rate must be specified for limited mileage package',
      });
    }
  }
  
  // Validate cross-border
  if (data.crossBorderAllowed && (!data.crossBorderCountries || data.crossBorderCountries.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['crossBorderCountries'],
      message: 'Please specify at least one country for cross-border travel',
    });
  }
});

// Step 2: Inspection Validation
export const step2ValidationSchema = z.object({
  preHandoverChecklist: z.object({
    vehicleCleaned: z.boolean(),
    vehicleFueled: z.boolean(),
    documentsReady: z.boolean(),
    keysAvailable: z.boolean(),
    warningLightsOk: z.boolean(),
  }).refine(
    (checklist) => Object.values(checklist).every(val => val === true),
    { message: 'All pre-handover checklist items must be completed' }
  ),
  damageMarkers: z.array(z.object({
    id: z.string(),
    view: z.enum(['front', 'rear', 'left', 'right', 'top']).optional(),
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    severity: z.enum(['minor', 'moderate', 'major']),
    type: z.string().min(1, 'Damage type is required'),
    photos: z.array(z.string()).min(1, 'At least one photo is required for each damage'),
    notes: z.string().min(1, 'Damage notes are required'),
  })),
  inspectionChecklist: z.record(z.string(), z.boolean()),
  fuelLevel: z.number().min(0).max(1, 'Fuel level must be between 0 and 1'),
  odometerReading: z.number().min(0, 'Odometer reading must be positive'),
  odometerPhoto: z.string().optional(),
  fuelGaugePhoto: z.string().optional(),
  photos: z.object({
    exterior: z.array(z.string()).min(8, 'All 8 exterior photos are required'),
    interior: z.array(z.string()).min(4, 'All 4 interior photos are required'),
    documents: z.array(z.string()).min(2, 'Vehicle document photos are required'),
    damages: z.array(z.string()),
  }),
}).superRefine((data, ctx) => {
  // Validate odometer photo is provided
  if (!data.odometerPhoto) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['odometerPhoto'],
      message: 'Odometer photo is required for verification',
    });
  }
  
  // Validate fuel gauge photo is provided
  if (!data.fuelGaugePhoto) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['fuelGaugePhoto'],
      message: 'Fuel gauge photo is required for verification',
    });
  }
  
  // Ensure damage photos match damage markers
  const damagePhotoCount = data.damageMarkers.reduce((acc, marker) => acc + marker.photos.length, 0);
  if (damagePhotoCount !== data.photos.damages.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['photos', 'damages'],
      message: 'Damage photos do not match marked damages',
    });
  }
});

// Step 3: Pricing Validation
export const step3ValidationSchema = z.object({
  baseRate: z.number().min(0, 'Base rate must be positive'),
  rateOverride: z.object({
    amount: z.number().min(0),
    reason: z.string().min(10, 'Override reason must be at least 10 characters'),
    approvedBy: z.string().optional(),
  }).optional(),
  insurancePackage: z.enum(['comprehensive', 'tpl']),
  excessAmount: z.number().min(0, 'Excess amount must be positive'),
  additionalCoverages: z.array(z.string()),
  maintenanceIncluded: z.boolean(),
  maintenanceCost: z.number().optional(),
  discountCode: z.string().optional(),
  discountAmount: z.number().optional(),
  discountReason: z.string().optional(),
  pricingBreakdown: z.object({
    baseRate: z.number().min(0),
    insurance: z.number().min(0),
    maintenance: z.number().min(0),
    addons: z.number().min(0),
    subtotal: z.number().min(0),
    discount: z.number().min(0),
    taxableAmount: z.number().min(0),
    vat: z.number().min(0),
    total: z.number().min(0, 'Total amount must be positive'),
  }),
}).superRefine((data, ctx) => {
  // Validate rate override
  if (data.rateOverride && data.rateOverride.amount !== data.baseRate) {
    if (!data.rateOverride.approvedBy) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rateOverride', 'approvedBy'],
        message: 'Rate override must be approved by a manager',
      });
    }
  }
  
  // Validate maintenance cost
  if (data.maintenanceIncluded && (!data.maintenanceCost || data.maintenanceCost <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['maintenanceCost'],
      message: 'Maintenance cost must be specified when maintenance is included',
    });
  }
  
  // Validate discount
  if (data.discountAmount && data.discountAmount > 0) {
    if (!data.discountReason || data.discountReason.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discountReason'],
        message: 'Discount reason must be provided (at least 10 characters)',
      });
    }
  }
  
  // Validate pricing breakdown consistency
  const calculatedSubtotal = data.pricingBreakdown.baseRate + 
                             data.pricingBreakdown.insurance + 
                             data.pricingBreakdown.maintenance + 
                             data.pricingBreakdown.addons;
  
  if (Math.abs(calculatedSubtotal - data.pricingBreakdown.subtotal) > 0.01) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['pricingBreakdown', 'subtotal'],
      message: 'Pricing breakdown subtotal does not match calculated value',
    });
  }
});

// Step 4: Add-ons Validation
export const step4ValidationSchema = z.object({
  selectedAddons: z.array(z.object({
    addonId: z.string().min(1, 'Add-on ID is required'),
    name: z.string().min(1, 'Add-on name is required'),
    category: z.string().min(1, 'Add-on category is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unitPrice: z.number().min(0, 'Unit price must be positive'),
    pricingModel: z.enum(['daily', 'weekly', 'monthly', 'one_time']),
    total: z.number().min(0, 'Total must be positive'),
  })),
  recommendedAddons: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
  // Validate addon totals
  data.selectedAddons.forEach((addon, index) => {
    const calculatedTotal = addon.quantity * addon.unitPrice;
    if (Math.abs(calculatedTotal - addon.total) > 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['selectedAddons', index, 'total'],
        message: `Add-on "${addon.name}" total does not match quantity × unit price`,
      });
    }
  });
});

// Step 5: Billing & Payment Validation
export const step5ValidationSchema = z.object({
  billingType: z.enum(['same', 'different', 'corporate']),
  billingInfo: z.object({
    name: z.string().min(1, 'Billing name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(7, 'Valid phone number is required'),
    address: z.string().min(10, 'Complete address is required'),
    taxRegNo: z.string().optional(),
  }).optional(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  paymentSchedule: z.enum(['upfront', 'monthly', 'postpaid']),
  advancePayment: z.object({
    amount: z.number().min(0, 'Advance payment amount must be positive'),
    status: z.enum(['pending', 'processing', 'completed', 'failed']),
    transactionRef: z.string().optional(),
    receiptUrl: z.string().optional(),
  }),
  securityDeposit: z.object({
    method: z.enum(['card_hold', 'cash', 'cheque']),
    amount: z.number().min(0, 'Security deposit amount must be positive'),
    status: z.enum(['pending', 'authorized', 'collected']),
    authorizationRef: z.string().optional(),
    chequeDetails: z.object({
      bankName: z.string().min(1, 'Bank name is required'),
      chequeNo: z.string().min(1, 'Cheque number is required'),
      chequeDate: z.string().min(1, 'Cheque date is required'),
    }).optional(),
  }),
  autoChargeAuthorized: z.boolean(),
  cardToken: z.string().optional(),
}).superRefine((data, ctx) => {
  // Validate billing info for different billing types
  if (data.billingType === 'different' || data.billingType === 'corporate') {
    if (!data.billingInfo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['billingInfo'],
        message: 'Billing information is required for this billing type',
      });
    } else if (data.billingType === 'corporate' && !data.billingInfo.taxRegNo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['billingInfo', 'taxRegNo'],
        message: 'Tax registration number is required for corporate billing',
      });
    }
  }
  
  // Validate advance payment
  if (data.advancePayment.status === 'completed' && !data.advancePayment.transactionRef) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['advancePayment', 'transactionRef'],
      message: 'Transaction reference is required for completed payment',
    });
  }
  
  // Validate security deposit
  if (data.securityDeposit.method === 'cheque') {
    if (!data.securityDeposit.chequeDetails) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['securityDeposit', 'chequeDetails'],
        message: 'Cheque details are required when payment method is cheque',
      });
    }
  }
  
  if (data.securityDeposit.status === 'authorized' && !data.securityDeposit.authorizationRef) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['securityDeposit', 'authorizationRef'],
      message: 'Authorization reference is required for authorized deposits',
    });
  }
  
  // Validate auto-charge
  if (data.autoChargeAuthorized && !data.cardToken) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['cardToken'],
      message: 'Card token is required when auto-charge is authorized',
    });
  }
});

// Step 6: Documents Validation
export const step6ValidationSchema = z.object({
  documents: z.array(z.object({
    type: z.enum(['emirates_id', 'passport', 'license', 'visa', 'additional_driver']),
    side: z.enum(['front', 'back']).optional(),
    url: z.string().min(1, 'Document URL is required'),
    uploadedAt: z.string(),
    verificationStatus: z.enum(['pending', 'verified', 'rejected']),
    rejectionReason: z.string().optional(),
    extractedData: z.object({
      name: z.string().optional(),
      idNumber: z.string().optional(),
      expiryDate: z.string().optional(),
      nationality: z.string().optional(),
    }).optional(),
  })).min(1, 'At least one document must be uploaded'),
  emiratesIdVerified: z.boolean(),
  licenseVerified: z.boolean(),
  blackPointsChecked: z.boolean(),
  blackPointsCount: z.number().optional(),
  eligibilityStatus: z.enum(['eligible', 'ineligible', 'review_required']),
}).superRefine((data, ctx) => {
  // Ensure Emirates ID is uploaded and verified
  const emiratesId = data.documents.find(doc => doc.type === 'emirates_id');
  if (!emiratesId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['documents'],
      message: 'Emirates ID is required',
    });
  } else if (!data.emiratesIdVerified) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['emiratesIdVerified'],
      message: 'Emirates ID must be verified before proceeding',
    });
  }
  
  // Ensure license is uploaded and verified
  const license = data.documents.find(doc => doc.type === 'license');
  if (!license) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['documents'],
      message: 'Driving license is required',
    });
  } else if (!data.licenseVerified) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['licenseVerified'],
      message: 'Driving license must be verified before proceeding',
    });
  }
  
  // Ensure black points are checked
  if (!data.blackPointsChecked) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['blackPointsChecked'],
      message: 'Black points must be checked before proceeding',
    });
  }
  
  // Check eligibility
  if (data.eligibilityStatus === 'ineligible') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['eligibilityStatus'],
      message: 'Customer is ineligible for rental',
    });
  }
});

// Step 7: Terms & Signature Validation
export const step7ValidationSchema = z.object({
  termsLanguage: z.enum(['en', 'ar']),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'Terms and conditions must be accepted',
  }),
  keyTermsAcknowledged: z.object({
    fuelPolicy: z.boolean(),
    insuranceCoverage: z.boolean(),
    tollsFinesLiability: z.boolean(),
    returnPolicy: z.boolean(),
    damageLiability: z.boolean(),
  }).refine(
    (terms) => Object.values(terms).every(val => val === true),
    'All key terms must be acknowledged'
  ),
  customerSignature: z.object({
    data: z.string().min(1, 'Customer signature is required'),
    signerName: z.string().min(1, 'Signer name is required'),
    signedAt: z.string(),
    ipAddress: z.string(),
    deviceInfo: z.string(),
  }).optional(),
  witnessSignature: z.object({
    data: z.string().min(1, 'Witness signature is required'),
    signerName: z.string().min(1, 'Witness name is required'),
    signedAt: z.string(),
    ipAddress: z.string(),
    deviceInfo: z.string(),
  }).optional(),
  customerDeclarations: z.object({
    vehicleConditionConfirmed: z.boolean(),
    keysDocumentsReceived: z.boolean(),
    termsUnderstood: z.boolean(),
  }).refine(
    (declarations) => Object.values(declarations).every(val => val === true),
    'All customer declarations must be confirmed'
  ),
}).superRefine((data, ctx) => {
  // Ensure customer signature is provided
  if (!data.customerSignature) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['customerSignature'],
      message: 'Customer signature is required',
    });
  }
});

// Step 8: Final Review Validation
export const step8ValidationSchema = z.object({
  reviewCompleted: z.boolean().refine(val => val === true, {
    message: 'Final review must be completed',
  }),
  distributionMethods: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    whatsapp: z.boolean(),
    print: z.boolean(),
  }).refine(
    (methods) => Object.values(methods).some(val => val === true),
    'At least one distribution method must be selected'
  ),
  finalNotes: z.string().max(1000, 'Final notes must be less than 1000 characters').optional(),
});

// Complete Agreement Validation
export const agreementValidationSchema = z.object({
  source: z.enum(['reservation', 'instant_booking', 'direct']),
  sourceId: z.string().optional(),
  step1: step1ValidationSchema,
  step2: step2ValidationSchema,
  step3: step3ValidationSchema,
  step4: step4ValidationSchema,
  step5: step5ValidationSchema,
  step6: step6ValidationSchema,
  step7: step7ValidationSchema,
  step8: step8ValidationSchema,
});

// Validation functions
export const validateStep = (stepNumber: number, data: any): ValidationResult => {
  const schemas = [
    sourceValidationSchema,
    step1ValidationSchema,
    step2ValidationSchema,
    step3ValidationSchema,
    step4ValidationSchema,
    step5ValidationSchema,
    step6ValidationSchema,
    step7ValidationSchema,
    step8ValidationSchema,
  ];

  const schema = schemas[stepNumber];
  if (!schema) {
    return { isValid: false, errors: [{ path: 'step', message: 'Invalid step number' }], warnings: [] };
  }

  const result = schema.safeParse(data);
  
  if (result.success) {
    return { isValid: true, errors: [], warnings: [] };
  }

  const errors = result.error.issues.map(err => ({
    path: err.path.join('.'),
    message: err.message,
    suggestion: getValidationSuggestion(err.path.join('.'), err.message),
  }));

  return { isValid: false, errors, warnings: [] };
};

export const validateAgreement = (data: any): ValidationResult => {
  const result = agreementValidationSchema.safeParse(data);
  
  if (result.success) {
    return { isValid: true, errors: [], warnings: [] };
  }

  const errors = result.error.issues.map(err => ({
    path: err.path.join('.'),
    message: err.message,
    suggestion: getValidationSuggestion(err.path.join('.'), err.message),
  }));

  return { isValid: false, errors, warnings: [] };
};

// Smart validation suggestions
function getValidationSuggestion(path: string, message: string): string | undefined {
  const suggestions: Record<string, string> = {
    'customerId': 'Please select a customer from the dropdown or create a new customer profile',
    'customerVerified': 'Verify customer identity by checking their documents',
    'pickupDateTime': 'Ensure pickup date/time is in the future and properly formatted',
    'dropoffDateTime': 'Drop-off must be after pickup date/time',
    'baseRate': 'Check the vehicle class rate card for correct pricing',
    'pricingBreakdown.total': 'Review all pricing components and ensure calculations are correct',
    'emiratesIdVerified': 'Upload and verify Emirates ID before proceeding',
    'licenseVerified': 'Upload and verify driving license before proceeding',
    'customerSignature': 'Request customer to sign the agreement digitally',
    'termsAccepted': 'Ensure customer reads and accepts all terms and conditions',
  };

  for (const [key, suggestion] of Object.entries(suggestions)) {
    if (path.includes(key)) {
      return suggestion;
    }
  }

  return undefined;
}
