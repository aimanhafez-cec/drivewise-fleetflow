import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RequiredLabel } from '@/components/ui/required-label';
import { FormError } from '@/components/ui/form-error';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface AgreementWizardStep1Props {
  data: {
    contractStart?: string;
    contractEnd?: string;
    referenceNumber?: string;
    poNumber?: string;
    notes?: string;
  };
  reservation: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export const AgreementWizardStep1: React.FC<AgreementWizardStep1Props> = ({
  data,
  reservation,
  onChange,
  errors,
}) => {
  const updateField = (field: string, value: string) => {
    onChange({ [field]: value });
  };

  return (
    <div id="wiz-step-details" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Agreement Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pre-filled Header Information (Read-only) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Customer *</Label>
              <p className="font-medium">{reservation.profiles?.full_name || 'Unknown Customer'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Bill-To *</Label>
              <p className="font-medium">Same as Customer</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Payment Terms *</Label>
              <p className="font-medium">Net 30 Days</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Price List *</Label>
              <p className="font-medium">Standard Rates</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Currency *</Label>
              <p className="font-medium">USD</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <Badge variant="secondary">Draft</Badge>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <RequiredLabel htmlFor="contractStart">Contract Start Date</RequiredLabel>
              <Input
                id="contractStart"
                type="date"
                value={data.contractStart || format(new Date(reservation.start_datetime), 'yyyy-MM-dd')}
                onChange={(e) => updateField('contractStart', e.target.value)}
                aria-required="true"
              />
              <FormError message={errors.contractStart} />
            </div>

            <div className="space-y-2">
              <RequiredLabel htmlFor="contractEnd">Contract End Date</RequiredLabel>
              <Input
                id="contractEnd"
                type="date"
                value={data.contractEnd || format(new Date(reservation.end_datetime), 'yyyy-MM-dd')}
                onChange={(e) => updateField('contractEnd', e.target.value)}
                aria-required="true"
              />
              <FormError message={errors.contractEnd} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referenceNumber">Reference Number</Label>
              <Input
                id="referenceNumber"
                placeholder="Enter reference number"
                value={data.referenceNumber || ''}
                onChange={(e) => updateField('referenceNumber', e.target.value)}
              />
              <FormError message={errors.referenceNumber} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="poNumber">PO Number</Label>
              <Input
                id="poNumber"
                placeholder="Enter PO number"
                value={data.poNumber || ''}
                onChange={(e) => updateField('poNumber', e.target.value)}
              />
              <FormError message={errors.poNumber} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Enter any additional notes for this agreement"
              rows={4}
              value={data.notes || ''}
              onChange={(e) => updateField('notes', e.target.value)}
            />
            <FormError message={errors.notes} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};