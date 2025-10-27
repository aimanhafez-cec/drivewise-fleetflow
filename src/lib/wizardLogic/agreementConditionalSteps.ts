import type { EnhancedWizardData } from '@/types/agreement-wizard';

/**
 * Determines which steps should be conditionally skipped based on wizard data
 * Returns an array of step numbers that should be hidden/skipped automatically
 */
export function getAgreementSkippedSteps(wizardData: EnhancedWizardData): number[] {
  const skippedSteps: number[] = [];

  // Skip add-ons (step 4) for instant/quick bookings from reservations
  // where everything was already configured
  if (wizardData.source === 'reservation' && wizardData.step4?.selectedAddons?.length === 0) {
    // Don't auto-skip, but could be marked as optional
  }

  // Skip document verification (step 6) for instant bookings
  // where customer is pre-verified
  if (wizardData.source === 'instant_booking' && wizardData.step6?.emiratesIdVerified) {
    // Already verified, but still show for review
  }

  // Add more conditional logic based on agreement type
  const agreementType = wizardData.step1?.agreementType;
  
  // For business rentals, certain steps might be simplified
  if (wizardData.step1?.rentalPurpose === 'business') {
    // Business rentals might have different requirements
    // But we'll keep all steps visible for now
  }

  return skippedSteps;
}

/**
 * Determines if a specific step is required based on current wizard state
 */
export function isAgreementStepRequired(
  stepNumber: number,
  wizardData: EnhancedWizardData
): boolean {
  const skippedSteps = getAgreementSkippedSteps(wizardData);
  return !skippedSteps.includes(stepNumber);
}

/**
 * Gets the next required step after the current step
 * Skips over non-required steps automatically
 */
export function getNextAgreementRequiredStep(
  currentStep: number,
  wizardData: EnhancedWizardData,
  totalSteps: number
): number {
  const skippedSteps = getAgreementSkippedSteps(wizardData);
  
  let nextStep = currentStep + 1;
  
  // Keep incrementing until we find a required step or reach the end
  while (nextStep < totalSteps && skippedSteps.includes(nextStep)) {
    nextStep++;
  }
  
  return nextStep < totalSteps ? nextStep : currentStep;
}

/**
 * Gets the previous required step before the current step
 * Skips over non-required steps automatically
 */
export function getPreviousAgreementRequiredStep(
  currentStep: number,
  wizardData: EnhancedWizardData
): number {
  const skippedSteps = getAgreementSkippedSteps(wizardData);
  
  let prevStep = currentStep - 1;
  
  // Keep decrementing until we find a required step or reach the start
  while (prevStep >= 0 && skippedSteps.includes(prevStep)) {
    prevStep--;
  }
  
  return prevStep >= 0 ? prevStep : currentStep;
}

/**
 * Check if step should be marked as optional
 */
export function isAgreementStepOptional(
  stepNumber: number,
  wizardData: EnhancedWizardData
): boolean {
  // Add-ons are always optional
  if (stepNumber === 4) return true;
  
  // Documents can be optional for pre-verified customers
  if (stepNumber === 6 && wizardData.source === 'instant_booking') {
    return true;
  }
  
  return false;
}
