import type { ReservationWizardData } from '@/components/reservations/wizard/ReservationWizardContext';

/**
 * Determines which steps should be skipped based on wizard data
 * Returns an array of step numbers that should be hidden/skipped
 */
export function getSkippedSteps(wizardData: ReservationWizardData): number[] {
  const skippedSteps: number[] = [];

  // Skip airport info (step 9) if not doing airport pickup/return
  if (!wizardData.airportPickup && !wizardData.airportReturn) {
    skippedSteps.push(9);
  }

  // Skip services/add-ons (step 8) if customer type indicates no extras
  // This could be extended based on business rules

  return skippedSteps;
}

/**
 * Determines if a specific step is required based on current wizard state
 */
export function isStepRequired(
  stepNumber: number,
  wizardData: ReservationWizardData
): boolean {
  const skippedSteps = getSkippedSteps(wizardData);
  return !skippedSteps.includes(stepNumber);
}

/**
 * Gets the next required step after the current step
 * Skips over non-required steps automatically
 */
export function getNextRequiredStep(
  currentStep: number,
  wizardData: ReservationWizardData,
  totalSteps: number
): number {
  const skippedSteps = getSkippedSteps(wizardData);
  
  let nextStep = currentStep + 1;
  
  // Keep incrementing until we find a required step or reach the end
  while (nextStep <= totalSteps && skippedSteps.includes(nextStep)) {
    nextStep++;
  }
  
  return nextStep <= totalSteps ? nextStep : currentStep;
}

/**
 * Gets the previous required step before the current step
 * Skips over non-required steps automatically
 */
export function getPreviousRequiredStep(
  currentStep: number,
  wizardData: ReservationWizardData
): number {
  const skippedSteps = getSkippedSteps(wizardData);
  
  let prevStep = currentStep - 1;
  
  // Keep decrementing until we find a required step or reach the start
  while (prevStep >= 1 && skippedSteps.includes(prevStep)) {
    prevStep--;
  }
  
  return prevStep >= 1 ? prevStep : currentStep;
}

/**
 * Groups steps into logical sections for better UX
 */
export interface WizardStepGroup {
  id: string;
  title: string;
  description: string;
  steps: number[];
  icon?: string;
  color?: string;
}

export function getStepGroups(): WizardStepGroup[] {
  return [
    {
      id: 'basics',
      title: 'Reservation Basics',
      description: 'Essential booking information',
      steps: [1, 2, 3, 4],
      icon: '📋',
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'vehicle-pricing',
      title: 'Vehicle & Pricing',
      description: 'Select vehicle and configure rates',
      steps: [5, 6, 7],
      icon: '🚗',
      color: 'from-green-500 to-green-600',
    },
    {
      id: 'services',
      title: 'Additional Services',
      description: 'Add-ons, insurance, and extras',
      steps: [8, 9, 10],
      icon: '✨',
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 'billing-payment',
      title: 'Billing & Payment',
      description: 'Configure billing and collect payment',
      steps: [11, 12, 13],
      icon: '💳',
      color: 'from-amber-500 to-amber-600',
    },
    {
      id: 'confirmation',
      title: 'Review & Confirm',
      description: 'Final review and submission',
      steps: [14],
      icon: '✅',
      color: 'from-emerald-500 to-emerald-600',
    },
  ];
}

/**
 * Gets the group that contains a specific step
 */
export function getStepGroup(stepNumber: number): WizardStepGroup | undefined {
  const groups = getStepGroups();
  return groups.find((group) => group.steps.includes(stepNumber));
}

/**
 * Calculates overall completion percentage for a group
 */
export function getGroupCompletionPercentage(
  group: WizardStepGroup,
  completedSteps: number[]
): number {
  const completedInGroup = group.steps.filter((step) =>
    completedSteps.includes(step)
  ).length;
  return Math.round((completedInGroup / group.steps.length) * 100);
}
