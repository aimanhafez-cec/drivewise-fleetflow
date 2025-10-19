import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  useReservationWizard,
  ReservationWizardProvider,
} from './ReservationWizardContext';
import { WizardProgress } from './WizardProgress';
import ReservationTypeSelector from '@/components/instant-booking/wizard/ReservationTypeSelector';
import CustomerIdentification from '@/components/instant-booking/wizard/CustomerIdentification';
import DatesLocations from '@/components/instant-booking/wizard/DatesLocations';
import { Step4SmartVehicleSelection } from './Step4SmartVehicleSelection';
import { Step5ServicesAddOns } from './Step5ServicesAddOns';
import { Step6PricingSummary } from './Step6PricingSummary';
import { Step7DownPayment } from './Step7DownPayment';
import { Step8Confirmation } from './Step8Confirmation';

const wizardSteps = [
  { number: 1, title: 'Reservation Type', description: 'Select booking type' },
  { number: 2, title: 'Customer', description: 'Identify customer' },
  { number: 3, title: 'Dates & Locations', description: 'Set schedule' },
  { number: 4, title: 'Vehicle Selection', description: 'Choose vehicle' },
  { number: 5, title: 'Add-ons', description: 'Select services' },
  { number: 6, title: 'Pricing', description: 'Review costs' },
  { number: 7, title: 'Payment', description: 'Collect deposit' },
  { number: 8, title: 'Confirmation', description: 'Complete booking' },
];

const ReservationWizardContent: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentStep, wizardData, nextStep, prevStep, resetWizard, updateWizardData } =
    useReservationWizard();

  const createReservationMutation = useMutation({
    mutationFn: async () => {
      const { data: reservationNo } = await supabase.rpc('generate_reservation_no');
      const { data: reservation, error } = await supabase
        .from('reservations')
        .insert({
          ro_number: reservationNo,
          customer_id: wizardData.customerId,
          reservation_type: wizardData.reservationType,
          vehicle_class_id: wizardData.vehicleClassId || null,
          make_model: wizardData.makeModel || null,
          vehicle_id: wizardData.vehicleId || null,
          start_datetime: new Date(`${wizardData.pickupDate}T${wizardData.pickupTime}`).toISOString(),
          end_datetime: new Date(`${wizardData.returnDate}T${wizardData.returnTime}`).toISOString(),
          pickup_location: wizardData.pickupLocation,
          return_location: wizardData.returnLocation,
          total_amount: wizardData.totalAmount,
          down_payment_amount: wizardData.downPaymentAmount,
          down_payment_status: 'paid',
          down_payment_method: wizardData.paymentMethod,
          down_payment_transaction_id: wizardData.transactionId,
          down_payment_paid_at: new Date().toISOString(),
          balance_due: wizardData.balanceDue,
          status: 'confirmed',
        })
        .select()
        .single();
      if (error) throw error;
      await supabase.from('reservation_payments').insert({
        reservation_id: reservation.id,
        payment_type: 'down_payment',
        amount: wizardData.downPaymentAmount,
        payment_method: wizardData.paymentMethod,
        transaction_id: wizardData.transactionId,
        payment_status: 'completed',
        processed_at: new Date().toISOString(),
      });
      return reservation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast({ title: 'Success', description: `Reservation ${data.ro_number} created.` });
    },
  });

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!wizardData.reservationType;
      case 2: return !!wizardData.customerId;
      case 3: return !!(wizardData.pickupDate && wizardData.returnDate && wizardData.pickupLocation);
      case 4: return !!(wizardData.vehicleClassId || wizardData.makeModel || wizardData.vehicleId);
      case 7: return !!(wizardData.paymentMethod && (wizardData.paymentMethod === 'card' || wizardData.transactionId));
      default: return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <ReservationTypeSelector selectedType={wizardData.reservationType} onTypeSelect={(type) => updateWizardData({ reservationType: type })} />;
      case 2: return <CustomerIdentification selectedCustomerId={wizardData.customerId} onCustomerSelect={(c) => updateWizardData({ customerId: c.id, customerData: c })} />;
      case 3: return <DatesLocations data={{ pickupDate: wizardData.pickupDate, pickupTime: wizardData.pickupTime, returnDate: wizardData.returnDate, returnTime: wizardData.returnTime, pickupLocation: wizardData.pickupLocation, returnLocation: wizardData.returnLocation }} onUpdate={(u) => updateWizardData(u)} />;
      case 4: return <Step4SmartVehicleSelection />;
      case 5: return <Step5ServicesAddOns />;
      case 6: return <Step6PricingSummary />;
      case 7: return <Step7DownPayment />;
      case 8: return <Step8Confirmation />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <WizardProgress currentStep={currentStep} totalSteps={8} steps={wizardSteps} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">{renderStep()}</div>
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { if (confirm('Cancel reservation?')) { resetWizard(); navigate('/reservations'); } }}><X className="mr-2 h-4 w-4" />Cancel</Button>
            {currentStep > 1 && currentStep < 8 && <Button variant="outline" onClick={prevStep}><ArrowLeft className="mr-2 h-4 w-4" />Previous</Button>}
          </div>
          <div className="flex gap-2">
            {currentStep < 8 && <Button onClick={nextStep} disabled={!canProceed()}>Next<ArrowRight className="ml-2 h-4 w-4" /></Button>}
            {currentStep === 8 && <><Button onClick={() => createReservationMutation.mutate()} disabled={createReservationMutation.isPending}><Save className="mr-2 h-4 w-4" />{createReservationMutation.isPending ? 'Saving...' : 'Complete'}</Button><Button variant="outline" onClick={() => navigate('/reservations')}>View All</Button></>}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ReservationWizardMain: React.FC = () => (
  <ReservationWizardProvider><ReservationWizardContent /></ReservationWizardProvider>
);
