import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ExpressStep1Quick } from './ExpressStep1Quick';
import { ExpressStep2DateTime } from './ExpressStep2DateTime';
import { ExpressStep3Confirm } from './ExpressStep3Confirm';
import { useExpressBooking } from '@/hooks/useExpressBooking';
import { Loader2, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ExpressReservationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ExpressReservationModal: React.FC<ExpressReservationModalProps> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();
  const { createExpressBooking } = useExpressBooking();
  const [step, setStep] = useState(1);

  // Step 1 data
  const [customerId, setCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [vehicleClassId, setVehicleClassId] = useState<string>('');

  // Step 2 data
  const [pickupDate, setPickupDate] = useState<Date>();
  const [pickupTime, setPickupTime] = useState('09:00');
  const [returnDate, setReturnDate] = useState<Date>();
  const [returnTime, setReturnTime] = useState('09:00');
  const [pickupLocation, setPickupLocation] = useState('');
  const [returnLocation, setReturnLocation] = useState('');

  // Step 3 data
  const [downPaymentAmount, setDownPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');

  // Fetch vehicle class name
  const { data: vehicleClass } = useQuery<{ name: string } | null>({
    queryKey: ['vehicle-class', vehicleClassId],
    queryFn: async () => {
      if (!vehicleClassId) return null;
      const { data } = await supabase
        .from('vehicle_categories' as any)
        .select('name')
        .eq('id', vehicleClassId)
        .single();
      return data as unknown as { name: string } | null;
    },
    enabled: !!vehicleClassId,
  });

  const canProceedStep1 = customerId && vehicleClassId;
  const canProceedStep2 = pickupDate && pickupTime && returnDate && returnTime && pickupLocation && returnLocation;
  const canCreate = canProceedStep1 && canProceedStep2;

  const estimatedTotal = React.useMemo(() => {
    if (!pickupDate || !returnDate) return 0;
    const durationDays = Math.ceil(
      (returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return durationDays * 50; // $50/day estimate
  }, [pickupDate, returnDate]);

  const handleNext = () => {
    if (step === 1 && canProceedStep1) setStep(2);
    else if (step === 2 && canProceedStep2) setStep(3);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCreate = async () => {
    if (!canCreate) return;

    await createExpressBooking.mutateAsync({
      customerId,
      vehicleClassId,
      pickupDate: pickupDate!.toISOString().split('T')[0],
      pickupTime,
      returnDate: returnDate!.toISOString().split('T')[0],
      returnTime,
      pickupLocation,
      returnLocation,
      downPaymentAmount: downPaymentAmount > 0 ? downPaymentAmount : undefined,
      paymentMethod: paymentMethod || undefined,
    });

    onOpenChange(false);
    // Reset form
    setStep(1);
    setCustomerId('');
    setVehicleClassId('');
    setPickupDate(undefined);
    setReturnDate(undefined);
    setPickupLocation('');
    setReturnLocation('');
    setDownPaymentAmount(0);
    setPaymentMethod('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Express Reservation
          </DialogTitle>
          <DialogDescription>
            Create a quick reservation in 3 simple steps - perfect for walk-ins and phone bookings
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 py-4">
          <div className={`h-2 w-16 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`h-2 w-16 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`h-2 w-16 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
        </div>

        <Separator />

        {/* All Steps - Scrollable */}
        <div className="space-y-6 py-4">
          <ExpressStep1Quick
            customerId={customerId}
            vehicleClassId={vehicleClassId}
            onCustomerSelect={(id, name) => {
              setCustomerId(id);
              setCustomerName(name);
            }}
            onVehicleClassSelect={setVehicleClassId}
            expanded={step === 1}
          />

          <ExpressStep2DateTime
            pickupDate={pickupDate}
            pickupTime={pickupTime}
            returnDate={returnDate}
            returnTime={returnTime}
            pickupLocation={pickupLocation}
            returnLocation={returnLocation}
            onPickupDateChange={setPickupDate}
            onPickupTimeChange={setPickupTime}
            onReturnDateChange={setReturnDate}
            onReturnTimeChange={setReturnTime}
            onPickupLocationChange={setPickupLocation}
            onReturnLocationChange={setReturnLocation}
            expanded={step === 2}
          />

          <ExpressStep3Confirm
            customerName={customerName}
            vehicleClassName={vehicleClass?.name}
            pickupDate={pickupDate}
            returnDate={returnDate}
            pickupLocation={pickupLocation}
            returnLocation={returnLocation}
            estimatedTotal={estimatedTotal}
            downPaymentAmount={downPaymentAmount}
            paymentMethod={paymentMethod}
            onDownPaymentChange={setDownPaymentAmount}
            onPaymentMethodChange={setPaymentMethod}
            expanded={step === 3}
          />
        </div>

        <DialogFooter className="flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <div className="flex-1" />
          {step > 1 && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={handleNext} disabled={
              (step === 1 && !canProceedStep1) ||
              (step === 2 && !canProceedStep2)
            }>
              Next
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={!canCreate || createExpressBooking.isPending}
            >
              {createExpressBooking.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Reservation'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
