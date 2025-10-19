import React from 'react';
import { useReservationWizard } from './ReservationWizardContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBusinessUnits, usePaymentTerms } from '@/hooks/useBusinessLOVs';
import { Building2, CreditCard, Briefcase, DollarSign } from 'lucide-react';

export const Step1_5BusinessConfig: React.FC = () => {
  const { wizardData, updateWizardData } = useReservationWizard();
  const { items: businessUnits, isLoading: loadingUnits } = useBusinessUnits();
  const { items: paymentTerms, isLoading: loadingTerms } = usePaymentTerms();
  const isLoading = loadingUnits || loadingTerms;

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
            <Label htmlFor="reservationMethod">
              Reservation Method <span className="text-destructive">*</span>
            </Label>
            <Select
              value={wizardData.reservationMethodId}
              onValueChange={(value) => updateWizardData({ reservationMethodId: value })}
            >
              <SelectTrigger id="reservationMethod">
                <SelectValue placeholder="Select reservation method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="walk-in">Walk-in</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="online">Online Portal</SelectItem>
                <SelectItem value="corporate">Corporate Contract</SelectItem>
                <SelectItem value="agent">Travel Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Business Unit */}
          <div className="space-y-2">
            <Label htmlFor="businessUnit">
              Business Unit <span className="text-destructive">*</span>
            </Label>
            <Select
              value={wizardData.businessUnitId}
              onValueChange={(value) => updateWizardData({ businessUnitId: value })}
              disabled={isLoading}
            >
              <SelectTrigger id="businessUnit">
                <SelectValue placeholder="Select business unit" />
              </SelectTrigger>
              <SelectContent>
                {businessUnits?.map((unit: any) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Terms */}
          <div className="space-y-2">
            <Label htmlFor="paymentTerms">
              Payment Terms <span className="text-destructive">*</span>
            </Label>
            <Select
              value={wizardData.paymentTermsId}
              onValueChange={(value) => updateWizardData({ paymentTermsId: value })}
              disabled={isLoading}
            >
              <SelectTrigger id="paymentTerms">
                <SelectValue placeholder="Select payment terms" />
              </SelectTrigger>
              <SelectContent>
                {paymentTerms?.map((term: any) => (
                  <SelectItem key={term.id} value={term.id}>
                    {term.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
