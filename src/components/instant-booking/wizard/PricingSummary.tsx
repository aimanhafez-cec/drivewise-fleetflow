import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import type { BookingWizardData } from '@/pages/NewInstantBooking';

interface PricingSummaryProps {
  bookingData: BookingWizardData;
  onPricingCalculated: (pricing: any) => void;
}

const PricingSummary = ({ bookingData, onPricingCalculated }: PricingSummaryProps) => {
  useEffect(() => {
    // Calculate pricing
    const baseRate = 150; // Default daily rate
    const days = Math.ceil(
      (new Date(`${bookingData.returnDate}T${bookingData.returnTime}`).getTime() -
        new Date(`${bookingData.pickupDate}T${bookingData.pickupTime}`).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const baseAmount = baseRate * days;
    const addOnsTotal = Object.values(bookingData.addOnCharges).reduce((sum, val) => sum + val, 0);
    
    // One-way fee
    const oneWayFee = bookingData.pickupLocation !== bookingData.returnLocation ? 150 : 0;
    
    const subtotal = baseAmount + addOnsTotal + oneWayFee;
    const taxAmount = subtotal * 0.05; // 5% VAT
    const totalAmount = subtotal + taxAmount;
    
    // Down payment calculation (30% or minimum AED 500)
    const downPaymentPercentage = bookingData.customerType === 'Company' ? 0.25 : 0.30;
    const downPaymentRequired = Math.max(500, totalAmount * downPaymentPercentage);
    const balanceDue = totalAmount - downPaymentRequired;

    onPricingCalculated({
      baseAmount,
      addOnsTotal,
      oneWayFee,
      taxAmount,
      totalAmount,
      downPaymentRequired,
      balanceDue,
    });
  }, [bookingData, onPricingCalculated]);

  const days = Math.ceil(
    (new Date(`${bookingData.returnDate}T${bookingData.returnTime}`).getTime() -
      new Date(`${bookingData.pickupDate}T${bookingData.pickupTime}`).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const pricing = bookingData.pricing;

  if (!pricing) {
    return <div>Calculating pricing...</div>;
  }

  // Mock auto-approval check
  const autoApproved = pricing.totalAmount <= 5000;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Pricing Summary</h2>
        <p className="text-muted-foreground">
          Review the complete pricing breakdown for this booking
        </p>
      </div>

      {/* Auto-Approval Status */}
      <Card className={`${autoApproved ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {autoApproved ? (
              <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h4 className={`font-semibold ${autoApproved ? 'text-emerald-800' : 'text-amber-800'}`}>
                {autoApproved ? 'Auto-Approved' : 'Manual Approval Required'}
              </h4>
              <p className={`text-sm ${autoApproved ? 'text-emerald-600' : 'text-amber-600'}`}>
                {autoApproved
                  ? 'This booking is within instant booking limits'
                  : 'Booking exceeds auto-approval threshold. Manager approval may be required.'}
              </p>
            </div>
            <Zap className={`h-5 w-5 ${autoApproved ? 'text-emerald-600' : 'text-amber-600'} flex-shrink-0`} />
          </div>
        </CardContent>
      </Card>

      {/* Pricing Breakdown */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-lg text-foreground">Rental Cost</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Base Rate (AED 150/day × {days} day{days !== 1 ? 's' : ''})
              </span>
              <span className="font-medium">AED {pricing.baseAmount.toFixed(2)}</span>
            </div>

            {pricing.addOnsTotal > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Add-ons:</p>
                  {Object.entries(bookingData.addOnCharges).map(([id, amount]) => (
                    <div key={id} className="flex justify-between text-sm pl-4">
                      <span className="text-muted-foreground capitalize">
                        {id.replace(/_/g, ' ')}
                      </span>
                      <span className="font-medium">AED {amount.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-foreground">Subtotal Add-ons:</span>
                    <span>AED {pricing.addOnsTotal.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}

            {pricing.oneWayFee && pricing.oneWayFee > 0 && (
              <>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">One-way Fee</span>
                  <span className="font-medium">AED {pricing.oneWayFee.toFixed(2)}</span>
                </div>
              </>
            )}

            <Separator />
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">VAT (5%)</span>
              <span className="font-medium">AED {pricing.taxAmount.toFixed(2)}</span>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between text-lg font-bold">
              <span className="text-foreground">Total Amount</span>
              <span className="text-primary">AED {pricing.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Breakdown */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-lg text-foreground">Payment Breakdown</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-foreground">Down Payment Required</p>
                <p className="text-xs text-muted-foreground">
                  {bookingData.customerType === 'Company' ? '25%' : '30%'} of total (Min. AED 500)
                </p>
              </div>
              <Badge className="bg-amber-600 text-white text-lg px-4 py-2">
                AED {pricing.downPaymentRequired.toFixed(2)}
              </Badge>
            </div>

            <Separator />

            <div className="flex justify-between items-center text-sm">
              <p className="text-muted-foreground">Balance Due at Pickup</p>
              <span className="font-semibold text-foreground">
                AED {pricing.balanceDue.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Details */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Daily Rate</p>
            <p className="text-2xl font-bold text-foreground">AED 150</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Duration</p>
            <p className="text-2xl font-bold text-foreground">{days} Days</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PricingSummary;
