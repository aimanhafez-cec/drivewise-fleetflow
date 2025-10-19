import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  CreditCard,
  Banknote,
  Building,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useReservationWizard } from './ReservationWizardContext';
import { Badge } from '@/components/ui/badge';

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Down Payment Collection
        </h2>
        <p className="text-muted-foreground">
          Collect the mandatory down payment to secure this reservation
        </p>
      </div>

      {/* Payment Amount Display */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Down Payment Amount
            </p>
            <p className="text-4xl font-bold text-primary mb-2">
              {formatCurrency(wizardData.downPaymentAmount)}
            </p>
            <Badge className="bg-primary text-primary-foreground">
              30% of Total
            </Badge>
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
              <div>
                <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                  Payment Recorded
                </p>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Down payment of {formatCurrency(wizardData.downPaymentAmount)}{' '}
                  has been recorded successfully
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
