import { EnhancedAgreementWizard } from '@/components/agreements/EnhancedAgreementWizard';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'sonner';

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
  const [searchParams] = useSearchParams();
  
  // Extract URL parameters
  const source = searchParams.get('source') as 'instant_booking' | 'reservation' | 'direct' | null;
  const bookingId = searchParams.get('bookingId');
  const reservationId = searchParams.get('reservationId');
  
  // Determine sourceId based on source type
  const sourceId = source === 'instant_booking' ? bookingId : source === 'reservation' ? reservationId : undefined;
  
  // Show notification if coming from a specific source
  useEffect(() => {
    if (source && sourceId) {
      const sourceLabel = source === 'instant_booking' ? 'Instant Booking' : 'Reservation';
      toast.info(`Loading ${sourceLabel}`, {
        description: `Pre-populating agreement from ${sourceLabel.toLowerCase()}`,
        duration: 3000,
      });
    }
  }, [source, sourceId]);

  return <EnhancedAgreementWizard initialSource={source || undefined} initialSourceId={sourceId || undefined} />;
};

export default EnhancedAgreementWizardPage;
