import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  PriceListSelect,
  InsuranceLevelSelect,
  InsuranceGroupSelect,
  InsuranceProviderSelect,
  DiscountTypeSelect
} from '@/components/ui/select-components';
import { DollarSign, Shield, Percent, Info } from 'lucide-react';
import type { EnhancedWizardData } from '@/types/agreement-wizard';

interface EnhancedPricingStepProps {
  data: EnhancedWizardData['step3'] & {
    priceListId?: string;
    insuranceLevelId?: string;
    insuranceGroupId?: string;
    insuranceProviderId?: string;
    discountTypeId?: string;
  };
  onChange: (field: string, value: any) => void;
  errors?: string[];
}

export const EnhancedPricingStep: React.FC<EnhancedPricingStepProps> = ({
  data,
  onChange,
  errors = [],
}) => {
  // Calculate pricing breakdown
  useEffect(() => {
    const baseRate = data.rateOverride ? data.rateOverride.amount : data.baseRate;
    const insurance = data.insurancePackage === 'comprehensive' ? 50 : 25;
    const maintenance = data.maintenanceIncluded ? (data.maintenanceCost || 0) : 0;
    const addons = 0;
    const subtotal = baseRate + insurance + maintenance + addons;
    const discount = data.discountAmount || 0;
    const taxableAmount = subtotal - discount;
    const vat = taxableAmount * 0.05; // 5% VAT in UAE
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
      <div>
        <h2 className="text-2xl font-bold mb-2">Pricing Configuration</h2>
        <p className="text-muted-foreground">
          Configure rates, insurance, and discounts for this agreement
        </p>
      </div>

      {/* Price List Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Price List & Base Rate
          </CardTitle>
          <CardDescription>
            Select a price list or manually configure rates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="priceListId">Price List</Label>
            <PriceListSelect
              value={data.priceListId}
              onChange={(value) => onChange('priceListId', value as string)}
            />
            <p className="text-xs text-muted-foreground">
              Select a predefined price list for automatic rate calculation
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseRate">System Rate (AED/day)</Label>
              <Input
                id="baseRate"
                type="number"
                step="0.01"
                value={data.baseRate}
                onChange={(e) => onChange('baseRate', parseFloat(e.target.value) || 0)}
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

          {data.rateOverride && (
            <div className="space-y-2">
              <Label htmlFor="overrideReason">Override Reason</Label>
              <Input
                id="overrideReason"
                value={data.rateOverride.reason || ''}
                onChange={(e) =>
                  onChange('rateOverride', { ...data.rateOverride, reason: e.target.value })
                }
                placeholder="Reason for rate override"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insurance Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Insurance Coverage
          </CardTitle>
          <CardDescription>
            Configure insurance level, group, and provider
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              UAE law requires minimum Third Party Liability insurance. Comprehensive coverage recommended for optimal protection.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="insuranceLevelId">
              Insurance Level <span className="text-destructive">*</span>
            </Label>
            <InsuranceLevelSelect
              value={data.insuranceLevelId}
              onChange={(value) => onChange('insuranceLevelId', value as string)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="insuranceGroupId">Insurance Group</Label>
            <InsuranceGroupSelect
              value={data.insuranceGroupId}
              onChange={(value) => onChange('insuranceGroupId', value as string)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="insuranceProviderId">
              Insurance Provider <span className="text-destructive">*</span>
            </Label>
            <InsuranceProviderSelect
              value={data.insuranceProviderId}
              onChange={(value) => onChange('insuranceProviderId', value as string)}
            />
            <p className="text-xs text-muted-foreground">
              Select the insurance company providing coverage
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="insurancePackage">
                Coverage Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={data.insurancePackage}
                onValueChange={(value) => onChange('insurancePackage', value)}
              >
                <SelectTrigger id="insurancePackage" aria-required="true">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Comprehensive (CDW) - Full Coverage</SelectItem>
                  <SelectItem value="tpl">Third Party Liability (TPL) - Basic</SelectItem>
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
                onChange={(e) => onChange('excessAmount', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Customer's liability in case of damage
              </p>
            </div>
          </div>

          {data.insurancePackage === 'comprehensive' && (
            <div className="space-y-2">
              <Label>Additional Coverages</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="coverage-theft"
                    className="rounded"
                    checked={data.additionalCoverages?.includes('theft') || false}
                    onChange={(e) => {
                      const coverages = data.additionalCoverages || [];
                      if (e.target.checked) {
                        onChange('additionalCoverages', [...coverages, 'theft']);
                      } else {
                        onChange('additionalCoverages', coverages.filter(c => c !== 'theft'));
                      }
                    }}
                  />
                  <Label htmlFor="coverage-theft" className="font-normal cursor-pointer">
                    Theft Protection
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="coverage-pai"
                    className="rounded"
                    checked={data.additionalCoverages?.includes('personal_accident') || false}
                    onChange={(e) => {
                      const coverages = data.additionalCoverages || [];
                      if (e.target.checked) {
                        onChange('additionalCoverages', [...coverages, 'personal_accident']);
                      } else {
                        onChange('additionalCoverages', coverages.filter(c => c !== 'personal_accident'));
                      }
                    }}
                  />
                  <Label htmlFor="coverage-pai" className="font-normal cursor-pointer">
                    Personal Accident Insurance (PAI)
                  </Label>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Package</CardTitle>
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
              <p className="text-xs text-muted-foreground">
                Includes regular maintenance and servicing
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Discounts & Promotions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="discountTypeId">Discount Type</Label>
            <DiscountTypeSelect
              value={data.discountTypeId}
              onChange={(value) => onChange('discountTypeId', value as string)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountCode">Discount Code</Label>
              <Input
                id="discountCode"
                value={data.discountCode || ''}
                onChange={(e) => onChange('discountCode', e.target.value)}
                placeholder="Enter promo code"
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
              placeholder="Reason for applying discount"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      <Card className="border-primary bg-primary/5">
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
          <Separator className="my-2" />
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-primary">AED {data.pricingBreakdown.total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            {errors.map((error, i) => (
              <div key={i}>{error}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
