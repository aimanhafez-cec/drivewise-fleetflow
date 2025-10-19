import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CreditCard,
  Banknote,
  Building,
  FileText,
  CheckCircle,
  Shield,
  DollarSign,
  Receipt,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { useReservationWizard } from './ReservationWizardContext';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const paymentMethods = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: CreditCard,
    description: 'Visa, Mastercard, Amex accepted',
    requiresOnline: true,
  },
  {
    id: 'cash',
    name: 'Cash',
    icon: Banknote,
    description: 'Payment received in person',
    requiresOnline: false,
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    icon: Building,
    description: 'Direct bank transfer',
    requiresOnline: false,
  },
  {
    id: 'cheque',
    name: 'Cheque',
    icon: FileText,
    description: 'Bank cheque accepted',
    requiresOnline: false,
  },
];

export const Step7DownPayment: React.FC = () => {
  const { wizardData, updateWizardData } = useReservationWizard();
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [collectSecurityDeposit, setCollectSecurityDeposit] = useState(false);
  const [collectAdvancePayment, setCollectAdvancePayment] = useState(false);
  
  // Default security deposit amount (can be customized)
  const defaultSecurityDeposit = 1000;
  const securityDepositAmount = collectSecurityDeposit ? wizardData.securityDepositPaid || defaultSecurityDeposit : 0;
  const advancePaymentAmount = collectAdvancePayment ? wizardData.advancePayment || 0 : 0;
  
  const totalCollected = wizardData.downPaymentAmount + securityDepositAmount + advancePaymentAmount;

  const handlePaymentMethodSelect = (method: string) => {
    updateWizardData({ paymentMethod: method });
  };

  const handleTransactionIdChange = (transactionId: string) => {
    updateWizardData({ transactionId });
  };

  const handleNotesChange = (notes: string) => {
    updateWizardData({ paymentNotes: notes });
  };

  const selectedMethod = paymentMethods.find(
    (m) => m.id === wizardData.paymentMethod
  );

  const handleSecurityDepositChange = (checked: boolean) => {
    setCollectSecurityDeposit(checked);
    if (checked) {
      updateWizardData({ securityDepositPaid: defaultSecurityDeposit });
    } else {
      updateWizardData({ securityDepositPaid: 0 });
    }
  };

  const handleSecurityDepositAmountChange = (amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    updateWizardData({ securityDepositPaid: numAmount });
  };

  const handleAdvancePaymentChange = (checked: boolean) => {
    setCollectAdvancePayment(checked);
    if (!checked) {
      updateWizardData({ advancePayment: 0 });
    }
  };

  const handleAdvancePaymentAmountChange = (amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    updateWizardData({ advancePayment: numAmount });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Payment & Deposits Collection
        </h2>
        <p className="text-muted-foreground">
          Collect down payment and optional deposits to secure this reservation
        </p>
      </div>

      {/* Payment Summary Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Down Payment */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Down Payment</p>
              <p className="text-xs text-muted-foreground">Required • 30% of total</p>
            </div>
            <Badge className="bg-primary text-primary-foreground px-3 py-1">
              {formatCurrency(wizardData.downPaymentAmount)}
            </Badge>
          </div>

          {/* Security Deposit */}
          {collectSecurityDeposit && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Security Deposit</p>
                  <p className="text-xs text-muted-foreground">Refundable</p>
                </div>
                <span className="font-mono font-semibold">
                  {formatCurrency(securityDepositAmount)}
                </span>
              </div>
            </>
          )}

          {/* Advance Payment */}
          {collectAdvancePayment && advancePaymentAmount > 0 && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Advance Payment</p>
                  <p className="text-xs text-muted-foreground">Towards balance</p>
                </div>
                <span className="font-mono font-semibold">
                  {formatCurrency(advancePaymentAmount)}
                </span>
              </div>
            </>
          )}

          <Separator className="border-t-2" />

          {/* Total to Collect */}
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold">Total to Collect Now</p>
            <p className="text-2xl font-bold text-primary font-mono">
              {formatCurrency(totalCollected)}
            </p>
          </div>

          {/* Remaining Balance */}
          <Alert>
            <DollarSign className="h-4 w-4" />
            <AlertDescription>
              <strong>Remaining Balance:</strong>{' '}
              {formatCurrency(Math.max(0, wizardData.balanceDue - advancePaymentAmount))}{' '}
              due at pickup
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Optional Deposits Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Optional Deposits & Advance Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Security Deposit */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="security-deposit"
                checked={collectSecurityDeposit}
                onCheckedChange={handleSecurityDepositChange}
              />
              <div className="flex-1">
                <Label
                  htmlFor="security-deposit"
                  className="font-semibold cursor-pointer"
                >
                  Collect Security Deposit
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Refundable deposit held against damages or excess charges
                </p>
              </div>
            </div>

            {collectSecurityDeposit && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="security-amount">Deposit Amount</Label>
                <div className="flex gap-2">
                  <Input
                    id="security-amount"
                    type="number"
                    min="0"
                    step="50"
                    value={securityDepositAmount}
                    onChange={(e) => handleSecurityDepositAmountChange(e.target.value)}
                    className="font-mono"
                  />
                  <Badge variant="outline" className="px-3 whitespace-nowrap">
                    AED
                  </Badge>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Advance Payment */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="advance-payment"
                checked={collectAdvancePayment}
                onCheckedChange={handleAdvancePaymentChange}
              />
              <div className="flex-1">
                <Label
                  htmlFor="advance-payment"
                  className="font-semibold cursor-pointer"
                >
                  Collect Advance Payment
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Additional payment towards the final balance
                </p>
              </div>
            </div>

            {collectAdvancePayment && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="advance-amount">Advance Amount</Label>
                <div className="flex gap-2">
                  <Input
                    id="advance-amount"
                    type="number"
                    min="0"
                    step="100"
                    max={wizardData.balanceDue}
                    value={advancePaymentAmount}
                    onChange={(e) => handleAdvancePaymentAmountChange(e.target.value)}
                    className="font-mono"
                  />
                  <Badge variant="outline" className="px-3 whitespace-nowrap">
                    AED
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Maximum: {formatCurrency(wizardData.balanceDue)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={wizardData.paymentMethod}
            onValueChange={handlePaymentMethodSelect}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => {
                const IconComponent = method.icon;
                const isSelected = wizardData.paymentMethod === method.id;

                return (
                  <Card
                    key={method.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      isSelected ? 'ring-2 ring-primary shadow-lg' : ''
                    }`}
                    onClick={() => handlePaymentMethodSelect(method.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem
                          value={method.id}
                          id={method.id}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <IconComponent className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <Label
                                htmlFor={method.id}
                                className="font-semibold cursor-pointer"
                              >
                                {method.name}
                              </Label>
                              {method.requiresOnline && (
                                <Badge
                                  variant="outline"
                                  className="ml-2 text-xs"
                                >
                                  Online
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {method.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Payment Details */}
      {wizardData.paymentMethod && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedMethod?.requiresOnline ? (
              <div className="p-6 bg-muted rounded-lg text-center space-y-4">
                <CreditCard className="h-16 w-16 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Card Payment Processing
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    In a production environment, this would integrate with Stripe or
                    another payment gateway
                  </p>
                  <Badge
                    className="bg-emerald-500 text-white"
                    onClick={() => setPaymentCompleted(true)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Simulate Payment Success
                  </Badge>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="transaction-id">
                    Transaction ID / Receipt Number *
                  </Label>
                  <Input
                    id="transaction-id"
                    placeholder="e.g., CH-2024-001234, TRF-12345678"
                    value={wizardData.transactionId || ''}
                    onChange={(e) => handleTransactionIdChange(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the reference number from the payment receipt
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-notes">Notes (Optional)</Label>
                  <Textarea
                    id="payment-notes"
                    placeholder="Additional payment details or notes..."
                    value={wizardData.paymentNotes || ''}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    rows={3}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Security Deposit Payment Method (if different) */}
      {collectSecurityDeposit && wizardData.paymentMethod && (
        <Card>
          <CardHeader>
            <CardTitle>Security Deposit Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deposit-payment-method">
                Payment Method (Optional - defaults to same as down payment)
              </Label>
              <RadioGroup
                value={wizardData.depositPaymentMethod || wizardData.paymentMethod}
                onValueChange={(value) =>
                  updateWizardData({ depositPaymentMethod: value })
                }
              >
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center gap-2">
                      <RadioGroupItem value={method.id} id={`dep-${method.id}`} />
                      <Label
                        htmlFor={`dep-${method.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {method.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {(!paymentMethods.find(
              (m) => m.id === (wizardData.depositPaymentMethod || wizardData.paymentMethod)
            )?.requiresOnline) && (
              <div className="space-y-2">
                <Label htmlFor="deposit-transaction-id">
                  Deposit Receipt / Transaction ID
                </Label>
                <Input
                  id="deposit-transaction-id"
                  placeholder="Receipt number for security deposit"
                  value={wizardData.depositTransactionId || ''}
                  onChange={(e) =>
                    updateWizardData({ depositTransactionId: e.target.value })
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Confirmation Status */}
      {(paymentCompleted ||
        (wizardData.paymentMethod &&
          !selectedMethod?.requiresOnline &&
          wizardData.transactionId)) && (
        <Card className="bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-emerald-500">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                  Payment Recorded Successfully
                </p>
                <div className="text-sm text-emerald-700 dark:text-emerald-300 mt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Down Payment:</span>
                    <span className="font-mono font-semibold">
                      {formatCurrency(wizardData.downPaymentAmount)}
                    </span>
                  </div>
                  {collectSecurityDeposit && (
                    <div className="flex justify-between">
                      <span>Security Deposit:</span>
                      <span className="font-mono font-semibold">
                        {formatCurrency(securityDepositAmount)}
                      </span>
                    </div>
                  )}
                  {collectAdvancePayment && advancePaymentAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Advance Payment:</span>
                      <span className="font-mono font-semibold">
                        {formatCurrency(advancePaymentAmount)}
                      </span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total Collected:</span>
                    <span className="font-mono">
                      {formatCurrency(totalCollected)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
