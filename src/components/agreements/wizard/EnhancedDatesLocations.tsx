import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Sparkles, 
  AlertCircle,
  ChevronDown,
  Settings2,
  Info
} from 'lucide-react';
import { format, addDays, addMonths, startOfWeek, endOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/currency';

interface EnhancedDatesLocationsProps {
  pickupDateTime: string;
  dropoffDateTime: string;
  pickupLocationId: string;
  dropoffLocationId: string;
  onPickupDateTimeChange: (value: string) => void;
  onDropoffDateTimeChange: (value: string) => void;
  onPickupLocationChange: (value: string) => void;
  onDropoffLocationChange: (value: string) => void;
  
  // Smart defaults
  hasSmartDefaults?: boolean;
  defaultPickupTime?: string;
  defaultDropoffTime?: string;
  defaultPickupLocation?: string;
  
  // Advanced options
  gracePeriodMinutes?: number;
  onGracePeriodChange?: (value: number) => void;
  billingCycle?: 'daily' | 'hourly';
  onBillingCycleChange?: (value: 'daily' | 'hourly') => void;
  afterHoursPickup?: boolean;
  onAfterHoursPickupChange?: (value: boolean) => void;
  
  // One-way rental
  oneWayFee?: number;
  
  // Validation
  errors?: string[];
}

export const EnhancedDatesLocations: React.FC<EnhancedDatesLocationsProps> = ({
  pickupDateTime,
  dropoffDateTime,
  pickupLocationId,
  dropoffLocationId,
  onPickupDateTimeChange,
  onDropoffDateTimeChange,
  onPickupLocationChange,
  onDropoffLocationChange,
  hasSmartDefaults = false,
  defaultPickupTime,
  defaultDropoffTime,
  defaultPickupLocation,
  gracePeriodMinutes = 60,
  onGracePeriodChange,
  billingCycle = 'daily',
  onBillingCycleChange,
  afterHoursPickup = false,
  onAfterHoursPickupChange,
  oneWayFee,
  errors = [],
}) => {
  const [sameLocation, setSameLocation] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [duration, setDuration] = useState<string>('');

  // Calculate duration
  useEffect(() => {
    if (pickupDateTime && dropoffDateTime) {
      const pickup = new Date(pickupDateTime);
      const dropoff = new Date(dropoffDateTime);
      const diffMs = dropoff.getTime() - pickup.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (diffDays > 0) {
        setDuration(`${diffDays} day${diffDays !== 1 ? 's' : ''}${diffHours > 0 ? ` ${diffHours}h` : ''}`);
      } else if (diffHours > 0) {
        setDuration(`${diffHours} hour${diffHours !== 1 ? 's' : ''}`);
      } else {
        setDuration('');
      }
    }
  }, [pickupDateTime, dropoffDateTime]);

  // Handle same location toggle
  const handleSameLocationToggle = (checked: boolean) => {
    setSameLocation(checked);
    if (checked) {
      onDropoffLocationChange(pickupLocationId);
    }
  };

  // Quick duration presets
  const setQuickDuration = (type: '1-day' | 'weekend' | '1-week' | '1-month') => {
    const now = new Date();
    const pickupDate = pickupDateTime ? new Date(pickupDateTime) : now;
    let dropoffDate: Date;

    switch (type) {
      case '1-day':
        dropoffDate = addDays(pickupDate, 1);
        break;
      case 'weekend':
        // Next Saturday to Sunday
        const nextSaturday = startOfWeek(addDays(pickupDate, 7), { weekStartsOn: 6 });
        dropoffDate = endOfWeek(nextSaturday, { weekStartsOn: 6 });
        break;
      case '1-week':
        dropoffDate = addDays(pickupDate, 7);
        break;
      case '1-month':
        dropoffDate = addMonths(pickupDate, 1);
        break;
    }

    onDropoffDateTimeChange(format(dropoffDate, "yyyy-MM-dd'T'HH:mm"));
  };

  const isOneWay = pickupLocationId !== dropoffLocationId && pickupLocationId && dropoffLocationId;

  return (
    <div className="space-y-6">
      {/* Smart Defaults Badge */}
      {hasSmartDefaults && (
        <Alert className="border-primary/50 bg-primary/5">
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto Defaults Applied</p>
              <p className="text-sm text-muted-foreground">
                Using preferences from customer's rental history
              </p>
            </div>
            <Badge variant="outline" className="gap-1 bg-background">
              <Sparkles className="h-3 w-3" />
              Smart
            </Badge>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Duration Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Quick Duration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickDuration('1-day')}
              className="hover-scale"
            >
              1 Day
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickDuration('weekend')}
              className="hover-scale"
            >
              Weekend
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickDuration('1-week')}
              className="hover-scale"
            >
              1 Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickDuration('1-month')}
              className="hover-scale"
            >
              1 Month
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pickup Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Pickup Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pickup-datetime">
                Date & Time
                {defaultPickupTime && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Default: {defaultPickupTime}
                  </Badge>
                )}
              </Label>
              <Input
                id="pickup-datetime"
                type="datetime-local"
                value={pickupDateTime}
                onChange={(e) => onPickupDateTimeChange(e.target.value)}
                className={cn(errors.some(e => e.includes('pickup')) && 'border-destructive')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickup-location">
                Location
                {defaultPickupLocation && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Preferred
                  </Badge>
                )}
              </Label>
              <Input
                id="pickup-location"
                placeholder="Select pickup location"
                value={pickupLocationId}
                onChange={(e) => onPickupLocationChange(e.target.value)}
                className={cn(errors.some(e => e.includes('pickup location')) && 'border-destructive')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dropoff Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Drop-off Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Checkbox
              id="same-location"
              checked={sameLocation}
              onCheckedChange={handleSameLocationToggle}
            />
            <Label
              htmlFor="same-location"
              className="text-sm font-normal cursor-pointer"
            >
              Return to same location
            </Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dropoff-datetime">
                Date & Time
                {defaultDropoffTime && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Default: {defaultDropoffTime}
                  </Badge>
                )}
              </Label>
              <Input
                id="dropoff-datetime"
                type="datetime-local"
                value={dropoffDateTime}
                onChange={(e) => onDropoffDateTimeChange(e.target.value)}
                className={cn(errors.some(e => e.includes('drop')) && 'border-destructive')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dropoff-location">Location</Label>
              <Input
                id="dropoff-location"
                placeholder="Select drop-off location"
                value={dropoffLocationId}
                onChange={(e) => onDropoffLocationChange(e.target.value)}
                disabled={sameLocation}
                className={cn(
                  errors.some(e => e.includes('drop-off location')) && 'border-destructive',
                  sameLocation && 'bg-muted'
                )}
              />
            </div>
          </div>

          {/* One-way fee notice */}
          {isOneWay && oneWayFee && oneWayFee > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium">One-way Rental</p>
                <p className="text-sm">
                  Additional fee: {formatCurrency(oneWayFee)}
                </p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Duration Display */}
      {duration && (
        <Card className="bg-primary/5 border-primary/20 animate-fade-in">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Rental Duration</p>
                  <p className="text-lg font-semibold">{duration}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-primary border-primary">
                {billingCycle === 'daily' ? 'Daily Billing' : 'Hourly Billing'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Options */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  Advanced Options
                </CardTitle>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    showAdvanced && 'rotate-180'
                  )}
                />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 animate-accordion-down">
              <Separator />
              
              {/* Grace Period */}
              {onGracePeriodChange && (
                <div className="space-y-2">
                  <Label htmlFor="grace-period">
                    Grace Period (minutes)
                    <Badge variant="outline" className="ml-2 text-xs">
                      <Info className="h-3 w-3 mr-1" />
                      Default: {gracePeriodMinutes}
                    </Badge>
                  </Label>
                  <Input
                    id="grace-period"
                    type="number"
                    min="0"
                    max="180"
                    value={gracePeriodMinutes}
                    onChange={(e) => onGracePeriodChange(parseInt(e.target.value) || 0)}
                    placeholder="60"
                  />
                  <p className="text-xs text-muted-foreground">
                    Additional time allowed for vehicle return without late charges
                  </p>
                </div>
              )}

              {/* Billing Cycle */}
              {onBillingCycleChange && (
                <div className="space-y-2">
                  <Label>Billing Cycle</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={billingCycle === 'daily' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onBillingCycleChange('daily')}
                    >
                      Daily
                    </Button>
                    <Button
                      variant={billingCycle === 'hourly' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onBillingCycleChange('hourly')}
                    >
                      Hourly
                    </Button>
                  </div>
                </div>
              )}

              {/* After Hours Pickup */}
              {onAfterHoursPickupChange && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="after-hours"
                    checked={afterHoursPickup}
                    onCheckedChange={onAfterHoursPickupChange}
                  />
                  <Label
                    htmlFor="after-hours"
                    className="text-sm font-normal cursor-pointer"
                  >
                    After-hours pickup/drop-off
                  </Label>
                  {afterHoursPickup && (
                    <Badge variant="secondary" className="ml-auto">
                      Additional fee may apply
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive" className="animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
