import { useCallback } from 'react';
import type { EnhancedWizardData } from '@/types/agreement-wizard';
import { validateStep, validateAgreement, type ValidationResult } from '@/lib/validation/agreementSchema';

interface ConsistencyCheck {
  field: string;
  issue: string;
  severity: 'error' | 'warning';
  suggestion: string;
}

export const useAgreementDataConsistency = () => {
  /**
   * Check data consistency across all steps
   */
  const checkDataConsistency = useCallback((wizardData: EnhancedWizardData): ConsistencyCheck[] => {
    const checks: ConsistencyCheck[] = [];

    // Check date consistency
    if (wizardData.step1?.pickupDateTime && wizardData.step1?.dropoffDateTime) {
      const pickup = new Date(wizardData.step1.pickupDateTime);
      const dropoff = new Date(wizardData.step1.dropoffDateTime);
      
      if (pickup >= dropoff) {
        checks.push({
          field: 'step1.dropoffDateTime',
          issue: 'Drop-off date/time must be after pickup date/time',
          severity: 'error',
          suggestion: 'Adjust the drop-off date to be after the pickup date',
        });
      }
      
      // Check if rental period matches agreement type
      const days = Math.ceil((dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));
      if (wizardData.step1.agreementType === 'daily' && days > 6) {
        checks.push({
          field: 'step1.agreementType',
          issue: 'Daily agreement type selected but rental period exceeds 6 days',
          severity: 'warning',
          suggestion: 'Consider changing to weekly agreement type for better pricing',
        });
      } else if (wizardData.step1.agreementType === 'weekly' && days < 7) {
        checks.push({
          field: 'step1.agreementType',
          issue: 'Weekly agreement type selected but rental period is less than 7 days',
          severity: 'warning',
          suggestion: 'Consider changing to daily agreement type',
        });
      } else if (wizardData.step1.agreementType === 'monthly' && days < 28) {
        checks.push({
          field: 'step1.agreementType',
          issue: 'Monthly agreement type selected but rental period is less than 28 days',
          severity: 'warning',
          suggestion: 'Consider changing to daily or weekly agreement type',
        });
      }
    }

    // Check pricing consistency
    if (wizardData.step3?.pricingBreakdown) {
      const breakdown = wizardData.step3.pricingBreakdown;
      const calculatedSubtotal = breakdown.baseRate + breakdown.insurance + breakdown.maintenance + breakdown.addons;
      
      if (Math.abs(calculatedSubtotal - breakdown.subtotal) > 0.01) {
        checks.push({
          field: 'step3.pricingBreakdown.subtotal',
          issue: 'Subtotal does not match sum of components',
          severity: 'error',
          suggestion: 'Recalculate pricing breakdown to ensure accuracy',
        });
      }
      
      const calculatedTaxable = breakdown.subtotal - breakdown.discount;
      if (Math.abs(calculatedTaxable - breakdown.taxableAmount) > 0.01) {
        checks.push({
          field: 'step3.pricingBreakdown.taxableAmount',
          issue: 'Taxable amount does not match subtotal minus discount',
          severity: 'error',
          suggestion: 'Verify discount calculation and taxable amount',
        });
      }
      
      const expectedVat = breakdown.taxableAmount * 0.05; // 5% VAT
      if (Math.abs(expectedVat - breakdown.vat) > 0.01) {
        checks.push({
          field: 'step3.pricingBreakdown.vat',
          issue: 'VAT calculation appears incorrect (should be 5%)',
          severity: 'error',
          suggestion: 'Recalculate VAT as 5% of taxable amount',
        });
      }
      
      const calculatedTotal = breakdown.taxableAmount + breakdown.vat;
      if (Math.abs(calculatedTotal - breakdown.total) > 0.01) {
        checks.push({
          field: 'step3.pricingBreakdown.total',
          issue: 'Total does not match taxable amount plus VAT',
          severity: 'error',
          suggestion: 'Verify final total calculation',
        });
      }
    }

    // Check add-ons consistency
    if (wizardData.step4?.selectedAddons) {
      wizardData.step4.selectedAddons.forEach((addon, index) => {
        const calculatedTotal = addon.quantity * addon.unitPrice;
        if (Math.abs(calculatedTotal - addon.total) > 0.01) {
          checks.push({
            field: `step4.selectedAddons[${index}].total`,
            issue: `Add-on "${addon.name}" total does not match quantity × unit price`,
            severity: 'error',
            suggestion: 'Recalculate add-on total',
          });
        }
      });
      
      // Verify add-ons total matches pricing breakdown
      const addonsTotal = wizardData.step4.selectedAddons.reduce((sum, addon) => sum + addon.total, 0);
      if (wizardData.step3?.pricingBreakdown?.addons && Math.abs(addonsTotal - wizardData.step3.pricingBreakdown.addons) > 0.01) {
        checks.push({
          field: 'step3.pricingBreakdown.addons',
          issue: 'Add-ons total in pricing breakdown does not match selected add-ons',
          severity: 'error',
          suggestion: 'Update pricing breakdown to reflect selected add-ons',
        });
      }
    }

    // Check payment consistency
    if (wizardData.step5) {
      const payment = wizardData.step5;
      
      // Validate advance payment amount
      if (wizardData.step3?.pricingBreakdown?.total) {
        const total = wizardData.step3.pricingBreakdown.total;
        if (payment.advancePayment.amount > total) {
          checks.push({
            field: 'step5.advancePayment.amount',
            issue: 'Advance payment exceeds total agreement amount',
            severity: 'error',
            suggestion: 'Reduce advance payment to not exceed total amount',
          });
        }
        
        if (payment.paymentSchedule === 'upfront' && payment.advancePayment.amount < total) {
          checks.push({
            field: 'step5.advancePayment.amount',
            issue: 'Upfront payment selected but advance payment is less than total',
            severity: 'error',
            suggestion: 'Set advance payment equal to total amount for upfront payment',
          });
        }
      }
      
      // Validate billing info for corporate
      if (payment.billingType === 'corporate' && payment.billingInfo && !payment.billingInfo.taxRegNo) {
        checks.push({
          field: 'step5.billingInfo.taxRegNo',
          issue: 'Tax registration number required for corporate billing',
          severity: 'error',
          suggestion: 'Enter company tax registration number',
        });
      }
      
      // Validate security deposit
      if (payment.securityDeposit.method === 'cheque' && !payment.securityDeposit.chequeDetails) {
        checks.push({
          field: 'step5.securityDeposit.chequeDetails',
          issue: 'Cheque details required when payment method is cheque',
          severity: 'error',
          suggestion: 'Enter complete cheque information',
        });
      }
    }

    // Check document consistency
    if (wizardData.step6) {
      const docs = wizardData.step6;
      
      // Ensure required documents are uploaded
      const hasEmiratesId = docs.documents.some(doc => doc.type === 'emirates_id');
      const hasLicense = docs.documents.some(doc => doc.type === 'license');
      
      if (!hasEmiratesId) {
        checks.push({
          field: 'step6.documents',
          issue: 'Emirates ID not uploaded',
          severity: 'error',
          suggestion: 'Upload Emirates ID front and back',
        });
      }
      
      if (!hasLicense) {
        checks.push({
          field: 'step6.documents',
          issue: 'Driving license not uploaded',
          severity: 'error',
          suggestion: 'Upload driving license',
        });
      }
      
      // Check verification status
      if (!docs.emiratesIdVerified && hasEmiratesId) {
        checks.push({
          field: 'step6.emiratesIdVerified',
          issue: 'Emirates ID uploaded but not verified',
          severity: 'warning',
          suggestion: 'Verify Emirates ID before proceeding',
        });
      }
      
      if (!docs.licenseVerified && hasLicense) {
        checks.push({
          field: 'step6.licenseVerified',
          issue: 'Driving license uploaded but not verified',
          severity: 'warning',
          suggestion: 'Verify driving license before proceeding',
        });
      }
      
      // Check eligibility
      if (docs.eligibilityStatus === 'ineligible') {
        checks.push({
          field: 'step6.eligibilityStatus',
          issue: 'Customer marked as ineligible',
          severity: 'error',
          suggestion: 'Review customer documents and eligibility criteria',
        });
      }
    }

    // Check inspection consistency
    if (wizardData.step2) {
      const inspection = wizardData.step2;
      
      // Ensure all pre-handover checks are complete
      const allChecksComplete = Object.values(inspection.preHandoverChecklist).every(val => val === true);
      if (!allChecksComplete) {
        checks.push({
          field: 'step2.preHandoverChecklist',
          issue: 'Not all pre-handover checks completed',
          severity: 'error',
          suggestion: 'Complete all pre-handover checklist items',
        });
      }
      
      // Verify photos
      if (inspection.photos.exterior.length < 8) {
        checks.push({
          field: 'step2.photos.exterior',
          issue: 'Missing exterior photos (8 required)',
          severity: 'error',
          suggestion: 'Capture all 8 exterior angles',
        });
      }
      
      if (inspection.photos.interior.length < 4) {
        checks.push({
          field: 'step2.photos.interior',
          issue: 'Missing interior photos (4 required)',
          severity: 'error',
          suggestion: 'Capture all 4 interior photos',
        });
      }
      
      // Verify damage markers have photos
      inspection.damageMarkers.forEach((marker, index) => {
        if (marker.photos.length === 0) {
          checks.push({
            field: `step2.damageMarkers[${index}].photos`,
            issue: `Damage marker "${marker.type}" has no photos`,
            severity: 'error',
            suggestion: 'Capture photos of the damage',
          });
        }
      });
    }

    // Check signature consistency
    if (wizardData.step7) {
      const terms = wizardData.step7;
      
      if (!terms.termsAccepted) {
        checks.push({
          field: 'step7.termsAccepted',
          issue: 'Terms and conditions not accepted',
          severity: 'error',
          suggestion: 'Customer must accept terms before proceeding',
        });
      }
      
      const allTermsAcknowledged = Object.values(terms.keyTermsAcknowledged).every(val => val === true);
      if (!allTermsAcknowledged) {
        checks.push({
          field: 'step7.keyTermsAcknowledged',
          issue: 'Not all key terms acknowledged',
          severity: 'error',
          suggestion: 'Ensure customer acknowledges all key terms',
        });
      }
      
      if (!terms.customerSignature) {
        checks.push({
          field: 'step7.customerSignature',
          issue: 'Customer signature missing',
          severity: 'error',
          suggestion: 'Obtain customer signature',
        });
      }
    }

    return checks;
  }, []);

  /**
   * Validate before submission
   */
  const validateBeforeSubmission = useCallback((wizardData: EnhancedWizardData): ValidationResult => {
    // Run schema validation
    const validationResult = validateAgreement(wizardData);
    
    // Run consistency checks
    const consistencyChecks = checkDataConsistency(wizardData);
    
    // Combine errors
    const allErrors = [
      ...validationResult.errors,
      ...consistencyChecks
        .filter(check => check.severity === 'error')
        .map(check => ({
          path: check.field,
          message: check.issue,
          suggestion: check.suggestion,
        })),
    ];
    
    // Combine warnings
    const allWarnings = [
      ...validationResult.warnings,
      ...consistencyChecks
        .filter(check => check.severity === 'warning')
        .map(check => ({
          path: check.field,
          message: check.issue,
          suggestion: check.suggestion,
        })),
    ];
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
    };
  }, [checkDataConsistency]);

  /**
   * Ensure data integrity (sanitize and fix common issues)
   */
  const ensureDataIntegrity = useCallback((wizardData: EnhancedWizardData): EnhancedWizardData => {
    const sanitized = { ...wizardData };

    // Sanitize strings
    if (sanitized.step1) {
      sanitized.step1 = {
        ...sanitized.step1,
        specialInstructions: sanitized.step1.specialInstructions?.trim(),
        internalNotes: sanitized.step1.internalNotes?.trim(),
      };
    }

    // Ensure pricing calculations are correct
    if (sanitized.step3?.pricingBreakdown) {
      const breakdown = sanitized.step3.pricingBreakdown;
      const subtotal = breakdown.baseRate + breakdown.insurance + breakdown.maintenance + breakdown.addons;
      const taxableAmount = subtotal - breakdown.discount;
      const vat = Math.round(taxableAmount * 0.05 * 100) / 100; // 5% VAT
      const total = Math.round((taxableAmount + vat) * 100) / 100;
      
      sanitized.step3.pricingBreakdown = {
        ...breakdown,
        subtotal: Math.round(subtotal * 100) / 100,
        taxableAmount: Math.round(taxableAmount * 100) / 100,
        vat,
        total,
      };
    }

    // Ensure add-on totals are correct
    if (sanitized.step4?.selectedAddons) {
      sanitized.step4.selectedAddons = sanitized.step4.selectedAddons.map(addon => ({
        ...addon,
        total: Math.round(addon.quantity * addon.unitPrice * 100) / 100,
      }));
    }

    // Remove empty values
    if (sanitized.step1?.crossBorderCountries) {
      sanitized.step1.crossBorderCountries = sanitized.step1.crossBorderCountries.filter(c => c.trim());
    }

    return sanitized;
  }, []);

  /**
   * Validate a specific step
   */
  const validateStepData = useCallback((stepNumber: number, data: any): ValidationResult => {
    return validateStep(stepNumber, data);
  }, []);

  return {
    checkDataConsistency,
    validateBeforeSubmission,
    ensureDataIntegrity,
    validateStepData,
  };
};
