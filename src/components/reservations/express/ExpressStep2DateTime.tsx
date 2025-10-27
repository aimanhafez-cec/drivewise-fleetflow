import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { LocationSelect } from '@/components/shared/LocationSelect';
import { cn } from '@/lib/utils';
import { CheckCircle2, Calendar as CalendarIcon } from 'lucide-react';
import { addDays, addWeeks, addMonths, format } from 'date-fns';

interface ExpressStep2DateTimeProps {
  pickupDate?: Date;
  pickupTime?: string;
  returnDate?: Date;
  returnTime?: string;
  pickupLocation?: string;
  returnLocation?: string;
  onPickupDateChange: (date: Date) => void;
  onPickupTimeChange: (time: string) => void;
  onReturnDateChange: (date: Date) => void;
  onReturnTimeChange: (time: string) => void;
  onPickupLocationChange: (location: string) => void;
  onReturnLocationChange: (location: string) => void;
  expanded: boolean;
}

export const ExpressStep2DateTime: React.FC<ExpressStep2DateTimeProps> = ({
  pickupDate,
  pickupTime,
  returnDate,
  returnTime,
  pickupLocation,
  returnLocation,
  onPickupDateChange,
  onPickupTimeChange,
  onReturnDateChange,
  onReturnTimeChange,
  onPickupLocationChange,
  onReturnLocationChange,
  expanded,
}) => {
  const isComplete = pickupDate && pickupTime && returnDate && returnTime && pickupLocation && returnLocation;

  const handleQuickDuration = (type: 'day' | 'weekend' | 'week' | 'month') => {
    const startDate = pickupDate || new Date();
    let endDate: Date;

    switch (type) {
      case 'day':
        endDate = addDays(startDate, 1);
        break;
      case 'weekend':
        endDate = addDays(startDate, 2);
        break;
      case 'week':
        endDate = addWeeks(startDate, 1);
        break;
      case 'month':
        endDate = addMonths(startDate, 1);
        break;
    }

    if (!pickupDate) onPickupDateChange(startDate);
    onReturnDateChange(endDate);
  };

  return (
    <div className={cn("space-y-4", !expanded && "opacity-50 pointer-events-none")}>
      <div className="flex items-center gap-2">
        <div className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
          expanded ? "bg-primary text-primary-foreground" : isComplete ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
        )}>
          {isComplete ? <CheckCircle2 className="h-5 w-5" /> : "2"}
        </div>
        <h3 className="font-semibold">When & Where</h3>
      </div>

      {expanded && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* Quick Duration Buttons */}
            <div>
              <Label className="mb-2 block">Quick Duration</Label>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => handleQuickDuration('day')}>
                  1 Day
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleQuickDuration('weekend')}>
                  Weekend
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleQuickDuration('week')}>
                  1 Week
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleQuickDuration('month')}>
                  1 Month
                </Button>
              </div>
            </div>

            {/* Pickup Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Pickup Date *</Label>
                <DatePicker
                  value={pickupDate}
                  onChange={(date) => date && onPickupDateChange(date)}
                  placeholder="Select date"
                />
              </div>
              <div>
                <Label>Pickup Time *</Label>
                <Input
                  type="time"
                  value={pickupTime || '09:00'}
                  onChange={(e) => onPickupTimeChange(e.target.value)}
                />
              </div>
            </div>

            {/* Return Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Return Date *</Label>
                <DatePicker
                  value={returnDate}
                  onChange={(date) => date && onReturnDateChange(date)}
                  placeholder="Select date"
                />
              </div>
              <div>
                <Label>Return Time *</Label>
                <Input
                  type="time"
                  value={returnTime || '09:00'}
                  onChange={(e) => onReturnTimeChange(e.target.value)}
                />
              </div>
            </div>

            {/* Locations */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Pickup Location *</Label>
                <LocationSelect
                  value={pickupLocation}
                  onValueChange={onPickupLocationChange}
                  placeholder="Select location"
                />
              </div>
              <div>
                <Label>Return Location *</Label>
                <LocationSelect
                  value={returnLocation}
                  onValueChange={onReturnLocationChange}
                  placeholder="Select location"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
