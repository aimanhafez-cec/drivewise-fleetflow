import React, { useEffect } from 'react';
import { useReservationWizard } from './ReservationWizardContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Clock, Calendar, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';

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
      };

      const rates = mockRates[wizardData.priceListId as keyof typeof mockRates] || mockRates.standard;
      
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Price List & Rates</h2>
        <p className="text-muted-foreground">
          Select a price list or customize rates for this reservation
        </p>
      </div>

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
            <Select
              value={wizardData.priceListId}
              onValueChange={(value) => updateWizardData({ priceListId: value })}
            >
              <SelectTrigger id="priceList">
                <SelectValue placeholder="Select price list" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard Rates</SelectItem>
                <SelectItem value="premium">Premium Rates</SelectItem>
                <SelectItem value="luxury">Luxury Rates</SelectItem>
                <SelectItem value="corporate">Corporate Discount</SelectItem>
                <SelectItem value="seasonal">Seasonal Special</SelectItem>
              </SelectContent>
            </Select>
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
                  <h4 className="font-semibold mb-2">Rate Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily:</span>
                      <span className="font-medium">{formatCurrency(wizardData.dailyRate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">KM/day:</span>
                      <span className="font-medium">{wizardData.dailyKilometerAllowed} km</span>
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
