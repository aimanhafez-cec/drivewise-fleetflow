import { EnhancedAgreementWizard } from '@/components/agreements/EnhancedAgreementWizard';

/**
 * Enhanced Agreement Wizard Page
 * 
 * Features:
 * - Source selection (reservation/instant booking/direct)
 * - 9-step wizard with comprehensive validation
 * - Progress tracking with localStorage persistence
 * - Interactive vehicle inspection with damage markers
 * - Document upload and verification
 * - Payment processing integration
 * - Enhanced signature capture
 * - Final review and distribution
 */
const EnhancedAgreementWizardPage = () => {
  return <EnhancedAgreementWizard />;
};

export default EnhancedAgreementWizardPage;
