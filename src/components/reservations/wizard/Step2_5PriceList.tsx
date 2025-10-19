import React, { useEffect } from 'react';
import { useReservationWizard } from './ReservationWizardContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PriceListSelect } from '@/components/ui/select-components';
import { DollarSign, Clock, Calendar, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { usePricingContext, calculateLinePrice } from '@/hooks/usePricingContext';
import type { ReservationLine } from './ReservationWizardContext';

export const Step2_5PriceList: React.FC = () => {
  const { wizardData, updateWizardData } = useReservationWizard();

  // Simulate loading price list rates (in production, fetch from API)
  useEffect(() => {
    if (wizardData.priceListId) {
      // Mock data - replace with actual API call
      const mockRates = {
        'standard': { hourly: 50, daily: 150, weekly: 900, monthly: 3500, kmCharge: 0.5, dailyKm: 150 },
        'premium': { hourly: 75, daily: 200, weekly: 1200, monthly: 4500, kmCharge: 0.4, dailyKm: 200 },
        'luxury': { hourly: 120, daily: 350, weekly: 2100, monthly: 7500, kmCharge: 0.3, dailyKm: 250 },
        'corporate': { hourly: 45, daily: 130, weekly: 800, monthly: 3000, kmCharge: 0.6, dailyKm: 100 },
        'seasonal': { hourly: 40, daily: 120, weekly: 700, monthly: 2800, kmCharge: 0.5, dailyKm: 150 },
      };

      const rates = mockRates[wizardData.priceListId as keyof typeof mockRates] || mockRates.standard;
      
      console.log('💵 Price List Loaded:', {
        priceListId: wizardData.priceListId,
        rates,
        timestamp: new Date().toISOString(),
      });
      
      updateWizardData({
        hourlyRate: rates.hourly,
        dailyRate: rates.daily,
        weeklyRate: rates.weekly,
        monthlyRate: rates.monthly,
        kilometerCharge: rates.kmCharge,
        dailyKilometerAllowed: rates.dailyKm,
      });
    }
  }, [wizardData.priceListId]);

  // Check if we have valid rates
  const hasValidRates = 
    (wizardData.dailyRate && wizardData.dailyRate > 0) || 
    (wizardData.weeklyRate && wizardData.weeklyRate > 0) || 
    (wizardData.monthlyRate && wizardData.monthlyRate > 0);

  // Create pricing context for recalculation
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

  // Recalculate all reservation lines when rates change
  useEffect(() => {
    if (!hasValidRates || !wizardData.reservationLines || wizardData.reservationLines.length === 0) {
      return;
    }

    console.log('🔄 Recalculating line pricing after price list change...', {
      priceListId: wizardData.priceListId,
      lineCount: wizardData.reservationLines.length,
      rates: {
        hourly: wizardData.hourlyRate,
        daily: wizardData.dailyRate,
        weekly: wizardData.weeklyRate,
        monthly: wizardData.monthlyRate,
      },
    });

    const updatedLines = wizardData.reservationLines.map((line) => {
      const checkOutDate = new Date(`${line.checkOutDate}T${line.checkOutTime}`);
      const checkInDate = new Date(`${line.checkInDate}T${line.checkInTime}`);
      
      const { lineNetPrice } = calculateLinePrice(pricingContext, checkOutDate, checkInDate);
      
      // Calculate add-ons and driver fees
      const lineAddOns = Object.values(line.addOnPrices).reduce((sum, price) => sum + price, 0);
      const lineDriverFees = line.drivers.reduce((sum, driver) => sum + (driver.fee || 0), 0);
      
      const updatedLine: ReservationLine = {
        ...line,
        baseRate: lineNetPrice,
        lineNet: lineNetPrice + lineAddOns + lineDriverFees,
        taxValue: 0,
        lineTotal: lineNetPrice + lineAddOns + lineDriverFees,
      };

      console.log(`  ✓ Line ${line.lineNo} recalculated:`, {
        baseRate: lineNetPrice,
        addOns: lineAddOns,
        driverFees: lineDriverFees,
        lineTotal: updatedLine.lineTotal,
      });

      return updatedLine;
    });

    updateWizardData({ reservationLines: updatedLines });
  }, [
    wizardData.priceListId,
    wizardData.hourlyRate,
    wizardData.dailyRate,
    wizardData.weeklyRate,
    wizardData.monthlyRate,
    wizardData.kilometerCharge,
    wizardData.dailyKilometerAllowed,
    hasValidRates,
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Price List & Rates</h2>
        <p className="text-muted-foreground">
          Select a price list or customize rates for this reservation
        </p>
      </div>

      {/* Validation Alert */}
      {wizardData.priceListId && !hasValidRates && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>No valid rates configured.</strong> Please ensure at least one rate (daily, weekly, or monthly) is set before proceeding.
          </AlertDescription>
        </Alert>
      )}

      {wizardData.priceListId && hasValidRates && (
        <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-900 dark:text-green-100">
            <strong>Rates loaded successfully.</strong> Your pricing is configured and ready for line calculations.
            {wizardData.reservationLines && wizardData.reservationLines.length > 0 && (
              <span className="block mt-1">
                ✓ {wizardData.reservationLines.length} reservation line{wizardData.reservationLines.length > 1 ? 's' : ''} automatically recalculated with new rates.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Price List Selection
          </CardTitle>
          <CardDescription>
            Choose a pre-configured price list or enter custom rates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="priceList">
              Price List <span className="text-destructive">*</span>
            </Label>
            <PriceListSelect
              value={wizardData.priceListId}
              onChange={(value) => updateWizardData({ priceListId: value as string })}
            />
          </div>

          {wizardData.priceListId && (
            <>
              <div className="grid grid-cols-2 gap-4">
                {/* Hourly Rate */}
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Hourly Rate
                  </Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    value={wizardData.hourlyRate}
                    onChange={(e) => updateWizardData({ hourlyRate: parseFloat(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>

                {/* Daily Rate */}
                <div className="space-y-2">
                  <Label htmlFor="dailyRate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Daily Rate
                  </Label>
                  <Input
                    id="dailyRate"
                    type="number"
                    step="0.01"
                    value={wizardData.dailyRate}
                    onChange={(e) => updateWizardData({ dailyRate: parseFloat(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>

                {/* Weekly Rate */}
                <div className="space-y-2">
                  <Label htmlFor="weeklyRate">Weekly Rate</Label>
                  <Input
                    id="weeklyRate"
                    type="number"
                    step="0.01"
                    value={wizardData.weeklyRate}
                    onChange={(e) => updateWizardData({ weeklyRate: parseFloat(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>

                {/* Monthly Rate */}
                <div className="space-y-2">
                  <Label htmlFor="monthlyRate">Monthly Rate</Label>
                  <Input
                    id="monthlyRate"
                    type="number"
                    step="0.01"
                    value={wizardData.monthlyRate}
                    onChange={(e) => updateWizardData({ monthlyRate: parseFloat(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Kilometer Charge */}
                <div className="space-y-2">
                  <Label htmlFor="kmCharge" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Excess KM Charge
                  </Label>
                  <Input
                    id="kmCharge"
                    type="number"
                    step="0.01"
                    value={wizardData.kilometerCharge}
                    onChange={(e) => updateWizardData({ kilometerCharge: parseFloat(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>

                {/* Daily KM Allowance */}
                <div className="space-y-2">
                  <Label htmlFor="dailyKm">Daily KM Allowance</Label>
                  <Input
                    id="dailyKm"
                    type="number"
                    value={wizardData.dailyKilometerAllowed}
                    onChange={(e) => updateWizardData({ dailyKilometerAllowed: parseInt(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Rate Summary */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Rate Summary</h4>
                    {hasValidRates ? (
                      <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                        ✓ Valid
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                        ⚠ No Rates
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hourly:</span>
                      <span className="font-medium">{formatCurrency(wizardData.hourlyRate || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily:</span>
                      <span className="font-medium">{formatCurrency(wizardData.dailyRate || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weekly:</span>
                      <span className="font-medium">{formatCurrency(wizardData.weeklyRate || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly:</span>
                      <span className="font-medium">{formatCurrency(wizardData.monthlyRate || 0)}</span>
                    </div>
                    <div className="flex justify-between col-span-2">
                      <span className="text-muted-foreground">Daily KM Allowance:</span>
                      <span className="font-medium">{wizardData.dailyKilometerAllowed || 0} km</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
