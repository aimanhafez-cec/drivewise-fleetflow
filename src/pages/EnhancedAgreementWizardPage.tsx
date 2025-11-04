import { EnhancedAgreementWizard } from '@/components/agreements/EnhancedAgreementWizard';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { ErrorBoundary } from '@/components/ui/error-boundary';

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
 * 
 * URL Parameters:
 * - ?source=instant_booking&bookingId=xxx - Pre-select an instant booking
 * - ?source=reservation&reservationId=xxx - Pre-select a reservation
 */
const EnhancedAgreementWizardPage = () => {
  console.log('[EnhancedAgreementWizardPage] Component rendering');
  
  const [searchParams] = useSearchParams();
  
  // Extract URL parameters
  const source = searchParams.get('source') as 'instant_booking' | 'reservation' | 'direct' | null;
  const bookingId = searchParams.get('bookingId');
  const reservationId = searchParams.get('reservationId');
  
  // Determine sourceId based on source type
  const sourceId = source === 'instant_booking' ? bookingId : source === 'reservation' ? reservationId : undefined;
  
  console.log('[EnhancedAgreementWizardPage] Params:', { source, bookingId, reservationId, sourceId });
  
  // Notification removed as per user request

  console.log('[EnhancedAgreementWizardPage] Rendering EnhancedAgreementWizard');
  return (
    <ErrorBoundary>
      <EnhancedAgreementWizard initialSource={source || undefined} initialSourceId={sourceId || undefined} />
    </ErrorBoundary>
  );
};

export default EnhancedAgreementWizardPage;
