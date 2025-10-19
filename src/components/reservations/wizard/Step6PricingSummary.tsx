import React, { useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { DollarSign, CreditCard, AlertCircle, Car, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { useReservationWizard } from './ReservationWizardContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePricingContext, calculateLinePrice } from '@/hooks/usePricingContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const Step6PricingSummary: React.FC = () => {
  const { wizardData, updateWizardData } = useReservationWizard();

  // Create pricing context from wizard data
  const pricingContext = usePricingContext({
    priceListId: wizardData.priceListId,
    promotionCode: '',
    hourlyRate: wizardData.hourlyRate,
    dailyRate: wizardData.dailyRate,
    weeklyRate: wizardData.weeklyRate,
    monthlyRate: wizardData.monthlyRate,
    kilometerCharge: wizardData.kilometerCharge,
    dailyKilometerAllowed: wizardData.dailyKilometerAllowed,
  });

  // Calculate detailed pricing for all lines
  const detailedPricing = useMemo(() => {
    let totalBaseRate = 0;
    let totalAddOns = 0;
    let totalDriverFees = 0;

    const lineDetails = wizardData.reservationLines.map((line) => {
      // Calculate base rate for this line using pricing context
      const checkOutDate = new Date(`${line.checkOutDate}T${line.checkOutTime}`);
      const checkInDate = new Date(`${line.checkInDate}T${line.checkInTime}`);
      
      const { lineNetPrice } = calculateLinePrice(
        pricingContext,
        checkOutDate,
        checkInDate
      );

      // Calculate add-ons for this line
      const lineAddOns = Object.values(line.addOnPrices).reduce(
        (sum, price) => sum + price,
        0
      );

      // Calculate driver fees for this line
      const lineDriverFees = line.drivers.reduce(
        (sum, driver) => sum + (driver.fee || 0),
        0
      );

      totalBaseRate += lineNetPrice;
      totalAddOns += lineAddOns;
      totalDriverFees += lineDriverFees;

      return {
        lineNo: line.lineNo,
        vehicleDisplay: line.vehicleData?.make && line.vehicleData?.model 
          ? `${line.vehicleData.make} ${line.vehicleData.model}`
          : 'Vehicle Class',
        baseRate: lineNetPrice,
        addOns: lineAddOns,
        driverFees: lineDriverFees,
        lineTotal: lineNetPrice + lineAddOns + lineDriverFees,
      };
    });

    // Calculate global add-ons
    const globalAddOnsTotal = Object.values(wizardData.globalAddOnPrices).reduce(
      (sum, price) => sum + (price as number),
      0
    );

    // Pre-subtotal
    const preSubtotal = totalBaseRate + totalAddOns + totalDriverFees + globalAddOnsTotal;

    // Apply discount if any
    const discountAmount = wizardData.discountValue || 0;

    // Subtotal after discount
    const subtotal = preSubtotal - discountAmount;

    // VAT (5% in UAE)
    const vatAmount = subtotal * 0.05;

    // Grand Total
    const grandTotal = subtotal + vatAmount;

    // Down payment (30% of grand total)
    const downPaymentAmount = grandTotal * 0.3;

    // Balance due
    const balanceDue = grandTotal - downPaymentAmount;

    return {
      lineDetails,
      totalBaseRate,
      totalAddOns,
      totalDriverFees,
      globalAddOnsTotal,
      preSubtotal,
      discountAmount,
      subtotal,
      vatAmount,
      grandTotal,
      downPaymentAmount,
      balanceDue,
    };
  }, [
    wizardData.reservationLines,
    wizardData.globalAddOnPrices,
    wizardData.discountValue,
    pricingContext,
  ]);

  // Update wizard data with calculated pricing
  useEffect(() => {
    updateWizardData({
      baseRate: detailedPricing.totalBaseRate,
      addOnsTotal: detailedPricing.totalAddOns + detailedPricing.globalAddOnsTotal,
      driverFeesTotal: detailedPricing.totalDriverFees,
      subtotal: detailedPricing.subtotal,
      vatAmount: detailedPricing.vatAmount,
      totalAmount: detailedPricing.grandTotal,
      downPaymentAmount: detailedPricing.downPaymentAmount,
      balanceDue: detailedPricing.balanceDue,
    });
  }, [detailedPricing, updateWizardData]);

  // Update each reservation line with its calculated pricing
  useEffect(() => {
    const updatedLines = wizardData.reservationLines.map((line) => {
      const lineDetail = detailedPricing.lineDetails.find(ld => ld.lineNo === line.lineNo);
      if (!lineDetail) return line;
      
      // Only update if values have changed to avoid infinite loops
      const needsUpdate = 
        line.baseRate !== lineDetail.baseRate ||
        line.lineNet !== lineDetail.lineTotal ||
        line.lineTotal !== lineDetail.lineTotal;
      
      if (!needsUpdate) return line;
      
      return {
        ...line,
        baseRate: lineDetail.baseRate,
        lineNet: lineDetail.lineTotal,
        taxValue: 0, // VAT calculated at total level, not per line
        lineTotal: lineDetail.lineTotal,
      };
    });
    
    // Only update if at least one line changed
    const hasChanges = updatedLines.some((line, idx) => 
      line !== wizardData.reservationLines[idx]
    );
    
    if (hasChanges) {
      updateWizardData({ reservationLines: updatedLines });
    }
  }, [detailedPricing.lineDetails, wizardData.reservationLines, updateWizardData]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Pricing Summary</h2>
        <p className="text-muted-foreground">
          Detailed breakdown of all reservation lines and charges
        </p>
      </div>

      {/* Validation: Check for lines with zero pricing */}
      {wizardData.reservationLines.some(line => !line.lineTotal || line.lineTotal <= 0) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Pricing Issue Detected:</strong> Some reservation lines have zero or missing pricing.
            Please go back to Step 6 and ensure a valid price list with rates is selected.
          </AlertDescription>
        </Alert>
      )}

      {/* Line-by-Line Breakdown */}
      {detailedPricing.lineDetails.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Reservation Lines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Line</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead className="text-right">Base Rate</TableHead>
                  <TableHead className="text-right">Add-ons</TableHead>
                  <TableHead className="text-right">Driver Fees</TableHead>
                  <TableHead className="text-right">Line Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailedPricing.lineDetails.map((line) => (
                  <TableRow key={line.lineNo}>
                    <TableCell className="font-medium">#{line.lineNo}</TableCell>
                    <TableCell>{line.vehicleDisplay}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(line.baseRate)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(line.addOns)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(line.driverFees)}
                    </TableCell>
                    <TableCell className="text-right font-semibold font-mono">
                      {formatCurrency(line.lineTotal)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pricing Breakdown */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cost Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Base Rates */}
          <div className="flex items-center justify-between">
            <span className="text-sm">Total Base Rates (All Lines)</span>
            <span className="font-semibold font-mono">
              {formatCurrency(detailedPricing.totalBaseRate)}
            </span>
          </div>

          {/* Line Add-ons */}
          {detailedPricing.totalAddOns > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm">Line-specific Add-ons</span>
              <span className="font-semibold font-mono">
                {formatCurrency(detailedPricing.totalAddOns)}
              </span>
            </div>
          )}

          {/* Driver Fees */}
          {detailedPricing.totalDriverFees > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm">Additional Driver Fees</span>
              <span className="font-semibold font-mono">
                {formatCurrency(detailedPricing.totalDriverFees)}
              </span>
            </div>
          )}

          {/* Global Add-ons */}
          {detailedPricing.globalAddOnsTotal > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Global Add-ons & Services
                </p>
                {Object.entries(wizardData.globalAddOnPrices).map(([addOnId, price]) => (
                  <div
                    key={addOnId}
                    className="flex items-center justify-between text-sm ml-4 mb-1"
                  >
                    <span className="text-muted-foreground">{addOnId}</span>
                    <span className="font-mono">{formatCurrency(price as number)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-sm font-medium mt-2">
                  <span>Global Add-ons Total</span>
                  <span className="font-mono">
                    {formatCurrency(detailedPricing.globalAddOnsTotal)}
                  </span>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Pre-Subtotal */}
          <div className="flex items-center justify-between font-medium">
            <span>Pre-Subtotal</span>
            <span className="font-mono">{formatCurrency(detailedPricing.preSubtotal)}</span>
          </div>

          {/* Discount */}
          {detailedPricing.discountAmount > 0 && (
            <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
              <span>Discount</span>
              <span className="font-mono">
                -{formatCurrency(detailedPricing.discountAmount)}
              </span>
            </div>
          )}

          {/* Subtotal */}
          <div className="flex items-center justify-between font-medium">
            <span>Subtotal</span>
            <span className="font-mono">{formatCurrency(detailedPricing.subtotal)}</span>
          </div>

          {/* VAT */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">VAT (5%)</span>
            <span className="font-mono">{formatCurrency(detailedPricing.vatAmount)}</span>
          </div>

          <Separator className="border-t-2" />

          {/* Grand Total */}
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Grand Total</span>
            <span className="text-primary font-mono">
              {formatCurrency(detailedPricing.grandTotal)}
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
            <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 font-mono">
              {formatCurrency(detailedPricing.downPaymentAmount)}
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
            <span className="text-xl font-bold font-mono">
              {formatCurrency(detailedPricing.balanceDue)}
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
          arrives to collect the vehicle. All pricing is calculated using the selected
          price list rates.
        </AlertDescription>
      </Alert>
    </div>
  );
};
