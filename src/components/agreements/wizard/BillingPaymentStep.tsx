import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentProcessor } from '@/components/agreements/shared/PaymentProcessor';
import type { EnhancedWizardData } from '@/types/agreement-wizard';

interface BillingPaymentStepProps {
  data: EnhancedWizardData['step5'];
  totalAmount: number;
  onChange: (field: keyof EnhancedWizardData['step5'], value: any) => void;
  errors?: string[];
}

export const BillingPaymentStep: React.FC<BillingPaymentStepProps> = ({
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
      <Card>
        <CardHeader>
          <CardTitle>Billing & Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentProcessor
            totalAmount={totalAmount}
            paymentData={data}
            onPaymentDataChange={handlePaymentDataChange}
          />
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
