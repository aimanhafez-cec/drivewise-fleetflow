import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  BusinessUnitSelect, 
  PaymentTermsSelect, 
  ReservationMethodSelect 
} from '@/components/ui/select-components';
import { Building2, CreditCard, Briefcase, DollarSign, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BusinessConfigurationStepProps {
  data: {
    businessUnitId?: string;
    paymentTermsId?: string;
    reservationMethodId?: string;
    currency?: string;
  };
  onChange: (field: string, value: any) => void;
  errors?: string[];
}

export const BusinessConfigurationStep: React.FC<BusinessConfigurationStepProps> = ({
  data,
  onChange,
  errors = [],
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Business Configuration</h2>
        <p className="text-muted-foreground">
          Configure business settings and payment terms for this agreement
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          These settings determine how the agreement will be processed and tracked within your business operations.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Business Settings
          </CardTitle>
          <CardDescription>
            Select the operating unit and reservation method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Business Unit */}
          <div className="space-y-2">
            <Label htmlFor="businessUnitId">
              Business Unit <span className="text-destructive">*</span>
            </Label>
            <BusinessUnitSelect
              value={data.businessUnitId}
              onChange={(value) => onChange('businessUnitId', value as string)}
            />
            <p className="text-xs text-muted-foreground">
              Select the branch or operating unit managing this agreement
            </p>
          </div>

          {/* Reservation Method */}
          <div className="space-y-2">
            <Label htmlFor="reservationMethodId">
              Booking Method <span className="text-destructive">*</span>
            </Label>
            <ReservationMethodSelect
              value={data.reservationMethodId}
              onChange={(value) => onChange('reservationMethodId', value as string)}
            />
            <p className="text-xs text-muted-foreground">
              How was this booking created or processed?
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Configuration
          </CardTitle>
          <CardDescription>
            Configure payment terms and currency
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Payment Terms */}
          <div className="space-y-2">
            <Label htmlFor="paymentTermsId">
              Payment Terms <span className="text-destructive">*</span>
            </Label>
            <PaymentTermsSelect
              value={data.paymentTermsId}
              onChange={(value) => onChange('paymentTermsId', value as string)}
            />
            <p className="text-xs text-muted-foreground">
              Define when and how payment should be made
            </p>
          </div>

          {/* Currency Display */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">AED (UAE Dirham)</span>
            </div>
            <p className="text-xs text-muted-foreground">
              All pricing in UAE Dirhams (AED)
            </p>
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
