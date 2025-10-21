import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import type { EnhancedWizardData } from '@/types/agreement-wizard';

interface PricingConfigurationStepProps {
  data: EnhancedWizardData['step3'];
  onChange: (field: keyof EnhancedWizardData['step3'], value: any) => void;
  errors?: string[];
}

export const PricingConfigurationStep: React.FC<PricingConfigurationStepProps> = ({
  data,
  onChange,
  errors = [],
}) => {
  // Calculate pricing breakdown
  useEffect(() => {
    const baseRate = data.rateOverride ? data.rateOverride.amount : data.baseRate;
    const insurance = data.insurancePackage === 'comprehensive' ? 50 : 25; // Example rates
    const maintenance = data.maintenanceIncluded ? (data.maintenanceCost || 0) : 0;
    const addons = 0; // Will be calculated from step 4
    const subtotal = baseRate + insurance + maintenance + addons;
    const discount = data.discountAmount || 0;
    const taxableAmount = subtotal - discount;
    const vat = taxableAmount * 0.05; // 5% VAT
    const total = taxableAmount + vat;

    onChange('pricingBreakdown', {
      baseRate,
      insurance,
      maintenance,
      addons,
      subtotal,
      discount,
      taxableAmount,
      vat,
      total,
    });
  }, [
    data.baseRate,
    data.rateOverride,
    data.insurancePackage,
    data.maintenanceIncluded,
    data.maintenanceCost,
    data.discountAmount,
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Base Rate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseRate">System Rate (AED/day)</Label>
              <Input
                id="baseRate"
                type="number"
                step="0.01"
                value={data.baseRate}
                onChange={(e) => onChange('baseRate', parseFloat(e.target.value))}
                disabled
              />
              <p className="text-xs text-muted-foreground">Calculated from price list</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rateOverride">Override Rate (AED/day)</Label>
              <Input
                id="rateOverride"
                type="number"
                step="0.01"
                value={data.rateOverride?.amount || ''}
                onChange={(e) => {
                  const amount = e.target.value ? parseFloat(e.target.value) : undefined;
                  onChange('rateOverride', amount ? { amount, reason: data.rateOverride?.reason || '' } : undefined);
                }}
              />
              <p className="text-xs text-muted-foreground">Leave empty to use system rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Insurance Coverage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="insurancePackage" className="required">
                Insurance Package *
              </Label>
              <Select
                value={data.insurancePackage}
                onValueChange={(value) => onChange('insurancePackage', value)}
              >
                <SelectTrigger id="insurancePackage" aria-required="true">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Comprehensive (CDW)</SelectItem>
                  <SelectItem value="tpl">Third Party Liability (TPL)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excessAmount">Excess Amount (AED)</Label>
              <Input
                id="excessAmount"
                type="number"
                step="0.01"
                value={data.excessAmount}
                onChange={(e) => onChange('excessAmount', parseFloat(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="maintenanceIncluded"
              checked={data.maintenanceIncluded}
              onCheckedChange={(checked) => onChange('maintenanceIncluded', checked)}
            />
            <Label htmlFor="maintenanceIncluded">Include Maintenance Package</Label>
          </div>

          {data.maintenanceIncluded && (
            <div className="space-y-2">
              <Label htmlFor="maintenanceCost">Maintenance Cost (AED/day)</Label>
              <Input
                id="maintenanceCost"
                type="number"
                step="0.01"
                value={data.maintenanceCost || ''}
                onChange={(e) =>
                  onChange('maintenanceCost', e.target.value ? parseFloat(e.target.value) : undefined)
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Discounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountCode">Discount Code</Label>
              <Input
                id="discountCode"
                value={data.discountCode || ''}
                onChange={(e) => onChange('discountCode', e.target.value)}
                placeholder="Enter discount code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountAmount">Discount Amount (AED)</Label>
              <Input
                id="discountAmount"
                type="number"
                step="0.01"
                value={data.discountAmount || ''}
                onChange={(e) =>
                  onChange('discountAmount', e.target.value ? parseFloat(e.target.value) : undefined)
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountReason">Discount Reason</Label>
            <Input
              id="discountReason"
              value={data.discountReason || ''}
              onChange={(e) => onChange('discountReason', e.target.value)}
              placeholder="Reason for discount"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary">
        <CardHeader>
          <CardTitle>Pricing Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Base Rate:</span>
            <span className="font-medium">AED {data.pricingBreakdown.baseRate.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Insurance:</span>
            <span className="font-medium">AED {data.pricingBreakdown.insurance.toFixed(2)}</span>
          </div>
          {data.maintenanceIncluded && (
            <div className="flex justify-between text-sm">
              <span>Maintenance:</span>
              <span className="font-medium">AED {data.pricingBreakdown.maintenance.toFixed(2)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span className="font-medium">AED {data.pricingBreakdown.subtotal.toFixed(2)}</span>
          </div>
          {data.discountAmount && data.discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount:</span>
              <span className="font-medium">-AED {data.pricingBreakdown.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>VAT (5%):</span>
            <span className="font-medium">AED {data.pricingBreakdown.vat.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-primary">AED {data.pricingBreakdown.total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <div className="text-sm text-destructive">
          {errors.map((error, i) => (
            <div key={i}>{error}</div>
          ))}
        </div>
      )}
    </div>
  );
};
