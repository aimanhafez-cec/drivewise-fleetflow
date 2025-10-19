import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, CreditCard, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { useReservationWizard } from './ReservationWizardContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const Step6PricingSummary: React.FC = () => {
  const { wizardData, updateWizardData } = useReservationWizard();

  // Calculate pricing
  useEffect(() => {
    // Calculate rental duration
    const pickup = new Date(`${wizardData.pickupDate}T${wizardData.pickupTime}`);
    const returnDate = new Date(`${wizardData.returnDate}T${wizardData.returnTime}`);
    const durationMs = returnDate.getTime() - pickup.getTime();
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

    // Base rate calculation (simplified - in production, fetch from price lists)
    // For demo: AED 150/day base rate
    const baseRate = durationDays * 150;

    // Add-ons total
    const addOnsTotal = Object.values(wizardData.addOnPrices).reduce(
      (sum, price) => sum + price,
      0
    );

    // Subtotal
    const subtotal = baseRate + addOnsTotal;

    // VAT (5% in UAE)
    const vatAmount = subtotal * 0.05;

    // Total
    const totalAmount = subtotal + vatAmount;

    // Down payment (30% of total)
    const downPaymentAmount = totalAmount * 0.3;

    // Balance due
    const balanceDue = totalAmount - downPaymentAmount;

    updateWizardData({
      baseRate,
      addOnsTotal,
      subtotal,
      vatAmount,
      totalAmount,
      downPaymentAmount,
      balanceDue,
    });
  }, [
    wizardData.pickupDate,
    wizardData.pickupTime,
    wizardData.returnDate,
    wizardData.returnTime,
    wizardData.addOnPrices,
  ]);

  const durationDays = Math.ceil(
    (new Date(`${wizardData.returnDate}T${wizardData.returnTime}`).getTime() -
      new Date(`${wizardData.pickupDate}T${wizardData.pickupTime}`).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Pricing Summary</h2>
        <p className="text-muted-foreground">
          Review the total cost and payment breakdown
        </p>
      </div>

      {/* Pricing Breakdown */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cost Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Rental Period */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Base Rental ({durationDays} day{durationDays !== 1 ? 's' : ''})
              </span>
            </div>
            <span className="font-semibold">
              {formatCurrency(wizardData.baseRate)}
            </span>
          </div>

          {/* Add-ons */}
          {wizardData.selectedAddOns.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">Add-ons & Services</p>
                {Object.entries(wizardData.addOnPrices).map(([addOnId, price]) => (
                  <div
                    key={addOnId}
                    className="flex items-center justify-between text-sm ml-4 mb-1"
                  >
                    <span className="text-muted-foreground">{addOnId}</span>
                    <span>{formatCurrency(price)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-sm font-medium mt-2">
                  <span>Add-ons Total</span>
                  <span>{formatCurrency(wizardData.addOnsTotal)}</span>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Subtotal */}
          <div className="flex items-center justify-between font-medium">
            <span>Subtotal</span>
            <span>{formatCurrency(wizardData.subtotal)}</span>
          </div>

          {/* VAT */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">VAT (5%)</span>
            <span>{formatCurrency(wizardData.vatAmount)}</span>
          </div>

          <Separator className="border-t-2" />

          {/* Total */}
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Grand Total</span>
            <span className="text-primary">
              {formatCurrency(wizardData.totalAmount)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Breakdown */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
            <CreditCard className="h-5 w-5" />
            Payment Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Down Payment - HIGHLIGHTED */}
          <div className="p-4 bg-white/80 dark:bg-black/20 rounded-lg border-2 border-amber-300 dark:border-amber-700">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Down Payment (30%)
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Required to secure reservation
                </p>
              </div>
              <Badge className="bg-amber-500 text-white px-3 py-1">
                REQUIRED
              </Badge>
            </div>
            <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
              {formatCurrency(wizardData.downPaymentAmount)}
            </p>
          </div>

          {/* Balance Due */}
          <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/10 rounded-lg">
            <div>
              <p className="text-sm font-medium">Balance Due at Pickup</p>
              <p className="text-xs text-muted-foreground">
                Payable when collecting the vehicle
              </p>
            </div>
            <span className="text-xl font-bold">
              {formatCurrency(wizardData.balanceDue)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Important Note */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> The down payment is mandatory to confirm this
          reservation. The remaining balance will be collected when the customer
          arrives to collect the vehicle.
        </AlertDescription>
      </Alert>
    </div>
  );
};
