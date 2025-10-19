import React from 'react';
import { useReservationWizard } from './ReservationWizardContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { TaxLevelSelect, TaxCodeSelect, DiscountTypeSelect } from '@/components/ui/select-components';
import { Receipt, DollarSign, Calendar, Percent } from 'lucide-react';

export const Step5_7BillingConfig: React.FC = () => {
  const { wizardData, updateWizardData } = useReservationWizard();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Billing Configuration</h2>
        <p className="text-muted-foreground">
          Configure billing details, tax settings, and discounts
        </p>
      </div>

      {/* Bill-To Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Bill-To Information
          </CardTitle>
          <CardDescription>
            Select who will be billed for this reservation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="billToType">
              Bill To <span className="text-destructive">*</span>
            </Label>
            <Select
              value={wizardData.billToType}
              onValueChange={(value: any) => updateWizardData({ billToType: value })}
            >
              <SelectTrigger id="billToType">
                <SelectValue placeholder="Select billing entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CUSTOMER">Customer (Direct)</SelectItem>
                <SelectItem value="CORPORATE">Corporate Account</SelectItem>
                <SelectItem value="INSURANCE">Insurance Company</SelectItem>
                <SelectItem value="AGENCY">Travel Agency</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {wizardData.billToType === 'CORPORATE' && (
            <div className="space-y-2">
              <Label htmlFor="poNumber">Purchase Order Number</Label>
              <Input
                id="poNumber"
                placeholder="Enter PO number"
                value={wizardData.billToMeta?.po_ref || ''}
                onChange={(e) => updateWizardData({ 
                  billToMeta: { ...wizardData.billToMeta, po_ref: e.target.value }
                })}
              />
            </div>
          )}

          {wizardData.billToType === 'INSURANCE' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="claimNo">Claim Number</Label>
                <Input
                  id="claimNo"
                  placeholder="Enter claim number"
                  value={wizardData.billToMeta?.claim_no || ''}
                  onChange={(e) => updateWizardData({ 
                    billToMeta: { ...wizardData.billToMeta, claim_no: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="policyNo">Policy Number</Label>
                <Input
                  id="policyNo"
                  placeholder="Enter policy number"
                  value={wizardData.billToMeta?.policy_no || ''}
                  onChange={(e) => updateWizardData({ 
                    billToMeta: { ...wizardData.billToMeta, policy_no: e.target.value }
                  })}
                />
              </div>
            </>
          )}

          {wizardData.billToType === 'AGENCY' && (
            <div className="space-y-2">
              <Label htmlFor="voucherRef">Voucher Reference</Label>
              <Input
                id="voucherRef"
                placeholder="Enter voucher reference"
                value={wizardData.billToMeta?.voucher_ref || ''}
                onChange={(e) => updateWizardData({ 
                  billToMeta: { ...wizardData.billToMeta, voucher_ref: e.target.value }
                })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tax Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Tax Settings
          </CardTitle>
          <CardDescription>
            Configure tax level and tax code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Tax Level */}
            <div className="space-y-2">
              <Label htmlFor="taxLevel">
                Tax Level <span className="text-destructive">*</span>
              </Label>
              <TaxLevelSelect
                value={wizardData.taxLevelId}
                onChange={(value) => updateWizardData({ taxLevelId: value as string })}
              />
            </div>

            {/* Tax Code */}
            <div className="space-y-2">
              <Label htmlFor="taxCode">
                Tax Code <span className="text-destructive">*</span>
              </Label>
              <TaxCodeSelect
                value={wizardData.taxCodeId}
                onChange={(value) => updateWizardData({ taxCodeId: value as string })}
                taxLevelId={wizardData.taxLevelId}
                disabled={!wizardData.taxLevelId}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Discount & Validity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Discount & Validity
          </CardTitle>
          <CardDescription>
            Configure discounts and reservation validity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Discount Type */}
            <div className="space-y-2">
              <Label htmlFor="discountType">Discount Type</Label>
              <DiscountTypeSelect
                value={wizardData.discountTypeId}
                onChange={(value) => updateWizardData({ discountTypeId: value as string })}
              />
            </div>

            {/* Discount Value */}
            <div className="space-y-2">
              <Label htmlFor="discountValue">Discount Value</Label>
              <Input
                id="discountValue"
                type="number"
                step="0.01"
                value={wizardData.discountValue}
                onChange={(e) => updateWizardData({ discountValue: parseFloat(e.target.value) })}
                placeholder="0.00"
                disabled={!wizardData.discountTypeId}
              />
            </div>
          </div>

          {/* Validity Date */}
          <div className="space-y-2">
            <Label htmlFor="validityDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Validity Date To
            </Label>
            <Input
              id="validityDate"
              type="date"
              value={wizardData.validityDateTo || ''}
              onChange={(e) => updateWizardData({ validityDateTo: e.target.value })}
            />
          </div>

          {/* Lease to Own */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="leaseToOwn" className="text-base font-semibold">
                Lease to Own Option
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable lease-to-own program for this reservation
              </p>
            </div>
            <Switch
              id="leaseToOwn"
              checked={wizardData.leaseToOwn}
              onCheckedChange={(checked) => updateWizardData({ leaseToOwn: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
