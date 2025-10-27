import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Car, DollarSign } from 'lucide-react';
import type { AgreementLine } from '@/types/agreement-line';
import { formatCurrency } from '@/lib/utils/currency';

interface LineConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  line: AgreementLine | null;
  onSave: (line: AgreementLine) => void;
  mode: 'create' | 'edit';
}

export const LineConfigDialog: React.FC<LineConfigDialogProps> = ({
  open,
  onOpenChange,
  line,
  onSave,
  mode,
}) => {
  const [formData, setFormData] = useState<Partial<AgreementLine>>(line || {});

  useEffect(() => {
    if (line) {
      setFormData(line);
    }
  }, [line]);

  const handleSave = () => {
    if (!formData.id) return;
    onSave(formData as AgreementLine);
    onOpenChange(false);
  };

  const updateField = <K extends keyof AgreementLine>(
    field: K,
    value: AgreementLine[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            {mode === 'create' ? 'Add New Line' : 'Edit Line'}
            {formData.lineNumber && (
              <Badge variant="secondary">#{formData.lineNumber}</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Configure vehicle details, rental period, and pricing for this line
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Vehicle Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              <h4 className="font-semibold">Vehicle</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vehicle Class</Label>
                <Input
                  placeholder="Select vehicle class"
                  value={formData.vehicleClassId || ''}
                  onChange={(e) => updateField('vehicleClassId', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Specific Vehicle (Optional)</Label>
                <Input
                  placeholder="Select specific vehicle"
                  value={formData.specificVehicleId || ''}
                  onChange={(e) => updateField('specificVehicleId', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Rental Period */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <h4 className="font-semibold">Rental Period</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Check-out Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.checkOutDateTime || ''}
                  onChange={(e) => updateField('checkOutDateTime', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Check-in Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.checkInDateTime || ''}
                  onChange={(e) => updateField('checkInDateTime', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Locations */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <h4 className="font-semibold">Locations</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Check-out Location</Label>
                <Input
                  placeholder="Select location"
                  value={formData.checkOutLocationId || ''}
                  onChange={(e) => updateField('checkOutLocationId', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Check-in Location</Label>
                <Input
                  placeholder="Select location"
                  value={formData.checkInLocationId || ''}
                  onChange={(e) => updateField('checkInLocationId', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Pricing */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <h4 className="font-semibold">Pricing</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Base Rate</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.baseRate || ''}
                  onChange={(e) => updateField('baseRate', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>Insurance Package</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={formData.insurancePackage || 'comprehensive'}
                  onChange={(e) => updateField('insurancePackage', e.target.value as any)}
                >
                  <option value="comprehensive">Comprehensive</option>
                  <option value="tpl">TPL Only</option>
                </select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-3">
            <h4 className="font-semibold">Notes</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Special Instructions</Label>
                <Textarea
                  placeholder="Any special instructions for this line..."
                  value={formData.specialInstructions || ''}
                  onChange={(e) => updateField('specialInstructions', e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Internal Notes</Label>
                <Textarea
                  placeholder="Internal notes (not visible to customer)..."
                  value={formData.internalNotes || ''}
                  onChange={(e) => updateField('internalNotes', e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Pricing Summary */}
          {formData.pricingBreakdown && (
            <>
              <Separator />
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Line Total</h4>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(formData.pricingBreakdown.total)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Including VAT and all charges
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {mode === 'create' ? 'Add Line' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
