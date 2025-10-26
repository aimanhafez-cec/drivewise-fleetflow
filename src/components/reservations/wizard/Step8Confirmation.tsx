import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  User,
  Calendar,
  Car,
  Package,
  Hash,
  MapPin,
  DollarSign,
  CreditCard,
  Download,
  Mail,
  Printer,
  Loader2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { useReservationWizard } from './ReservationWizardContext';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useReservationPayments } from '@/hooks/useReservationPayments';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const Step8Confirmation: React.FC = () => {
  const { wizardData, resetWizard } = useReservationWizard();
  const { recordPayment } = useReservationPayments();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinalizeReservation = async () => {
    setIsSubmitting(true);
    try {
      // Generate reservation number
      const { data: reservationNoData, error: reservationNoError } = await supabase
        .rpc('generate_reservation_no');

      if (reservationNoError) throw reservationNoError;

      // Create reservation
      const firstLine = wizardData.reservationLines[0];
      const reservationData = {
        ro_number: reservationNoData,
        customer_id: wizardData.customerId,
        reservation_type: wizardData.reservationType,
        vehicle_class_id: firstLine?.vehicleClassId,
        vehicle_id: firstLine?.vehicleId,
        start_datetime: `${wizardData.pickupDate}T${wizardData.pickupTime}:00`,
        end_datetime: `${wizardData.returnDate}T${wizardData.returnTime}:00`,
        pickup_location: wizardData.pickupLocation,
        return_location: wizardData.returnLocation,
        total_amount: wizardData.totalAmount,
        down_payment_amount: wizardData.downPaymentAmount,
        down_payment_status: 'paid',
        down_payment_method: wizardData.paymentMethod,
        down_payment_transaction_id: wizardData.transactionId,
        down_payment_paid_at: new Date().toISOString(),
        balance_due: wizardData.balanceDue,
        status: 'confirmed' as const,
        add_ons: wizardData.globalAddOns,
        make_model: firstLine?.vehicleData?.makeModel,
        special_requests: wizardData.notes,
      };

      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .insert([reservationData])
        .select()
        .single();

      if (reservationError) throw reservationError;

      // Record down payment
      await recordPayment({
        reservationId: reservation.id,
        amount: wizardData.downPaymentAmount,
        paymentType: 'down_payment',
        paymentMethod: wizardData.paymentMethod,
        transactionId: wizardData.transactionId,
        notes: wizardData.paymentNotes,
      });

      toast({
        title: 'Reservation Created Successfully!',
        description: `Reservation ${reservationNoData} has been confirmed.`,
      });

      // Reset wizard and navigate
      setTimeout(() => {
        resetWizard();
        navigate(`/reservations/${reservation.id}`);
      }, 2000);

    } catch (error: any) {
      console.error('Error creating reservation:', error);
      toast({
        title: 'Reservation Failed',
        description: error.message || 'Failed to create reservation',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const reservationTypeLabels = {
    vehicle_class: 'Vehicle Class',
    specific_vehicle: 'Specific Vehicle',
  } as const;

  const getReservationTypeIcon = () => {
    switch (wizardData.reservationType) {
      case 'vehicle_class':
        return <Package className="h-5 w-5" />;
      case 'specific_vehicle':
        return <Car className="h-5 w-5" />;
      default:
        return <Car className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-emerald-100 dark:bg-emerald-950">
            <CheckCircle className="h-16 w-16 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Reservation Confirmed!
          </h2>
          <p className="text-muted-foreground">
            The reservation has been successfully created and the down payment has
            been recorded
          </p>
        </div>
        <Badge className="text-lg px-4 py-2 bg-emerald-500 text-white">
          Reservation #RES-{new Date().getTime().toString().slice(-6)}
        </Badge>
      </div>

      {/* Reservation Summary */}
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </h3>
            <div className="space-y-2 ml-7">
              <p className="font-medium">{wizardData.customerData?.full_name}</p>
              <p className="text-sm text-muted-foreground">
                {wizardData.customerData?.email}
              </p>
              <p className="text-sm text-muted-foreground">
                {wizardData.customerData?.phone}
              </p>
            </div>
          </div>

          <Separator />

          {/* Reservation Details */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              {getReservationTypeIcon()}
              Reservation Details
            </h3>
            <div className="space-y-2 ml-7">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Type:</span>
                <Badge variant="outline">
                  {reservationTypeLabels[wizardData.reservationType!]}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Vehicle:</span>
                <span className="font-medium">
                  {wizardData.reservationType === 'vehicle_class' &&
                    wizardData.reservationLines[0]?.vehicleData?.name}
                  {wizardData.reservationType === 'specific_vehicle' &&
                    (wizardData.reservationLines[0]?.vehicleData?.makeModel || 
                     `${wizardData.reservationLines[0]?.vehicleData?.make} ${wizardData.reservationLines[0]?.vehicleData?.model}`)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dates & Locations */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Dates & Locations
            </h3>
            <div className="space-y-3 ml-7">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-emerald-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Pickup</p>
                  <p className="text-sm text-muted-foreground">
                    {wizardData.pickupDate && wizardData.pickupTime
                      ? format(
                          new Date(`${wizardData.pickupDate}T${wizardData.pickupTime}`),
                          'PPP p'
                        )
                      : 'Not specified'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {wizardData.pickupLocation || 'Not specified'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Return</p>
                  <p className="text-sm text-muted-foreground">
                    {wizardData.returnDate && wizardData.returnTime
                      ? format(
                          new Date(`${wizardData.returnDate}T${wizardData.returnTime}`),
                          'PPP p'
                        )
                      : 'Not specified'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {wizardData.returnLocation || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Financial Summary */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Summary
            </h3>
            <div className="space-y-2 ml-7">
              <div className="flex items-center justify-between">
                <span className="text-sm">Base Rate:</span>
                <span className="font-medium">
                  {formatCurrency(wizardData.baseRate)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Add-ons:</span>
                <span className="font-medium">
                  {formatCurrency(wizardData.addOnsTotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">VAT (5%):</span>
                <span className="font-medium">
                  {formatCurrency(wizardData.vatAmount)}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-primary">
                  {formatCurrency(wizardData.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Status */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Status
            </h3>
            <div className="space-y-3 ml-7">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                    Down Payment (Paid)
                  </span>
                  <Badge className="bg-emerald-500 text-white">PAID</Badge>
                </div>
                <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                  {formatCurrency(wizardData.downPaymentAmount)}
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                  Payment Method: {wizardData.paymentMethod}
                </p>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Balance Due at Pickup
                  </span>
                  <Badge className="bg-amber-500 text-white">PENDING</Badge>
                </div>
                <p className="text-xl font-bold text-amber-900 dark:text-amber-100">
                  {formatCurrency(wizardData.balanceDue)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="mr-2 h-4 w-4" />
              Email Customer
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Finalize Button */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              By clicking "Finalize Reservation", you confirm that all details are correct
              and the down payment has been collected.
            </p>
            <Button
              size="lg"
              className="w-full md:w-auto px-8"
              onClick={handleFinalizeReservation}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Reservation...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Finalize Reservation
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
