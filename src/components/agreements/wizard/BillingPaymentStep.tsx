import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Link, DollarSign, CreditCard } from 'lucide-react';
import { PaymentProcessor } from '@/components/agreements/shared/PaymentProcessor';
import type { EnhancedWizardData } from '@/types/agreement-wizard';

interface BillingPaymentStepProps {
  data: EnhancedWizardData['step5'];
  totalAmount: number;
  onChange: (field: keyof EnhancedWizardData['step5'], value: any) => void;
  errors?: string[];
  source?: 'reservation' | 'instant_booking' | 'direct';
  instantBookingPayment?: {
    advancePaymentCollected: number;
    securityDepositHeld: number;
    paymentMethod: string;
    transactionRef?: string;
  };
}

export const BillingPaymentStep: React.FC<BillingPaymentStepProps> = ({
  data,
  totalAmount,
  onChange,
  errors = [],
  source,
  instantBookingPayment,
}) => {
  const isFromInstantBooking = source === 'instant_booking';
  const remainingBalance = isFromInstantBooking && instantBookingPayment
    ? totalAmount - instantBookingPayment.advancePaymentCollected
    : totalAmount;
  const handlePaymentDataChange = (paymentData: Partial<EnhancedWizardData['step5']>) => {
    Object.entries(paymentData).forEach(([key, value]) => {
      onChange(key as keyof EnhancedWizardData['step5'], value);
    });
  };

  return (
    <div className="space-y-6">
      {isFromInstantBooking && instantBookingPayment && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="space-y-3">
              <div>
                <span className="font-semibold">Instant Booking Payment Processed</span>
                <p className="text-sm mt-1">
                  Payment has been collected and security deposit authorized during instant booking
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                    Advance Payment
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-700">
                      AED {instantBookingPayment.advancePaymentCollected.toFixed(2)}
                    </span>
                    <Badge className="bg-green-500">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Paid
                    </Badge>
                  </div>
                  {instantBookingPayment.transactionRef && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Ref: {instantBookingPayment.transactionRef}
                    </p>
                  )}
                </div>

                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <CreditCard className="h-4 w-4" />
                    Security Deposit
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-700">
                      AED {instantBookingPayment.securityDepositHeld.toFixed(2)}
                    </span>
                    <Badge className="bg-blue-500">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Held
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Via {instantBookingPayment.paymentMethod}
                  </p>
                </div>
              </div>

              {remainingBalance > 0 && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-amber-800">
                      Remaining Balance Due:
                    </span>
                    <span className="text-lg font-bold text-amber-900">
                      AED {remainingBalance.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-amber-700 mt-1">
                    To be collected at agreement signing or vehicle handover
                  </p>
                </div>
              )}

              {remainingBalance <= 0 && (
                <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-700" />
                    <span className="text-sm font-semibold text-green-800">
                      Full payment received - No additional payment required
                    </span>
                  </div>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{isFromInstantBooking ? 'Additional Payment (if any)' : 'Billing & Payment'}</span>
            {isFromInstantBooking && instantBookingPayment && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Link className="h-3 w-3" />
                Linked to Booking
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isFromInstantBooking || remainingBalance > 0 ? (
            <PaymentProcessor
              amount={remainingBalance}
              depositAmount={isFromInstantBooking ? 0 : data.securityDeposit.amount}
              onPaymentComplete={(transactionRef, method) => {
                onChange('advancePayment', {
                  ...data.advancePayment,
                  amount: remainingBalance,
                  status: 'completed',
                  transactionRef,
                });
                onChange('paymentMethod', method);
              }}
              onDepositAuthorize={(authorizationRef) => {
                if (!isFromInstantBooking) {
                  onChange('securityDeposit', {
                    ...data.securityDeposit,
                    status: 'authorized',
                    authorizationRef,
                  });
                }
              }}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p className="font-medium">All payments processed through instant booking</p>
              <p className="text-sm mt-1">No additional payment required at this stage</p>
            </div>
          )}
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
