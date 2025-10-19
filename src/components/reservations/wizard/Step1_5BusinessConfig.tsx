import React from 'react';
import { useReservationWizard } from './ReservationWizardContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { BusinessUnitSelect, PaymentTermsSelect, ReservationMethodSelect } from '@/components/ui/select-components';
import { Building2, CreditCard, Briefcase, DollarSign } from 'lucide-react';

export const Step1_5BusinessConfig: React.FC = () => {
  const { wizardData, updateWizardData } = useReservationWizard();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Business Configuration</h2>
        <p className="text-muted-foreground">
          Configure business settings and payment terms for this reservation
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Business Settings
          </CardTitle>
          <CardDescription>
            Select the business unit and payment terms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Reservation Method */}
          <div className="space-y-2">
            <Label htmlFor="reservationMethodId">
              Reservation Method <span className="text-destructive">*</span>
            </Label>
            <ReservationMethodSelect
              value={wizardData.reservationMethodId}
              onChange={(value) => updateWizardData({ reservationMethodId: value as string })}
            />
          </div>

          {/* Business Unit */}
          <div className="space-y-2">
            <Label htmlFor="businessUnitId">
              Business Unit <span className="text-destructive">*</span>
            </Label>
            <BusinessUnitSelect
              value={wizardData.businessUnitId}
              onChange={(value) => updateWizardData({ businessUnitId: value as string })}
            />
          </div>

          {/* Payment Terms */}
          <div className="space-y-2">
            <Label htmlFor="paymentTermsId">
              Payment Terms <span className="text-destructive">*</span>
            </Label>
            <PaymentTermsSelect
              value={wizardData.paymentTermsId}
              onChange={(value) => updateWizardData({ paymentTermsId: value as string })}
            />
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">AED (UAE Dirham)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
