import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TaxLevelSelect, TaxCodeSelect } from '@/components/ui/select-components';
import { PaymentProcessor } from '@/components/agreements/shared/PaymentProcessor';
import { Receipt, FileText, Info } from 'lucide-react';
import type { EnhancedWizardData } from '@/types/agreement-wizard';

interface EnhancedBillingStepProps {
  data: EnhancedWizardData['step5'] & {
    taxLevelId?: string;
    taxCodeId?: string;
    billToType?: string;
    purchaseOrderNo?: string;
    claimNo?: string;
    policyNo?: string;
    voucherReference?: string;
  };
  totalAmount: number;
  onChange: (field: string, value: any) => void;
  errors?: string[];
}

export const EnhancedBillingStep: React.FC<EnhancedBillingStepProps> = ({
  data,
  totalAmount,
  onChange,
  errors = [],
}) => {
  const handlePaymentDataChange = (paymentData: Partial<EnhancedWizardData['step5']>) => {
    Object.entries(paymentData).forEach(([key, value]) => {
      onChange(key as keyof EnhancedWizardData['step5'], value);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Billing & Payment</h2>
        <p className="text-muted-foreground">
          Configure billing, tax settings, and process payment
        </p>
      </div>

      {/* Bill-To Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bill-To Information
          </CardTitle>
          <CardDescription>
            Select who will be billed for this agreement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="billToType">
              Bill To <span className="text-destructive">*</span>
            </Label>
            <Select
              value={data.billToType || 'customer'}
              onValueChange={(value) => onChange('billToType', value)}
            >
              <SelectTrigger id="billToType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer (Individual)</SelectItem>
                <SelectItem value="corporate">Corporate Account</SelectItem>
                <SelectItem value="insurance">Insurance Company</SelectItem>
                <SelectItem value="agency">Travel Agency</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Corporate - PO Number */}
          {data.billToType === 'corporate' && (
            <div className="space-y-2">
              <Label htmlFor="purchaseOrderNo">Purchase Order Number</Label>
              <Input
                id="purchaseOrderNo"
                value={data.purchaseOrderNo || ''}
                onChange={(e) => onChange('purchaseOrderNo', e.target.value)}
                placeholder="PO-2025-XXXX"
              />
              <p className="text-xs text-muted-foreground">
                Corporate purchase order for billing reference
              </p>
            </div>
          )}

          {/* Insurance - Claim & Policy */}
          {data.billToType === 'insurance' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="claimNo">Insurance Claim Number</Label>
                <Input
                  id="claimNo"
                  value={data.claimNo || ''}
                  onChange={(e) => onChange('claimNo', e.target.value)}
                  placeholder="CLM-2025-XXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="policyNo">Policy Number</Label>
                <Input
                  id="policyNo"
                  value={data.policyNo || ''}
                  onChange={(e) => onChange('policyNo', e.target.value)}
                  placeholder="POL-XXXXXX"
                />
              </div>
            </>
          )}

          {/* Agency - Voucher */}
          {data.billToType === 'agency' && (
            <div className="space-y-2">
              <Label htmlFor="voucherReference">Voucher Reference</Label>
              <Input
                id="voucherReference"
                value={data.voucherReference || ''}
                onChange={(e) => onChange('voucherReference', e.target.value)}
                placeholder="VCHR-2025-XXXX"
              />
              <p className="text-xs text-muted-foreground">
                Travel agency voucher or booking reference
              </p>
            </div>
          )}

          {/* Billing Type */}
          <div className="space-y-2">
            <Label htmlFor="billingType">Billing Address</Label>
            <Select
              value={data.billingType}
              onValueChange={(value) => onChange('billingType', value)}
            >
              <SelectTrigger id="billingType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="same">Same as Customer</SelectItem>
                <SelectItem value="different">Different Address</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {data.billingType === 'different' && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Please provide alternative billing address details in the customer information section.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Tax Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Tax Settings
          </CardTitle>
          <CardDescription>
            Configure UAE VAT and tax codes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Standard UAE VAT rate is 5%. Some services may be exempt or zero-rated.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="taxLevelId">
              Tax Level <span className="text-destructive">*</span>
            </Label>
            <TaxLevelSelect
              value={data.taxLevelId}
              onChange={(value) => onChange('taxLevelId', value as string)}
            />
            <p className="text-xs text-muted-foreground">
              Standard (5%), Zero-Rated (0%), or Exempt
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxCodeId">
              Tax Code <span className="text-destructive">*</span>
            </Label>
            <TaxCodeSelect
              taxLevelId={data.taxLevelId}
              value={data.taxCodeId}
              onChange={(value) => onChange('taxCodeId', value as string)}
            />
            <p className="text-xs text-muted-foreground">
              Specific tax classification code
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-md">
            <div>
              <p className="text-xs text-muted-foreground">Taxable Amount</p>
              <p className="text-lg font-semibold">
                AED {(totalAmount / 1.05).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">VAT (5%)</p>
              <p className="text-lg font-semibold text-primary">
                AED {(totalAmount - totalAmount / 1.05).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Processing */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Processing</CardTitle>
          <CardDescription>
            Process advance payment and security deposit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentProcessor
            amount={totalAmount}
            depositAmount={data.securityDeposit.amount}
            onPaymentComplete={(transactionRef, method) => {
              onChange('advancePayment', {
                ...data.advancePayment,
                amount: totalAmount,
                status: 'completed',
                transactionRef,
              });
              onChange('paymentMethod', method);
            }}
            onDepositAuthorize={(authorizationRef) => {
              onChange('securityDeposit', {
                ...data.securityDeposit,
                status: 'authorized',
                authorizationRef,
              });
            }}
          />
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
