import type { EnhancedWizardData, StepValidation } from '@/types/agreement-wizard';

/**
 * Validation utilities for the enhanced agreement wizard
 */

export const validateStep0 = (data: EnhancedWizardData): StepValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.source) {
    errors.push('Please select an agreement source');
  }

  if (data.source !== 'direct' && !data.sourceId) {
    errors.push('Please select a reservation or booking to convert');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const validateStep1 = (data: EnhancedWizardData): StepValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const step1 = data.step1;

  // Customer validation
  if (!step1.customerId) {
    errors.push('Please select a customer');
  }

  // Agreement type validation
  if (!step1.agreementType) {
    errors.push('Please select an agreement type');
  }

  if (!step1.rentalPurpose) {
    errors.push('Please select rental purpose');
  }

  // Location validation
  if (!step1.pickupLocationId) {
    errors.push('Please select pickup location');
  }

  if (!step1.dropoffLocationId) {
    errors.push('Please select drop-off location');
  }

  // Date validation
  if (!step1.pickupDateTime) {
    errors.push('Please select pickup date and time');
  }

  if (!step1.dropoffDateTime) {
    errors.push('Please select drop-off date and time');
  }

  if (step1.pickupDateTime && step1.dropoffDateTime) {
    const pickupDate = new Date(step1.pickupDateTime);
    const dropoffDate = new Date(step1.dropoffDateTime);
    
    if (dropoffDate <= pickupDate) {
      errors.push('Drop-off date must be after pickup date');
    }
  }

  // Mileage package validation
  if (!step1.mileagePackage) {
    errors.push('Please select a mileage package');
  }

  if (step1.mileagePackage === 'limited' && !step1.includedKm) {
    errors.push('Please specify included kilometers');
  }

  if (step1.mileagePackage === 'limited' && !step1.excessKmRate) {
    errors.push('Please specify excess km rate');
  }

  // Cross-border validation
  if (step1.crossBorderAllowed && (!step1.crossBorderCountries || step1.crossBorderCountries.length === 0)) {
    warnings.push('Cross-border allowed but no countries specified');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const validateStep2 = (data: EnhancedWizardData): StepValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const step2 = data.step2;

  // Pre-handover checklist
  const checklist = step2.preHandoverChecklist;
  if (!checklist.vehicleCleaned || !checklist.vehicleFueled || !checklist.documentsReady || 
      !checklist.keysAvailable || !checklist.warningLightsOk) {
    warnings.push('Pre-handover checklist not fully completed');
  }

  // Fuel level validation
  if (step2.fuelLevel === undefined || step2.fuelLevel < 0 || step2.fuelLevel > 1) {
    errors.push('Please set fuel level (0-100%)');
  }

  // Odometer validation
  if (!step2.odometerReading || step2.odometerReading <= 0) {
    errors.push('Please enter a valid odometer reading');
  }

  // Photo requirements
  if (!step2.odometerPhoto) {
    warnings.push('Odometer photo not captured');
  }

  if (!step2.fuelGaugePhoto) {
    warnings.push('Fuel gauge photo not captured');
  }

  if (step2.photos.exterior.length < 4) {
    warnings.push(`Only ${step2.photos.exterior.length} exterior photos captured (recommended: 8)`);
  }

  if (step2.photos.interior.length < 2) {
    warnings.push(`Only ${step2.photos.interior.length} interior photos captured (recommended: 4)`);
  }

  // Inspection checklist
  const completedChecks = Object.values(step2.inspectionChecklist).filter(Boolean).length;
  if (completedChecks < 23) {
    warnings.push(`${completedChecks}/23 inspection points completed`);
  }

  // Damage markers
  if (step2.damageMarkers.length > 0) {
    step2.damageMarkers.forEach((marker, index) => {
      if (marker.photos.length === 0) {
        warnings.push(`Damage marker #${index + 1} has no photos`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const validateStep3 = (data: EnhancedWizardData): StepValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const step3 = data.step3;

  // Base rate validation
  if (!step3.baseRate || step3.baseRate <= 0) {
    errors.push('Base rate must be greater than 0');
  }

  // Insurance package validation
  if (!step3.insurancePackage) {
    errors.push('Please select an insurance package');
  }

  if (!step3.excessAmount || step3.excessAmount < 0) {
    errors.push('Please set insurance excess amount');
  }

  // Rate override validation
  if (step3.rateOverride) {
    if (!step3.rateOverride.reason) {
      errors.push('Rate override requires a reason');
    }
    if (Math.abs(step3.rateOverride.amount - step3.baseRate) / step3.baseRate > 0.2) {
      warnings.push('Rate override is more than 20% - approval may be required');
    }
  }

  // Pricing breakdown validation
  if (!step3.pricingBreakdown || step3.pricingBreakdown.total <= 0) {
    errors.push('Pricing breakdown is incomplete');
  }

  // Discount validation
  if (step3.discountAmount && step3.discountAmount > 0) {
    if (!step3.discountReason) {
      warnings.push('Discount applied without reason');
    }
    if (step3.discountAmount > step3.pricingBreakdown.subtotal * 0.3) {
      warnings.push('Discount exceeds 30% - approval may be required');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const validateStep4 = (data: EnhancedWizardData): StepValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const step4 = data.step4;

  // Add-ons validation (optional step, minimal validation)
  step4.selectedAddons.forEach((addon) => {
    if (addon.quantity <= 0) {
      errors.push(`${addon.name}: Quantity must be greater than 0`);
    }
    if (addon.total < 0) {
      errors.push(`${addon.name}: Total amount cannot be negative`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const validateStep5 = (data: EnhancedWizardData): StepValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const step5 = data.step5;

  // Billing type validation
  if (!step5.billingType) {
    errors.push('Please select billing type');
  }

  // Billing info validation for different/corporate billing
  if (step5.billingType !== 'same' && step5.billingInfo) {
    if (!step5.billingInfo.name) {
      errors.push('Billing name is required');
    }
    if (!step5.billingInfo.email) {
      errors.push('Billing email is required');
    }
    if (!step5.billingInfo.phone) {
      errors.push('Billing phone is required');
    }
    if (!step5.billingInfo.address) {
      errors.push('Billing address is required');
    }
    if (step5.billingType === 'corporate' && !step5.billingInfo.taxRegNo) {
      warnings.push('Tax registration number (TRN) recommended for corporate billing');
    }
  }

  // Payment method validation
  if (!step5.paymentMethod) {
    errors.push('Please select a payment method');
  }

  // Payment schedule validation
  if (!step5.paymentSchedule) {
    errors.push('Please select payment schedule');
  }

  // Advance payment validation
  if (step5.advancePayment.status !== 'completed' && step5.paymentSchedule === 'upfront') {
    errors.push('Advance payment must be completed for upfront payment schedule');
  }

  // Security deposit validation
  if (!step5.securityDeposit.method) {
    errors.push('Please select security deposit method');
  }

  if (step5.securityDeposit.status !== 'authorized' && step5.securityDeposit.status !== 'collected') {
    warnings.push('Security deposit not yet authorized or collected');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const validateStep6 = (data: EnhancedWizardData): StepValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const step6 = data.step6;

  // Document validation
  const hasEmiratesId = step6.documents.some(d => 
    d.type === 'emirates_id' && d.verificationStatus === 'verified'
  );
  const hasPassport = step6.documents.some(d => 
    d.type === 'passport' && d.verificationStatus === 'verified'
  );
  const hasLicense = step6.documents.some(d => 
    d.type === 'license' && d.verificationStatus === 'verified'
  );

  if (!hasEmiratesId) {
    errors.push('Emirates ID must be uploaded and verified');
  }

  if (!hasPassport) {
    errors.push('Passport must be uploaded and verified');
  }

  if (!hasLicense) {
    errors.push('Driving license must be uploaded and verified');
  }

  // Verification status
  if (!step6.emiratesIdVerified) {
    warnings.push('Emirates ID verification pending');
  }

  if (!step6.licenseVerified) {
    warnings.push('License verification pending');
  }

  if (!step6.blackPointsChecked) {
    warnings.push('Black points check not performed');
  }

  if (step6.blackPointsCount && step6.blackPointsCount > 0) {
    warnings.push(`Driver has ${step6.blackPointsCount} black points`);
  }

  // Eligibility validation
  if (step6.eligibilityStatus === 'ineligible') {
    errors.push('Driver is not eligible to rent a vehicle');
  }

  if (step6.eligibilityStatus === 'review_required') {
    warnings.push('Driver eligibility requires manual review');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const validateStep7 = (data: EnhancedWizardData): StepValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const step7 = data.step7;

  // Terms acceptance validation
  if (!step7.termsAccepted) {
    errors.push('You must accept the terms and conditions');
  }

  // Key terms acknowledgment
  const keyTerms = step7.keyTermsAcknowledged;
  if (!keyTerms.fuelPolicy) {
    errors.push('Please acknowledge the fuel policy');
  }
  if (!keyTerms.insuranceCoverage) {
    errors.push('Please acknowledge the insurance coverage');
  }
  if (!keyTerms.tollsFinesLiability) {
    errors.push('Please acknowledge tolls/fines liability');
  }
  if (!keyTerms.returnPolicy) {
    errors.push('Please acknowledge the return policy');
  }
  if (!keyTerms.damageLiability) {
    errors.push('Please acknowledge damage liability');
  }

  // Signature validation
  if (!step7.customerSignature) {
    errors.push('Customer signature is required');
  }

  if (step7.customerSignature && !step7.customerSignature.signerName) {
    errors.push('Signer name is required');
  }

  // Customer declarations
  const declarations = step7.customerDeclarations;
  if (!declarations.vehicleConditionConfirmed) {
    errors.push('Please confirm vehicle condition');
  }
  if (!declarations.keysDocumentsReceived) {
    errors.push('Please confirm keys and documents received');
  }
  if (!declarations.termsUnderstood) {
    errors.push('Please confirm terms understood');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const validateStep8 = (data: EnhancedWizardData): StepValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const step8 = data.step8;

  // Review completion validation
  if (!step8.reviewCompleted) {
    errors.push('Please complete the final review');
  }

  // Distribution methods validation
  const distribution = step8.distributionMethods;
  if (!distribution.email && !distribution.sms && !distribution.whatsapp && !distribution.print) {
    errors.push('Please select at least one distribution method');
  }

  // Validate all previous steps
  const step0Valid = validateStep0(data);
  const step1Valid = validateStep1(data);
  const step2Valid = validateStep2(data);
  const step3Valid = validateStep3(data);
  const step4Valid = validateStep4(data);
  const step5Valid = validateStep5(data);
  const step6Valid = validateStep6(data);
  const step7Valid = validateStep7(data);

  if (!step0Valid.isValid) {
    errors.push('Step 0 (Source Selection) has errors');
  }
  if (!step1Valid.isValid) {
    errors.push('Step 1 (Agreement Terms) has errors');
  }
  if (!step2Valid.isValid) {
    errors.push('Step 2 (Inspection) has errors');
  }
  if (!step3Valid.isValid) {
    errors.push('Step 3 (Pricing) has errors');
  }
  if (!step4Valid.isValid) {
    errors.push('Step 4 (Add-ons) has errors');
  }
  if (!step5Valid.isValid) {
    errors.push('Step 5 (Billing & Payment) has errors');
  }
  if (!step6Valid.isValid) {
    errors.push('Step 6 (Documents) has errors');
  }
  if (!step7Valid.isValid) {
    errors.push('Step 7 (Terms & Signature) has errors');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const validateStep = (step: number, data: EnhancedWizardData): StepValidation => {
  switch (step) {
    case 0:
      return validateStep0(data);
    case 1:
      return validateStep1(data);
    case 2:
      return validateStep2(data);
    case 3:
      return validateStep3(data);
    case 4:
      return validateStep4(data);
    case 5:
      return validateStep5(data);
    case 6:
      return validateStep6(data);
    case 7:
      return validateStep7(data);
    case 8:
      return validateStep8(data);
    default:
      return { isValid: false, errors: ['Invalid step'], warnings: [] };
  }
};
