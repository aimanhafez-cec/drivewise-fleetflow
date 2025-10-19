import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Save, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  useReservationWizard,
  ReservationWizardProvider,
} from './ReservationWizardContext';
import { WizardProgress } from './WizardProgress';
import ReservationTypeSelector from '@/components/instant-booking/wizard/ReservationTypeSelector';
import CustomerIdentification from '@/components/instant-booking/wizard/CustomerIdentification';
import DatesLocations from '@/components/instant-booking/wizard/DatesLocations';
import { Step1_5BusinessConfig } from './Step1_5BusinessConfig';
import { Step2_5PriceList } from './Step2_5PriceList';
import { Step4MultiLineBuilder } from './Step4MultiLineBuilder';
import { Step5ServicesAddOns } from './Step5ServicesAddOns';
import { Step5_5AirportInfo } from './Step5_5AirportInfo';
import { Step5_6Insurance } from './Step5_6Insurance';
import { Step5_7BillingConfig } from './Step5_7BillingConfig';
import { Step6PricingSummary } from './Step6PricingSummary';
import { Step7DownPayment } from './Step7DownPayment';
import { Step7_5ReferralNotes } from './Step7_5ReferralNotes';
import { Step8Confirmation } from './Step8Confirmation';
import { useReservationDataConsistency } from '@/hooks/useReservationDataConsistency';
import { validateReservation, validateHeader } from '@/lib/validation/reservationSchema';
import { ValidationErrorBanner } from '@/components/ui/validation-error-banner';

const wizardSteps = [
  { number: 1, title: 'Reservation Type', description: 'Select booking type' },
  { number: 2, title: 'Business Config', description: 'Setup business rules' },
  { number: 3, title: 'Customer', description: 'Identify customer' },
  { number: 4, title: 'Price List', description: 'Select rates' },
  { number: 5, title: 'Dates & Locations', description: 'Set schedule' },
  { number: 6, title: 'Vehicle Lines', description: 'Build reservation' },
  { number: 7, title: 'Services & Add-ons', description: 'Select extras' },
  { number: 8, title: 'Airport Info', description: 'Flight details' },
  { number: 9, title: 'Insurance', description: 'Coverage options' },
  { number: 10, title: 'Billing', description: 'Setup billing' },
  { number: 11, title: 'Pricing Summary', description: 'Review costs' },
  { number: 12, title: 'Payment', description: 'Collect deposit' },
  { number: 13, title: 'Referral & Notes', description: 'Additional info' },
  { number: 14, title: 'Confirmation', description: 'Complete booking' },
];

const ReservationWizardContent: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentStep, wizardData, nextStep, prevStep, resetWizard, updateWizardData } =
    useReservationWizard();
  const { validateBeforeSubmission, ensureDataIntegrity, checkDataConsistency } = useReservationDataConsistency();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const createReservationMutation = useMutation({
    mutationFn: async () => {
      // Run comprehensive validation
      const validationResult = validateReservation(wizardData);
      if (!validationResult.success) {
        const errorMessages = validationResult.errors.map(e => e.message).join(', ');
        throw new Error(`Validation failed: ${errorMessages}`);
      }

      // Check data consistency
      const { isConsistent, issues } = checkDataConsistency(wizardData);
      if (!isConsistent) {
        throw new Error(`Data consistency issues: ${issues.join(', ')}`);
      }

      // Validate before submission
      if (!validateBeforeSubmission(wizardData)) {
        throw new Error('Data validation failed');
      }

      // Ensure data integrity
      const cleanData = ensureDataIntegrity(wizardData);

      const { data: reservationNo } = await supabase.rpc('generate_reservation_no');
      const { data: reservation, error } = await supabase
        .from('reservations')
        .insert({
          ro_number: reservationNo,
          customer_id: cleanData.customerId,
          reservation_type: cleanData.reservationType,
          vehicle_class_id: cleanData.vehicleClassId || null,
          make_model: cleanData.makeModel || null,
          vehicle_id: cleanData.vehicleId || null,
          start_datetime: new Date(`${cleanData.pickupDate}T${cleanData.pickupTime}`).toISOString(),
          end_datetime: new Date(`${cleanData.returnDate}T${cleanData.returnTime}`).toISOString(),
          pickup_location: cleanData.pickupLocation,
          return_location: cleanData.returnLocation || cleanData.pickupLocation,
          total_amount: cleanData.totalAmount,
          down_payment_amount: cleanData.downPaymentAmount,
          down_payment_status: cleanData.downPaymentAmount > 0 ? 'paid' : 'pending',
          down_payment_method: cleanData.paymentMethod,
          down_payment_transaction_id: cleanData.transactionId,
          down_payment_paid_at: cleanData.downPaymentAmount > 0 ? new Date().toISOString() : null,
          balance_due: cleanData.balanceDue,
          status: 'confirmed',
          add_ons: cleanData.selectedAddons || [],
        })
        .select()
        .single();
      
      if (error) throw error;

      // Record payment if down payment was made
      if (cleanData.downPaymentAmount && cleanData.downPaymentAmount > 0) {
        await supabase.from('reservation_payments').insert({
          reservation_id: reservation.id,
          payment_type: 'down_payment',
          amount: cleanData.downPaymentAmount,
          payment_method: cleanData.paymentMethod,
          transaction_id: cleanData.transactionId,
          payment_status: 'completed',
          processed_at: new Date().toISOString(),
        });
      }

      return reservation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast({ 
        title: 'Reservation Created', 
        description: `Reservation ${data.ro_number} has been successfully created.` 
      });
      resetWizard();
      navigate(`/reservations/${data.id}?created=1`);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Create Reservation',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });

  const validateCurrentStep = () => {
    const errors: Record<string, string> = {};

    switch (currentStep) {
      case 1: // Reservation Type
        if (!wizardData.reservationType) {
          errors.reservationType = 'Please select a reservation type';
        }
        break;
      
      case 2: // Business Config
        if (!wizardData.businessUnitId) {
          errors.businessUnitId = 'Business unit is required';
        }
        if (!wizardData.reservationMethodId) {
          errors.reservationMethodId = 'Reservation method is required';
        }
        break;
      
      case 3: // Customer
        if (!wizardData.customerId) {
          errors.customerId = 'Customer selection is required';
        }
        break;
      
      case 4: // Price List
        if (!wizardData.priceListId) {
          errors.priceListId = 'Price list selection is required';
        }
        break;
      
      case 5: // Dates & Locations
        if (!wizardData.pickupDate) {
          errors.pickupDate = 'Pickup date is required';
        }
        if (!wizardData.pickupTime) {
          errors.pickupTime = 'Pickup time is required';
        }
        if (!wizardData.returnDate) {
          errors.returnDate = 'Return date is required';
        }
        if (!wizardData.returnTime) {
          errors.returnTime = 'Return time is required';
        }
        if (!wizardData.pickupLocation) {
          errors.pickupLocation = 'Pickup location is required';
        }
        if (!wizardData.returnLocation) {
          errors.returnLocation = 'Return location is required';
        }
        
        // Date consistency check
        if (wizardData.pickupDate && wizardData.returnDate && wizardData.pickupTime && wizardData.returnTime) {
          const pickup = new Date(`${wizardData.pickupDate}T${wizardData.pickupTime}`);
          const returnDate = new Date(`${wizardData.returnDate}T${wizardData.returnTime}`);
          if (pickup >= returnDate) {
            errors.dateRange = 'Return date/time must be after pickup date/time';
          }
        }
        break;
      
      case 6: // Vehicle Lines
        if (!wizardData.reservationLines || wizardData.reservationLines.length === 0) {
          errors.reservationLines = 'At least one vehicle line is required';
        }
        break;
      
      case 10: // Billing Config
        if (!wizardData.billToType) {
          errors.billToType = 'Bill to type is required';
        }
        if (!wizardData.taxLevelId) {
          errors.taxLevelId = 'Tax level is required';
        }
        if (!wizardData.taxCodeId) {
          errors.taxCodeId = 'Tax code is required';
        }
        break;
      
      case 12: // Payment
        if (wizardData.downPaymentAmount && wizardData.downPaymentAmount > 0) {
          if (!wizardData.paymentMethod) {
            errors.paymentMethod = 'Payment method is required for down payment';
          }
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const canProceed = () => {
    return validateCurrentStep();
  };

  const handleNext = () => {
    if (canProceed()) {
      setValidationErrors({});
      nextStep();
    } else {
      toast({
        title: 'Validation Failed',
        description: 'Please correct the errors before proceeding',
        variant: 'destructive',
      });
    }
  };

  const handleFieldFocus = (field: string) => {
    const element = document.getElementById(field);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <ReservationTypeSelector selectedType={wizardData.reservationType} onTypeSelect={(type) => updateWizardData({ reservationType: type })} />;
      case 2: return <Step1_5BusinessConfig />;
      case 3: return <CustomerIdentification selectedCustomerId={wizardData.customerId} onCustomerSelect={(c) => updateWizardData({ customerId: c.id, customerData: c })} />;
      case 4: return <Step2_5PriceList />;
      case 5: return <DatesLocations data={{ pickupDate: wizardData.pickupDate, pickupTime: wizardData.pickupTime, returnDate: wizardData.returnDate, returnTime: wizardData.returnTime, pickupLocation: wizardData.pickupLocation, returnLocation: wizardData.returnLocation }} onUpdate={(u) => updateWizardData(u)} />;
      case 6: return <Step4MultiLineBuilder />;
      case 7: return <Step5ServicesAddOns />;
      case 8: return <Step5_5AirportInfo />;
      case 9: return <Step5_6Insurance />;
      case 10: return <Step5_7BillingConfig />;
      case 11: return <Step6PricingSummary />;
      case 12: return <Step7DownPayment />;
      case 13: return <Step7_5ReferralNotes />;
      case 14: return <Step8Confirmation />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <WizardProgress currentStep={currentStep} totalSteps={14} steps={wizardSteps} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {Object.keys(validationErrors).length > 0 && (
          <ValidationErrorBanner
            errors={validationErrors}
            onDismiss={() => setValidationErrors({})}
            onFieldFocus={handleFieldFocus}
          />
        )}
        <div className="mb-8">{renderStep()}</div>
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { if (confirm('Cancel reservation?')) { resetWizard(); navigate('/reservations'); } }}><X className="mr-2 h-4 w-4" />Cancel</Button>
            {currentStep > 1 && currentStep < 14 && <Button variant="outline" onClick={prevStep}><ArrowLeft className="mr-2 h-4 w-4" />Previous</Button>}
          </div>
          <div className="flex gap-2">
            {currentStep < 14 && (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next<ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {currentStep === 14 && (
              <>
                <Button 
                  onClick={() => createReservationMutation.mutate()} 
                  disabled={createReservationMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {createReservationMutation.isPending ? 'Creating...' : 'Create Reservation'}
                </Button>
                <Button variant="outline" onClick={() => navigate('/reservations')}>
                  Cancel & View All
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ReservationWizardMain: React.FC = () => (
  <ReservationWizardProvider><ReservationWizardContent /></ReservationWizardProvider>
);
