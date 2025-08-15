import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RequiredLabel } from '@/components/ui/required-label';
import { FormError } from '@/components/ui/form-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, Shield, User } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface AgreementWizardStep5Props {
  data: {
    billingType: 'same' | 'other';
    billingInfo?: {
      name: string;
      email: string;
      phone: string;
      address: string;
    };
    paymentMethod: string;
    advanceAmount: number;
    securityDeposit: number;
    applyDepositAsCredit: boolean;
  };
  reservation: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export const AgreementWizardStep5: React.FC<AgreementWizardStep5Props> = ({
  data,
  reservation,
  onChange,
  errors,
}) => {
  const updateField = (field: string, value: any) => {
    onChange({ [field]: value });
  };

  const updateBillingInfo = (field: string, value: string) => {
    const currentBillingInfo = data.billingInfo || { name: '', email: '', phone: '', address: '' };
    onChange({
      billingInfo: {
        ...currentBillingInfo,
        [field]: value,
      },
    });
  };

  return (
    <div id="wiz-step-billing" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Billing & Payment Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Billing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">Bill To *</Label>
                <RadioGroup
                  value={data.billingType}
                  onValueChange={(value: 'same' | 'other') => updateField('billingType', value)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="same" id="billing-same" />
                    <Label htmlFor="billing-same" className="font-normal">
                      Same as Customer
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="billing-other" />
                    <Label htmlFor="billing-other" className="font-normal">
                      Different Billing Address
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Customer Information Display */}
              {data.billingType === 'same' && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">Customer Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Name:</span> {reservation.profiles?.full_name}</p>
                    <p><span className="text-muted-foreground">Email:</span> {reservation.profiles?.email}</p>
                    <p><span className="text-muted-foreground">Phone:</span> {reservation.profiles?.phone || 'Not provided'}</p>
                  </div>
                </div>
              )}

              {/* Other Billing Information */}
              {data.billingType === 'other' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <RequiredLabel htmlFor="billing-name">Full Name</RequiredLabel>
                    <Input
                      id="billing-name"
                      placeholder="Enter full name"
                      value={data.billingInfo?.name || ''}
                      onChange={(e) => updateBillingInfo('name', e.target.value)}
                      aria-required="true"
                    />
                    <FormError message={errors.billing_name} />
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel htmlFor="billing-email">Email Address</RequiredLabel>
                    <Input
                      id="billing-email"
                      type="email"
                      placeholder="Enter email address"
                      value={data.billingInfo?.email || ''}
                      onChange={(e) => updateBillingInfo('email', e.target.value)}
                      aria-required="true"
                    />
                    <FormError message={errors.billing_email} />
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel htmlFor="billing-phone">Phone Number</RequiredLabel>
                    <Input
                      id="billing-phone"
                      type="tel"
                      placeholder="Enter phone number"
                      value={data.billingInfo?.phone || ''}
                      onChange={(e) => updateBillingInfo('phone', e.target.value)}
                      aria-required="true"
                    />
                    <FormError message={errors.billing_phone} />
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel htmlFor="billing-address">Address</RequiredLabel>
                    <Input
                      id="billing-address"
                      placeholder="Enter billing address"
                      value={data.billingInfo?.address || ''}
                      onChange={(e) => updateBillingInfo('address', e.target.value)}
                      aria-required="true"
                    />
                    <FormError message={errors.billing_address} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Method */}
              <div className="space-y-2">
                <RequiredLabel htmlFor="payment-method">Payment Method</RequiredLabel>
                <Select
                  value={data.paymentMethod}
                  onValueChange={(value) => updateField('paymentMethod', value)}
                >
                  <SelectTrigger id="payment-method">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="debit_card">Debit Card</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
                <FormError message={errors.payment_method} />
              </div>

              {/* Payment Amounts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="advance-amount">Advance Payment</Label>
                  <Input
                    id="advance-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={data.advanceAmount || ''}
                    onChange={(e) => updateField('advanceAmount', parseFloat(e.target.value) || 0)}
                  />
                  <FormError message={errors.advance_amount} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="security-deposit">Security Deposit</Label>
                  <Input
                    id="security-deposit"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={data.securityDeposit || ''}
                    onChange={(e) => updateField('securityDeposit', parseFloat(e.target.value) || 0)}
                  />
                  <FormError message={errors.security_deposit} />
                </div>
              </div>

              {/* Payment Options */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="apply-deposit-credit"
                  checked={data.applyDepositAsCredit}
                  onCheckedChange={(checked) => updateField('applyDepositAsCredit', checked)}
                />
                <Label htmlFor="apply-deposit-credit" className="font-normal">
                  Apply security deposit as credit towards rental charges
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rental Total:</span>
                  <span>{formatCurrency(reservation.total_amount || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Add-ons:</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax:</span>
                  <span>{formatCurrency(24)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-medium">
                <span>Grand Total:</span>
                <span className="text-lg">{formatCurrency((reservation.total_amount || 0) + 24)}</span>
              </div>

              <Separator />

              <div className="space-y-2">
                {data.advanceAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Advance Payment:</span>
                    <span>-{formatCurrency(data.advanceAmount)}</span>
                  </div>
                )}
                {data.securityDeposit > 0 && data.applyDepositAsCredit && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Deposit Credit:</span>
                    <span>-{formatCurrency(data.securityDeposit)}</span>
                  </div>
                )}
              </div>

              {(data.advanceAmount > 0 || (data.securityDeposit > 0 && data.applyDepositAsCredit)) && (
                <>
                  <Separator />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Amount Due:</span>
                    <span>
                      {formatCurrency(Math.max(0, ((reservation.total_amount || 0) + 24) - data.advanceAmount - (data.applyDepositAsCredit ? data.securityDeposit : 0)))}
                    </span>
                  </div>
                </>
              )}

              {data.securityDeposit > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Security Deposit</span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    {formatCurrency(data.securityDeposit)} will be authorized on your payment method
                  </p>
                </div>
              )}

              <div className="mt-4">
                <Badge variant="outline" className="w-full justify-center">
                  {data.paymentMethod.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
