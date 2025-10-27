/**
 * Agreement Wizard Step Groups
 * Organizes the 9-step agreement wizard into logical sections
 */

export interface AgreementStepGroup {
  id: string;
  title: string;
  description: string;
  steps: number[];
  icon?: string;
  color?: string;
}

export function getAgreementStepGroups(): AgreementStepGroup[] {
  return [
    {
      id: 'source',
      title: 'Source & Setup',
      description: 'Agreement source and initial setup',
      steps: [0], // Source Selection
      icon: '📋',
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'agreement-details',
      title: 'Agreement Details',
      description: 'Terms, inspection, and pricing',
      steps: [1, 2, 3], // Terms, Inspection, Pricing
      icon: '📝',
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 'services',
      title: 'Services & Payment',
      description: 'Add-ons and billing setup',
      steps: [4, 5], // Add-ons, Billing/Payment
      icon: '💳',
      color: 'from-green-500 to-green-600',
    },
    {
      id: 'verification',
      title: 'Documents & Signature',
      description: 'Verify documents and sign agreement',
      steps: [6, 7], // Documents, Signature
      icon: '✍️',
      color: 'from-amber-500 to-amber-600',
    },
    {
      id: 'finalization',
      title: 'Final Review',
      description: 'Complete and issue agreement',
      steps: [8], // Final Review
      icon: '✅',
      color: 'from-emerald-500 to-emerald-600',
    },
  ];
}

/**
 * Gets the group that contains a specific step
 */
export function getAgreementStepGroup(stepNumber: number): AgreementStepGroup | undefined {
  const groups = getAgreementStepGroups();
  return groups.find((group) => group.steps.includes(stepNumber));
}

/**
 * Calculates overall completion percentage for a group
 */
export function getAgreementGroupCompletionPercentage(
  group: AgreementStepGroup,
  completedSteps: number[]
): number {
  const completedInGroup = group.steps.filter((step) =>
    completedSteps.includes(step)
  ).length;
  return Math.round((completedInGroup / group.steps.length) * 100);
}
