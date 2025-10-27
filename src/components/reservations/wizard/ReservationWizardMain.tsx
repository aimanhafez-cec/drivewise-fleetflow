import React, { useState, useEffect } from 'react';
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
import { WizardDebugPanel } from './WizardDebugPanel';
import { useSmartDefaults, useApplySmartDefaults } from '@/hooks/useSmartDefaults';

const wizardSteps = [
  { number: 1, title: 'Reservation Type', description: 'Select booking type' },
  { number: 2, title: 'Business Config', description: 'Setup business rules' },
  { number: 3, title: 'Customer', description: 'Identify customer' },
  { number: 4, title: 'Dates & Locations', description: 'Set schedule' },
  { number: 5, title: 'Vehicle Lines', description: 'Build reservation' },
  { number: 6, title: 'Price List', description: 'Select rates' },
  { number: 7, title: 'Pricing Summary', description: 'Review costs' },
  { number: 8, title: 'Services & Add-ons', description: 'Select extras' },
  { number: 9, title: 'Airport Info', description: 'Flight details' },
  { number: 10, title: 'Insurance', description: 'Coverage options' },
  { number: 11, title: 'Billing', description: 'Setup billing' },
  { number: 12, title: 'Payment', description: 'Collect deposit' },
  { number: 13, title: 'Referral & Notes', description: 'Additional info' },
  { number: 14, title: 'Confirmation', description: 'Complete booking' },
];

const ReservationWizardContent: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { 
    currentStep, 
    wizardData, 
    nextStep, 
    prevStep, 
    goToStep, 
    resetWizard, 
    updateWizardData,
    completedSteps,
    visitedSteps,
    stepValidationStatus,
    markStepComplete,
    markStepIncomplete,
    getStepStatus
  } = useReservationWizard();
  const { validateBeforeSubmission, ensureDataIntegrity, checkDataConsistency } = useReservationDataConsistency();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Smart defaults for customer history
  const { smartDefaults, hasHistory, isLoading: loadingDefaults } = useSmartDefaults(wizardData.customerId);
  const { applyDefaults } = useApplySmartDefaults();

  // Apply smart defaults when customer is selected
  useEffect(() => {
    if (wizardData.customerId && smartDefaults && !loadingDefaults) {
      const updates = applyDefaults(wizardData, smartDefaults, {
        overwriteExisting: false, // Don't overwrite user-entered data
      });
      
      if (Object.keys(updates).length > 0) {
        console.log('[SmartDefaults] Applying smart defaults:', updates);
        updateWizardData(updates);
        
        if (smartDefaults.hasHistory) {
          toast({
            title: 'Smart Defaults Applied',
            description: 'Pre-filled with customer\'s preferences from previous bookings',
          });
        }
      }
    }
  }, [wizardData.customerId, smartDefaults, loadingDefaults]);

  // Handler for "Book Again" quick action
  const handleBookAgain = () => {
    if (!smartDefaults) return;
    
    const updates = applyDefaults(wizardData, smartDefaults, {
      overwriteExisting: true, // Force overwrite for "Book Again"
    });
    
    if (Object.keys(updates).length > 0) {
      updateWizardData(updates);
      toast({
        title: 'Booking Pre-filled',
        description: 'All details copied from last booking. Review and adjust as needed.',
      });
      // Skip to vehicle selection step
      goToStep(5);
    }
  };

  const createReservationMutation = useMutation({
    mutationFn: async () => {
      try {
        // Validate all steps before submission
        const { isValid, invalidSteps } = validateAllSteps();
        if (!isValid) {
          const stepNames = invalidSteps
            .map((step) => wizardSteps.find((s) => s.number === step)?.title)
            .filter(Boolean)
            .join(', ');
          throw new Error(
            `Please complete all required steps. Incomplete/invalid steps: ${stepNames}`
          );
        }

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

        // Edge case: Verify dates are not in the past
        const now = new Date();
        const pickupDateTime = new Date(`${cleanData.pickupDate}T${cleanData.pickupTime}`);
        if (pickupDateTime < now && pickupDateTime.getTime() < now.getTime() - 86400000) {
          throw new Error('Pickup date cannot be more than 24 hours in the past');
        }

        // Edge case: Verify return is after pickup
        const returnDateTime = new Date(`${cleanData.returnDate}T${cleanData.returnTime}`);
        if (returnDateTime <= pickupDateTime) {
          throw new Error('Return date/time must be after pickup date/time');
        }

        // Edge case: Verify payment amounts
        if (cleanData.totalAmount && cleanData.totalAmount <= 0) {
          throw new Error('Total amount must be greater than zero');
        }
        if (cleanData.downPaymentAmount && cleanData.downPaymentAmount < 0) {
          throw new Error('Down payment amount cannot be negative');
        }
        if (cleanData.downPaymentAmount && cleanData.totalAmount && cleanData.downPaymentAmount > cleanData.totalAmount) {
          throw new Error('Down payment cannot exceed total amount');
        }

        // Generate reservation number
        const { data: reservationNo, error: rpcError } = await supabase.rpc('generate_reservation_no');
        if (rpcError) throw new Error(`Failed to generate reservation number: ${rpcError.message}`);
        if (!reservationNo) throw new Error('Failed to generate reservation number');

        // Insert reservation with all new fields
        const { data: reservation, error } = await supabase
          .from('reservations')
          .insert({
            ro_number: reservationNo,
            customer_id: cleanData.customerId,
            reservation_type: cleanData.reservationType,
            business_unit_id: cleanData.businessUnitId || null,
            reservation_method_id: cleanData.reservationMethodId || null,
            payment_terms_id: cleanData.paymentTermsId || null,
            price_list_id: cleanData.priceListId || null,
            vehicle_class_id: cleanData.vehicleClassId || null,
            make_model: cleanData.makeModel || null,
            vehicle_id: cleanData.vehicleId || null,
            start_datetime: pickupDateTime.toISOString(),
            end_datetime: returnDateTime.toISOString(),
            pickup_location: cleanData.pickupLocation,
            return_location: cleanData.returnLocation || cleanData.pickupLocation,
            bill_to_type: cleanData.billToType || null,
            bill_to_meta: cleanData.billToMeta || null,
            tax_level_id: cleanData.taxLevelId || null,
            tax_code_id: cleanData.taxCodeId || null,
            discount_type_id: cleanData.discountTypeId || null,
            discount_value: cleanData.discountValue || null,
            validity_date_to: cleanData.validityDateTo || null,
            lease_to_own: cleanData.leaseToOwn || false,
            insurance_level_id: cleanData.insuranceLevelId || null,
            insurance_group_id: cleanData.insuranceGroupId || null,
            insurance_provider_id: cleanData.insuranceProviderId || null,
            airport_pickup: cleanData.airportPickup || false,
            pickup_flight_no: cleanData.pickupFlightNo || null,
            pickup_flight_time: cleanData.pickupFlightTime || null,
            airport_return: cleanData.airportReturn || false,
            return_flight_no: cleanData.returnFlightNo || null,
            return_flight_time: cleanData.returnFlightTime || null,
            referral_source: cleanData.referralSource || null,
            referral_details: cleanData.referralDetails || null,
            internal_notes: cleanData.internalNotes || null,
            customer_notes: cleanData.customerNotes || null,
            total_amount: cleanData.totalAmount || 0,
            down_payment_amount: cleanData.downPaymentAmount || 0,
            down_payment_status: cleanData.downPaymentAmount && cleanData.downPaymentAmount > 0 ? 'paid' : 'pending',
            deposit_payment_method: cleanData.paymentMethod || null,
            deposit_transaction_id: cleanData.transactionId || null,
            down_payment_paid_at: cleanData.downPaymentAmount && cleanData.downPaymentAmount > 0 ? new Date().toISOString() : null,
            advance_payment: cleanData.advancePayment || 0,
            security_deposit_paid: cleanData.securityDepositPaid || 0,
            balance_due: cleanData.balanceDue || 0,
            status: 'confirmed',
            add_ons: cleanData.selectedAddons || [],
          })
          .select()
          .single();
        
        if (error) {
          console.error('Reservation insert error:', error);
          throw new Error(`Failed to create reservation: ${error.message || 'Unknown error'}`);
        }
        
        if (!reservation) {
          throw new Error('Reservation was not created properly');
        }

        // Record payment if down payment was made
        if (cleanData.downPaymentAmount && cleanData.downPaymentAmount > 0) {
          const { error: paymentError } = await supabase.from('reservation_payments').insert({
            reservation_id: reservation.id,
            payment_type: 'down_payment',
            amount: cleanData.downPaymentAmount,
            payment_method: cleanData.paymentMethod,
            transaction_id: cleanData.transactionId,
            payment_status: 'completed',
            processed_at: new Date().toISOString(),
          });

          if (paymentError) {
            console.error('Payment record error:', paymentError);
            // Don't fail the entire reservation, just log the error
            toast({
              title: 'Warning',
              description: 'Reservation created but payment record failed. Please check payment history.',
              variant: 'destructive',
            });
          }
        }

        return reservation;
      } catch (error) {
        console.error('Reservation creation error:', error);
        throw error;
      }
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
        if (!wizardData.paymentTermsId) {
          errors.paymentTermsId = 'Payment terms are required';
        }
        break;
      
      case 3: // Customer
        if (!wizardData.customerId) {
          errors.customerId = 'Customer selection is required';
        }
        // Edge case: Verify customer data is loaded
        if (wizardData.customerId && !wizardData.customerData) {
          errors.customerData = 'Customer data could not be loaded. Please reselect the customer.';
        }
        break;
      
      case 4: // Dates & Locations
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
        
        // Date consistency checks
        if (wizardData.pickupDate && wizardData.returnDate && wizardData.pickupTime && wizardData.returnTime) {
          const pickup = new Date(`${wizardData.pickupDate}T${wizardData.pickupTime}`);
          const returnDate = new Date(`${wizardData.returnDate}T${wizardData.returnTime}`);
          
          if (isNaN(pickup.getTime())) {
            errors.pickupDateTime = 'Invalid pickup date/time format';
          }
          if (isNaN(returnDate.getTime())) {
            errors.returnDateTime = 'Invalid return date/time format';
          }
          
          if (pickup >= returnDate) {
            errors.dateRange = 'Return date/time must be after pickup date/time';
          }
          
          // Edge case: Warn if pickup is more than 24h in the past
          const now = new Date();
          if (pickup < now && pickup.getTime() < now.getTime() - 86400000) {
            errors.pickupPast = 'Warning: Pickup date is more than 24 hours in the past';
          }

          // Edge case: Minimum rental duration (1 hour)
          const durationMs = returnDate.getTime() - pickup.getTime();
          const durationHours = durationMs / (1000 * 60 * 60);
          if (durationHours < 1) {
            errors.duration = 'Minimum rental duration is 1 hour';
          }
        }
        break;
      
      case 5: // Vehicle Lines
        if (!wizardData.reservationLines || wizardData.reservationLines.length === 0) {
          errors.reservationLines = 'At least one vehicle line is required';
        }
        // Validate vehicle lines based on reservation type
        if (wizardData.reservationLines && wizardData.reservationLines.length > 0) {
          wizardData.reservationLines.forEach((line, index) => {
            if (wizardData.reservationType === 'vehicle_class') {
              if (!line.vehicleClassId) {
                errors[`line${index}_vehicle`] = `Line ${index + 1}: Vehicle class selection is required`;
              }
            } else if (wizardData.reservationType === 'specific_vehicle') {
              if (!line.vehicleId && !line.vehicleData?.make) {
                errors[`line${index}_vehicle`] = `Line ${index + 1}: Specific vehicle selection is required`;
              }
            }
          });
        }
        break;
      
      case 6: // Price List
        if (!wizardData.priceListId) {
          errors.priceListId = 'Price list selection is required';
        }
        // Validate that rates are configured
        const hasValidRates = 
          (wizardData.dailyRate && wizardData.dailyRate > 0) || 
          (wizardData.weeklyRate && wizardData.weeklyRate > 0) || 
          (wizardData.monthlyRate && wizardData.monthlyRate > 0);
        
        if (!hasValidRates) {
          errors.priceListRates = 'At least one rate (daily, weekly, or monthly) must be greater than zero';
        }
        break;
      
      case 7: // Pricing Summary
        if (!wizardData.totalAmount || wizardData.totalAmount <= 0) {
          errors.totalAmount = 'Total amount must be greater than zero';
        }
        // Validate that all lines have calculated pricing
        if (wizardData.reservationLines && wizardData.reservationLines.length > 0) {
          const linesWithZeroTotal = wizardData.reservationLines.filter(
            line => !line.lineTotal || line.lineTotal <= 0
          );
          if (linesWithZeroTotal.length > 0) {
            errors.linePricing = `${linesWithZeroTotal.length} line(s) have zero or missing pricing. Please go back to Step 6 to ensure rates are properly configured.`;
          }
        }
        // Edge case: Verify payment amounts add up
        if (wizardData.totalAmount && wizardData.downPaymentAmount && wizardData.balanceDue) {
          const calculatedBalance = wizardData.totalAmount - wizardData.downPaymentAmount;
          if (Math.abs(calculatedBalance - wizardData.balanceDue) > 0.01) {
            errors.paymentMismatch = 'Payment amounts do not match total amount';
          }
        }
        break;
      
      case 9: // Airport Info
        // Conditional validation: If airport pickup is enabled, require flight details
        if (wizardData.airportPickup) {
          if (!wizardData.pickupFlightNo) {
            errors.pickupFlightNo = 'Flight number is required for airport pickup';
          }
          if (!wizardData.pickupFlightTime) {
            errors.pickupFlightTime = 'Flight time is required for airport pickup';
          }
        }
        if (wizardData.airportReturn) {
          if (!wizardData.returnFlightNo) {
            errors.returnFlightNo = 'Flight number is required for airport return';
          }
          if (!wizardData.returnFlightTime) {
            errors.returnFlightTime = 'Flight time is required for airport return';
          }
        }
        break;
      
      case 10: // Insurance
        if (!wizardData.insuranceLevelId) {
          errors.insuranceLevelId = 'Insurance level is required';
        }
        if (!wizardData.insuranceGroupId) {
          errors.insuranceGroupId = 'Insurance group is required';
        }
        break;
      
      case 11: // Billing Config
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
          // Edge case: Validate down payment amount
          if (wizardData.downPaymentAmount < 0) {
            errors.downPaymentNegative = 'Down payment cannot be negative';
          }
          if (wizardData.totalAmount && wizardData.downPaymentAmount > wizardData.totalAmount) {
            errors.downPaymentExcessive = 'Down payment cannot exceed total amount';
          }
        }
        break;
    }

    return errors;
  };

  const canProceed = () => {
    // Check if there are any validation errors for the current step
    const currentErrors = validateCurrentStep();
    if (Object.keys(currentErrors).length > 0) {
      return false;
    }

    // Pure function that checks without updating state
    switch (currentStep) {
      case 1: return !!wizardData.reservationType;
      case 2: return !!(wizardData.businessUnitId && wizardData.reservationMethodId && wizardData.paymentTermsId);
      case 3: return !!(wizardData.customerId && wizardData.customerData);
      case 4: {
        if (!wizardData.pickupDate || !wizardData.returnDate || !wizardData.pickupLocation || !wizardData.returnLocation) {
          return false;
        }
        // Additional validation for dates
        const pickup = new Date(`${wizardData.pickupDate}T${wizardData.pickupTime || '00:00'}`);
        const returnDate = new Date(`${wizardData.returnDate}T${wizardData.returnTime || '00:00'}`);
        return pickup < returnDate;
      }
      case 5: return !!(wizardData.reservationLines?.length && wizardData.reservationLines.every(line => {
        if (wizardData.reservationType === 'vehicle_class') return !!line.vehicleClassId;
        if (wizardData.reservationType === 'specific_vehicle') return !!line.vehicleId || !!(line.vehicleData?.make && line.vehicleData?.model);
        return false;
      }));
      case 6: return !!(wizardData.priceListId && (
        (wizardData.dailyRate && wizardData.dailyRate > 0) || 
        (wizardData.weeklyRate && wizardData.weeklyRate > 0) || 
        (wizardData.monthlyRate && wizardData.monthlyRate > 0)
      ));
      case 7: return !!(wizardData.totalAmount && wizardData.totalAmount > 0);
      case 9: {
        // Airport info is optional unless airport pickup/return is selected
        if (wizardData.airportPickup && (!wizardData.pickupFlightNo || !wizardData.pickupFlightTime)) {
          return false;
        }
        if (wizardData.airportReturn && (!wizardData.returnFlightNo || !wizardData.returnFlightTime)) {
          return false;
        }
        return true;
      }
      case 10: return !!(wizardData.insuranceLevelId && wizardData.insuranceGroupId);
      case 11: return !!(wizardData.billToType && wizardData.taxLevelId && wizardData.taxCodeId);
      case 12: return wizardData.downPaymentAmount && wizardData.downPaymentAmount > 0 ? !!wizardData.paymentMethod : true;
      default: return true;
    }
  };

  const handleNext = () => {
    const errors = validateCurrentStep();
    
    if (Object.keys(errors).length === 0) {
      setValidationErrors({});
      markStepComplete(currentStep);
      nextStep();
    } else {
      setValidationErrors(errors);
      // Mark as has-errors if there are validation errors, otherwise incomplete
      updateWizardData({ 
        [`step${currentStep}ValidationStatus`]: 'has-errors' as any 
      });
      toast({
        title: 'Validation Failed',
        description: 'Please correct the errors before proceeding',
        variant: 'destructive',
      });
    }
  };

  const handleStepClick = (stepNumber: number) => {
    // Already on this step - no action needed
    if (stepNumber === currentStep) {
      return;
    }
    
    console.log('🔄 Step Navigation:', {
      from: currentStep,
      to: stepNumber,
      stepName: wizardSteps.find(s => s.number === stepNumber)?.title,
    });
    
    // Validate current step before leaving
    const errors = validateCurrentStep();
    if (Object.keys(errors).length > 0) {
      // Mark current step with errors but allow navigation
      setValidationErrors(errors);
      markStepIncomplete(currentStep);
      toast({
        title: 'Step Has Validation Issues',
        description: 'You can navigate freely, but please fix these issues before final submission.',
        variant: 'default',
      });
    } else {
      // Mark as complete if no errors and moving forward
      if (stepNumber > currentStep) {
        markStepComplete(currentStep);
      }
      setValidationErrors({});
    }
    
    // Allow free navigation to any step
    goToStep(stepNumber);
  };

  const validateAllSteps = (): { isValid: boolean; invalidSteps: number[] } => {
    const invalidSteps: number[] = [];
    const requiredSteps = [1, 2, 3, 4, 5, 6, 7, 11]; // Core required steps
    
    requiredSteps.forEach((step) => {
      const status = getStepStatus(step);
      if (status === 'has-errors' || status === 'incomplete' || status === 'not-visited') {
        invalidSteps.push(step);
      }
    });
    
    return {
      isValid: invalidSteps.length === 0,
      invalidSteps,
    };
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
      case 3: return (
        <CustomerIdentification 
          selectedCustomerId={wizardData.customerId} 
          onCustomerSelect={(c) => updateWizardData({ customerId: c.id, customerData: c })} 
          onBookAgain={hasHistory ? handleBookAgain : undefined}
          hasLastBooking={hasHistory}
        />
      );
      case 4: return <DatesLocations data={{ pickupDate: wizardData.pickupDate, pickupTime: wizardData.pickupTime, returnDate: wizardData.returnDate, returnTime: wizardData.returnTime, pickupLocation: wizardData.pickupLocation, returnLocation: wizardData.returnLocation }} onUpdate={(u) => updateWizardData(u)} />;
      case 5: return <Step4MultiLineBuilder />;
      case 6: return <Step2_5PriceList />;
      case 7: return <Step6PricingSummary />;
      case 8: return <Step5ServicesAddOns />;
      case 9: return <Step5_5AirportInfo />;
      case 10: return <Step5_6Insurance />;
      case 11: return <Step5_7BillingConfig />;
      case 12: return <Step7DownPayment />;
      case 13: return <Step7_5ReferralNotes />;
      case 14: return <Step8Confirmation />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <WizardDebugPanel />
      <WizardProgress
        currentStep={currentStep} 
        totalSteps={14} 
        steps={wizardSteps}
        completedSteps={completedSteps}
        stepValidationStatus={stepValidationStatus}
        onStepClick={handleStepClick}
      />
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
            {currentStep > 1 && currentStep < 14 && (
              <Button 
                variant="outline" 
                onClick={() => {
                  // Save validation status of current step before going back
                  const errors = validateCurrentStep();
                  if (Object.keys(errors).length > 0) {
                    markStepIncomplete(currentStep);
                  }
                  prevStep();
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />Previous
              </Button>
            )}
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
