import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CostSheetHeaderProps {
  financingRate: number;
  overheadPercent: number;
  targetMargin: number;
  residualValue: number;
  leaseTerm: number;
  notes?: string;
  disabled?: boolean;
  onChange: (field: string, value: any) => void;
}

export const CostSheetHeader: React.FC<CostSheetHeaderProps> = ({
  financingRate,
  overheadPercent,
  targetMargin,
  residualValue,
  leaseTerm,
  notes,
  disabled = false,
  onChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cost Sheet Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="financing-rate">Financing Rate (%)</Label>
            <Input
              id="financing-rate"
              type="number"
              step="0.1"
              value={financingRate}
              onChange={(e) => onChange('financing_rate_percent', parseFloat(e.target.value))}
              disabled={disabled}
            />
          </div>

          <div>
            <Label htmlFor="overhead">Overhead (%)</Label>
            <Input
              id="overhead"
              type="number"
              step="0.1"
              value={overheadPercent}
              onChange={(e) => onChange('overhead_percent', parseFloat(e.target.value))}
              disabled={disabled}
            />
          </div>

          <div>
            <Label htmlFor="target-margin">Target Margin (%)</Label>
            <Input
              id="target-margin"
              type="number"
              step="0.1"
              value={targetMargin}
              onChange={(e) => onChange('target_margin_percent', parseFloat(e.target.value))}
              disabled={disabled}
            />
          </div>

          <div>
            <Label htmlFor="residual-value">Residual Value (%)</Label>
            <Input
              id="residual-value"
              type="number"
              step="0.1"
              value={residualValue}
              onChange={(e) => onChange('residual_value_percent', parseFloat(e.target.value))}
              disabled={disabled}
            />
          </div>

          <div>
            <Label htmlFor="lease-term">Lease Term (Months)</Label>
            <Input
              id="lease-term"
              type="number"
              value={leaseTerm}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="md:col-span-3">
            <Label htmlFor="notes">Notes / Assumptions</Label>
            <Textarea
              id="notes"
              value={notes || ''}
              onChange={(e) => onChange('notes_assumptions', e.target.value)}
              disabled={disabled}
              placeholder="Add any notes or assumptions about this cost sheet..."
              rows={3}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};