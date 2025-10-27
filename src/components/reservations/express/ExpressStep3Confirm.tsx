import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CheckCircle2, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { format } from 'date-fns';

interface ExpressStep3ConfirmProps {
  customerName?: string;
  vehicleClassName?: string;
  pickupDate?: Date;
  returnDate?: Date;
  pickupLocation?: string;
  returnLocation?: string;
  estimatedTotal: number;
  downPaymentAmount?: number;
  paymentMethod?: string;
  onDownPaymentChange: (amount: number) => void;
  onPaymentMethodChange: (method: string) => void;
  expanded: boolean;
}

export const ExpressStep3Confirm: React.FC<ExpressStep3ConfirmProps> = ({
  customerName,
  vehicleClassName,
  pickupDate,
  returnDate,
  pickupLocation,
  returnLocation,
  estimatedTotal,
  downPaymentAmount,
  paymentMethod,
  onDownPaymentChange,
  onPaymentMethodChange,
  expanded,
}) => {
  const [collectPayment, setCollectPayment] = React.useState(false);

  return (
    <div className={cn("space-y-4", !expanded && "opacity-50 pointer-events-none")}>
      <div className="flex items-center gap-2">
        <div className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
          expanded ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          3
        </div>
        <h3 className="font-semibold">Review & Confirm</h3>
      </div>

      {expanded && (
        <>
          {/* Summary Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Customer</span>
                <span className="font-medium">{customerName || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Vehicle Class</span>
                <span className="font-medium">{vehicleClassName || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Dates</span>
                <span className="font-medium">
                  {pickupDate && returnDate
                    ? `${format(pickupDate, 'MMM dd')} - ${format(returnDate, 'MMM dd')}`
                    : 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Locations</span>
                <span className="font-medium text-right">
                  {pickupLocation || 'TBD'} → {returnLocation || 'TBD'}
                </span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Estimated Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(estimatedTotal)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Final pricing will be calculated based on selected price list
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Optional Payment Collection */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="collect-payment"
                  checked={collectPayment}
                  onCheckedChange={(checked) => {
                    setCollectPayment(checked as boolean);
                    if (!checked) {
                      onDownPaymentChange(0);
                      onPaymentMethodChange('');
                    }
                  }}
                />
                <Label htmlFor="collect-payment" className="flex items-center gap-2 cursor-pointer">
                  <DollarSign className="h-4 w-4" />
                  Collect down payment now
                </Label>
              </div>

              {collectPayment && (
                <div className="space-y-3 pl-6">
                  <div>
                    <Label>Down Payment Amount</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={downPaymentAmount || ''}
                      onChange={(e) => onDownPaymentChange(Number(e.target.value))}
                      min={0}
                      max={estimatedTotal}
                    />
                  </div>
                  <div>
                    <Label>Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
